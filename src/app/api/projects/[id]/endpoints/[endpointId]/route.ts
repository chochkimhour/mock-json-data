import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { csrfError } from "@/lib/csrf";

async function ownedEndpoint(id: string, endpointId: string) {
  const user = await currentUser();
  if (!user)
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  const endpoint = await db.endpoint.findFirst({
    where: { id: endpointId, project: { id, ownerId: user.id } },
  });
  if (!endpoint)
    return {
      error: NextResponse.json({ error: "Not found" }, { status: 404 }),
    };
  return { endpoint };
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; endpointId: string }> },
) {
  const csrf = csrfError(_request);
  if (csrf) return csrf;
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
  const csrf = csrfError(request);
  if (csrf) return csrf;
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
        ...(typeof body.enabled === "boolean" ? { enabled: body.enabled } : {}),
      },
    });
    const user = await currentUser();
    if (user && typeof body.enabled === "boolean")
      await audit(
        user.id,
        body.enabled ? "endpoint.enabled" : "endpoint.disabled",
        values.id,
        { endpointId: endpoint.id },
      );
    return NextResponse.json(endpoint);
  } catch {
    return NextResponse.json(
      { error: "An endpoint with that method and path already exists." },
      { status: 409 },
    );
  }
}
