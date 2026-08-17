import { createHash, randomBytes } from "crypto";

export const API_KEY_TTL_DAYS = 30;
export const API_KEY_TTL_MS = API_KEY_TTL_DAYS * 24 * 60 * 60 * 1000;

export function createApiKey() {
  const value = `mjd_${randomBytes(24).toString("hex")}`;
  return {
    value,
    hash: createHash("sha256").update(value).digest("hex"),
    last4: value.slice(-4),
  };
}

export function hashApiKey(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
