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

export interface BoardItem {
  id: string
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
}
