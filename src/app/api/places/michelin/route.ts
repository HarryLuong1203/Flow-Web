import { NextResponse } from 'next/server'
import { michelinPlaces } from '@/data/michelinData'
import type { PlaceResult } from '@/types'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')

  if (!query) {
    return NextResponse.json({ results: [] })
  }

  const lowercaseQuery = query.toLowerCase().trim()

  // Fuzzy filter by name, address, or cuisine category
  const filtered = michelinPlaces.filter(place => {
    return (
      place.name.toLowerCase().includes(lowercaseQuery) ||
      place.address.toLowerCase().includes(lowercaseQuery) ||
      place.category.toLowerCase().includes(lowercaseQuery)
    );
  });

  // Map to Unified PlaceResult structure
  const results: PlaceResult[] = filtered.map(place => ({
    placeId: place.placeId,
    name: place.name,
    address: place.address,
    rating: place.rating,
    photoUrl: place.photoUrl,
    website: place.website,
    phoneNumber: place.phoneNumber,
    isMostVisited: false,
    lat: place.lat,
    lng: place.lng,
    michelinType: place.michelinType,
    michelinStars: place.stars,
  }));

  return NextResponse.json({ results })
}
