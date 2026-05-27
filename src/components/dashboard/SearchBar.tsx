'use client'

import React, { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { PlaceCard } from '@/components/dashboard/PlaceCard'
import { AddToGroupModal } from '@/components/dashboard/AddToGroupModal'
import type { PlaceResult, Group } from '@/types'

interface SearchBarProps {
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
}

export function SearchBar({ groups, user }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PlaceResult[]>([])
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
      const res = await fetch(`/api/places?query=${encodeURIComponent(query)}`)
      const data = await res.json()
      
      if (data.error) {
        setErrorMsg(data.error)
      }
      setResults(data.results || [])
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

      {results.length > 0 && (
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
