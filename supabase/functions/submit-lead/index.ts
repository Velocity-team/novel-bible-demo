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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanInterests(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim().slice(0, 100))
    .filter(Boolean)
    .slice(0, 50);
}

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
  const email = cleanText(body.email, 320)?.toLowerCase() ?? null;
  const role = cleanOptionalText(body.role, 100);
  const genre = cleanOptionalText(body.genre, 100);
  const genreOther = cleanOptionalText(body.genreOther, 100);
  const interests = cleanInterests(body.interests);
  const ts = cleanTimestamp(body.ts);

  if (!sid || !email || !EMAIL_PATTERN.test(email) || !ts) {
    return json({ ok: false, error: "invalid lead" }, 400, getCorsHeaders(req));
  }

  const payload = {
    sid,
    email,
    role,
    genre,
    genre_other: genreOther,
    interests,
    ts,
  };

  try {
    const supabase = createServiceClient();
    const inserted = await supabase.from("leads").insert(payload).select("id").single();

    if (!inserted.error) {
      return json({ ok: true, id: inserted.data.id }, 200, getCorsHeaders(req));
    }

    if (inserted.error.code !== "23505") {
      throw inserted.error;
    }

    const updated = await supabase
      .from("leads")
      .update(payload)
      .eq("email", email)
      .select("id")
      .single();

    if (updated.error) throw updated.error;

    return json({ ok: true, id: updated.data.id, updated: true }, 200, getCorsHeaders(req));
  } catch {
    return json({ ok: false, error: "failed to store lead" }, 500, getCorsHeaders(req));
  }
});
