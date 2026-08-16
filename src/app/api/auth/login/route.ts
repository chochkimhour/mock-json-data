import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
export async function POST(req: NextRequest) {
  const data = z
    .object({
      username: z.string().min(1),
      password: z.string().min(4),
      rememberMe: z
        .preprocess((value) => value === true || value === "on", z.boolean())
        .default(false),
    })
    .safeParse(await req.json());
  if (!data.success)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const user = await db.user.findUnique({
    where: { username: data.data.username },
  });
  if (!user || !(await bcrypt.compare(data.data.password, user.passwordHash)))
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  await createSession(user.id, data.data.rememberMe);
  return NextResponse.json({ id: user.id, username: user.username });
}
