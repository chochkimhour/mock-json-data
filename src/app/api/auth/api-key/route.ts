import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  for (let attempt = 0; attempt < 5; attempt++) {
    const apiKey = `mjd_${randomBytes(24).toString("hex")}`;
    try {
      const updated = await db.user.update({ where: { id: user.id }, data: { apiKey }, select: { apiKey: true } });
      return NextResponse.json(updated);
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  return NextResponse.json({ error: "Could not generate API key" }, { status: 500 });
}

export async function DELETE() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.update({ where: { id: user.id }, data: { apiKey: null } });
  return NextResponse.json({ ok: true });
}
