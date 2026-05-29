'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { MapPin, Star, Globe, Phone, Plus, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { PlaceResult } from '@/types'

interface SearchResultDetailModalProps {
  place: PlaceResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddClick: (place: PlaceResult) => void
}

export function SearchResultDetailModal({ place, open, onOpenChange, onAddClick }: SearchResultDetailModalProps) {
  if (!place) return null

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`
  const mapEmbedUrl = place.lat && place.lng 
    ? `https://maps.google.com/maps?q=${place.lat},${place.lng}&hl=vi&z=15&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(place.name + ' ' + place.address)}&hl=vi&z=15&output=embed`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-xl md:max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Cover Photo / TikTok Video */}
        {place.type === 'tiktok' && place.videoEmbedHtml ? (
          <div 
            className="w-full bg-black flex justify-center tiktok-embed-container"
            dangerouslySetInnerHTML={{ __html: place.videoEmbedHtml }}
          />
        ) : place.photoUrl ? (
          <div className="w-full h-48 md:h-64 bg-muted relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={place.photoUrl}
              alt={place.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-primary/10 via-muted to-primary/5 flex items-center justify-center relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          </div>
        )}

        <div className="p-6 space-y-6 relative -mt-10">
          {/* Header */}
          <DialogHeader className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <DialogTitle className="text-2xl md:text-3xl font-bold leading-tight drop-shadow-sm">
                  {place.name}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-1.5 mt-2 text-base text-foreground/80">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" />
                  {place.address}
                </DialogDescription>
              </div>
              {place.rating > 0 && (
                <Badge className="bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-400 text-base px-3 py-1.5 gap-1.5 shrink-0 shadow-sm border-0">
                  <Star className="h-4 w-4 fill-current" />
                  {place.rating.toFixed(1)}
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {place.isMostVisited && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Phổ biến nhất
                </Badge>
              )}
              {place.michelinType === 'star' && (
                <Badge className="bg-red-600 text-white">⭐ Michelin Star</Badge>
              )}
              {place.michelinType === 'bib' && (
                <Badge className="bg-emerald-600 text-white">😋 Bib Gourmand</Badge>
              )}
            </div>
          </DialogHeader>

          {/* Mini Google Map */}
          {place.type !== 'tiktok' && (
            <div className="rounded-xl overflow-hidden shadow-sm border border-border/50 bg-muted">
              <iframe
                width="100%"
                height="220"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={mapEmbedUrl}
                title={`Bản đồ địa điểm ${place.name}`}
                className="w-full grayscale-[0.2] contrast-[1.1]"
              />
            </div>
          )}

          {/* Actions & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              size="lg" 
              className="w-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-base gap-2 bg-gradient-to-r from-primary to-primary/80"
              onClick={() => {
                onOpenChange(false)
                onAddClick(place)
              }}
            >
              <Plus className="h-5 w-5" />
              Thêm vào Board
            </Button>

            {place.type === 'tiktok' && place.videoUrl ? (
              <Button size="lg" variant="outline" className="w-full gap-2 border-pink-500 text-pink-500 hover:bg-pink-500/10" asChild>
                <a href={place.videoUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Mở trên TikTok
                </a>
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="w-full gap-2 bg-background/50 hover:bg-muted" asChild>
                <a href={googleMapsUrl} target="_blank" rel="noreferrer">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  Mở Google Maps
                </a>
              </Button>
            )}
          </div>

          {(place.phoneNumber || place.website) && (
            <div className="flex flex-col gap-3 pt-4 border-t border-border/50">
              {place.phoneNumber && (
                <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Phone className="h-4 w-4" />
                  </div>
                  <span className="font-medium">{place.phoneNumber}</span>
                </a>
              )}
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors p-2 rounded-lg hover:bg-muted/50">
                  <div className="bg-primary/10 p-2 rounded-full text-primary">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="font-medium line-clamp-1">{place.website}</span>
                  <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-50" />
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
