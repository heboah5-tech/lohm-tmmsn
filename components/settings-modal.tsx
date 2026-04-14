"use client"

import { useState, useEffect } from "react"
import { X, Plus, Trash2, CreditCard, Globe } from "lucide-react"
import { 
  getSettings, 
  addBlockedCardBin, 
  removeBlockedCardBin, 
  addAllowedCountry, 
  removeAllowedCountry,
  type Settings 
} from "@/lib/firebase/settings"
import { toast } from "sonner"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const COUNTRIES = [
  { code: "SAU", name: "السعودية", flag: "🇸🇦" },
  { code: "ARE", name: "الإمارات", flag: "🇦🇪" },
  { code: "KWT", name: "الكويت", flag: "🇰🇼" },
  { code: "BHR", name: "البحرين", flag: "🇧🇭" },
  { code: "OMN", name: "عمان", flag: "🇴🇲" },
  { code: "QAT", name: "قطر", flag: "🇶🇦" },
  { code: "JOR", name: "الأردن", flag: "🇯🇴" },
  { code: "EGY", name: "مصر", flag: "🇪🇬" },
  { code: "LBN", name: "لبنان", flag: "🇱🇧" },
  { code: "IRQ", name: "العراق", flag: "🇮🇶" },
  { code: "SYR", name: "سوريا", flag: "🇸🇾" },
  { code: "YEM", name: "اليمن", flag: "🇾🇪" },
  { code: "PSE", name: "فلسطين", flag: "🇵🇸" },
  { code: "MAR", name: "المغرب", flag: "🇲🇦" },
  { code: "DZA", name: "الجزائر", flag: "🇩🇿" },
  { code: "TUN", name: "تونس", flag: "🇹🇳" },
  { code: "LBY", name: "ليبيا", flag: "🇱🇾" },
  { code: "SDN", name: "السودان", flag: "🇸🇩" },
]

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>({
    blockedCardBins: [],
    allowedCountries: []
  })
  const [newBinsInput, setNewBinsInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"cards" | "countries">("cards")

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const data = await getSettings()
      setSettings(data)
    } catch (error) {
      console.error("Error loading settings:", error)
      toast.error("فشل تحميل الإعدادات")
    }
  }

  const handleAddBins = async () => {
    const bins = newBinsInput
      .split(/[\s,\n]+/)
      .map(bin => bin.trim())
      .filter(bin => bin.length === 4 && /^\d+$/.test(bin))

    if (bins.length === 0) {
      toast.error("يجب إدخال أرقام صحيحة (4 أرقام لكل بطاقة)")
      return
    }

    setLoading(true)
    try {
      for (const bin of bins) {
        await addBlockedCardBin(bin)
      }
      await loadSettings()
      setNewBinsInput("")
      toast.success(`تم إضافة ${bins.length} بطاقة محظورة`)
    } catch (error) {
      console.error("Error adding blocked BINs:", error)
      toast.error("فشل إضافة البطاقات")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveBin = async (bin: string) => {
    setLoading(true)
    try {
      await removeBlockedCardBin(bin)
      await loadSettings()
      toast.success("تم إزالة البطاقة المحظورة")
    } catch (error) {
      console.error("Error removing blocked BIN:", error)
      toast.error("فشل إزالة البطاقة")
    } finally {
      setLoading(false)
    }
  }

  const handleAddCountry = async () => {
    if (!selectedCountry) {
      toast.error("يرجى اختيار دولة")
      return
    }

    setLoading(true)
    try {
      await addAllowedCountry(selectedCountry)
      await loadSettings()
      setSelectedCountry("")
      toast.success("تم إضافة الدولة المسموحة")
    } catch (error) {
      console.error("Error adding allowed country:", error)
      toast.error("فشل إضافة الدولة")
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveCountry = async (country: string) => {
    setLoading(true)
    try {
      await removeAllowedCountry(country)
      await loadSettings()
      toast.success("تم إزالة الدولة المسموحة")
    } catch (error) {
      console.error("Error removing allowed country:", error)
      toast.error("فشل إزالة الدولة")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 backdrop-blur-md sm:p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white dark:bg-slate-900 sm:rounded-3xl"
        style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)" }}>
        <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-white sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold sm:text-2xl tracking-tight">إعدادات النظام</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 border-b border-gray-100 dark:border-slate-800">
          <button
            onClick={() => setActiveTab("cards")}
            className={`px-2 py-3 text-xs font-semibold transition-all duration-200 sm:px-6 sm:py-4 sm:text-base ${
              activeTab === "cards"
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 bg-blue-50/50 dark:bg-blue-950/30"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>حجب بطاقات الدفع</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("countries")}
            className={`px-2 py-3 text-xs font-semibold transition-all duration-200 sm:px-6 sm:py-4 sm:text-base ${
              activeTab === "countries"
                ? "text-violet-600 dark:text-violet-400 border-b-2 border-violet-500 bg-violet-50/50 dark:bg-violet-950/30"
                : "text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>تقييد الوصول حسب الدولة</span>
            </div>
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 scrollbar-thin">
          {activeTab === "cards" ? (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-slate-200 sm:text-xl">قائمة حجب بطاقات الدفع</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  أضف البيانات الخاصة بأرقام البطاقات التي لا تريده. يمكنك إضافة مجموعة من البيانات
                  <br className="hidden sm:block" />
                  مفصولة بفاصلة أو فاصلة أو سطر جديد. اضغط Enter لإضافة كل بلوك.
                </p>
              </div>

              <div className="bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                <textarea
                  value={newBinsInput}
                  onChange={(e) => setNewBinsInput(e.target.value)}
                  placeholder="مثال: 4890, 4458, 4909&#10;أو كل رقم في سطر منفصل"
                  rows={4}
                  dir="ltr"
                  className="w-full resize-none rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-3 text-base font-mono focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:text-lg transition-all duration-200"
                />
                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    onClick={handleAddBins}
                    disabled={loading || !newBinsInput.trim()}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-2.5 font-semibold text-white transition-all duration-200 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 shadow-sm shadow-blue-200"
                  >
                    <Plus className="w-5 h-5" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setNewBinsInput("")}
                    className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl font-semibold transition-all duration-200"
                  >
                    إلغاء
                  </button>
                </div>
              </div>

              <div>
                {settings.blockedCardBins.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>لا توجد بطاقات محظورة</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.blockedCardBins.map((bin) => (
                      <div
                        key={bin}
                        className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:border-gray-300 dark:hover:border-slate-600"
                      >
                        <span className="font-mono text-sm font-semibold text-gray-700 dark:text-slate-300">
                          {bin}
                        </span>
                        <button
                          onClick={() => handleRemoveBin(bin)}
                          disabled={loading}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-slate-200 sm:text-xl">تقييد الوصول حسب الدولة</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  تحكم في الدول التي تسمح لها بالوصول إلى موقعك الإلكتروني للتعزيز الأمان.
                  <br className="hidden sm:block" />
                  يمكنك إضافة أكثر من دولة. وسيمنع الوصول من أي دولة غير موجودة في القائمة.
                </p>
              </div>

              <div className="bg-violet-50/60 dark:bg-violet-950/30 rounded-2xl p-4 border border-violet-100 dark:border-violet-800">
                <label className="block text-sm font-semibold text-gray-600 dark:text-slate-400 mb-2">
                  - الدول المسموح لها بالوصول -
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 px-4 py-3 text-base focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all duration-200"
                    dir="rtl"
                  >
                    <option value="">اختر دولة...</option>
                    {COUNTRIES.filter(c => !settings.allowedCountries.includes(c.code)).map((country) => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddCountry}
                    disabled={loading || !selectedCountry}
                    className="rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:from-violet-600 hover:to-violet-700 disabled:from-gray-300 disabled:to-gray-400 shadow-sm shadow-violet-200"
                  >
                    حفظ
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">
                  يمكنك إضافة أكثر من دولة غير موجودة في القائمة.
                </p>
              </div>

              <div>
                {settings.allowedCountries.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 dark:text-slate-500">
                    <Globe className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>جميع الدول مسموحة (لم يتم تحديد قيود)</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {settings.allowedCountries.map((countryCode) => {
                      const country = COUNTRIES.find(c => c.code === countryCode)
                      return (
                        <div
                          key={countryCode}
                          className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2 flex items-center gap-2 transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700"
                        >
                          <span className="text-lg">{country?.flag || "🌍"}</span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
                            {country?.name || countryCode}
                          </span>
                          <button
                            onClick={() => handleRemoveCountry(countryCode)}
                            disabled={loading}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 border-t border-gray-100 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/60 p-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-sm"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
