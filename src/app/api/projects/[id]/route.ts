import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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
