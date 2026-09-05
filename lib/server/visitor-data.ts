import "server-only";

import { getServerSupabaseClient } from "./supabase";
import type { ChatMessage, InsuranceApplication } from "@/lib/firestore-types";

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

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toDate = (value: unknown): Date => {
  if (value instanceof Date) return value;
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

export const mapVisitorRow = (row: VisitorRow): InsuranceApplication => {
  const data = asRecord(row.data);

  return {
    ...data,
    id: row.visitor_id,
    isOnline: row.is_online ?? Boolean(data.isOnline),
    isBlocked: row.is_blocked ?? Boolean(data.isBlocked),
    isUnread: row.is_unread ?? Boolean(data.isUnread),
    currentPage: row.current_page ?? (data.currentPage as string | undefined),
    currentStep:
      row.current_step ??
      (data.currentStep as InsuranceApplication["currentStep"]),
    redirectPage:
      row.redirect_page ?? (data.redirectPage as string | null | undefined),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  } as InsuranceApplication;
};

const getSortTime = (application: InsuranceApplication) => {
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

export const sortApplications = (applications: InsuranceApplication[]) =>
  applications.sort((a, b) => getSortTime(b) - getSortTime(a));

export async function getVisitorRecord(visitorId: string) {
  const { data, error } = await getServerSupabaseClient()
    .from("visitor_records")
    .select("*")
    .eq("visitor_id", visitorId)
    .maybeSingle<VisitorRow>();

  if (error) throw error;
  return data;
}

export async function listVisitorRecords() {
  const { data, error } = await getServerSupabaseClient()
    .from("visitor_records")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return sortApplications(
    (data || []).map((row) => mapVisitorRow(row as VisitorRow)),
  );
}

const visitorPayload = (
  updates: Partial<InsuranceApplication>,
  existingData: Record<string, unknown>,
) => {
  const data = { ...existingData, ...updates } as Record<string, unknown>;
  delete data.id;
  delete data.createdAt;
  delete data.updatedAt;

  return {
    data,
    ...(updates.isOnline !== undefined ? { is_online: updates.isOnline } : {}),
    ...(updates.isBlocked !== undefined ? { is_blocked: updates.isBlocked } : {}),
    ...(updates.isUnread !== undefined ? { is_unread: updates.isUnread } : {}),
    ...(updates.currentPage !== undefined
      ? { current_page: updates.currentPage }
      : {}),
    ...(updates.currentStep !== undefined
      ? {
          current_step:
            typeof updates.currentStep === "number" ? updates.currentStep : null,
        }
      : {}),
    ...(updates.redirectPage !== undefined
      ? { redirect_page: updates.redirectPage }
      : {}),
  };
};

export async function updateVisitorRecord(
  visitorId: string,
  updates: Partial<InsuranceApplication>,
) {
  const existing = await getVisitorRecord(visitorId);
  if (!existing) return false;

  const { error } = await getServerSupabaseClient()
    .from("visitor_records")
    .update(visitorPayload(updates, asRecord(existing.data)))
    .eq("visitor_id", visitorId);

  if (error) throw error;
  return true;
}

export async function deleteVisitorRecords(visitorIds: string[]) {
  if (visitorIds.length === 0) return;

  const { error } = await getServerSupabaseClient()
    .from("visitor_records")
    .delete()
    .in("visitor_id", visitorIds);

  if (error) throw error;
}

export async function getChatMessages(applicationId: string) {
  const { data, error } = await getServerSupabaseClient()
    .from("chat_messages")
    .select("*")
    .eq("application_id", applicationId)
    .order("timestamp", { ascending: true });

  if (error) throw error;
  return (data || []).map(
    (message) =>
      ({
        id: message.id,
        applicationId: message.application_id,
        senderId: message.sender_id,
        senderName: message.sender_name,
        senderRole: message.sender_role,
        message: message.message,
        timestamp: toDate(message.timestamp),
        read: Boolean(message.read),
      }) as ChatMessage,
  );
}

export async function createChatMessage(
  message: Omit<ChatMessage, "id" | "timestamp">,
) {
  const { data, error } = await getServerSupabaseClient()
    .from("chat_messages")
    .insert({
      application_id: message.applicationId,
      sender_id: message.senderId,
      sender_name: message.senderName,
      sender_role: message.senderRole,
      message: message.message,
      read: message.read,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

export async function markChatMessageRead(messageId: string) {
  const { error } = await getServerSupabaseClient()
    .from("chat_messages")
    .update({ read: true })
    .eq("id", messageId);

  if (error) throw error;
}

export async function getApplicationSettings() {
  const { data, error } = await getServerSupabaseClient()
    .from("application_settings")
    .select("settings")
    .eq("id", "app_settings")
    .maybeSingle();

  if (error) throw error;
  const settings = asRecord(data?.settings);
  return {
    blockedCardBins: Array.isArray(settings.blockedCardBins)
      ? settings.blockedCardBins.filter((value): value is string => typeof value === "string")
      : [],
    allowedCountries: Array.isArray(settings.allowedCountries)
      ? settings.allowedCountries.filter((value): value is string => typeof value === "string")
      : [],
  };
}

export async function saveApplicationSettings(settings: {
  blockedCardBins: string[];
  allowedCountries: string[];
}) {
  const { error } = await getServerSupabaseClient()
    .from("application_settings")
    .upsert(
      { id: "app_settings", settings },
      { onConflict: "id" },
    );

  if (error) throw error;
}

export async function getPageViewEvents() {
  const { data, error } = await getServerSupabaseClient()
    .from("page_view_events")
    .select("id,page,visitor_id,event_name,metadata,created_at")
    .order("created_at", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return data || [];
}