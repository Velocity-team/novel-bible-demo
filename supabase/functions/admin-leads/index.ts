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
    return json({ leads: [], ok: false, error: "method not allowed" }, 405, getCorsHeaders(req));
  }

  const originError = forbiddenOrigin(req);
  if (originError) return originError;

  const adminError = requireAdmin(req);
  if (adminError) return adminError;

  const url = new URL(req.url);
  const limit = Math.min(Math.max(readNumberParam(url, "limit") ?? 500, 1), 1000);
  const from = readNumberParam(url, "from");
  const to = readNumberParam(url, "to");

  try {
    const supabase = createServiceClient();
    let query = supabase
      .from("leads")
      .select("id,sid,email,role,genre,genre_other,interests,ts,created_at")
      .order("ts", { ascending: false })
      .limit(limit);

    if (from) query = query.gte("ts", from);
    if (to) query = query.lte("ts", to);

    const { data, error } = await query;
    if (error) throw error;

    const leads = (data ?? []).map((lead) => ({
      id: lead.id,
      sid: lead.sid,
      email: lead.email,
      role: lead.role,
      genre: lead.genre,
      genreOther: lead.genre_other,
      interests: lead.interests,
      ts: lead.ts,
      createdAt: lead.created_at,
    }));

    return json({ leads }, 200, getCorsHeaders(req));
  } catch {
    return json({ leads: [], ok: false, error: "failed to load leads" }, 500, getCorsHeaders(req));
  }
});
