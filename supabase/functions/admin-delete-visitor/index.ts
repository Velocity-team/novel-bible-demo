import {
  cleanText,
  forbiddenOrigin,
  getCorsHeaders,
  handleOptions,
  json,
  readJson,
  requireAdmin,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405, getCorsHeaders(req));
  }

  const originError = forbiddenOrigin(req);
  if (originError) return originError;

  const adminError = requireAdmin(req);
  if (adminError) return adminError;

  let body: Record<string, unknown>;
  try {
    body = await readJson(req, 2048);
  } catch {
    return json({ ok: false, error: "bad request" }, 400, getCorsHeaders(req));
  }

  const sid = cleanText(body.sid, 128);
  if (!sid) {
    return json({ ok: false, error: "missing sid" }, 400, getCorsHeaders(req));
  }

  try {
    const supabase = createServiceClient();
    const { count, error } = await supabase
      .from("events")
      .delete({ count: "exact" })
      .eq("sid", sid);

    if (error) throw error;

    return json({ ok: true, deleted: count ?? 0 }, 200, getCorsHeaders(req));
  } catch {
    return json({ ok: false, error: "failed to delete visitor" }, 500, getCorsHeaders(req));
  }
});
