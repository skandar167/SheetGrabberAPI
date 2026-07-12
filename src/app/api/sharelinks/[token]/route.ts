import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/lib/models/ShareLink";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";


interface Params {
  params: Promise<{ token: string }>;
}

/** GET /api/sharelinks/[token] — public: get clients data for a share link */
export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params;
  await connectDB();

  const link = await ShareLink.findOne({ token });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  if (!link.active) {
    return NextResponse.json({ error: "This link has been deactivated", inactive: true }, { status: 410 });
  }

  return NextResponse.json({
    ok: true,
    label: link.label,
    clients: JSON.parse(link.clientsData),
  });
}

/** PATCH /api/sharelinks/[token] — toggle active (owner or admin only) */
export async function PATCH(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { active } = await req.json();

  await connectDB();
  const link = await ShareLink.findOne({ token });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Only owner or admin can toggle
  if (link.createdBy.toString() !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  link.active = active;
  await link.save();

  return NextResponse.json({ ok: true, active: link.active });
}

/** DELETE /api/sharelinks/[token] — delete a link completely (owner or admin only) */
export async function DELETE(req: NextRequest, { params }: Params) {
  const { token } = await params;
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const link = await ShareLink.findOne({ token });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // Only owner or admin can delete
  if (link.createdBy.toString() !== session.userId && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await link.deleteOne();

  return NextResponse.json({ ok: true, deleted: true });
}

