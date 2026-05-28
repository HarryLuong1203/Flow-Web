'use client'

import React, { useState } from 'react'
import { Star, MapPin, Trash2, ThumbsUp, ThumbsDown, UtensilsCrossed, Coffee, Hotel, Map } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useBoardItems } from '@/hooks/useBoardItems'
import { deleteBoardItem, voteBoardItem } from '@/lib/firestore'
import { PlaceDetailPanel } from '@/components/dashboard/PlaceDetailPanel'
import type { BoardCategory, BoardItem, Group } from '@/types'

interface GroupBoardProps {
  groupId: string
  groupName: string
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
}

const categoryConfig: Record<BoardCategory, {
  label: string
  emoji: string
  icon: React.ElementType
  gradient: string
  accent: string
}> = {
  restaurant: {
    label: 'Restaurants',
    emoji: '🍜',
    icon: UtensilsCrossed,
    gradient: 'from-orange-500 to-red-500',
    accent: 'text-orange-600 dark:text-orange-400',
  },
  cafe: {
    label: 'Cafes',
    emoji: '☕',
    icon: Coffee,
    gradient: 'from-amber-500 to-yellow-500',
    accent: 'text-amber-600 dark:text-amber-400',
  },
  hotel: {
    label: 'Hotels',
    emoji: '🏨',
    icon: Hotel,
    gradient: 'from-blue-500 to-indigo-500',
    accent: 'text-blue-600 dark:text-blue-400',
  },
  attraction: {
    label: 'Attractions',
    emoji: '🗺️',
    icon: Map,
    gradient: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-600 dark:text-emerald-400',
  },
}

const categories: BoardCategory[] = ['restaurant', 'cafe', 'hotel', 'attraction']

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 transition-colors ${
            i < Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-muted text-muted'
          }`}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

function getVoteScore(votes: Record<string, 'up' | 'down'> | undefined) {
  if (!votes) return 0
  let score = 0
  for (const v of Object.values(votes)) {
    if (v === 'up') score++
    else if (v === 'down') score--
  }
  return score
}

function BoardItemRow({
  item,
  groupId,
  accent,
  userId,
  onClickItem,
}: {
  item: BoardItem
  groupId: string
  accent: string
  userId: string | null
  onClickItem: (item: BoardItem) => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsDeleting(true)
    try {
      await deleteBoardItem(groupId, item.id)
    } catch (err) {
      console.error('Failed to delete board item:', err)
      setIsDeleting(false)
    }
  }

  const handleVote = async (e: React.MouseEvent, vote: 'up' | 'down') => {
    e.stopPropagation()
    if (!userId) return
    try {
      await voteBoardItem(groupId, item.id, userId, vote)
    } catch (err) {
      console.error('Failed to vote:', err)
    }
  }

  const votes = item.votes || {}
  const myVote = userId ? votes[userId] : undefined
  const score = getVoteScore(votes)

  return (
    <div
      className={`group/item flex items-start gap-2 rounded-lg px-3 py-2.5 transition-all duration-200 hover:bg-muted/60 cursor-pointer ${
        isDeleting ? 'opacity-40 pointer-events-none scale-95' : ''
      }`}
      onClick={() => onClickItem(item)}
    >
      {/* Vote buttons */}
      <div className="flex flex-col items-center gap-0 shrink-0 pt-0.5">
        <button
          onClick={(e) => handleVote(e, 'up')}
          className={`p-0.5 rounded transition-colors ${
            myVote === 'up'
              ? 'text-emerald-500'
              : 'text-muted-foreground/40 hover:text-emerald-400'
          }`}
        >
          <ThumbsUp className="h-3.5 w-3.5" />
        </button>
        <span className={`text-[10px] font-bold leading-tight ${
          score > 0 ? 'text-emerald-500' : score < 0 ? 'text-red-400' : 'text-muted-foreground/50'
        }`}>
          {score > 0 ? `+${score}` : score}
        </span>
        <button
          onClick={(e) => handleVote(e, 'down')}
          className={`p-0.5 rounded transition-colors ${
            myVote === 'down'
              ? 'text-red-400'
              : 'text-muted-foreground/40 hover:text-red-400'
          }`}
        >
          <ThumbsDown className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium leading-snug truncate ${accent}`}>
          {item.name}
        </p>
        <StarRating rating={item.rating} />
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground truncate">{item.address}</p>
        </div>
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        className="opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

function CategoryCard({
  category,
  items,
  groupId,
  userId,
  onClickItem,
}: {
  category: BoardCategory
  items: BoardItem[]
  groupId: string
  userId: string | null
  onClickItem: (item: BoardItem) => void
}) {
  const config = categoryConfig[category]
  const Icon = config.icon

  // Sort by vote score descending
  const sortedItems = [...items].sort((a, b) => getVoteScore(b.votes) - getVoteScore(a.votes))

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 border-0 ring-1 ring-foreground/5">
      <CardHeader
        className={`bg-gradient-to-r ${config.gradient} px-4 py-3 text-white`}
      >
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <Icon className="h-4 w-4" />
            <span>{config.emoji} {config.label}</span>
          </span>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs border-0 hover:bg-white/30">
            {items.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Icon className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-xs text-muted-foreground/60">No places added yet</p>
          </div>
        ) : (
          <div className="space-y-0.5 max-h-[320px] overflow-y-auto">
            {sortedItems.map((item) => (
              <BoardItemRow
                key={item.id}
                item={item}
                groupId={groupId}
                accent={config.accent}
                userId={userId}
                onClickItem={onClickItem}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function GroupBoard({ groupId, groupName, groups, user }: GroupBoardProps) {
  const items = useBoardItems(groupId)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const selectedItem = items.find(item => item.id === selectedItemId) || null

  const handleClickItem = (item: BoardItem) => {
    setSelectedItemId(item.id)
    setDetailOpen(true)
  }

  const itemsByCategory = categories.reduce(
    (acc, cat) => {
      acc[cat] = items.filter((item) => item.category === cat)
      return acc
    },
    {} as Record<BoardCategory, BoardItem[]>
  )

  return (
    <section>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          📋 {groupName}&apos;s Board
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'place' : 'places'} saved across all categories
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {categories.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            items={itemsByCategory[category]}
            groupId={groupId}
            userId={user?.uid || null}
            onClickItem={handleClickItem}
          />
        ))}
      </div>

      <PlaceDetailPanel
        item={selectedItem}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        groupId={groupId}
        groups={groups}
        user={user}
      />
    </section>
  )
}
