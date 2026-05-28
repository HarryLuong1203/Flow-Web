import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 })
  }

  try {
    // Gọi TikTok oEmbed API (miễn phí, không cần key)
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    const res = await fetch(oembedUrl)

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch TikTok data' }, { status: 400 })
    }

    const data = await res.json()

    return NextResponse.json({
      result: {
        url,
        title: data.title || 'TikTok Video',
        authorName: data.author_name || 'Unknown',
        thumbnailUrl: data.thumbnail_url || null,
        embedHtml: data.html || '',
      }
    })
  } catch (error) {
    console.error('TikTok oEmbed error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
