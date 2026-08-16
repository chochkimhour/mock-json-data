import { createHash, randomBytes } from "crypto";

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
