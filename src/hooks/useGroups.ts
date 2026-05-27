'use client'
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { subscribeToUserGroups } from '@/lib/firestore'
import type { Group } from '@/types'

export function useGroups() {
  const { user } = useAuth()
  const [groups, setGroups] = useState<Group[]>([])

  useEffect(() => {
    if (!user || !user.email) return
    const unsub = subscribeToUserGroups(user.email, setGroups)
    return unsub
  }, [user])

  return groups
}
