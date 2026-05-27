'use client'

import React from 'react'
import { MapPin, Star, Globe, Phone, Plus, Award } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PlaceResult } from '@/types'

interface PlaceCardProps {
  place: PlaceResult
  onAddToGroup: (place: PlaceResult) => void
}

export function PlaceCard({ place, onAddToGroup }: PlaceCardProps) {
  const fullStars = Math.floor(place.rating)
  const hasHalfStar = place.rating % 1 >= 0.3

  return (
    <Card className="group/card relative overflow-hidden bg-background/50 backdrop-blur-sm border-muted/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20">
      {/* Most Visited Badge */}
      {place.isMostVisited && (
        <div className="absolute top-3 left-3 z-10 animate-in fade-in-0 slide-in-from-left-2 duration-500">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md px-2.5 py-1 text-xs font-bold tracking-wide gap-1">
            <Award className="h-3 w-3" />
            MOST VISITED
          </Badge>
        </div>
      )}

      {/* Floating Add Button */}
      <Button
        size="icon-sm"
        variant="default"
        className="absolute top-3 right-3 z-10 opacity-0 scale-90 shadow-lg transition-all duration-200 group-hover/card:opacity-100 group-hover/card:scale-100 hover:scale-110"
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
              <h3 className="font-semibold text-lg line-clamp-1 transition-colors duration-200 group-hover/card:text-primary">
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
                  <Star className="h-3.5 w-3.5 fill-current" />
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
              <a href={place.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {place.phoneNumber && (
              <a href={`tel:${place.phoneNumber}`} className="flex items-center gap-1.5 hover:text-primary transition-colors">
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
