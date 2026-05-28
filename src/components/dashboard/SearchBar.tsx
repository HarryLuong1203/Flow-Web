'use client'

import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PlaceCard } from '@/components/dashboard/PlaceCard'
import { MichelinCard } from '@/components/dashboard/MichelinCard'
import { AddToGroupModal } from '@/components/dashboard/AddToGroupModal'
import type { PlaceResult, Group } from '@/types'

interface SearchBarProps {
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
}

export function SearchBar({ groups, user }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
  const [michelinResults, setMichelinResults] = useState<PlaceResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Modal state
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setErrorMsg('')
    try {
      let isTikTok = false
      let searchUrl = `/api/places?query=${encodeURIComponent(query)}`

      if (query.includes('tiktok.com') || query.includes('vm.tiktok.com')) {
        isTikTok = true
        searchUrl = `/api/tiktok?url=${encodeURIComponent(query)}`
      }

      if (isTikTok) {
        setMichelinResults([])
        const res = await fetch(searchUrl)
        const data = await res.json()
        
        if (data.error) {
          setErrorMsg(data.error)
          setResults([])
          return
        }

        if (data.result) {
          const tk = data.result
          setResults([{
            placeId: tk.url,
            name: tk.title,
            address: `TikTok Video by ${tk.authorName}`,
            rating: 0,
            photoUrl: tk.thumbnailUrl,
            website: tk.url,
            phoneNumber: null,
            isMostVisited: false,
            lat: null,
            lng: null,
            type: 'tiktok',
            videoUrl: tk.url,
            videoEmbedHtml: tk.embedHtml,
            authorName: tk.authorName
          }])
        }
      } else {
        const michelinUrl = `/api/places/michelin?query=${encodeURIComponent(query)}`
        
        // Parallel fetching
        const [res, michRes] = await Promise.all([
          fetch(searchUrl),
          fetch(michelinUrl)
        ])

        const [data, michData] = await Promise.all([
          res.json(),
          michRes.json()
        ])

        setMichelinResults(michData.results || [])

        if (data.error) {
          setErrorMsg(data.error)
          setResults([])
          return
        }

        setResults(data.results || [])
      }
    } catch (error) {
      console.error('Failed to search places:', error)
      setErrorMsg('Đã có lỗi xảy ra khi tìm kiếm.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToGroup = (place: PlaceResult) => {
    setSelectedPlace(place)
    setModalOpen(true)
  }

  return (
    <div className="w-full space-y-6">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            className="pl-12 h-14 text-lg rounded-full shadow-sm bg-background border-muted-foreground/20 focus-visible:ring-1"
            placeholder="Search or paste Google Maps link..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </form>

      {errorMsg && (
        <div className="p-4 bg-amber-50 text-amber-900 border border-amber-200 rounded-lg text-sm text-center">
          {errorMsg}
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {(results.length > 0 || michelinResults.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in-0 duration-300">
          {/* General Results Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              🔍 Tìm kiếm chung ({results.length})
            </h3>
            {results.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground bg-muted/20 border border-dashed rounded-xl">
                Không tìm thấy địa điểm nào
              </div>
            ) : (
              <div className="space-y-4">
                {results.map((place) => (
                  <PlaceCard
                    key={place.placeId}
                    place={place}
                    onAddToGroup={handleAddToGroup}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Michelin Guide Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-red-500 dark:text-red-400 flex items-center gap-2">
              🌟 Michelin Guide ({michelinResults.length})
            </h3>
            {michelinResults.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground bg-red-950/5 border border-red-900/10 border-dashed rounded-xl">
                Không tìm thấy gợi ý Michelin nào khớp
              </div>
            ) : (
              <div className="space-y-4">
                {michelinResults.map((place) => (
                  <MichelinCard
                    key={place.placeId}
                    place={place}
                    onAddToGroup={handleAddToGroup}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AddToGroupModal
        place={selectedPlace}
        open={modalOpen}
        onOpenChange={setModalOpen}
        groups={groups}
        user={user}
      />
    </div>
  )
}
