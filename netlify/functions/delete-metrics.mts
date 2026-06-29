import { getStore } from "@netlify/blobs";

function env(name: string): string {
  return Netlify.env.get(name) ?? process.env[name] ?? "";
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}

/**
 * 특정 방문 키(sid)에 해당하는 중앙 지표 이벤트를 삭제한다.
 * POST /.netlify/functions/delete-metrics
 * Headers: x-admin-password: <BACKOFFICE_PASSWORD>
 * Body: { sid: string }
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const adminPassword = env("BACKOFFICE_PASSWORD").trim();
  if (!adminPassword) {
    return json({ events: [], ok: false, error: "backoffice password is not configured" }, 500);
  }

  const provided = (req.headers.get("x-admin-password") ?? "").trim();
  if (provided !== adminPassword) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  let body: { sid?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "bad request" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const sid = typeof body.sid === "string" ? body.sid.trim().slice(0, 80) : "";
  if (!sid) {
    return new Response(JSON.stringify({ ok: false, error: "missing sid" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const store = getStore("nb-metrics");
    const { blobs } = await store.list({ prefix: "ev/" });
    let deleted = 0;

    for (const blob of blobs) {
      const event = (await store.get(blob.key, { type: "json" })) as { sid?: string } | null;
      if (event?.sid === sid) {
        await store.delete(blob.key);
        deleted += 1;
      }
    }

    return new Response(JSON.stringify({ ok: true, deleted }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
