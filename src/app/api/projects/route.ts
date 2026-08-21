import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectInput } from "@/lib/validation";
import { randomInt } from "crypto";
import { csrfError } from "@/lib/csrf";

const shortIdAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
function createShortId(length = 6) {
  return Array.from(
    { length },
    () => shortIdAlphabet[randomInt(shortIdAlphabet.length)],
  ).join("");
}
export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const projects = await db.project.findMany({
    where: {
      ownerId: user.id,
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
    },
    select: {
      id: true,
      publicId: true,
      slug: true,
      name: true,
      description: true,
      visibility: true,
      enabled: true,
      updatedAt: true,
      expiresAt: true,
      owner: {
        select: {
          apiKeyLast4: true,
          apiKeyCreatedAt: true,
          apiKeyRevokedAt: true,
        },
      },
      _count: { select: { endpoints: true, logs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(projects, {
    headers: { "Cache-Control": "private, no-store" },
  });
}
export async function POST(req: NextRequest) {
  const csrf = csrfError(req);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = projectInput.safeParse(await req.json());
  if (!data.success)
    return NextResponse.json({ error: "Invalid project" }, { status: 400 });
  const baseSlug =
    data.data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mock-api";
  let slug = `${baseSlug}-${createShortId()}`;
  while (await db.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${createShortId()}`;
  }
  return NextResponse.json(
    await db.project.create({
      data: {
        ...data.data,
        slug,
        ownerId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
    { status: 201 },
  );
}
