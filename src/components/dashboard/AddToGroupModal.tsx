'use client'

import React, { useState } from 'react'
import { Loader2, CheckCircle2, ImagePlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { addBoardItem } from '@/lib/firestore'
import type { PlaceResult, Group, BoardCategory, BoardItem } from '@/types'

interface AddToGroupModalProps {
  place: PlaceResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
}

const CATEGORIES: { label: string; value: BoardCategory; emoji: string }[] = [
  { label: 'Restaurant', value: 'restaurant', emoji: '🍜' },
  { label: 'Cafe', value: 'cafe', emoji: '☕' },
  { label: 'Hotel', value: 'hotel', emoji: '🏨' },
  { label: 'Attraction', value: 'attraction', emoji: '🗺️' },
]

export function AddToGroupModal({
  place,
  open,
  onOpenChange,
  groups,
  user,
}: AddToGroupModalProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<BoardCategory | ''>('')
  const [customPhotoUrl, setCustomPhotoUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const resetState = () => {
    setSelectedGroupId('')
    setSelectedCategory('')
    setCustomPhotoUrl('')
    setIsSubmitting(false)
    setShowSuccess(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      resetState()
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = async () => {
    if (!place || !selectedGroupId || !selectedCategory || !user) return

    setIsSubmitting(true)
    try {
      const itemData: Omit<BoardItem, 'id' | 'addedAt'> = {
        type: place.type || 'place',
        placeId: place.placeId,
        name: place.name,
        address: place.address,
        rating: place.rating,
        photoUrl: customPhotoUrl.trim() || place.photoUrl || '',
        website: place.website || null,
        phoneNumber: place.phoneNumber || null,
        category: selectedCategory,
        addedBy: user.uid,
        addedByName: user.displayName || user.email,
        lat: place.lat || null,
        lng: place.lng || null,
        votes: {},
        comments: [],
      }

      if (place.videoUrl) itemData.videoUrl = place.videoUrl
      if (place.videoEmbedHtml) itemData.videoEmbedHtml = place.videoEmbedHtml
      if (place.authorName) itemData.authorName = place.authorName
      if (place.michelinType) itemData.michelinType = place.michelinType
      if (place.michelinStars) itemData.michelinStars = place.michelinStars

      await addBoardItem(selectedGroupId, itemData)

      setShowSuccess(true)
      setTimeout(() => {
        handleOpenChange(false)
      }, 1200)
    } catch (error) {
      console.error('Failed to add to board:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!place) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center py-8 gap-3 animate-in fade-in-0 zoom-in-95 duration-300">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-in zoom-in-50 duration-500" />
            <p className="text-lg font-semibold text-foreground">Added to Board!</p>
            <p className="text-sm text-muted-foreground">
              {place.name} has been saved successfully.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add to Board</DialogTitle>
              <DialogDescription>
                Save <span className="font-medium text-foreground">{place.name}</span> to a group board.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Group Select */}
              <div className="space-y-2">
                <Label>Group</Label>
                <Select value={selectedGroupId} onValueChange={(val) => setSelectedGroupId(val || '')}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a group..." />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Selection */}
              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`
                        flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border text-sm font-medium
                        transition-all duration-200 cursor-pointer select-none
                        ${
                          selectedCategory === cat.value
                            ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary/30 shadow-sm'
                            : 'border-border bg-background hover:bg-muted hover:border-muted-foreground/30 text-foreground'
                        }
                      `}
                    >
                      <span className="text-lg leading-none">{cat.emoji}</span>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Photo URL */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5">
                  <ImagePlus className="h-4 w-4 text-muted-foreground" />
                  Photo URL <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder="Paste image link here..."
                  value={customPhotoUrl}
                  onChange={(e) => setCustomPhotoUrl(e.target.value)}
                />
                {customPhotoUrl && (
                  <div className="w-full h-32 rounded-md overflow-hidden border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customPhotoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!selectedGroupId || !selectedCategory || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add to Board'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
