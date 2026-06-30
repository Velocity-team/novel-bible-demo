import {
  cleanOptionalText,
  cleanText,
  cleanTimestamp,
  forbiddenOrigin,
  getCorsHeaders,
  handleOptions,
  json,
  readJson,
} from "../_shared/http.ts";
import { createServiceClient } from "../_shared/supabase.ts";

const METRIC_TYPES = new Set([
  "role_select",
  "demo_open",
  "interest_add",
  "interest_remove",
  "waitlist_submit",
  "submit_interest",
  "enter_demo",
  "app_feature",
]);

Deno.serve(async (req) => {
  const options = handleOptions(req);
  if (options) return options;

  if (req.method !== "POST") {
    return json({ ok: false, error: "method not allowed" }, 405, getCorsHeaders(req));
  }

  const originError = forbiddenOrigin(req);
  if (originError) return originError;

  let body: Record<string, unknown>;
  try {
    body = await readJson(req);
  } catch {
    return json({ ok: false, error: "bad request" }, 400, getCorsHeaders(req));
  }

  const sid = cleanText(body.sid, 128);
  const type = cleanText(body.type, 40);
  const feature = cleanOptionalText(body.feature, 512);
  const ts = cleanTimestamp(body.ts);

  if (!sid || !type || !METRIC_TYPES.has(type) || !ts) {
    return json({ ok: false, error: "invalid event" }, 400, getCorsHeaders(req));
  }

  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from("events")
      .insert({ sid, type, feature, ts })
      .select("id")
      .single();

    if (error) throw error;

    return json({ ok: true, id: data.id }, 200, getCorsHeaders(req));
  } catch {
    return json({ ok: false, error: "failed to store event" }, 500, getCorsHeaders(req));
  }
});
