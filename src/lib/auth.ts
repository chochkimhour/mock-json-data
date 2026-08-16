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
export async function createSession(userId: string, remember = false) {
  const token = randomBytes(32).toString("base64url");
  const maxAge = remember ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
  await db.session.create({
    data: {
      userId,
      tokenHash: hash(token),
      expiresAt: new Date(Date.now() + maxAge * 1000),
    },
  });
  const cookieOptions: Parameters<
    Awaited<ReturnType<typeof cookies>>["set"]
  >[2] = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  };
  if (remember) cookieOptions.maxAge = maxAge;
  (await cookies()).set(cookieName, token, cookieOptions);
}
export async function destroySession() {
  const store = await cookies(),
    token = store.get(cookieName)?.value;
  if (token) await db.session.deleteMany({ where: { tokenHash: hash(token) } });
  store.delete(cookieName);
}
