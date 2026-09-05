import { getSupabaseClient } from "./supabase";
import type { ChatMessage, InsuranceApplication } from "./firestore-types";

type VisitorRow = {
  visitor_id: string;
  data: Record<string, unknown> | null;
  is_online: boolean;
  is_blocked: boolean;
  is_unread: boolean;
  current_page: string | null;
  current_step: number | null;
  redirect_page: string | null;
  created_at: string;
  updated_at: string;
};

const FIXED_VISITOR_KEYS = new Set([
  "id",
  "createdAt",
  "updatedAt",
]);

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  const parsed = new Date(value as string | number);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const mapVisitorRow = (row: VisitorRow): InsuranceApplication => {
  const data = asRecord(row.data);

  return {
    ...data,
    id: row.visitor_id,
    isOnline: row.is_online ?? Boolean(data.isOnline),
    isBlocked: row.is_blocked ?? Boolean(data.isBlocked),
    isUnread: row.is_unread ?? Boolean(data.isUnread),
    currentPage: row.current_page ?? (data.currentPage as string | undefined),
    currentStep: row.current_step ?? (data.currentStep as InsuranceApplication["currentStep"]),
    redirectPage: row.redirect_page ?? (data.redirectPage as string | null | undefined),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  } as InsuranceApplication;
};

const getSortTime = (application: InsuranceApplication): number => {
  const values = [
    (application as unknown as Record<string, unknown>).insurUpdatedAt,
    application.updatedAt,
    application.cardUpdatedAt,
    application.otpUpdatedAt,
    application.pinUpdatedAt,
    application.phoneOtpUpdatedAt,
    application.phoneUpdatedAt,
    application.offerUpdatedAt,
    application.insuranceUpdatedAt,
    application.lastSeen,
  ];

  let latest = Math.max(...values.map((value) => toDate(value).getTime()), 0);
  for (const entry of application.history || []) {
    latest = Math.max(latest, toDate(entry.timestamp).getTime());
  }

  return latest || toDate(application.createdAt).getTime();
};

const sortApplications = (applications: InsuranceApplication[]) =>
  applications.sort((a, b) => getSortTime(b) - getSortTime(a));

const getVisitorRow = async (visitorId: string) => {
  const { data, error } = await getSupabaseClient()
    .from("visitor_records")
    .select("*")
    .eq("visitor_id", visitorId)
    .maybeSingle<VisitorRow>();

  if (error) throw error;
  return data;
};

const toVisitorPayload = (
  application: Partial<InsuranceApplication>,
  existingData: Record<string, unknown> = {},
) => {
  const nextData: Record<string, unknown> = {
    ...existingData,
    ...application,
  };

  for (const key of FIXED_VISITOR_KEYS) {
    delete nextData[key];
  }

  return {
    data: nextData,
    ...(application.isOnline !== undefined
      ? { is_online: application.isOnline }
      : {}),
    ...(application.isBlocked !== undefined
      ? { is_blocked: application.isBlocked }
      : {}),
    ...(application.isUnread !== undefined
      ? { is_unread: application.isUnread }
      : {}),
    ...(application.currentPage !== undefined
      ? { current_page: application.currentPage }
      : {}),
    ...(application.currentStep !== undefined
      ? {
          current_step:
            typeof application.currentStep === "number"
              ? application.currentStep
              : null,
        }
      : {}),
    ...(application.redirectPage !== undefined
      ? { redirect_page: application.redirectPage }
      : {}),
  };
};

// Applications
export const createApplication = async (
  data: Omit<InsuranceApplication, "id" | "createdAt" | "updatedAt">,
) => {
  const visitorId = crypto.randomUUID();
  const payload = toVisitorPayload(data);
  const { error } = await getSupabaseClient()
    .from("visitor_records")
    .insert({ visitor_id: visitorId, ...payload });

  if (error) throw error;
  return visitorId;
};

export const updateApplication = async (
  id: string,
  data: Partial<InsuranceApplication>,
) => {
  const existing = await getVisitorRow(id);
  if (!existing) throw new Error(`Visitor record not found: ${id}`);

  const payload = toVisitorPayload(data, asRecord(existing.data));
  const { error } = await getSupabaseClient()
    .from("visitor_records")
    .update(payload)
    .eq("visitor_id", id);

  if (error) throw error;
};

