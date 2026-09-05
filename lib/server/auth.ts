import "server-only";

import { getAuthSupabaseClient } from "@/lib/supabase/server";

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAdmin() {
  const supabase = await getAuthSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthorizationError(401, "Authentication required");
  }

  const appMetadata = (user.app_metadata || {}) as Record<string, unknown>;
  const email = user.email;
  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const allowedUserIds = (process.env.ADMIN_SUPABASE_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const isAdmin =
    appMetadata.role === "admin" ||
    appMetadata.isAdmin === true ||
    allowedUserIds.includes(user.id) ||
    (!!email && allowedEmails.includes(email.toLowerCase()));

  if (!isAdmin) {
    throw new AuthorizationError(403, "Administrator access required");
  }

  return {
    userId: user.id,
    name:
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : undefined) ||
      email ||
      "Administrator",
    email,
  };
}

export function authorizationResponse(error: unknown) {
  if (error instanceof AuthorizationError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Authorization check failed:", error);
  return Response.json({ error: "Authorization service unavailable" }, { status: 500 });
}