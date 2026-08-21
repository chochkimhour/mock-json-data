import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { randomBytes } from "crypto";
import { csrfError } from "@/lib/csrf";

function createSlugSuffix() {
  return randomBytes(4).toString("hex").slice(0, 6);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = csrfError(request);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const enabled = typeof body?.enabled === "boolean" ? body.enabled : undefined;
  if (name !== undefined && (!name || name.length > 80))
    return NextResponse.json(
      { error: "Name must be 1–80 characters." },
      { status: 400 },
    );
  const project = await db.project.findFirst({
    where: { id: (await params).id, ownerId: user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (name === undefined && enabled === undefined)
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  const baseSlug = name
    ?.toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  let slug: string | undefined;
  if (baseSlug) {
    do {
      slug = `${baseSlug}-${createSlugSuffix()}`;
    } while (await db.project.findUnique({ where: { slug } }));
  }
  const updated = await db.project.update({
    where: { id: project.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(slug !== undefined ? { slug } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
    },
  });
  await audit(
    user.id,
    enabled === undefined ? "project.renamed" : "project.updated",
    project.id,
    {
      ...(name !== undefined ? { name } : {}),
      ...(enabled !== undefined ? { enabled } : {}),
    },
  );
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = csrfError(request);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await db.project.findFirst({
    where: { id: (await params).id, ownerId: user.id },
    select: { id: true },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.project.delete({ where: { id: project.id } });
  return NextResponse.json({ ok: true });
}
