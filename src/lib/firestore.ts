import { db } from './firebase'
import {
  collection, addDoc, query, where, onSnapshot, serverTimestamp,
  doc, deleteDoc, updateDoc, arrayRemove, arrayUnion, getDocs
} from 'firebase/firestore'
import type { Group, BoardItem } from '@/types'

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
export function subscribeToUserGroups(email: string, callback: (groups: Group[]) => void) {
  const q = query(collection(db, 'groups'), where('memberEmails', 'array-contains', email))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Group)))
  })
}

// Thêm địa điểm vào board
export async function addBoardItem(groupId: string, item: Omit<BoardItem, 'id' | 'addedAt'>) {
  // Remove any undefined fields to prevent Firestore serialization errors
  const cleanItem = Object.fromEntries(
    Object.entries(item).filter(([, v]) => v !== undefined)
  )
  await addDoc(collection(db, 'groups', groupId, 'boardItems'), {
    ...cleanItem,
    addedAt: serverTimestamp()
  })
}

export function subscribeToBoardItems(groupId: string, callback: (items: BoardItem[]) => void) {
  const ref = collection(db, 'groups', groupId, 'boardItems')
  return onSnapshot(ref, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as BoardItem)))
  })
}

// Xoá nhóm (và các boardItems bên trong)
export async function deleteGroup(groupId: string) {
  // Delete all boardItems first
  const boardItemsRef = collection(db, 'groups', groupId, 'boardItems')
  const snapshot = await getDocs(boardItemsRef)
  const deletePromises = snapshot.docs.map(d => deleteDoc(d.ref))
  await Promise.all(deletePromises)

  // Delete the group document
  await deleteDoc(doc(db, 'groups', groupId))
}

// Xoá thành viên khỏi nhóm (theo email)
export async function removeMemberEmail(groupId: string, emailToRemove: string) {
  const groupRef = doc(db, 'groups', groupId)
  await updateDoc(groupRef, {
    memberEmails: arrayRemove(emailToRemove)
  })
}

// Thêm thành viên vào nhóm đã tạo (theo email)
export async function addMemberEmail(groupId: string, emailToAdd: string) {
  const groupRef = doc(db, 'groups', groupId)
  await updateDoc(groupRef, {
    memberEmails: arrayUnion(emailToAdd)
  })
}

// Xoá địa điểm khỏi board
export async function deleteBoardItem(groupId: string, itemId: string) {
  await deleteDoc(doc(db, 'groups', groupId, 'boardItems', itemId))
}

// Vote cho địa điểm (toggle: bấm lần nữa = huỷ vote)
export async function voteBoardItem(
  groupId: string,
  itemId: string,
  userId: string,
  vote: 'up' | 'down'
) {
  const itemRef = doc(db, 'groups', groupId, 'boardItems', itemId)
  // Lấy snapshot hiện tại
  const { getDoc: getDocFn } = await import('firebase/firestore')
  const snap = await getDocFn(itemRef)
  if (!snap.exists()) return

  const data = snap.data()
  const currentVotes: Record<string, string> = data.votes || {}

  // Toggle: nếu đã vote giống thì xoá, nếu khác hoặc chưa có thì set
  if (currentVotes[userId] === vote) {
    // Huỷ vote
    delete currentVotes[userId]
  } else {
    currentVotes[userId] = vote
  }

  await updateDoc(itemRef, { votes: currentVotes })
}

// Thêm bình luận vào board item
export async function addBoardItemComment(
  groupId: string,
  itemId: string,
  userId: string,
  userName: string,
  text: string
) {
  const itemRef = doc(db, 'groups', groupId, 'boardItems', itemId)
  
  const newComment = {
    id: Date.now().toString() + Math.random().toString(36).substring(7),
    userId,
    userName,
    text,
    createdAt: new Date().toISOString()
  }

  await updateDoc(itemRef, {
    comments: arrayUnion(newComment)
  })
}
