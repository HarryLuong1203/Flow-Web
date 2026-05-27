import { useState, useEffect } from 'react'
import { subscribeToBoardItems } from '@/lib/firestore'
import type { BoardItem } from '@/types'

export function useBoardItems(groupId: string | null) {
  const [items, setItems] = useState<BoardItem[]>([])
  
  useEffect(() => {
    if (!groupId) {
      setItems([])
      return
    }
    const unsub = subscribeToBoardItems(groupId, setItems)
    return unsub
  }, [groupId])

  return items
}
