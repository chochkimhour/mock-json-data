import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matchPath } from "@/lib/routing";
import { renderTemplate } from "@/lib/templates";
import { safeHeaders } from "@/lib/validation";
import { schemaToZod } from "@/lib/schema";
import { rateLimit } from "@/lib/rate-limit";
import { API_KEY_TTL_MS, hashApiKey } from "@/lib/api-key";
type RuntimeScenario = {
  slug: string;
  isDefault: boolean;
  responseBody: unknown;
  responseHeaders: unknown;
  statusCode: number | null;
  delayMs: number | null;
  mode: "STATIC" | "STATEFUL" | null;
};
type RuntimeEndpoint = {
  id: string;
  method: string;
  path: string;
  requestSchema: unknown;
  responseBody: unknown;
  responseHeaders: unknown;
  statusCode: number;
  delayMs: number;
  mode: "STATIC" | "STATEFUL";
  stateData: unknown;
  seedData: unknown;
  scenarios: RuntimeScenario[];
};
export const dynamic = "force-dynamic";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,HEAD,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Mock-Scenario, X-API-Key",
  "Access-Control-Expose-Headers": "x-request-id",
};
function jsonEnvelope(data: unknown, status: number, message: string) {
  const requestId = crypto.randomUUID();
  const existing =
    data && typeof data === "object" && !Array.isArray(data)
      ? (data as Record<string, unknown>)
      : null;
  const payload =
    existing &&
    "status" in existing &&
    "success" in existing &&
    "data" in existing
      ? {
          ...existing,
          status,
          timestamp: existing.timestamp ?? new Date().toISOString(),
        }
      : {
          status,
          success: status >= 200 && status < 400,
          message,
          data: data ?? null,
          timestamp: new Date().toISOString(),
        };
  return NextResponse.json(payload, {
    status,
    headers: { ...CORS, "x-request-id": requestId },
  });
}
async function handle(
  request: NextRequest,
  context: { params: Promise<{ publicId: string; path: string[] }> },
) {
  const started = Date.now(),
    { publicId, path } = await context.params;
  const address =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`public:${address}:${publicId}`, 120, 60_000).allowed)
    return jsonEnvelope(null, 429, "Too many requests. Try again shortly.");
  if (request.method === "OPTIONS")
    return new NextResponse(null, { status: 204, headers: CORS });
  const project = await db.project.findUnique({
    where: { publicId },
    select: {
      id: true,
      visibility: true,
      enabled: true,
      expiresAt: true,
      logRequestBodies: true,
      owner: {
        select: {
          apiKeyHash: true,
          apiKeyCreatedAt: true,
          apiKeyRevokedAt: true,
        },
      },
      endpoints: {
        where: { enabled: true },
        select: {
          id: true,
          method: true,
          path: true,
          requestSchema: true,
          responseBody: true,
          responseHeaders: true,
          statusCode: true,
          delayMs: true,
          mode: true,
          stateData: true,
          seedData: true,
          scenarios: {
            select: {
              slug: true,
              isDefault: true,
              responseBody: true,
              responseHeaders: true,
              statusCode: true,
              delayMs: true,
              mode: true,
            },
          },
        },
      },
    },
  });
  if (!project || project.visibility !== "PUBLIC" || !project.enabled)
    return jsonEnvelope(null, 404, "Mock project not found");
  if (project.expiresAt && project.expiresAt <= new Date()) {
    await db.project.delete({ where: { id: project.id } });
    return jsonEnvelope(null, 404, "Mock project expired");
  }
  const suppliedKey =
    request.headers.get("x-api-key") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (
    !suppliedKey ||
    !project.owner.apiKeyHash ||
    project.owner.apiKeyRevokedAt ||
    !project.owner.apiKeyCreatedAt ||
    project.owner.apiKeyCreatedAt.getTime() + API_KEY_TTL_MS <= Date.now() ||
    hashApiKey(suppliedKey) !== project.owner.apiKeyHash
  )
    return jsonEnvelope(null, 401, "A valid API key is required");
  if (
    !rateLimit(
      `public:key:${project.id}:${hashApiKey(suppliedKey)}`,
      300,
      60_000,
    ).allowed
  )
    return jsonEnvelope(
      null,
      429,
      "API key rate limit exceeded. Try again shortly.",
    );
  const endpoints = project.endpoints as RuntimeEndpoint[];
  const urlPath = "/" + path.join("/");
  const method = request.method;
  const candidates = endpoints
    .filter((e: RuntimeEndpoint) => e.method === method)
    .map((e: RuntimeEndpoint) => ({ e, params: matchPath(e.path, urlPath) }))
    .filter(
      (x: {
        e: RuntimeEndpoint;
        params: Record<string, string> | null;
      }): x is { e: RuntimeEndpoint; params: Record<string, string> } =>
        x.params !== null,
    );
  if (!candidates.length) {
    const anyPath = endpoints.some((e: RuntimeEndpoint) =>
      matchPath(e.path, urlPath),
    );
    const errorStatus = anyPath ? 405 : 404;
    return jsonEnvelope(
      null,
      errorStatus,
      anyPath ? "Method not supported" : "Endpoint not found",
    );
  }
  const { e, params } = candidates[0];
  let body: unknown = undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    const text = await request.text();
    if (text.length > 1_000_000)
      return jsonEnvelope(null, 413, "Request body too large");
    if (text) {
      try {
        body = request.headers.get("content-type")?.includes("application/json")
          ? JSON.parse(text)
          : text;
      } catch {
        return jsonEnvelope(null, 400, "Invalid JSON request body");
      }
    }
  }
  if (e.requestSchema) {
    const parsed = schemaToZod(e.requestSchema as never).safeParse(body);
    if (!parsed.success)
      return jsonEnvelope(
        parsed.error.flatten(),
        422,
        "Request validation failed",
      );
  }
  const wanted =
    request.headers.get("x-mock-scenario") ??
    request.nextUrl.searchParams.get("scenario");
  const scenario = wanted
    ? e.scenarios.find((s: RuntimeScenario) => s.slug === wanted)
    : e.scenarios.find((s: RuntimeScenario) => s.isDefault);
  if (wanted && !scenario) return jsonEnvelope(null, 404, "Scenario not found");
  const query = Object.fromEntries(request.nextUrl.searchParams);
  let responseBody = (scenario?.responseBody ?? e.responseBody) as unknown,
    status = scenario?.statusCode ?? e.statusCode,
    mode = scenario?.mode ?? e.mode;
  if (mode === "STATEFUL") {
    let data = (e.stateData ?? e.seedData ?? []) as unknown[];
    const id = params.id;
    if (request.method === "GET")
      responseBody = id
        ? (data.find(
            (x) => String((x as Record<string, unknown>).id) === id,
          ) ?? { error: "Not found" })
        : data;
    else if (request.method === "POST") {
      const record = {
        ...(body as Record<string, unknown>),
        id: (body as Record<string, unknown>)?.id ?? crypto.randomUUID(),
      };
      data = [...data, record];
      responseBody = record;
      status = status === 200 ? 201 : status;
      await db.endpoint.update({
        where: { id: e.id },
        data: { stateData: data as never },
      });
    } else if (["PUT", "PATCH"].includes(request.method) && id) {
      let found = false;
      data = data.map((x) =>
        String((x as Record<string, unknown>).id) === id
          ? ((found = true),
            {
              ...(x as Record<string, unknown>),
              ...(body as Record<string, unknown>),
            })
          : x,
      );
      if (!found) {
        responseBody = { error: "Not found" };
        status = 404;
      } else {
        responseBody = data.find(
          (x) => String((x as Record<string, unknown>).id) === id,
        );
        await db.endpoint.update({
          where: { id: e.id },
          data: { stateData: data as never },
        });
      }
    } else if (request.method === "DELETE" && id) {
      const count = data.length;
      data = data.filter(
        (x) => String((x as Record<string, unknown>).id) !== id,
      );
      if (count === data.length) {
        responseBody = { error: "Not found" };
        status = 404;
      } else {
        responseBody = { success: true };
        await db.endpoint.update({
          where: { id: e.id },
          data: { stateData: data as never },
        });
      }
    }
  }
  const delay = Math.min(scenario?.delayMs ?? e.delayMs, 10_000);
  if (delay) await new Promise((r) => setTimeout(r, delay));
  const headers = {
    ...CORS,
    ...safeHeaders(
      (scenario?.responseHeaders ?? e.responseHeaders) as Record<
        string,
        string
      >,
    ),
    "x-request-id": crypto.randomUUID(),
  };
  const rendered = renderTemplate(responseBody, {
    request: body,
    params,
    query,
  });
  void db.requestLog
    .create({
      data: {
        projectId: project.id,
        endpointId: e.id,
        method: request.method,
        path: urlPath,
        query,
        headers: { "user-agent": request.headers.get("user-agent") ?? "" },
        body: project.logRequestBodies ? (body as never) : undefined,
        statusCode: status,
        durationMs: Date.now() - started,
        scenario: scenario?.slug,
      },
    })
    .catch(() => undefined);
  const existing =
    rendered && typeof rendered === "object" && !Array.isArray(rendered)
      ? (rendered as Record<string, unknown>)
      : null;
  const finalPayload =
    existing &&
    "status" in existing &&
    "success" in existing &&
    "data" in existing
      ? {
          ...existing,
          status,
          timestamp: existing.timestamp ?? new Date().toISOString(),
        }
      : {
          status,
          success: status >= 200 && status < 400,
          message:
            status >= 200 && status < 400
              ? "Request successful"
              : "Request failed",
          data: rendered ?? null,
          timestamp: new Date().toISOString(),
        };
  return new NextResponse(
    request.method === "HEAD" ? null : JSON.stringify(finalPayload),
    {
      status,
      headers: {
        ...headers,
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
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
