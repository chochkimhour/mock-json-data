import { z } from "zod";
export const methods = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;
export const endpointInput = z.object({
  method: z.enum(methods),
  path: z
    .string()
    .regex(/^\//)
    .max(240)
    .refine((v) => !v.includes("//") && !v.includes("..")),
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  statusCode: z.number().int().min(100).max(599),
  responseBody: z.unknown(),
  responseHeaders: z.record(z.string(), z.string()).default({}),
  requestSchema: z.unknown().optional(),
  requestExample: z.unknown().optional(),
  delayMs: z.number().int().min(0).max(10_000).default(0),
  enabled: z.boolean().default(true),
  mode: z.enum(["STATIC", "STATEFUL"]).default("STATIC"),
  seedData: z.unknown().optional(),
});
export const projectInput = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional(),
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
});
export function safeHeaders(input: Record<string, string>) {
  const blocked = new Set([
    "set-cookie",
    "content-length",
    "connection",
    "transfer-encoding",
  ]);
  return Object.fromEntries(
    Object.entries(input).filter(
      ([key, value]) =>
        /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(key) &&
        !blocked.has(key.toLowerCase()) &&
        value.length <= 1000,
    ),
  );
}
