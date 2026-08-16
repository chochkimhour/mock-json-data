import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
export async function POST(req: NextRequest) {
  const address =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`login:${address}`, 10, 60_000).allowed)
    return NextResponse.json(
      { error: "Too many login attempts. Try again shortly." },
      { status: 429 },
    );
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
