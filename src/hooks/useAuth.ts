'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import type { User } from '@/types'

function setSessionCookie() {
  document.cookie = 'session=true; path=/; max-age=2592000; SameSite=Lax'
}

function removeSessionCookie() {
  document.cookie = 'session=; path=/; max-age=0; SameSite=Lax'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? '',
          photoURL: firebaseUser.photoURL,
        })
        setSessionCookie()
      } else {
        setUser(null)
        removeSessionCookie()
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const credential = await signInWithEmailAndPassword(auth, email, password)
    setSessionCookie()
    return credential.user
  }, [])

  const signUpWithEmail = useCallback(
    async (email: string, password: string, displayName: string) => {
      const credential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(credential.user, { displayName })
      setSessionCookie()
      return credential.user
    },
    []
  )

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider()
    const credential = await signInWithPopup(auth, provider)
    setSessionCookie()
    return credential.user
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth)
    removeSessionCookie()
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }, [])

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
  }
}
