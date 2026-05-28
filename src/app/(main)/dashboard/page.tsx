'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useGroups } from '@/hooks/useGroups'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { GroupBoard } from '@/components/dashboard/GroupBoard'
import { createGroup } from '@/lib/firestore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { michelinPlaces } from '@/data/michelinData'
import { MichelinCard } from '@/components/dashboard/MichelinCard'
import { AddToGroupModal } from '@/components/dashboard/AddToGroupModal'
import type { PlaceResult } from '@/types'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const groups = useGroups()
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null)
  
  // Real-time user location, defaulting to HCMC Center (District 1) where Michelin restaurants are centered
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: 10.7760, lng: 106.7015 })

  // Michelin horizontal row modal state
  const [selectedMichelinPlace, setSelectedMichelinPlace] = useState<PlaceResult | null>(null)
  const [michelinModalOpen, setMichelinModalOpen] = useState(false)

  const handleAddMichelinToGroup = (place: PlaceResult) => {
    setSelectedMichelinPlace(place)
    setMichelinModalOpen(true)
  }

  // Get user location on mount (asynchronously update if permitted)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Browser geolocation declined or failed.', error)
        }
      )
    }
  }, [])

  // Helper to calculate distance in km between two coordinates (Haversine formula)
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Process and sort Michelin restaurants by distance
  const featuredMichelinPlaces: PlaceResult[] = React.useMemo(() => {
    const list = michelinPlaces.map(place => {
      let distanceText = ''
      let distanceKm = 999999
      if (coords) {
        const dist = getDistanceKm(coords.lat, coords.lng, place.lat, place.lng)
        distanceKm = dist
        distanceText = dist < 1 
          ? `Cách ${Math.round(dist * 1000)}m` 
          : `Cách ${dist.toFixed(1)}km`
      }
      return {
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
        distanceText,
        distanceKm
      }
    })

    // If coordinates are loaded, sort by distance
    if (coords) {
      return list.sort((a, b) => a.distanceKm - b.distanceKm)
    }
    return list
  }, [coords])
  
  // Dialog state for "empty state" create group
  const [open, setOpen] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [emailsStr, setEmailsStr] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const currentGroupId = activeGroupId || (groups.length > 0 ? groups[0].id : null)
  const currentGroup = groups.find(g => g.id === currentGroupId)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return null // Route is likely protected by middleware, but this handles any blip
  }

  const handleCreateGroup = async (name: string, emails: string[]) => {
    if (!user) return
    const id = await createGroup(name, user.uid, user.email || '', emails)
    setActiveGroupId(id)
  }

  const handleEmptyStateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    
    setIsSubmitting(true)
    try {
      const emailList = emailsStr
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean)
        
      await handleCreateGroup(groupName, emailList)
      setOpen(false)
      setGroupName('')
      setEmailsStr('')
    } catch (error) {
      console.error('Failed to create group:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (groups.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-64px)] space-y-4 px-4 text-center bg-background">
        <div className="max-w-md w-full p-8 border rounded-xl bg-card shadow-sm">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome to Flow!</h1>
          <p className="text-muted-foreground mb-8">
            You don&apos;t have any groups yet. Create your first group to start planning and saving your favorite places.
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button size="lg" className="w-full" />}>
              Create a Group
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleEmptyStateSubmit}>
                <DialogHeader>
                  <DialogTitle>Create a New Group</DialogTitle>
                  <DialogDescription>
                    Give your group a name and invite members to collaborate.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 text-left">
                  <div className="space-y-2">
                    <Label htmlFor="empty-name">Group Name</Label>
                    <Input
                      id="empty-name"
                      placeholder="e.g. Summer Vacation, Weekend Trip"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="empty-emails">Invite Members (Emails)</Label>
                    <Input
                      id="empty-emails"
                      placeholder="alice@example.com, bob@example.com"
                      value={emailsStr}
                      onChange={(e) => setEmailsStr(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Separate multiple emails with commas.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !groupName.trim()}>
                    {isSubmitting ? 'Creating...' : 'Create Group'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full overflow-hidden">
      <Sidebar 
        groups={groups} 
        activeGroupId={currentGroupId} 
        setActiveGroupId={setActiveGroupId}
        onCreateGroup={handleCreateGroup}
      />
      <main className="flex-1 overflow-y-auto bg-muted/10 relative">
        <div className="max-w-7xl mx-auto p-6 lg:p-10">
          <header className="mb-10 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Explore & Add Places</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Find and save places to your group board.
            </p>
          </header>
          
          <div className="flex flex-col xl:flex-row gap-8 items-start">
            {/* Search Column */}
            <div className="w-full xl:w-[450px] 2xl:w-[500px] shrink-0 xl:sticky xl:top-6">
              <SearchBar groups={groups} user={user} />
            </div>

            {/* Board Column */}
            <div className="flex-1 min-w-0 w-full">
              {currentGroupId && currentGroup ? (
                <GroupBoard groupId={currentGroupId} groupName={currentGroup.name} groups={groups} user={user} />
              ) : (
                <div className="h-[400px] border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground">
                  Select or create a group to view its board
                </div>
              )}
            </div>
          </div>

          {/* Michelin Guide Hot Recommendations Row */}
          <div className="w-full mt-12 pt-8 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>🏆</span> Michelin Guide — Địa điểm Đang Hot
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Đề xuất các nhà hàng đạt sao Michelin, Selected & Bib Gourmand xuất sắc nhất tại Việt Nam. Cuộn ngang để khám phá!
                </p>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
              {featuredMichelinPlaces.map((place) => (
                <MichelinCard
                  key={place.placeId}
                  place={place}
                  onAddToGroup={handleAddMichelinToGroup}
                  layout="compact"
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <AddToGroupModal
        place={selectedMichelinPlace}
        open={michelinModalOpen}
        onOpenChange={setMichelinModalOpen}
        groups={groups}
        user={user}
      />
    </div>
  )
}
