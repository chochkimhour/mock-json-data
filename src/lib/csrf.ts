import { NextResponse } from "next/server";

/** Allow non-browser API clients while rejecting cross-origin browser writes. */
export function csrfError(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return null;

  const expected = new URL(request.url).origin;
  if (origin === expected) return null;

  return NextResponse.json(
    { error: "Invalid request origin" },
    { status: 403 },
  );
}
