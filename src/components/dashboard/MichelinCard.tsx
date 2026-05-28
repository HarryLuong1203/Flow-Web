'use client'

import React from 'react'
import { MapPin, Star, Globe, Phone, Plus } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PlaceResult } from '@/types'

interface MichelinCardProps {
  place: PlaceResult
  onAddToGroup: (place: PlaceResult) => void
  layout?: 'default' | 'compact'
}

export function MichelinCard({ place, onAddToGroup, layout = 'default' }: MichelinCardProps) {
  const fullStars = Math.floor(place.rating)
  const hasHalfStar = place.rating % 1 >= 0.3

  // Determine badge styling based on Michelin type
  const renderMichelinBadge = (isCompact = false) => {
    const sizeClasses = isCompact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
    switch (place.michelinType) {
      case 'star':
        return (
          <Badge className={`bg-gradient-to-r from-red-700 to-red-600 border border-red-500/30 text-white font-bold tracking-wide shadow-md gap-1.5 animate-pulse ${sizeClasses}`}>
            <span className="text-amber-300 leading-none">
              {'★'.repeat(place.michelinStars || 1)}
            </span>
            {isCompact ? "STARRED" : "MICHELIN STARRED"}
          </Badge>
        )
      case 'bib':
        return (
          <Badge className={`bg-emerald-600 border border-emerald-500/20 text-white font-bold tracking-wide shadow-md gap-1 ${sizeClasses}`}>
            <span>😋</span>
            {isCompact ? "BIB" : "BIB GOURMAND"}
          </Badge>
        )
      case 'selected':
        return (
          <Badge className={`bg-zinc-800 border border-zinc-700 text-white font-bold tracking-wide shadow-md gap-1 ${sizeClasses}`}>
            <span>🍽️</span>
            {isCompact ? "SELECTED" : "MICHELIN SELECTED"}
          </Badge>
        )
      default:
        return null
    }
  }

  // Render COMPACT Card for horizontal list
  if (layout === 'compact') {
    return (
      <Card className="group/card relative w-60 h-[280px] flex flex-col overflow-hidden bg-gradient-to-br from-red-950/20 to-background/50 backdrop-blur-sm border-red-900/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-red-600/40 shrink-0">
        {/* Photo */}
        <div className="h-36 w-full overflow-hidden bg-muted relative shrink-0">
          {place.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={place.photoUrl}
              alt={place.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          
          {/* Michelin Badge */}
          <div className="absolute top-2 left-2 z-10">
            {renderMichelinBadge(true)}
          </div>

          {/* Floating Add Button */}
          <Button
            size="icon-xs"
            variant="default"
            className="absolute top-2 right-2 z-10 shadow-md bg-red-600 text-white hover:bg-red-700 w-7 h-7 rounded-full"
            onClick={() => onAddToGroup(place)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">Add to group</span>
          </Button>
        </div>

        {/* Content */}
        <CardContent className="p-3 flex-1 flex flex-col justify-between min-w-0">
          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-[14px] text-foreground line-clamp-1 transition-colors duration-200 group-hover/card:text-red-500">
              {place.name}
            </h3>
            
            <p className="text-muted-foreground text-[10px] flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{place.address}</span>
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-red-950/10">
            {/* Rating & Distance */}
            <div className="flex items-center gap-1.5">
              {place.rating > 0 ? (
                <div className="flex items-center gap-1 bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  <Star className="h-3 w-3 fill-current text-amber-500" />
                  <span>{place.rating.toFixed(1)}</span>
                </div>
              ) : (
                <div />
              )}
              {place.distanceText && (
                <Badge variant="outline" className="border-red-500/20 text-red-500 dark:text-red-400 text-[9px] px-1 py-0.2 font-semibold shrink-0">
                  {place.distanceText}
                </Badge>
              )}
            </div>

            {/* Quick links */}
            <div className="flex gap-1.5 text-xs text-muted-foreground">
              {place.website && (
                <a href={place.website} target="_blank" rel="noreferrer" className="p-1 rounded-md hover:bg-red-600/10 hover:text-red-500 transition-all">
                  <Globe className="h-3.5 w-3.5" />
                </a>
              )}
              {place.phoneNumber && (
                <a href={`tel:${place.phoneNumber}`} className="p-1 rounded-md hover:bg-red-600/10 hover:text-red-500 transition-all">
                  <Phone className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render DEFAULT responsive horizontal Card (original layout)
  return (
    <Card className="group/card relative overflow-hidden bg-gradient-to-br from-red-950/20 to-background/50 backdrop-blur-sm border-red-900/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-red-600/40">
      {/* Michelin Badge */}
      <div className="absolute top-3 left-3 z-10">
        {renderMichelinBadge(false)}
      </div>

      {/* Floating Add Button */}
      <Button
        size="icon-sm"
        variant="default"
        className="absolute top-3 right-3 z-10 opacity-0 scale-90 shadow-lg transition-all duration-200 group-hover/card:opacity-100 group-hover/card:scale-100 hover:scale-110 bg-red-600 text-white hover:bg-red-700"
        onClick={() => onAddToGroup(place)}
      >
        <Plus className="h-4 w-4" />
        <span className="sr-only">Add to group</span>
      </Button>

      <CardContent className="p-0 flex flex-col sm:flex-row h-full">
        {/* Photo */}
        {place.photoUrl ? (
          <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-muted overflow-hidden relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={place.photoUrl}
              alt={place.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105"
            />
          </div>
        ) : (
          <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-muted flex items-center justify-center">
            <MapPin className="h-10 w-10 text-muted-foreground/30" />
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-lg line-clamp-1 transition-colors duration-200 group-hover/card:text-red-500 flex items-center gap-1.5">
                {place.name}
              </h3>
              <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-2">{place.address}</span>
              </p>
            </div>

            {/* Rating Badge */}
            {place.rating > 0 && (
              <div className="flex flex-col items-center shrink-0">
                <div className="flex items-center gap-1 bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-1 rounded-md shrink-0">
                  <Star className="h-3.5 w-3.5 fill-current text-amber-500" />
                  <span className="text-sm font-semibold">{place.rating.toFixed(1)}</span>
                </div>
                {/* Visual stars */}
                <div className="flex items-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < fullStars
                          ? 'fill-amber-400 text-amber-400'
                          : i === fullStars && hasHalfStar
                            ? 'fill-amber-400/50 text-amber-400'
                            : 'text-muted-foreground/20'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer: Website + Phone */}
          <div className="mt-auto pt-4 flex gap-4 text-sm text-muted-foreground">
            {place.website && (
              <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {place.phoneNumber && (
              <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                <Phone className="h-4 w-4" />
                {place.phoneNumber}
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
