"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "./firebase"
import { useRouter } from "next/navigation"

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
    try {
      const authInstance = getFirebaseAuth()
      const unsubscribe = onAuthStateChanged(authInstance, (firebaseUser) => {
        setUser(firebaseUser)
        setLoading(false)
      })
      return () => unsubscribe()
    } catch {
      setLoading(false) // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [])

  const logout = async () => {
    try {
      const authInstance = getFirebaseAuth()
      await authInstance.signOut()
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
