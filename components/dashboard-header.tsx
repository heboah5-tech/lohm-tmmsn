"use client"

import { useEffect, useState } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { Settings, FileDown, Users, UserCheck, Activity, CreditCard, Smartphone } from "lucide-react"

interface AnalyticsData {
  activeUsers: number
  todayVisitors: number
  totalVisitors: number
  visitorsWithCard: number
  visitorsWithPhone: number
  devices: Array<{ device: string; users: number }>
  countries: Array<{ country: string; users: number }>
}

interface DashboardHeaderProps {
  onExportAllCards?: () => void
  isExportingAllCards?: boolean
}

const statCards = [
  {
    key: "activeUsers" as const,
    label: "نشط الآن",
    icon: Activity,
    gradient: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-400/20",
    pulse: true,
  },
  {
    key: "todayVisitors" as const,
    label: "زوار اليوم",
    icon: Users,
    gradient: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-400/20",
  },
  {
    key: "totalVisitors" as const,
    label: "إجمالي (30 يوم)",
    icon: UserCheck,
    gradient: "from-violet-500 to-violet-600",
    iconBg: "bg-violet-400/20",
  },
  {
    key: "visitorsWithCard" as const,
    label: "لديهم بطاقة",
    icon: CreditCard,
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-400/20",
  },
  {
    key: "visitorsWithPhone" as const,
    label: "لديهم هاتف",
    icon: Smartphone,
    gradient: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-400/20",
  },
]

export function DashboardHeader({ onExportAllCards, isExportingAllCards }: DashboardHeaderProps = {}) {
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
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/60">
      <div className="px-3 sm:px-4 landscape:px-3 md:px-6 py-3 landscape:py-1.5 md:py-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-lg sm:text-xl landscape:text-sm md:text-2xl font-extrabold text-gray-900 tracking-tight">لوحة التحكم</h1>
            <p className="hidden sm:block text-xs landscape:text-[10px] md:text-sm text-gray-500 landscape:hidden md:block">إدارة زوار BCare</p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {onExportAllCards && (
              <button
                onClick={onExportAllCards}
                disabled={isExportingAllCards}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all shadow-sm shadow-indigo-200 hover:shadow-md hover:shadow-indigo-200 whitespace-nowrap"
                title="تصدير جميع البطاقات PDF"
              >
                {isExportingAllCards ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <FileDown className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    تصدير الكل PDF
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white p-2.5 rounded-xl transition-all shadow-sm hover:shadow-md"
              title="إعدادات"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 md:px-6 py-2.5 md:py-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
          {statCards.map((card) => {
            const Icon = card.icon
            const value = analytics[card.key]
            return (
              <div
                key={card.key}
                className="relative overflow-hidden rounded-xl p-2.5 md:p-3 transition-all hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(249,250,251,0.95) 100%)",
                  border: "1px solid rgba(229,231,235,0.8)",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02)",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" strokeWidth={2.2} />
                  </div>
                  <span className="text-[11px] md:text-xs text-gray-500 font-medium">{card.label}</span>
                  {card.pulse && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                  )}
                </div>
                <div className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                  {loading ? (
                    <div className="h-6 w-12 bg-gray-200 rounded-md animate-pulse"></div>
                  ) : (
                    value
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
