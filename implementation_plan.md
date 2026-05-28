# 🌊 FLOW WEB — Kế Hoạch Dự Án A→Z

> Website du lịch nhóm · Chạy local · Firebase · Next.js 14
> Thời gian: 3 ngày · AI Coding: 100%

---

## 📌 MỤC LỤC

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Tech Stack](#2-tech-stack)
3. [Cấu trúc thư mục](#3-cấu-trúc-thư-mục)
4. [Firestore Schema](#4-firestore-schema)
5. [Màn hình & Components](#5-màn-hình--components)
6. [User Flow chi tiết](#6-user-flow-chi-tiết)
7. [Giai đoạn 1 — Foundation](#7-giai-đoạn-1--foundation)
8. [Giai đoạn 2 — Core Features](#8-giai-đoạn-2--core-features)
9. [Giai đoạn 3 — Board & Real-time](#9-giai-đoạn-3--board--real-time)
10. [Environment Variables](#10-environment-variables)
11. [Test Playlist](#11-test-playlist)

---

## 1. Tổng quan dự án

**Tên:** Flow Web
**Mô tả:** Website giúp nhóm bạn bè cùng lên kế hoạch du lịch — tìm kiếm địa điểm qua Google Places, tổng hợp rating, và cùng nhau build một board kế hoạch theo thời gian thực.

### 2 tính năng cốt lõi
| Tính năng | Mô tả |
|---|---|
| **Rating Aggregator** | Paste tên/link địa điểm → hiện thông tin + rating từ Google Places API |
| **Shared Group Board** | Board 2×2 real-time (Quán ăn · Cafe · Khách sạn · Địa điểm du lịch) |

---

## 2. Tech Stack

| Layer | Công nghệ | Version | Ghi chú |
|---|---|---|---|
| Framework | Next.js | 14 (App Router) | Full-stack |
| Styling | Tailwind CSS | 3.x | |
| Components | shadcn/ui | latest | |
| Auth | Firebase Auth | 10.x | Email + Google + Facebook |
| Database | Cloud Firestore | 10.x | NoSQL, real-time built-in |
| Storage | Firebase Storage | 10.x | Ảnh địa điểm (nếu cần) |
| Local dev | Firebase Emulator Suite | latest | Chạy hoàn toàn offline |
| External API | Google Places API (New) | v1 | Rating, ảnh, địa chỉ |
| Icons | Lucide React | latest | |

### Setup lệnh khởi tạo
```bash
npx create-next-app@latest flow-web --typescript --tailwind --app --src-dir
cd flow-web
npx shadcn@latest init
npm install firebase
npm install -g firebase-tools
firebase login
firebase init emulators  # chọn: Auth, Firestore, Storage
```

---

## 3. Cấu trúc thư mục

```
flow-web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Màn hình Login
│   │   │   └── register/
│   │   │       └── page.tsx          # Màn hình Register
│   │   ├── (main)/
│   │   │   └── dashboard/
│   │   │       └── page.tsx          # Màn hình chính (search + sidebar)
│   │   ├── api/
│   │   │   └── places/
│   │   │       └── route.ts          # API route gọi Google Places
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Redirect → /login hoặc /dashboard
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── RegisterForm.tsx
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx           # Danh sách nhóm + Create a Group
│   │   │   ├── SearchBar.tsx         # Ô paste link + nút tìm
│   │   │   ├── PlaceCard.tsx         # Card kết quả địa điểm
│   │   │   ├── AddToGroupModal.tsx   # Modal chọn category khi bấm [+]
│   │   │   └── GroupBoard.tsx        # Board 2×2 (popup/modal)
│   │   └── ui/                       # shadcn components
│   ├── lib/
│   │   ├── firebase.ts               # Firebase config + init
│   │   ├── firestore.ts              # Firestore helper functions
│   │   └── places.ts                 # Google Places API helper
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth state hook
│   │   ├── useGroups.ts              # Lấy danh sách nhóm của user
│   │   └── useBoardItems.ts          # Real-time listener board items
│   ├── types/
│   │   └── index.ts                  # TypeScript interfaces
│   └── middleware.ts                 # Route protection
├── .env.local                        # API keys (KHÔNG commit)
├── firebase.json                     # Emulator config
└── .firebaserc
```

---

## 4. Firestore Schema

### Collection: `users`
```
/users/{uid}
{
  uid: string,
  email: string,
  displayName: string,
  photoURL: string | null,
  createdAt: Timestamp
}
```

### Collection: `groups`
```
/groups/{groupId}
{
  id: string,
  name: string,
  createdBy: string,        // uid
  members: string[],        // mảng uid
  memberEmails: string[],   // để invite bằng email
  createdAt: Timestamp
}
```

### Sub-collection: `boardItems`
```
/groups/{groupId}/boardItems/{itemId}
{
  id: string,
  placeId: string,          // Google Place ID
  name: string,
  address: string,
  rating: number,
  photoUrl: string,
  website: string | null,
  phoneNumber: string | null,
  category: "restaurant" | "cafe" | "hotel" | "attraction",
  addedBy: string,          // uid
  addedByName: string,
  addedAt: Timestamp
}
```

### Firestore Rules (local emulator)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
    match /groups/{groupId} {
      allow read: if request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.members;
      match /boardItems/{itemId} {
        allow read, write: if request.auth.uid in 
          get(/databases/$(database)/documents/groups/$(groupId)).data.members;
      }
    }
  }
}
```

---

## 5. Màn hình & Components

### Màn hình 1: `/login`
**Mô tả:** Trước khi đăng nhập
**Elements:**
- Header: Logo + Tên Web
- Title: "LOG IN / SIGN IN"
- Input: Email
- Input: Password (toggle show/hide)
- Link: "Forgot password?" → Firebase sendPasswordResetEmail
- Button: SIGN IN
- Divider
- Text: "Don't have an account?" + Link → `/register`
- Button: Đăng nhập bằng Google (GoogleAuthProvider)
- Button: Đăng nhập bằng Facebook (FacebookAuthProvider)

### Màn hình 2: `/register`
**Elements:**
- Tương tự Login nhưng có thêm field: Họ tên
- Button: SIGN UP
- Link: "Already have an account? Sign In" → `/login`

### Màn hình 3: `/dashboard` — Create Group (state ban đầu)
**Hiển thị khi user chưa có nhóm nào hoặc muốn tạo mới**
**Elements:**
- Nút lớn: `[+] Create a Group`
- Form (hiện khi click):
  - Input: Group name
  - Input: Add member's email (có thể thêm nhiều)
  - Button: Create

### Màn hình 4: `/dashboard` — Main Screen (sau khi có group)
**Layout:** Sidebar trái + Content phải

**Sidebar (Sidebar.tsx):**
- Header: "Your Group"
- Danh sách tên nhóm (click → mở GroupBoard)
- Bottom: Button "Create a Group"

**Content (phần chính):**
- SearchBar: "Paste link here" + icon copy + nút 🔎
- Kết quả: danh sách PlaceCard

**PlaceCard.tsx — mỗi card gồm:**
- Ảnh/thumbnail (từ Google Places photo)
- Badge "Most Visited" (nếu rating ≥ 4.5 VÀ có đủ: address + website + phone)
- Rating: số sao ⭐
- Tên địa điểm
- Địa chỉ
- Số điện thoại
- Website
- Nút `[+]` → mở AddToGroupModal

**AddToGroupModal.tsx:**
- Title: "Thêm vào nhóm nào?"
- Chọn nhóm (dropdown/select)
- Chọn category:
  - 🍜 Quán ăn / Nhà hàng
  - ☕ Cafe
  - 🏨 Khách sạn
  - 🗺️ Địa điểm du lịch
- Button: Thêm vào board

### Màn hình 5: Group Board (modal/popup)
**Trigger:** Click tên nhóm trong sidebar
**Layout:** Modal overlay hoặc slide-in panel

**Elements:**
- Title: [Tên nhóm]
- Grid 2×2:

| 🍜 Quán ăn / Nhà hàng | ☕ Cafe |
|---|---|
| 🏨 Khách sạn | 🗺️ Địa điểm du lịch |

- Mỗi ô hiển thị danh sách địa điểm đã thêm (tên + rating)
- **Real-time:** Firestore `onSnapshot` listener → tự update khi thành viên khác thêm

---

## 6. User Flow chi tiết

```
[Truy cập web]
      ↓
[Chưa đăng nhập?] → /login
      ↓
[Đăng nhập thành công] → /dashboard
      ↓
[Có group chưa?]
  ├─ Chưa → Hiện nút "Create a Group"
  │           ↓
  │         [Nhập Group name + email thành viên] → Create
  │           ↓
  └─ Rồi  → Hiện sidebar + search
              ↓
            [Paste tên/link địa điểm → bấm 🔎]
              ↓
            [Gọi /api/places → Google Places API]
              ↓
            [Hiển thị PlaceCard(s) + badge "Most Visited"]
              ↓
            [Bấm [+] → AddToGroupModal]
              ↓
            [Chọn nhóm + chọn category → Thêm]
              ↓
            [Firestore write → /groups/{id}/boardItems]
              ↓
            [Tất cả thành viên thấy real-time qua onSnapshot]
              ↓
            [Click tên nhóm ở sidebar → GroupBoard popup]
              ↓
            [Xem 4 ô category đã được fill địa điểm]
```

---

## 7. Giai đoạn 1 — Foundation

**Mục tiêu:** Project chạy được, auth hoạt động, emulator lên.

### 7.1 Setup Firebase Project
1. Vào [console.firebase.google.com](https://console.firebase.google.com)
2. Tạo project mới → đặt tên "flow-web"
3. Enable **Authentication** → Sign-in methods:
   - Email/Password ✅
   - Google ✅
   - Facebook ✅ (cần Facebook App ID từ developers.facebook.com)
4. Enable **Firestore Database** (chọn mode: test)
5. Enable **Storage**
6. Project Settings → "Your apps" → Web → lấy `firebaseConfig`

### 7.2 Setup Firebase Emulator
```bash
firebase init emulators
# Chọn: Authentication, Firestore, Storage
# Port mặc định: Auth 9099, Firestore 8080, Storage 9199

# Chạy emulator
firebase emulators:start
```

### 7.3 `lib/firebase.ts`
```typescript
import { initializeApp, getApps } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Kết nối emulator khi dev
if (process.env.NODE_ENV === 'development') {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, 'localhost', 8080)
  connectStorageEmulator(storage, 'localhost', 9199)
}
```

### 7.4 TypeScript Types (`types/index.ts`)
```typescript
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
  createdAt: any
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
  addedAt: any
}

export interface PlaceResult {
  placeId: string
  name: string
  address: string
  rating: number
  photoUrl: string
  website: string | null
  phoneNumber: string | null
  isMostVisited: boolean
}
```

### 7.5 Middleware bảo vệ route
```typescript
// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')

  if (!session && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (session && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register']
}
```

### Checklist Giai đoạn 1
- [ ] `create-next-app` chạy được
- [ ] Firebase Emulator khởi động không lỗi
- [ ] Đăng ký bằng Email thành công (check Emulator UI: localhost:4000)
- [ ] Đăng nhập bằng Email thành công
- [ ] Đăng nhập bằng Google thành công
- [ ] Redirect đúng: chưa login → `/login`, đã login → `/dashboard`

---

## 8. Giai đoạn 2 — Core Features

**Mục tiêu:** Tạo nhóm, tìm kiếm địa điểm, thêm vào board.

### 8.1 Firestore Helpers (`lib/firestore.ts`)
```typescript
import { db } from './firebase'
import {
  collection, doc, addDoc, getDoc, getDocs,
  query, where, onSnapshot, serverTimestamp, updateDoc, arrayUnion
} from 'firebase/firestore'
import type { Group, BoardItem, BoardCategory } from '@/types'

// Tạo nhóm mới
export async function createGroup(name: string, creatorUid: string, creatorEmail: string, memberEmails: string[]) {
  const ref = await addDoc(collection(db, 'groups'), {
    name,
    createdBy: creatorUid,
    members: [creatorUid],
    memberEmails: [creatorEmail, ...memberEmails],
    createdAt: serverTimestamp()
  })
  return ref.id
}

// Lấy danh sách nhóm của user
export function subscribeToUserGroups(uid: string, callback: (groups: Group[]) => void) {
  const q = query(collection(db, 'groups'), where('members', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)))
  })
}

// Thêm địa điểm vào board
export async function addBoardItem(groupId: string, item: Omit<BoardItem, 'id' | 'addedAt'>) {
  await addDoc(collection(db, 'groups', groupId, 'boardItems'), {
    ...item,
    addedAt: serverTimestamp()
  })
}

// Real-time listen board items của nhóm
export function subscribeToBoardItems(groupId: string, callback: (items: BoardItem[]) => void) {
  const ref = collection(db, 'groups', groupId, 'boardItems')
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as BoardItem)))
  })
}
```

### 8.2 Google Places API Route (`app/api/places/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query')
  if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const apiKey = process.env.GOOGLE_PLACES_API_KEY

  // Bước 1: Text Search để lấy placeId
  const searchRes = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey!,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos,places.websiteUri,places.nationalPhoneNumber'
      },
      body: JSON.stringify({ textQuery: query, maxResultCount: 5 })
    }
  )

  const data = await searchRes.json()
  const places = (data.places || []).map((p: any) => {
    const hasFullInfo = p.rating >= 4.0 && p.formattedAddress && p.websiteUri && p.nationalPhoneNumber

    return {
      placeId: p.id,
      name: p.displayName?.text || '',
      address: p.formattedAddress || '',
      rating: p.rating || 0,
      photoUrl: p.photos?.[0]
        ? `https://places.googleapis.com/v1/${p.photos[0].name}/media?maxHeightPx=400&key=${apiKey}`
        : null,
      website: p.websiteUri || null,
      phoneNumber: p.nationalPhoneNumber || null,
      isMostVisited: hasFullInfo
    }
  })

  return NextResponse.json({ places })
}
```

> **Logic "Most Visited" badge:**
> Địa điểm có `rating ≥ 4.0` VÀ có đầy đủ: `address` + `website` + `phoneNumber` → hiện badge.

### 8.3 Hook useGroups (`hooks/useGroups.ts`)
```typescript
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeToUserGroups } from '@/lib/firestore'
import type { Group } from '@/types'

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    if (!user) return
    const unsub = subscribeToUserGroups(user.uid, setGroups)
    return unsub
  }, [user])

  return groups
}
```

### Checklist Giai đoạn 2
- [ ] Tạo nhóm thành công → hiện trong sidebar
- [ ] Paste tên địa điểm → bấm 🔎 → hiện kết quả card
- [ ] Card hiển thị đủ: ảnh, rating, tên, địa chỉ, website
- [ ] Badge "Most Visited" hiện đúng điều kiện
- [ ] Bấm `[+]` → modal mở
- [ ] Chọn nhóm + category → bấm Thêm → Firestore có document mới (check Emulator UI)

---

## 9. Giai đoạn 3 — Board & Real-time

**Mục tiêu:** GroupBoard hoạt động, real-time sync giữa các thành viên.

### 9.1 Hook useBoardItems (`hooks/useBoardItems.ts`)
```typescript
import { useEffect, useState } from 'react'
import { subscribeToBoardItems } from '@/lib/firestore'
import type { BoardItem } from '@/types'

