import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

async function handle(
  request: NextRequest,
  context: { params: Promise<{ slug: string; path: string[] }> },
) {
  const { slug, path } = await context.params;
  const project = await db.project.findFirst({
    where: {
      OR: [
        { slug },
        { publicId: slug },
        { name: { equals: slug, mode: "insensitive" } },
      ],
    },
  });
  if (!project || project.visibility !== "PUBLIC") {
    return NextResponse.json(
      { error: "Mock project not found" },
      { status: 404 },
    );
  }
  const target = new URL(
    "/m/" + project.publicId + "/" + path.join("/"),
    request.url,
  );
  target.search = request.nextUrl.search;
  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();
  const response = await fetch(target, {
    method: request.method,
    headers: request.headers,
    body,
    redirect: "manual",
  });
  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export {
  handle as GET,
  handle as POST,
  handle as PUT,
  handle as PATCH,
  handle as DELETE,
  handle as HEAD,
  handle as OPTIONS,
};
