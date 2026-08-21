import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { API_KEY_TTL_MS, createApiKey } from "@/lib/api-key";
import { decryptApiKey, encryptApiKey } from "@/lib/api-key-crypto";
import { audit } from "@/lib/audit";
import { csrfError } from "@/lib/csrf";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const stored = await db.user.findUnique({
    where: { id: user.id },
    select: { apiKeyEncrypted: true, apiKeyCreatedAt: true, apiKeyLast4: true },
  });
  return NextResponse.json({
    apiKey: stored?.apiKeyEncrypted
      ? decryptApiKey(stored.apiKeyEncrypted)
      : null,
    last4: stored?.apiKeyLast4 ?? null,
    createdAt: stored?.apiKeyCreatedAt ?? null,
  });
}

export async function POST(request: Request) {
  const csrf = csrfError(request);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  for (let attempt = 0; attempt < 5; attempt++) {
    const apiKey = createApiKey();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + API_KEY_TTL_MS);
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          apiKeyHash: apiKey.hash,
          apiKeyEncrypted: encryptApiKey(apiKey.value),
          apiKeyLast4: apiKey.last4,
          apiKeyCreatedAt: createdAt,
          apiKeyRevokedAt: null,
        },
      });
      await audit(user.id, "api_key.created", undefined, {
        last4: apiKey.last4,
      });
      return NextResponse.json({ apiKey: apiKey.value, createdAt, expiresAt });
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  return NextResponse.json(
    { error: "Could not generate API key" },
    { status: 500 },
  );
}

export async function DELETE(request: Request) {
  const csrf = csrfError(request);
  if (csrf) return csrf;
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.update({
    where: { id: user.id },
    data: {
      apiKeyHash: null,
      apiKeyEncrypted: null,
      apiKeyLast4: null,
      apiKeyRevokedAt: new Date(),
    },
  });
  await audit(user.id, "api_key.revoked");
  return NextResponse.json({ ok: true });
}
