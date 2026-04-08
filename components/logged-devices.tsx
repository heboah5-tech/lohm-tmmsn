"use client";

import { useEffect, useState } from "react";
import { subscribeToAdminSessions, type AdminSession } from "@/lib/device-session";
import { useAuth } from "@/lib/auth-context";

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

function toMs(value: any): number {
  if (!value) return 0;
  if (typeof value === "string") return new Date(value).getTime();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value?.seconds) return value.seconds * 1000;
  return 0;
}

function getDeviceIcon(device: string) {
  const d = device.toLowerCase();
  if (d === "mobile") return "📱";
  if (d === "tablet") return "📲";
  return "🖥️";
}

function getBrowserColor(browser: string) {
  const colors: Record<string, string> = {
    Chrome: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Firefox: "bg-orange-100 text-orange-800 border-orange-200",
    Safari: "bg-blue-100 text-blue-800 border-blue-200",
    Edge: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Opera: "bg-red-100 text-red-800 border-red-200",
  };
  return colors[browser] ?? "bg-gray-100 text-gray-700 border-gray-200";
}

function formatRelative(ms: number) {
  if (!ms) return "غير معروف";
  const diff = Date.now() - ms;
  if (diff < 60_000) return "الآن";
  if (diff < 3600_000) return `منذ ${Math.floor(diff / 60_000)} دقيقة`;
  if (diff < 86400_000) return `منذ ${Math.floor(diff / 3600_000)} ساعة`;
  return `منذ ${Math.floor(diff / 86400_000)} يوم`;
}

export function LoggedDevices() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAdminSessions((all) => {
      setSessions(all);
    });
    return () => unsubscribe();
  }, []);

  // Set initial value and tick every 30s to refresh relative times
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const activeSessions = sessions.filter((s) => {
    const lastActive = toMs(s.lastActiveAt);
    return now - lastActive < ACTIVE_THRESHOLD_MS;
  });

  const inactiveSessions = sessions.filter((s) => {
    const lastActive = toMs(s.lastActiveAt);
    return now - lastActive >= ACTIVE_THRESHOLD_MS;
  });

  if (sessions.length === 0) return null;

  return (
    <div className="bg-slate-50 border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] md:text-xs font-semibold text-gray-500 shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          الأجهزة المتصلة ({activeSessions.length})
        </span>

        {activeSessions.map((session) => {
          const isCurrentDevice = session.uid === user?.uid &&
            typeof sessionStorage !== "undefined" &&
            sessionStorage.getItem("admin_session_id") === session.sessionId;

          return (
            <div
              key={session.id}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] md:text-xs font-medium ${getBrowserColor(session.browser)} ${isCurrentDevice ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
              title={`${session.email} • ${session.os} • آخر نشاط: ${formatRelative(toMs(session.lastActiveAt))}`}
            >
              <span>{getDeviceIcon(session.device)}</span>
              <span>{session.browser}</span>
              <span className="opacity-60">{session.os}</span>
              {isCurrentDevice && (
                <span className="bg-green-500 text-white text-[9px] px-1 py-0.5 rounded-full leading-none">أنت</span>
              )}
            </div>
          );
        })}

        {inactiveSessions.length > 0 && (
          <span className="text-[11px] md:text-xs text-gray-400 mr-1">
            +{inactiveSessions.length} غير نشط
          </span>
        )}
      </div>
    </div>
  );
}
