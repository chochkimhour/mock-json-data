import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const input = z.object({
  username: z.string().min(1),
  password: z.string().min(4).max(128),
});

export async function POST(request: NextRequest) {
  const parsed = input.safeParse(await request.json());
  if (!parsed.success)
    return NextResponse.json({ error: "Use a username and password of at least 4 characters." }, { status: 400 });
  const user = await db.user.findUnique({ where: { username: parsed.data.username } });
  if (!user)
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 12) },
  });
  return NextResponse.json({ ok: true });
}
