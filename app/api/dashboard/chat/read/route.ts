import { NextRequest, NextResponse } from "next/server";

import { authorizationResponse, requireAdmin } from "@/lib/server/auth";
import { markChatMessageRead } from "@/lib/server/visitor-data";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const messageId = typeof body?.messageId === "string" ? body.messageId : "";

    if (!/^[a-zA-Z0-9-]{1,100}$/.test(messageId)) {
      return NextResponse.json({ error: "Invalid message ID" }, { status: 400 });
    }

    await markChatMessageRead(messageId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && "status" in error) return authorizationResponse(error);
    console.error("Chat read update failed:", error);
    return NextResponse.json({ error: "Unable to mark message as read" }, { status: 500 });
  }
}