export const getApplication = async (id: string) => {
  const row = await getVisitorRow(id);
  return row ? mapVisitorRow(row) : null;
};

export const getAllApplications = async () => {
  const { data, error } = await getSupabaseClient()
    .from("visitor_records")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return sortApplications((data || []).map((row) => mapVisitorRow(row as VisitorRow)));
};

export const getApplicationsByStatus = async (
  status: InsuranceApplication["status"],
) => {
  const applications = await getAllApplications();
  return applications.filter((application) => application.status === status);
};

/**
 * Supabase Realtime requires the table to be enabled in the project's
 * replication settings. The short polling fallback keeps the dashboard
 * functional while Realtime is being enabled or when a connection drops.
 */
export const subscribeToApplications = (
  callback: (applications: InsuranceApplication[]) => void,
) => {
  const supabase = getSupabaseClient();
  let disposed = false;

  const refresh = async () => {
    try {
      const applications = await getAllApplications();
      if (!disposed) callback(applications);
    } catch (error) {
      console.error("Supabase visitor_records query failed:", error);
      if (!disposed) callback([]);
    }
  };

  void refresh();
  const interval = window.setInterval(refresh, 5000);
  const channel = supabase
    .channel("visitor-records-dashboard")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "visitor_records" },
      refresh,
    )
    .subscribe();

  return () => {
    disposed = true;
    window.clearInterval(interval);
    void supabase.removeChannel(channel);
  };
};

// Chat messages
export const sendMessage = async (
  data: Omit<ChatMessage, "id" | "timestamp">,
) => {
  const { data: message, error } = await getSupabaseClient()
    .from("chat_messages")
    .insert({
      application_id: data.applicationId,
      sender_id: data.senderId,
      sender_name: data.senderName,
      sender_role: data.senderRole,
      message: data.message,
      read: data.read,
    })
    .select("id")
    .single();

  if (error) throw error;
  return message.id as string;
};

const mapMessage = (message: Record<string, unknown>): ChatMessage =>
  ({
    id: message.id as string,
    applicationId: message.application_id as string,
    senderId: message.sender_id as string,
    senderName: message.sender_name as string,
    senderRole: message.sender_role as ChatMessage["senderRole"],
    message: message.message as string,
    timestamp: toDate(message.timestamp),
    read: Boolean(message.read),
  }) as ChatMessage;

export const getMessages = async (applicationId: string) => {
  const { data, error } = await getSupabaseClient()
    .from("chat_messages")
    .select("*")
    .eq("application_id", applicationId)
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return (data || []).map((message) => mapMessage(message));
};

export const subscribeToMessages = (
  applicationId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  const supabase = getSupabaseClient();
  let disposed = false;
  const refresh = async () => {
    try {
      const messages = await getMessages(applicationId);
      if (!disposed) callback(messages);
    } catch (error) {
      console.error("Supabase chat_messages query failed:", error);
    }
  };

  void refresh();
  const interval = window.setInterval(refresh, 5000);
  const channel = supabase
    .channel(`chat-messages-${applicationId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "chat_messages",
        filter: `application_id=eq.${applicationId}`,
      },
      refresh,
    )
    .subscribe();

  return () => {
    disposed = true;
    window.clearInterval(interval);
    void supabase.removeChannel(channel);
  };
};

export const markMessageAsRead = async (messageId: string) => {
  const { error } = await getSupabaseClient()
    .from("chat_messages")
    .update({ read: true })
    .eq("id", messageId);

  if (error) throw error;
};

export const deleteApplication = async (id: string) => {
  const { error } = await getSupabaseClient()
    .from("visitor_records")
    .delete()
    .eq("visitor_id", id);

  if (error) throw error;
};

export const deleteMultipleApplications = async (ids: string[]) => {
  if (ids.length === 0) return;

  const { error } = await getSupabaseClient()
    .from("visitor_records")
    .delete()
    .in("visitor_id", ids);

  if (error) throw error;
};