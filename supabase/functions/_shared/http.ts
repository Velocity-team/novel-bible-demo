export type JsonValue = Record<string, unknown>;

const DEFAULT_ALLOWED_ORIGINS = ["https://loreblock-demo.netlify.app"];

export function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...headers,
    },
  });
}

export function getAllowedOrigins(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? Deno.env.get("ALLOWED_ORIGIN") ?? "";
  const configured = raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
}

export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowedOrigins = getAllowedOrigins();
  const allowOrigin = allowedOrigins.includes("*")
    ? "*"
    : allowedOrigins.includes(origin)
      ? origin
      : allowedOrigins[0];

  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-headers": "authorization, content-type, x-admin-password",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "vary": "Origin",
  };
}

export function isAllowedOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes("*") || allowedOrigins.includes(origin);
}

export function handleOptions(req: Request): Response | null {
  if (req.method !== "OPTIONS") return null;
  if (!isAllowedOrigin(req)) {
    return json({ ok: false, error: "forbidden origin" }, 403, getCorsHeaders(req));
  }
  return new Response(null, { status: 204, headers: getCorsHeaders(req) });
}

export function forbiddenOrigin(req: Request): Response | null {
  if (isAllowedOrigin(req)) return null;
  return json({ ok: false, error: "forbidden origin" }, 403, getCorsHeaders(req));
}

export async function readJson<T extends JsonValue>(req: Request, maxBytes = 8192): Promise<T> {
  const text = await req.text();
  if (text.length > maxBytes) {
    throw new Error("payload too large");
  }
  return JSON.parse(text) as T;
}

export function requireAdmin(req: Request): Response | null {
  const adminPassword = (Deno.env.get("BACKOFFICE_PASSWORD") ?? "").trim();
  if (!adminPassword) {
    return json(
      { ok: false, error: "backoffice password is not configured" },
      500,
      getCorsHeaders(req),
    );
  }

  const provided = (req.headers.get("x-admin-password") ?? "").trim();
  if (provided !== adminPassword) {
    return json({ ok: false, error: "unauthorized" }, 401, getCorsHeaders(req));
  }

  return null;
}

export function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  return text.slice(0, maxLength);
}

export function cleanOptionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? text.slice(0, maxLength) : null;
}

export function cleanTimestamp(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return null;
  return Math.trunc(value);
}
