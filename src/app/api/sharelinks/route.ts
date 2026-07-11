import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import ShareLink from "@/lib/models/ShareLink";
import { getSessionUser } from "@/lib/auth";
import { nanoid } from "nanoid";

/** POST /api/sharelinks — create a new share link */
export async function POST(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { clientsData, label } = await req.json();

  if (!clientsData || !Array.isArray(clientsData)) {
    return NextResponse.json({ error: "clientsData must be an array" }, { status: 400 });
  }

  await connectDB();

  const token = nanoid(20);

  const link = await ShareLink.create({
    token,
    clientsData: JSON.stringify(clientsData),
    createdBy: session.userId,
    active: true,
    label: label || `Carte du ${new Date().toLocaleDateString("fr-FR")}`,
  });

  return NextResponse.json({ ok: true, token: link.token, label: link.label });
}

/** GET /api/sharelinks — list share links for the current user */
export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const links = await ShareLink.find({ createdBy: session.userId })
    .select("-clientsData")
    .sort({ createdAt: -1 });

  return NextResponse.json({ links });
}
