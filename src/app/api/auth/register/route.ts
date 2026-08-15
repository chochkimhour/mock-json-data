import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
const input = z.object({
  username: z.string().min(1).max(255),
  password: z.string().min(4).max(128),
  name: z.string().max(100).optional(),
});
export async function POST(req: NextRequest) {
  const parsed = input.safeParse(await req.json());
  if (!parsed.success)
    return NextResponse.json(
      { error: "Use a username and password of at least 4 characters." },
      { status: 400 },
    );
  try {
    const { password, username, name } = parsed.data;
    const user = await db.user.create({
      data: {
        username,
        name,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });
    await createSession(user.id);
    return NextResponse.json(
      { id: user.id, username: user.username },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "That username is already in use." },
        { status: 409 },
      );
    }

    console.error("Account registration failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json(
      { error: "We could not create your account. Please try again." },
      { status: 500 },
    );
  }
}
