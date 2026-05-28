'use client'

import React, { useState } from 'react'
import {
  MapPin, Star, Globe, Phone, ExternalLink, Navigation,
  ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NearbyGuide } from '@/components/dashboard/NearbyGuide'
import { addBoardItemComment, voteBoardItem } from '@/lib/firestore'
import type { BoardItem, Group, BoardComment } from '@/types'

interface PlaceDetailPanelProps {
  item: BoardItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
  groups: Group[]
  user: { uid: string; displayName: string; email: string } | null
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

export function PlaceDetailPanel({
  item,
  open,
  onOpenChange,
  groupId,
  groups,
  user,
}: PlaceDetailPanelProps) {
  const [commentText, setCommentText] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  if (!item) return null

  const googleMapsUrl = item.lat && item.lng
    ? `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.name + ' ' + item.address)}`


  // Voting logic
  const handleVote = async (vote: 'up' | 'down') => {
    if (!user) return
    try {
      await voteBoardItem(groupId, item.id, user.uid, vote)
    } catch (error) {
      console.error('Vote error:', error)
    }
  }

  const votes = item.votes || {}
  const myVote = user ? votes[user.uid] : undefined
  const score = getVoteScore(votes)

  // Comment logic
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !commentText.trim()) return
    setIsSubmittingComment(true)
    try {
      await addBoardItemComment(
        groupId,
        item.id,
        user.uid,
        user.displayName || user.email,
        commentText.trim()
      )
      setCommentText('')
    } catch (error) {
      console.error('Comment error:', error)
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const comments: BoardComment[] = item.comments || []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between pr-6">
            <div>
              <DialogTitle className="text-xl md:text-2xl">{item.name}</DialogTitle>
              <DialogDescription className="flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {item.address}
              </DialogDescription>
            </div>
            
            {/* Voting Area */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 shrink-0">
              <button
                onClick={() => handleVote('up')}
                className={`p-1.5 rounded-md transition-colors ${
                  myVote === 'up'
                    ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
              </button>
              <span className={`min-w-[2ch] text-center text-sm font-bold ${
                score > 0 ? 'text-emerald-500' : score < 0 ? 'text-red-400' : 'text-muted-foreground'
              }`}>
                {score > 0 ? `+${score}` : score}
              </span>
              <button
                onClick={() => handleVote('down')}
                className={`p-1.5 rounded-md transition-colors ${
                  myVote === 'down'
                    ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left Column: Media, Actions & Nearby Recommendations */}
          <div className="space-y-5">
            {/* Media (TikTok or Photo) */}
            {item.type === 'tiktok' && item.videoEmbedHtml ? (
              <div 
                className="w-full rounded-xl overflow-hidden bg-black flex justify-center tiktok-embed-container"
                dangerouslySetInnerHTML={{ __html: item.videoEmbedHtml }}
              />
            ) : item.photoUrl ? (
              <div className="w-full h-56 rounded-xl overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.photoUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}

            {/* Info badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="gap-1.5 text-xs">
                Added by {item.addedByName}
              </Badge>
              <Badge variant="secondary" className="gap-1.5 text-xs capitalize">
                {item.category}
              </Badge>
              {item.rating > 0 && (
                <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  <Star className="h-3 w-3 fill-current" />
                  {item.rating.toFixed(1)}
                </Badge>
              )}
            </div>

            {/* Quick actions */}
            {item.type !== 'tiktok' && (
              <div className="grid grid-cols-1 gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/80 transition-colors"
                >
                  <Navigation className="h-4 w-4" />
                  Mở Google Maps — Chỉ đường
                </a>

                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-background font-medium text-sm hover:bg-muted transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Truy cập Website
                    <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
                  </a>
                )}

                {item.phoneNumber && (
                  <a
                    href={`tel:${item.phoneNumber}`}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-lg border border-border bg-background font-medium text-sm hover:bg-muted transition-colors"
                  >
                    <Phone className="h-4 w-4" />
                    Gọi: {item.phoneNumber}
                  </a>
                )}
              </div>
            )}

            {/* Flow Guide — Nearby Recommendations */}
            {item.type !== 'tiktok' && (
              <div className="space-y-3 pt-3">
                <Separator />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <span>🗺️</span> Khám phá lân cận
                </h3>
                {item.lat && item.lng ? (
                  <NearbyGuide
                    lat={item.lat}
                    lng={item.lng}
                    groupId={groupId}
                    groups={groups}
                    user={user}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    Không có toạ độ — không thể gợi ý lân cận.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Comments Only */}
          <div className="space-y-6">
            {/* Comments Section */}
            <div className="space-y-3 flex flex-col h-[500px] md:h-[550px]">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                Thảo luận ({comments.length})
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 bg-muted/20 rounded-lg p-3 border border-border/50">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 italic">
                    Chưa có bình luận nào.
                  </p>
                ) : (
                  comments.map(c => (
                    <div key={c.id} className="text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{c.userName}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-muted-foreground bg-background p-2 rounded-md border border-border/50 shadow-sm inline-block">
                        {c.text}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddComment} className="flex items-center gap-2 mt-auto">
                <Input
                  placeholder="Viết bình luận..."
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  className="bg-background"
                />
                <Button type="submit" size="icon" disabled={!commentText.trim() || isSubmittingComment}>
                  {isSubmittingComment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
