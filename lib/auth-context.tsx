"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { auth } from "./firebase"
import { useRouter } from "next/navigation"
import { recordDeviceSession, pingDeviceSession, removeDeviceSession } from "./device-session"

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)

      if (firebaseUser) {
        // Record this device session when user logs in
        try {
          await recordDeviceSession(firebaseUser.uid, firebaseUser.email || "")
        } catch {
          // Silently fail if Firestore is unavailable
        }
      }
    })

    return () => unsubscribe()
  }, [])

  // Ping activity every 2 minutes to show session is still active
  useEffect(() => {
    if (!user) return
    const interval = setInterval(() => {
      pingDeviceSession(user.uid).catch(() => {})
    }, 2 * 60 * 1000)
    return () => clearInterval(interval)
  }, [user])

  const logout = async () => {
    try {
      if (user) {
        await removeDeviceSession(user.uid)
      }
      await auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
