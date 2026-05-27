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
  await addDoc(collection(db, 'groups', groupId, 'boardItems'), {
    ...item,
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
