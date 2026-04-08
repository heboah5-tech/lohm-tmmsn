"use client"

import { useEffect, useState } from "react"
import { SettingsModal } from "@/components/settings-modal"
import { Settings, FileDown, FileSpreadsheet, LogOut } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { LoggedDevices } from "@/components/logged-devices"

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
  onExportCsv?: () => void
  isExportingCsv?: boolean
}

export function DashboardHeader({ onExportAllCards, isExportingAllCards, onExportCsv, isExportingCsv }: DashboardHeaderProps = {}) {
  const { logout } = useAuth()
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
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  // Get device names in Arabic
  const getDeviceName = (device: string) => {
    const names: Record<string, string> = {
      'mobile': 'موبايل',
      'desktop': 'كمبيوتر',
      'tablet': 'تابلت',
    }
    return names[device.toLowerCase()] || device
  }

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Main Header */}
      <div className="px-3 sm:px-4 landscape:px-3 md:px-6 py-3 landscape:py-1.5 md:py-4 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Title */}
          <div>
            <h1 className="text-lg sm:text-xl landscape:text-sm md:text-2xl font-bold text-gray-800">لوحة التحكم</h1>
            <p className="hidden sm:block text-xs landscape:text-[10px] md:text-sm text-gray-600 landscape:hidden md:block">إدارة زوار BCare</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 md:gap-3">
            {onExportCsv && (
              <button
                onClick={onExportCsv}
                disabled={isExportingCsv}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
                title="تصدير جميع البطاقات CSV"
              >
                {isExportingCsv ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    تصدير CSV
                  </>
                )}
              </button>
            )}
            {onExportAllCards && (
              <button
                onClick={onExportAllCards}
                disabled={isExportingAllCards}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors whitespace-nowrap"
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
              className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors"
              title="إعدادات"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Stats Bar */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 px-3 sm:px-4 md:px-6 py-2 border-b border-gray-100">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 md:gap-3">
          {/* Active Users */}
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-green-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[11px] md:text-xs text-gray-600">نشط الآن</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-green-600">
              {loading ? '...' : analytics.activeUsers}
            </span>
          </div>

          {/* Today's Visitors */}
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-blue-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-[11px] md:text-xs text-gray-600">زوار اليوم</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-blue-600">
              {loading ? '...' : analytics.todayVisitors}
            </span>
          </div>

          {/* Total Visitors */}
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-purple-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-[11px] md:text-xs text-gray-600">إجمالي (30 يوم)</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-purple-600">
              {loading ? '...' : analytics.totalVisitors}
            </span>
          </div>

          {/* Visitors with Card */}
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-orange-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] md:text-xs">💳</span>
              <span className="text-[11px] md:text-xs text-gray-600">لديهم بطاقة</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-orange-600">
              {loading ? '...' : analytics.visitorsWithCard}
            </span>
          </div>

          {/* Visitors with Phone */}
          <div className="flex flex-col gap-0.5 bg-white/70 backdrop-blur-sm rounded-lg p-1.5 md:p-2 border border-pink-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] md:text-xs">📱</span>
              <span className="text-[11px] md:text-xs text-gray-600">لديهم هاتف</span>
            </div>
            <span className="text-sm sm:text-base md:text-xl font-bold text-pink-600">
              {loading ? '...' : analytics.visitorsWithPhone}
            </span>
          </div>
        </div>
      </div>

      {/* Devices Bar */}
      <div className="bg-gray-50 px-3 sm:px-4 md:px-6 py-2">
        <div className="flex flex-wrap items-center gap-2 md:gap-4">
          <span className="text-[11px] md:text-xs font-semibold text-gray-500 shrink-0">أجهزة الدخول:</span>
          {loading ? (
            <span className="text-[11px] md:text-xs text-gray-400">جاري التحميل...</span>
          ) : analytics.devices.length === 0 ? (
            <span className="text-[11px] md:text-xs text-gray-400">لا توجد بيانات</span>
          ) : (
            <>
              {analytics.devices.map(({ device, users }) => {
                const icons: Record<string, string> = { mobile: '📱', desktop: '🖥️', tablet: '📲' }
                const colors: Record<string, string> = {
                  mobile: 'bg-blue-100 text-blue-700 border-blue-200',
                  desktop: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                  tablet: 'bg-teal-100 text-teal-700 border-teal-200',
                }
                const key = device.toLowerCase()
                const icon = icons[key] ?? '💻'
                const color = colors[key] ?? 'bg-gray-100 text-gray-700 border-gray-200'
                const total = analytics.devices.reduce((s, d) => s + d.users, 0)
                const pct = total > 0 ? Math.round((users / total) * 100) : 0
                return (
                  <div key={device} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] md:text-xs font-semibold ${color}`}>
                    <span>{icon}</span>
                    <span>{getDeviceName(device)}</span>
                    <span className="font-bold">{users}</span>
                    <span className="opacity-60">({pct}%)</span>
                  </div>
                )
              })}
              <span className="text-[11px] md:text-xs text-gray-400 mr-auto">
                الإجمالي: {analytics.devices.reduce((s, d) => s + d.users, 0)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Logged Admin Devices */}
      <LoggedDevices />

      {/* Settings Modal */}
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  )
}
