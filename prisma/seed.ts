import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();
async function main() {
  const username = process.env.DEMO_USERNAME;
  if (!username) return;
  const user = await db.user.upsert({
    where: { username },
    update: {},
    create: {
      username,
      passwordHash: await bcrypt.hash(
        process.env.DEMO_PASSWORD ?? "development-only-password",
        12,
      ),
      name: "Demo Developer",
    },
  });
  const project = await db.project.upsert({
    where: { publicId: "demo-users-api" },
    update: {},
    create: {
      publicId: "demo-users-api",
      name: "Users API",
      description: "Development demo",
      visibility: "PUBLIC",
      ownerId: user.id,
    },
  });
  await db.endpoint.upsert({
    where: {
      projectId_method_path: {
        projectId: project.id,
        method: "GET",
        path: "/users",
      },
    },
    update: {},
    create: {
      projectId: project.id,
      method: "GET",
      path: "/users",
      name: "List users",
      responseBody: [{ id: 1, name: "Kimhour", email: "kimhour@example.test" }],
    },
  });
}
main().finally(() => db.$disconnect());
