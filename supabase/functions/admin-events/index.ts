import {
  forbiddenOrigin,
  getCorsHeaders,
  handleOptions,
  json,
  requireAdmin,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabase.ts";

function readNumberParam(url: URL, key: string): number | null {
  const raw = url.searchParams.get(key);
  if (!raw) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.trunc(value) : null;
}

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== "GET") {
    return json({ events: [], ok: false, error: "method not allowed" }, 405, getCorsHeaders(req));
  }

  const originError = forbiddenOrigin(req);
  if (originError) return originError;

  const adminError = requireAdmin(req);
  if (adminError) return adminError;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(readNumberParam(url, "limit") ?? 8000, 1), 8000);
  const from = readNumberParam(url, "from");
  const to = readNumberParam(url, "to");

  try {
    const supabase = createServiceClient();
    let query = supabase
      .from("events")
      .select("sid,type,feature,ts")
      .order("ts", { ascending: false })
      .limit(limit);

    if (from) query = query.gte("ts", from);
    if (to) query = query.lte("ts", to);

    const { data, error } = await query;
    if (error) throw error;

    const events = [...(data ?? [])].sort((a, b) => Number(a.ts) - Number(b.ts));
    return json({ events }, 200, getCorsHeaders(req));
  } catch {
    return json({ events: [], ok: false, error: "failed to load events" }, 500, getCorsHeaders(req));
  }
});
