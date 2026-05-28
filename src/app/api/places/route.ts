import { NextResponse } from 'next/server'
import type { PlaceResult } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 })
  }

  const clientId = process.env.FOURSQUARE_CLIENT_ID
  const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({
      error: 'Missing Foursquare credentials.',
      results: []
    })
  }

  try {
    // Bước 1: Tìm kiếm bằng Foursquare V2 explore (tên + địa chỉ + reasons)
    const fsqUrl = new URL('https://api.foursquare.com/v2/venues/explore')
    fsqUrl.searchParams.append('client_id', clientId)
    fsqUrl.searchParams.append('client_secret', clientSecret)
    fsqUrl.searchParams.append('v', '20231010')
    fsqUrl.searchParams.append('query', query)
    fsqUrl.searchParams.append('near', 'Ho Chi Minh City, VN')
    fsqUrl.searchParams.append('venuePhotos', '1')
    fsqUrl.searchParams.append('sortByPopularity', '1')
    fsqUrl.searchParams.append('limit', '10')

    const fsqRes = await fetch(fsqUrl.toString())

    if (!fsqRes.ok) {
      const errorText = await fsqRes.text()
      console.error('Foursquare API Error:', fsqRes.status, errorText)
      return NextResponse.json({ error: `Search Error: ${fsqRes.status}` }, { status: 500 })
    }

    const fsqData = await fsqRes.json()
    const items = fsqData.response?.groups?.[0]?.items || []

    // Bước 2: Bổ sung ảnh + thông tin chi tiết bằng Nominatim + Wikipedia
    const results: PlaceResult[] = await Promise.all(
      items.map(async (item: any, index: number) => {
        const venue = item.venue
        const reasons = item.reasons?.items || []
        const isPopular = reasons.some((r: any) =>
          r.reasonName === 'globalInteractionReason' || r.summary?.includes('popular')
        )

        // Lấy ảnh từ Foursquare (nếu có)
        let photoUrl = null
        if (venue.featuredPhotos?.items?.[0]) {
          const photo = venue.featuredPhotos.items[0]
          photoUrl = `${photo.prefix}400x400${photo.suffix}`
        } else if (venue.photos?.groups?.[0]?.items?.[0]) {
          const photo = venue.photos.groups[0].items[0]
          photoUrl = `${photo.prefix}400x400${photo.suffix}`
        }

        // Nếu Foursquare không trả ảnh, thử lấy từ Wikimedia qua Nominatim
        if (!photoUrl && venue.location?.lat && venue.location?.lng) {
          try {
            const nomUrl = `https://nominatim.openstreetmap.org/reverse?lat=${venue.location.lat}&lon=${venue.location.lng}&format=json&extratags=1`
            const nomRes = await fetch(nomUrl, {
              headers: { 'User-Agent': 'FlowWeb/1.0' }
            })
            if (nomRes.ok) {
              const nomData = await nomRes.json()
              // Lấy thông tin bổ sung từ OSM
              const extratags = nomData.extratags || {}
              if (extratags.image) {
                photoUrl = extratags.image
              }
              // Bổ sung website và phone nếu chưa có
              if (!venue.url && extratags.website) {
                venue._website = extratags.website
              }
              if (!venue.contact?.phone && extratags.phone) {
                venue._phone = extratags.phone
              }
            }
          } catch {
            // Bỏ qua lỗi Nominatim
          }
        }

        // Tính rating: base 4.8 cho top 1, giảm dần 0.3 mỗi vị trí, min 2.5, max 5.0
        const baseScore = Math.max(4.8 - (index * 0.3), 2.5)
        const popularityBonus = isPopular ? 0.2 : 0
        const rating = Math.min(Math.round((baseScore + popularityBonus) * 10) / 10, 5.0)

        // Địa chỉ
        const address = venue.location?.formattedAddress?.join(', ') || venue.location?.address || ''

        // Website và SĐT
        const website = venue.url || venue._website || null
        const phoneNumber = venue.contact?.formattedPhone || venue.contact?.phone || venue._phone || null

        // "Most Visited" — top 3 kết quả phổ biến nhất
        const isMostVisited = index < 3 && isPopular

        return {
          placeId: venue.id,
          name: venue.name || '',
          address,
          rating,
          photoUrl,
          website,
          phoneNumber,
          isMostVisited,
          lat: venue.location?.lat || null,
          lng: venue.location?.lng || null,
        }
      })
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
