import type { ChatMessage, InsuranceApplication } from "./firestore-types";

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed with status ${response.status}`);
  }
  return payload as T;
};

export const createApplication = async () => {
  throw new Error("Visitor creation is owned by the visitor application.");
};

export const updateApplication = async (
  id: string,
  data: Partial<InsuranceApplication>,
) => {
  await request(`/api/dashboard/visitors/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const getApplication = async (id: string) => {
  const result = await request<{ data: InsuranceApplication }>(
    `/api/dashboard/visitors/${encodeURIComponent(id)}`,
  );
  return result.data;
};

export const getAllApplications = async () => {
  const pageSize = 200;
  const firstPage = await request<{
    data: InsuranceApplication[];
    total?: number;
    pageSize?: number;
  }>(
    `/api/dashboard/visitors?page=1&pageSize=${pageSize}`,
  );

  const total = firstPage.total ?? firstPage.data.length;
  const responsePageSize = firstPage.pageSize || pageSize;
  const totalPages = Math.max(1, Math.ceil(total / responsePageSize));
  if (totalPages === 1) return firstPage.data;

  const remainingPages = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      request<{ data: InsuranceApplication[] }>(
        `/api/dashboard/visitors?page=${index + 2}&pageSize=${responsePageSize}`,
      ),
    ),
  );

  const allApplications = [
    firstPage.data,
    ...remainingPages.map((page) => page.data),
  ].flat();

  return Array.from(
    new Map(
      allApplications.map((application, index) => [
        application.id || `visitor-${index}`,
        application,
      ]),
    ).values(),
  );
};

export const getApplicationsByStatus = async (
  status: InsuranceApplication["status"],
) => {
  const result = await request<{ data: InsuranceApplication[] }>(
    `/api/dashboard/visitors?status=${encodeURIComponent(status)}&pageSize=200`,
  );
  return result.data;
};

export const subscribeToApplications = (
  callback: (applications: InsuranceApplication[]) => void,
  onError?: (error: Error) => void,
) => {
  let disposed = false;
  const refresh = async () => {
    try {
      const applications = await getAllApplications();
      if (!disposed) callback(applications);
    } catch (error) {
      const normalized = error instanceof Error ? error : new Error("Unable to load visitors");
      console.error("Dashboard visitor request failed:", normalized);
      if (!disposed) onError?.(normalized);
    }
  };

  void refresh();
  const interval = window.setInterval(refresh, 5000);
  return () => {
    disposed = true;
    window.clearInterval(interval);
  };
};

export const sendMessage = async (
  data: Omit<ChatMessage, "id" | "timestamp">,
) => {
  const result = await request<{ id: string }>("/api/dashboard/chat", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return result.id;
};

export const getMessages = async (applicationId: string) => {
  const result = await request<{ data: ChatMessage[] }>(
    `/api/dashboard/chat?applicationId=${encodeURIComponent(applicationId)}`,
  );
  return result.data;
};

export const subscribeToMessages = (
  applicationId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  let disposed = false;
  const refresh = async () => {
    try {
      const messages = await getMessages(applicationId);
      if (!disposed) callback(messages);
    } catch (error) {
      console.error("Dashboard chat request failed:", error);
    }
  };

  void refresh();
  const interval = window.setInterval(refresh, 5000);
  return () => {
    disposed = true;
    window.clearInterval(interval);
  };
};

export const markMessageAsRead = async (messageId: string) => {
  await request("/api/dashboard/chat/read", {
    method: "PATCH",
    body: JSON.stringify({ messageId }),
  });
};

export const deleteApplication = async (id: string) => {
  await request(`/api/dashboard/visitors/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

export const deleteMultipleApplications = async (ids: string[]) => {
  if (ids.length === 0) return;
  await request("/api/dashboard/visitors", {
    method: "DELETE",
    body: JSON.stringify({ ids }),
  });
};