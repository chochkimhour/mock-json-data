import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
const cookieName = "mjd_session";
const hash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
export async function currentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hash(token) },
    select: {
      id: true,
      tokenHash: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
        },
      },
    },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}
export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  await db.session.create({
    data: {
      userId,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });
  (await cookies()).set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
export async function destroySession() {
  const store = await cookies(),
    token = store.get(cookieName)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } });
  store.delete(cookieName);
}
