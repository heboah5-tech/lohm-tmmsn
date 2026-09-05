import { NextRequest, NextResponse } from "next/server";

import { authorizationResponse, requireAdmin } from "@/lib/server/auth";
import {
  createChatMessage,
  getChatMessages,
} from "@/lib/server/visitor-data";

const validRoles = new Set(["customer", "professional", "admin"]);

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const applicationId = request.nextUrl.searchParams.get("applicationId") || "";
    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    return NextResponse.json({ data: await getChatMessages(applicationId) });
  } catch (error) {
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Chat lookup failed:", error);
    return NextResponse.json({ error: "Unable to load chat messages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json().catch(() => null);
    const applicationId = typeof body?.applicationId === "string" ? body.applicationId : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const senderRole = typeof body?.senderRole === "string" ? body.senderRole : "admin";

    if (!/^[a-zA-Z0-9_-]{1,200}$/.test(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }
    if (!message || message.length > 2000) {
      return NextResponse.json({ error: "Message must be 1-2000 characters" }, { status: 400 });
    }
    if (!validRoles.has(senderRole)) {
      return NextResponse.json({ error: "Invalid sender role" }, { status: 400 });
    }

    const id = await createChatMessage({
      applicationId,
      senderId: admin.userId,
      senderName: admin.name,
      senderRole: "admin",
      message,
      read: true,
    });

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Chat creation failed:", error);
    return NextResponse.json({ error: "Unable to send chat message" }, { status: 500 });
  }
}