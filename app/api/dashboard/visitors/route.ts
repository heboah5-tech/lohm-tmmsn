import { NextRequest, NextResponse } from "next/server";

import { authorizationResponse, requireAdmin } from "@/lib/server/auth";
import { listVisitorRecords, deleteVisitorRecords } from "@/lib/server/visitor-data";

const statuses = new Set([
  "draft",
  "pending_review",
  "approved",
  "rejected",
  "completed",
]);

const toBoolean = (value: string | null) => {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const params = request.nextUrl.searchParams;
    const search = params.get("search")?.trim().toLowerCase() || "";
    const status = params.get("status") || "";
    const paymentStatus = params.get("paymentStatus") || "";
    const online = toBoolean(params.get("online"));
    const blocked = toBoolean(params.get("blocked"));
    const currentPage = params.get("currentPage") || "";
    const from = params.get("from");
    const to = params.get("to");
    const page = Math.max(Number(params.get("page")) || 1, 1);
    const pageSize = Math.min(Math.max(Number(params.get("pageSize")) || 50, 1), 200);

    if (status && !statuses.has(status)) {
      return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
    }

    let visitors = await listVisitorRecords();
    visitors = visitors.filter((visitor) => {
      const values = [
        visitor.id,
        visitor.ownerName,
        visitor.phoneNumber,
        visitor.identityNumber,
        visitor.vehicleModel,
        visitor.insuranceType,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const createdAt = new Date(visitor.createdAt).getTime();

      return (
        (!search || values.includes(search)) &&
        (!status || visitor.status === status) &&
        (!paymentStatus || visitor.paymentStatus === paymentStatus) &&
        (online === undefined || Boolean(visitor.isOnline) === online) &&
        (blocked === undefined || Boolean(visitor.isBlocked) === blocked) &&
        (!currentPage ||
          String(visitor.currentPage || visitor.currentStep || "") === currentPage) &&
        (!from || createdAt >= new Date(from).getTime()) &&
        (!to || createdAt <= new Date(`${to}T23:59:59.999Z`).getTime())
      );
    });

    const total = visitors.length;
    const start = (page - 1) * pageSize;
    const data = visitors.slice(start, start + pageSize);

    return NextResponse.json({ data, total, page, pageSize });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return authorizationResponse(error);
    }
    console.error("Visitor listing failed:", error);
    return NextResponse.json({ error: "Unable to load visitor records" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const ids = Array.isArray(body?.ids) ? body.ids : [];

    if (
      ids.length === 0 ||
      ids.length > 100 ||
      ids.some((id: unknown) => typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,200}$/.test(id))
    ) {
      return NextResponse.json({ error: "Invalid visitor IDs" }, { status: 400 });
    }

    await deleteVisitorRecords(ids);
    return NextResponse.json({ success: true, deleted: ids.length });
  } catch (error) {
    if (error instanceof Error && "status" in error) {
      return authorizationResponse(error);
    }
    console.error("Visitor deletion failed:", error);
    return NextResponse.json({ error: "Unable to delete visitor records" }, { status: 500 });
  }
}