"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, RefreshCw, Send, UserRound } from "lucide-react";
import type { ChatMessage, InsuranceApplication } from "@/lib/firestore-types";
import { getMessages, sendMessage, subscribeToMessages } from "@/lib/firebase-services";

export function ChatInbox({ visitors }: { visitors: InsuranceApplication[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(visitors[0]?.id || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const conversations = useMemo(
    () => [...visitors].sort((a, b) => Number(Boolean(b.isUnread)) - Number(Boolean(a.isUnread))),
    [visitors],
  );
  const selected = conversations.find((visitor) => visitor.id === selectedId) || conversations[0];

  useEffect(() => {
    if (!selected?.id) {
      setMessages([]);
      return;
    }
    setSelectedId(selected.id);
    setLoading(true);
    const unsubscribe = subscribeToMessages(selected.id, (nextMessages) => {
      setMessages(nextMessages);
      setLoading(false);
    });
    void getMessages(selected.id).catch(() => setLoading(false));
    return unsubscribe;
  }, [selected?.id]);

  const submit = async () => {
    if (!selected?.id || !draft.trim() || sending) return;
    setSending(true);
    try {
      await sendMessage({
        applicationId: selected.id,
        senderId: "admin",
        senderName: "المشرف",
        senderRole: "admin",
        message: draft.trim(),
        read: true,
      });
      setDraft("");
      setMessages(await getMessages(selected.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden p-3 sm:p-5" dir="rtl">
      <div className="mx-auto flex min-h-0 w-full max-w-[1500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50/70 sm:block dark:border-slate-800 dark:bg-slate-950/30">
          <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <h2 className="text-sm font-black text-slate-900 dark:text-white">المحادثات</h2>
            <p className="mt-1 text-xs text-slate-500">{conversations.length} محادثة متاحة</p>
          </div>
          {conversations.map((visitor) => (
            <button key={visitor.id} onClick={() => setSelectedId(visitor.id || null)} className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-right transition-colors dark:border-slate-800 ${selected?.id === visitor.id ? "bg-blue-50 dark:bg-blue-950/30" : "hover:bg-white dark:hover:bg-slate-900"}`}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950/50"><UserRound className="h-4 w-4" /></span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-100">{visitor.ownerName || visitor.phoneNumber || "زائر بدون اسم"}</span>
                <span className="mt-1 block truncate text-[10px] text-slate-400">{visitor.currentPage || "في التطبيق"}</span>
              </span>
              {visitor.isUnread && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            </button>
          ))}
        </aside>
        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">{selected?.ownerName || selected?.phoneNumber || "اختر محادثة"}</h2>
              <p className="mt-1 text-[11px] text-slate-500">{selected?.id || "لا توجد محادثة محددة"}</p>
            </div>
            <MessageCircle className="h-5 w-5 text-blue-500" />
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-4 dark:bg-slate-950/30">
            {!selected ? (
              <div className="grid h-full place-items-center text-sm text-slate-400">لا توجد محادثات بعد</div>
            ) : loading ? (
              <div className="grid h-full place-items-center"><RefreshCw className="h-5 w-5 animate-spin text-blue-500" /></div>
            ) : messages.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-400">لم تبدأ المحادثة بعد</div>
            ) : messages.map((message) => (
              <div key={message.id} className={`flex ${message.senderRole === "admin" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${message.senderRole === "admin" ? "rounded-br-md bg-blue-600 text-white" : "rounded-bl-md bg-white text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200"}`}>
                  <p>{message.message}</p>
                  <time className="mt-1 block text-[10px] opacity-60">{new Date(message.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</time>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <div className="flex items-end gap-2">
              <textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void submit(); } }} placeholder="اكتب ردًا..." rows={2} className="min-h-11 flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" />
              <button disabled={!draft.trim() || sending || !selected} onClick={() => void submit()} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}