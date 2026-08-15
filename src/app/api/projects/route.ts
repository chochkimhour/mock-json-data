import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectInput } from "@/lib/validation";
export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(
    await db.project.findMany({
      where: { ownerId: user.id },
      include: { _count: { select: { endpoints: true, logs: true } } },
      orderBy: { updatedAt: "desc" },
    }),
  );
}
export async function POST(req: NextRequest) {
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
      .replace(/^-|-$/g, "") || "mock";
  let slug = baseSlug;
  for (
    let suffix = 2;
    await db.project.findUnique({ where: { slug } });
    suffix++
  ) {
    slug = `${baseSlug}-${suffix}`;
  }
  return NextResponse.json(
    await db.project.create({ data: { ...data.data, slug, ownerId: user.id } }),
    { status: 201 },
  );
}