export function useBoardItems(groupId: string | null) {
  const [items, setItems] = useState<BoardItem[]>([])

  useEffect(() => {
    if (!groupId) return
    const unsub = subscribeToBoardItems(groupId, setItems)
    return unsub
  }, [groupId])

  return items
}
```

### 9.2 GroupBoard Component
```typescript
// Hiển thị board 2×2, tự update real-time qua useBoardItems
const categories = [
  { key: 'restaurant', label: '🍜 Quán ăn / Nhà hàng' },
  { key: 'cafe',       label: '☕ Cafe' },
  { key: 'hotel',      label: '🏨 Khách sạn' },
  { key: 'attraction', label: '🗺️ Địa điểm du lịch' },
]

// items từ useBoardItems → filter theo category → render vào ô tương ứng
```

### 9.3 Test Real-time
1. Mở 2 browser tab (hoặc 2 browser khác nhau)
2. Đăng nhập 2 tài khoản khác nhau (cùng là member của 1 nhóm)
3. Tab 1: Tìm kiếm địa điểm → bấm `[+]` → thêm vào board
4. Tab 2: Mở GroupBoard của nhóm đó → địa điểm xuất hiện **không cần F5**

### Checklist Giai đoạn 3
- [ ] Click tên nhóm trong sidebar → GroupBoard mở
- [ ] 4 ô category hiển thị đúng
- [ ] Địa điểm đã thêm hiện trong đúng ô
- [ ] Real-time: thêm từ tab khác → tab này tự update
- [ ] Nhiều nhóm → board hiển thị đúng từng nhóm

---

## 10. Environment Variables

Tạo file `.env.local` ở root (KHÔNG commit lên git):

```bash
# Firebase (lấy từ Firebase Console → Project Settings → Web App)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Google Places API (lấy từ Google Cloud Console)
# KHÔNG có NEXT_PUBLIC_ vì chỉ dùng ở server (API route)
GOOGLE_PLACES_API_KEY=your_places_api_key
```

> ⚠️ Thêm `.env.local` vào `.gitignore`

---

## 11. Test Playlist

Chạy theo thứ tự từ trên xuống dưới để verify toàn bộ hệ thống.

### 🔐 Auth Tests
```
[ ] T01 - Truy cập /dashboard khi chưa login → redirect về /login
[ ] T02 - Register bằng Email/Password → tạo account thành công
[ ] T03 - Login bằng Email/Password → vào /dashboard
[ ] T04 - Login bằng Google → vào /dashboard
[ ] T05 - Bấm "Forgot password?" → nhận email reset (check Emulator UI)
[ ] T06 - Truy cập /login khi đã login → redirect về /dashboard
[ ] T07 - Logout → redirect về /login
```

### 👥 Group Tests
```
[ ] T08 - Tạo nhóm mới (chỉ mình) → hiện trong sidebar
[ ] T09 - Tạo nhóm với email người khác → nhóm có 2 members (check Firestore Emulator)
[ ] T10 - Tạo 2-3 nhóm → tất cả hiện trong sidebar
[ ] T11 - Tên nhóm hiển thị đúng trong sidebar
```

### 🔍 Search Tests
```
[ ] T12 - Paste tên "Bùi Viện" → bấm 🔎 → hiện card kết quả
[ ] T13 - Paste tên "Sofitel Saigon" → hiện đúng thông tin (rating, địa chỉ, website)
[ ] T14 - Địa điểm đủ điều kiện → có badge "Most Visited"
[ ] T15 - Địa điểm thiếu thông tin → KHÔNG có badge
[ ] T16 - Ảnh địa điểm load đúng
[ ] T17 - Search địa điểm không tồn tại → xử lý gracefully (không crash)
```

### ➕ Add to Board Tests
```
[ ] T18 - Bấm [+] → modal mở
[ ] T19 - Modal hiện đúng danh sách nhóm của user
[ ] T20 - Chọn nhóm + category "Quán ăn" → bấm Thêm → modal đóng
[ ] T21 - Check Firestore Emulator: document xuất hiện trong /groups/{id}/boardItems
[ ] T22 - Thêm 4 địa điểm vào 4 category khác nhau
```

### 📋 Group Board Tests
```
[ ] T23 - Click tên nhóm ở sidebar → GroupBoard mở
[ ] T24 - 4 ô category hiển thị đúng (Quán ăn, Cafe, Khách sạn, Địa điểm)
[ ] T25 - Địa điểm đã thêm hiện trong đúng ô category
[ ] T26 - Tên + rating hiển thị trong mỗi item
```

### ⚡ Real-time Tests
```
[ ] T27 - Mở 2 tab: cùng đăng nhập tài khoản, mở board nhóm
[ ] T28 - Tab 1: thêm địa điểm → Tab 2: địa điểm xuất hiện KHÔNG cần F5
[ ] T29 - Mở board → thành viên khác thêm → board tự update trong < 2 giây
```

### 🔄 Edge Case Tests
```
[ ] T30 - Nhóm chưa có địa điểm nào → board hiện state rỗng đẹp (không crash)
[ ] T31 - Search khi chưa có nhóm nào → [+] vẫn mở modal, nhắc tạo nhóm trước
[ ] T32 - Mất kết nối internet → app không crash, có thông báo phù hợp
[ ] T33 - Reload trang → vẫn giữ đăng nhập (session persist)
```

---

## 🚀 Lệnh chạy dự án

```bash
# Terminal 1: Firebase Emulator
firebase emulators:start

