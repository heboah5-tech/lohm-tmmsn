import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

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
  const { userId } = await auth();
  if (!userId) {
    throw new AuthorizationError(401, "Authentication required");
  }

  const user = await currentUser();
  const metadata = (user?.publicMetadata || {}) as Record<string, unknown>;
  const privateMetadata = (user?.privateMetadata || {}) as Record<string, unknown>;
  const email = user?.emailAddresses.find(
    (address) => address.id === user.primaryEmailAddressId,
  )?.emailAddress;
  const allowedEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const allowedUserIds = (process.env.ADMIN_CLERK_USER_IDS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const isAdmin =
    metadata.role === "admin" ||
    metadata.isAdmin === true ||
    privateMetadata.role === "admin" ||
    allowedUserIds.includes(userId) ||
    (!!email && allowedEmails.includes(email.toLowerCase()));

  if (!isAdmin) {
    throw new AuthorizationError(403, "Administrator access required");
  }

  return {
    userId,
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
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