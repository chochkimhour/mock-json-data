import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { endpointInput } from "@/lib/validation";
import { csrfError } from "@/lib/csrf";

export async function GET(
  _request: NextRequest,
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
  return NextResponse.json(
    await db.endpoint.findMany({
      where: { projectId: project.id },
      orderBy: [{ path: "asc" }, { method: "asc" }],
    }),
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const csrf = csrfError(req);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = await db.project.findFirst({
    where: { id: (await params).id, ownerId: user.id },
  });
  if (!project)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const input = await req.json();
  if (input.endpointId) {
    const existing = await db.endpoint.findFirst({
      where: { id: input.endpointId, projectId: project.id },
    });
    if (!existing)
      return NextResponse.json(
        { error: "Endpoint not found" },
        { status: 404 },
      );
    const updated = await db.endpoint.update({
      where: { id: existing.id },
      data: {
        name: input.name,
        method: input.method,
        path: input.path,
        statusCode: input.statusCode,
        responseBody: input.responseBody,
      },
    });
    return NextResponse.json(updated);
  }
  const data = endpointInput.safeParse(input);
  if (!data.success)
    return NextResponse.json(
      { error: "Invalid endpoint", details: data.error.flatten() },
      { status: 400 },
    );
  try {
    const endpoint = await db.endpoint.create({
      data: {
        ...data.data,
        projectId: project.id,
        responseBody: data.data.responseBody as never,
        responseHeaders: data.data.responseHeaders as never,
        requestSchema: data.data.requestSchema as never,
        requestExample: data.data.requestExample as never,
        seedData: data.data.seedData as never,
        stateData:
          data.data.mode === "STATEFUL"
            ? (data.data.seedData as never)
            : undefined,
      },
    });
    return NextResponse.json(endpoint, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "An endpoint with that method and path already exists." },
      { status: 409 },
    );
  }
}
