import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  displayName: string
  photoURL: string | null
}

export interface Group {
  id: string
  name: string
  createdBy: string
  members: string[]
  memberEmails: string[]
  createdAt: Timestamp | null
}

export type BoardCategory = 'restaurant' | 'cafe' | 'hotel' | 'attraction'
export type BoardItemType = 'place' | 'tiktok'

export interface BoardComment {
  id: string
  userId: string
  userName: string
  text: string
  createdAt: any
}

export interface BoardItem {
  id: string
  type: BoardItemType
  placeId: string
  name: string
  address: string
  rating: number
  photoUrl: string
  website: string | null
  phoneNumber: string | null
  category: BoardCategory
  addedBy: string
  addedByName: string
  addedAt: Timestamp | null
  lat: number | null
  lng: number | null
  // Voting: { [userId]: 'up' | 'down' }
  votes: Record<string, 'up' | 'down'>
  comments?: BoardComment[]
  // TikTok-specific
  videoUrl?: string
  videoEmbedHtml?: string
  authorName?: string
}

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  rating: number
  photoUrl: string | null
  website: string | null
  phoneNumber: string | null
  isMostVisited: boolean
  lat: number | null
  lng: number | null
  type?: BoardItemType
  videoUrl?: string
  videoEmbedHtml?: string
  authorName?: string
}

export interface TikTokResult {
  url: string
  title: string
  authorName: string
  thumbnailUrl: string
  embedHtml: string
}