# Terminal 2: Next.js dev server
npm run dev

# Truy cập:
# App:          http://localhost:3000
# Emulator UI:  http://localhost:4000
```

---

*Tài liệu này cover toàn bộ yêu cầu đã thảo luận. Mọi thay đổi spec cần update tài liệu này trước khi code.*

---

## 12. Giai đoạn 4 — Nâng cấp (Comments, TikTok, Nearby)
*(Được yêu cầu bổ sung thêm)*

### 12.1 Gợi ý lân cận (Nearby)
- **Tình trạng:** Thực tế đã được code hoàn chỉnh (Component `NearbyGuide` và API `/api/places/nearby`).
- **Lý do lỗi trong hình:** Các địa điểm cũ được lưu trong Firestore từ trước khi có tính năng Nearby có thể không có tọa độ (`lat`, `lng`), nên không gợi ý được. 
- **Giải pháp:** Với các địa điểm search và add mới, hệ thống đã lưu tọa độ và sẽ tự động hiển thị gợi ý (Quán ăn, Cafe, Tham quan, Lưu trú).

### 12.2 Tính năng Bình luận & Đồng ý/Không đồng ý
- **Backend:** Thêm mảng `comments` vào schema `BoardItem` trong `types/index.ts`. Tạo hàm `addComment` trong `lib/firestore.ts`.
- **Frontend (`PlaceDetailPanel.tsx`):** 
  - Cập nhật giao diện chi tiết địa điểm, bổ sung thêm khu vực "Thảo luận" (Comment section).
  - Tích hợp nút Vote (Đồng ý / Không đồng ý) ngay bên trong panel chi tiết cho rõ ràng (hiện tại nút vote đang ở bên ngoài thẻ trong Group Board).

### 12.3 Thêm địa điểm bằng link TikTok
- **Backend:** Tạo API Route mới `/api/tiktok/route.ts` để gọi API oEmbed của TikTok nhằm lấy thumbnail, title, author và mã nhúng video HTML.
- **Frontend (`SearchBar.tsx`):** Tự động nhận diện (auto-detect) nếu link dán vào là link TikTok (`tiktok.com` hoặc `vm.tiktok.com`) thì sẽ gọi API TikTok thay vì Google/Foursquare.
- **Frontend (`PlaceDetailPanel.tsx`):** Nếu địa điểm được thêm là loại "TikTok", sẽ render trực tiếp iframe/nhúng video TikTok để các thành viên có thể xem ngay trên web mà không cần chuyển trang.
