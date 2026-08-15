import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

async function ownedEndpoint(id: string, endpointId: string) {
  const user = await currentUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const endpoint = await db.endpoint.findFirst({
    where: { id: endpointId, project: { id, ownerId: user.id } },
  });
  if (!endpoint) return { error: NextResponse.json({ error: "Not found" }, { status: 404 }) };
  return { endpoint };
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; endpointId: string }> },
) {
  const values = await params;
  const owned = await ownedEndpoint(values.id, values.endpointId);
  if ("error" in owned) return owned.error;
  await db.endpoint.delete({ where: { id: owned.endpoint.id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; endpointId: string }> },
) {
  const values = await params;
  const owned = await ownedEndpoint(values.id, values.endpointId);
  if ("error" in owned) return owned.error;
  const body = await request.json();
  try {
    const endpoint = await db.endpoint.update({
      where: { id: owned.endpoint.id },
      data: {
        name: body.name,
        method: body.method,
        path: body.path,
        statusCode: body.statusCode,
        responseBody: body.responseBody,
      },
    });
    return NextResponse.json(endpoint);
  } catch {
    return NextResponse.json({ error: "An endpoint with that method and path already exists." }, { status: 409 });
  }
}
