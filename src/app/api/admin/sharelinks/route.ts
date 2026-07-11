import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/lib/models/ShareLink";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** GET /api/admin/sharelinks — admin: list all share links in the system */
export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const links = await ShareLink.find({})
    .populate("createdBy", "username")
    .select("-clientsData")
    .sort({ createdAt: -1 });

  return NextResponse.json({ links });
}
