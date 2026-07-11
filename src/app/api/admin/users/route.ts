import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/User";
import { getSessionUser } from "@/lib/auth";

/** GET /api/admin/users — list all non-admin users (admin only) */
export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await connectDB();
  const users = await User.find({ role: "user" })
    .select("-passwordHash")
    .sort({ createdAt: -1 });

  return NextResponse.json({ users });
}

/** PATCH /api/admin/users — approve or reject a user */
export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, status } = await req.json();

  if (!userId || !["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await connectDB();
  const updated = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, select: "-passwordHash" }
  );

  if (!updated) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user: updated });
}
