'use client'

import React, { useState, useEffect } from 'react'
import { Star, MapPin, Plus, Navigation, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Group, BoardCategory } from '@/types'
import { addBoardItem } from '@/lib/firestore'

interface NearbyPlace {
  placeId: string
  name: string
  address: string
  rating: number
  photoUrl: string | null
  website: string | null
  phoneNumber: string | null
  distanceMeters: number
  distanceText: string
  lat: number
  lng: number
  category: string
}

interface NearbyGuideProps {
  lat: number
  lng: number
  groupId: string
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
}

const SECTIONS = [
  { key: 'food', label: '🍜 Ăn uống', boardCategory: 'restaurant' as BoardCategory },
  { key: 'coffee', label: '☕ Cafe', boardCategory: 'cafe' as BoardCategory },
  { key: 'sights', label: '🏛️ Tham quan', boardCategory: 'attraction' as BoardCategory },
  { key: 'outdoors', label: '🏨 Lưu trú', boardCategory: 'hotel' as BoardCategory },
]

export function NearbyGuide({ lat, lng, groupId, groups, user }: NearbyGuideProps) {
  const [activeTab, setActiveTab] = useState('food')
  const [results, setResults] = useState<NearbyPlace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchNearby = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/places/nearby?lat=${lat}&lng=${lng}&section=${activeTab}`)
        const data = await res.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchNearby()
  }, [lat, lng, activeTab])

  const handleAdd = async (place: NearbyPlace) => {
    if (!user) return
    const section = SECTIONS.find(s => s.key === activeTab)
    const category = section?.boardCategory || 'restaurant'

    setAddingId(place.placeId)
    try {
      await addBoardItem(groupId, {
        type: 'place',
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        rating: place.rating,
        photoUrl: place.photoUrl || '',
        website: place.website,
        phoneNumber: place.phoneNumber,
        category,
        addedBy: user.uid,
        addedByName: user.displayName || user.email,
        lat: place.lat,
        lng: place.lng,
        votes: {},
      })
      setAddedIds(prev => new Set(prev).add(place.placeId))
    } catch (err) {
      console.error('Failed to add nearby place:', err)
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/60 rounded-lg">
        {SECTIONS.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveTab(section.key)}
            className={`flex-1 px-2 py-2 text-xs font-medium rounded-md transition-all duration-200 ${
              activeTab === section.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="py-6 text-center text-sm text-muted-foreground">
          Không tìm thấy địa điểm nào gần đây
        </div>
      ) : (
        <div className="space-y-2">
          {results.map((place) => {
            const isAdded = addedIds.has(place.placeId)
            const isAdding = addingId === place.placeId
            const fullStars = Math.floor(place.rating)

            return (
              <div
                key={place.placeId}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/40 transition-colors"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  {/* Name + Distance */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold truncate">{place.name}</p>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 font-normal">
                      <Navigation className="h-2.5 w-2.5 mr-0.5" />
                      {place.distanceText}
                    </Badge>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < fullStars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-muted-foreground/20'
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-xs text-muted-foreground">{place.rating.toFixed(1)}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                  </div>

                  {/* Foursquare category */}
                  {place.category && (
                    <p className="text-[10px] text-muted-foreground/70 italic">{place.category}</p>
                  )}
                </div>

                {/* Add button */}
                <Button
                  size="sm"
                  variant={isAdded ? 'secondary' : 'outline'}
                  className="shrink-0 h-8 text-xs"
                  onClick={() => handleAdd(place)}
                  disabled={isAdding || isAdded}
                >
                  {isAdded ? (
                    '✓ Added'
                  ) : isAdding ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-3 w-3" />
                      Add
                    </>
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
