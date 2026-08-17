import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export function audit(
  userId: string,
  action: string,
  projectId?: string,
  metadata?: Record<string, unknown>,
) {
  return db.auditLog.create({
    data: {
      userId,
      action,
      projectId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  });
}
