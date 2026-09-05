"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { SettingsModal } from "@/components/settings-modal"
import { Settings, Activity, Users, UserCheck, CreditCard, Smartphone } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

interface AnalyticsData {
  activeUsers: number
  todayVisitors: number
  totalVisitors: number
  visitorsWithCard: number
  visitorsWithPhone: number
  devices: Array<{ device: string; users: number }>
  countries: Array<{ country: string; users: number }>
}

const statItems = [
  { key: "activeUsers" as const, label: "نشط", icon: Activity, color: "text-emerald-500", pulse: true },
  { key: "todayVisitors" as const, label: "اليوم", icon: Users, color: "text-blue-500" },
  { key: "totalVisitors" as const, label: "30 يوم", icon: UserCheck, color: "text-violet-500" },
  { key: "visitorsWithCard" as const, label: "بطاقة", icon: CreditCard, color: "text-amber-500" },
  { key: "visitorsWithPhone" as const, label: "هاتف", icon: Smartphone, color: "text-rose-500" },
]

export function DashboardHeader() {
  const { user, signOut } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeUsers: 0,
    todayVisitors: 0,
    totalVisitors: 0,
    visitorsWithCard: 0,
    visitorsWithPhone: 0,
    devices: [],
    countries: [],
  })
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics')
        const data = await response.json()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="border-b border-[#e5e8ee] bg-white text-[#253044] dark:border-slate-800 dark:bg-slate-950 dark:text-white">
      <div className="flex min-h-[52px] items-center gap-3 px-3 md:px-5" dir="ltr">
        <div className="flex shrink-0 items-center gap-2">
          <Image
            src="/tameeni_logo.svg"
            alt="Tamini"
            width={24}
            height={32}
            priority
            className="h-8 w-6 object-contain"
          />
          <div className="hidden sm:block">
            <p className="text-[12px] font-black leading-none tracking-tight text-[#0b72ce]">Tamini</p>
            <p className="mt-0.5 text-[8px] font-medium text-slate-400">ADMIN CONSOLE</p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-thin" dir="rtl">
          <h1 className="hidden shrink-0 px-2 text-[12px] font-extrabold text-slate-700 dark:text-slate-200 md:block">لوحة التحكم</h1>
            {statItems.map((item) => {
              const Icon = item.icon
              const value = analytics[item.key]
              return (
                <div
                  key={item.key}
                  className="flex shrink-0 items-center gap-1 border-r border-slate-100 px-2 text-[10px] dark:border-slate-800"
                >
                  <Icon className={`h-3 w-3 ${item.color} shrink-0`} strokeWidth={2.2} />
                  {item.pulse && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                    </span>
                  )}
                  <span className="font-bold tabular-nums text-slate-700 dark:text-white">
                    {loading ? "—" : value}
                  </span>
                  <span className="hidden text-[9px] font-medium text-slate-400 sm:inline">{item.label}</span>
                </div>
              )
            })}
        </div>

        <div className="flex shrink-0 items-center gap-2" dir="rtl">
          <div className="hidden text-right sm:block">
            <p className="max-w-[150px] truncate text-[10px] font-bold text-slate-700 dark:text-slate-200">
                 {(typeof user?.user_metadata?.full_name === "string"
                   ? user.user_metadata.full_name
                   : typeof user?.user_metadata?.name === "string"
                     ? user.user_metadata.name
                     : user?.email) || "المشرف"}
              </p>
            <p className="text-[9px] text-slate-400 dark:text-slate-500">Admin</p>
          </div>
          <button onClick={() => setShowSettings(true)} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-[#0b72ce] hover:text-[#0b72ce] dark:border-slate-700" title="إعدادات">
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => signOut({ redirectUrl: "/sign-in" })} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" title="تسجيل الخروج">
            خروج
          </button>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </header>
  )
}
