import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const section = searchParams.get('section') || 'food' // food, coffee, arts, outdoors, sights

  if (!lat || !lng) {
    return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 })
  }

  const clientId = process.env.FOURSQUARE_CLIENT_ID
  const clientSecret = process.env.FOURSQUARE_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Missing credentials', results: [] })
  }

  try {
    const url = new URL('https://api.foursquare.com/v2/venues/explore')
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('client_secret', clientSecret)
    url.searchParams.append('v', '20231010')
    url.searchParams.append('ll', `${lat},${lng}`)
    url.searchParams.append('section', section)
    url.searchParams.append('radius', '2000') // 2km
    url.searchParams.append('sortByPopularity', '1')
    url.searchParams.append('limit', '6')
    url.searchParams.append('venuePhotos', '1')

    const res = await fetch(url.toString())

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Foursquare Nearby Error:', res.status, errorText)
      return NextResponse.json({ error: `API Error: ${res.status}` }, { status: 500 })
    }

    const data = await res.json()
    const items = data.response?.groups?.[0]?.items || []

    const originLat = parseFloat(lat)
    const originLng = parseFloat(lng)

    const results = items.map((item: any, index: number) => {
      const venue = item.venue
      const venueLat = venue.location?.lat || 0
      const venueLng = venue.location?.lng || 0

      // Tính khoảng cách (haversine đơn giản)
      const R = 6371e3 // metres
      const φ1 = originLat * Math.PI / 180
      const φ2 = venueLat * Math.PI / 180
      const Δφ = (venueLat - originLat) * Math.PI / 180
      const Δλ = (venueLng - originLng) * Math.PI / 180
      const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceMeters = Math.round(R * c)

      // Rating dựa trên vị trí popularity
      const baseScore = Math.max(4.8 - (index * 0.3), 2.5)
      const rating = Math.min(Math.round(baseScore * 10) / 10, 5.0)

      // Ảnh
      let photoUrl = null
      if (venue.featuredPhotos?.items?.[0]) {
        const photo = venue.featuredPhotos.items[0]
        photoUrl = `${photo.prefix}300x300${photo.suffix}`
      } else if (venue.photos?.groups?.[0]?.items?.[0]) {
        const photo = venue.photos.groups[0].items[0]
        photoUrl = `${photo.prefix}300x300${photo.suffix}`
      }

      const address = venue.location?.formattedAddress?.join(', ') || venue.location?.address || ''

      return {
        placeId: venue.id,
        name: venue.name || '',
        address,
        rating,
        photoUrl,
        website: venue.url || null,
        phoneNumber: venue.contact?.formattedPhone || venue.contact?.phone || null,
        distanceMeters,
        distanceText: distanceMeters < 1000
          ? `${distanceMeters}m`
          : `${(distanceMeters / 1000).toFixed(1)}km`,
        lat: venueLat,
        lng: venueLng,
        category: venue.categories?.[0]?.name || '',
      }
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
