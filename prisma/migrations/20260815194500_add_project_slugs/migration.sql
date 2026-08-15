-- The slug column and unique index were already applied to the database with
-- `prisma db push`; this migration records that schema change for deployments.
-- It is intentionally idempotent for the already-updated development database.
ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project"("slug");
