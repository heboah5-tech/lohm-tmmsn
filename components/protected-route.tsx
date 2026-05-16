"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user && pathname !== "/login") {
      router.replace("/login")
    }
  }, [loading, user, pathname, router])

  if (loading || (!user && pathname !== "/login")) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-200/50">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
          </div>
          <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium text-sm">جاري التحقق...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
