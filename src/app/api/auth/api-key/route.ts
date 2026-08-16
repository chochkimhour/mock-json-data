import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { createApiKey } from "@/lib/api-key";

export async function POST() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  for (let attempt = 0; attempt < 5; attempt++) {
    const apiKey = createApiKey();
    const createdAt = new Date();
    const expiresAt = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    try {
      await db.user.update({
        where: { id: user.id },
        data: {
          apiKeyHash: apiKey.hash,
          apiKeyLast4: apiKey.last4,
          apiKeyCreatedAt: createdAt,
          apiKeyRevokedAt: null,
        },
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

export async function DELETE() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await db.user.update({
    where: { id: user.id },
    data: { apiKeyHash: null, apiKeyLast4: null, apiKeyRevokedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
