"use client";

import { useEffect, useState } from "react";
import { subscribeToAdminSessions, forceRemoveSession, type AdminSession } from "@/lib/device-session";
import { useAuth } from "@/lib/auth-context";
import { X, LogOut } from "lucide-react";

const ACTIVE_THRESHOLD_MS = 5 * 60 * 1000;

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

function getBrowserColor(browser: string, inactive = false) {
  if (inactive) return "bg-gray-100 text-gray-400 border-gray-200";
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
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAdminSessions((all) => setSessions(all));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const isCurrentDevice = (session: AdminSession) =>
    session.uid === user?.uid &&
    typeof sessionStorage !== "undefined" &&
    sessionStorage.getItem("admin_session_id") === session.sessionId;

  const isActive = (session: AdminSession) =>
    now - toMs(session.lastActiveAt) < ACTIVE_THRESHOLD_MS;

  const activeSessions = sessions.filter(isActive);
  const inactiveSessions = sessions.filter((s) => !isActive(s));

  const handleLogout = async (session: AdminSession) => {
    if (confirmId !== session.id) {
      setConfirmId(session.id);
      return;
    }
    setRemoving(session.id);
    setConfirmId(null);
    await forceRemoveSession(session.id);
    setRemoving(null);
  };

  if (sessions.length === 0) return null;

  const SessionBadge = ({ session }: { session: AdminSession }) => {
    const isCurrent = isCurrentDevice(session);
    const active = isActive(session);
    const isConfirming = confirmId === session.id;
    const isRemoving = removing === session.id;

    return (
      <div
        className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] md:text-xs font-medium transition-all
          ${getBrowserColor(session.browser, !active)}
          ${isCurrent ? "ring-2 ring-green-400 ring-offset-1" : ""}
          ${isConfirming ? "ring-2 ring-red-400 ring-offset-1" : ""}
          ${isRemoving ? "opacity-40 pointer-events-none" : ""}
        `}
        title={`${session.email} • ${session.os} • آخر نشاط: ${formatRelative(toMs(session.lastActiveAt))}`}
      >
        <span>{getDeviceIcon(session.device)}</span>
        <span>{session.browser}</span>
        <span className="opacity-60">{session.os}</span>

        {isCurrent && (
          <span className="bg-green-500 text-white text-[9px] px-1 py-0.5 rounded-full leading-none">أنت</span>
        )}

        {!active && (
          <span className="text-gray-400 text-[9px] opacity-80">غير نشط</span>
        )}

        {/* Logout button */}
        {isConfirming ? (
          <div className="flex items-center gap-1 mr-0.5">
            <button
              onClick={() => handleLogout(session)}
              className="flex items-center gap-0.5 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none hover:bg-red-600 transition-colors"
              title="تأكيد تسجيل الخروج"
            >
              <LogOut className="w-2.5 h-2.5" />
              تأكيد
            </button>
            <button
              onClick={() => setConfirmId(null)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="إلغاء"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => handleLogout(session)}
            className={`mr-0.5 transition-all opacity-0 group-hover:opacity-100 rounded-full hover:bg-red-100 p-0.5
              ${isCurrent ? "text-green-700 hover:text-red-600" : "text-gray-400 hover:text-red-600"}
            `}
            title={isCurrent ? "تسجيل خروجك" : "تسجيل خروج هذا الجهاز"}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  };

  return (
    <div
      className="bg-slate-50 border-b border-gray-200 px-3 sm:px-4 md:px-6 py-2"
      onClick={() => { if (confirmId) setConfirmId(null); }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] md:text-xs font-semibold text-gray-500 shrink-0 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
          الأجهزة المتصلة ({activeSessions.length})
        </span>

        {activeSessions.map((session) => (
          <SessionBadge key={session.id} session={session} />
        ))}

        {inactiveSessions.map((session) => (
          <SessionBadge key={session.id} session={session} />
        ))}
      </div>
    </div>
  );
}
