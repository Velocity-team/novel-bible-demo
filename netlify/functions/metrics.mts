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
 * 모든 방문자의 이벤트를 합쳐 돌려준다(백오피스가 읽는다).
 * 응답: { events: { sid, type, feature?, ts }[] }
 */
export default async (req: Request): Promise<Response> => {
  const adminPassword = env("BACKOFFICE_PASSWORD").trim();
  if (!adminPassword) {
    return json({ events: [], ok: false, error: "backoffice password is not configured" }, 500);
  }

  const provided = (req.headers.get("x-admin-password") ?? "").trim();
  if (provided !== adminPassword) {
    return json({ events: [], ok: false, error: "unauthorized" }, 401);
  }

  try {
    const store = getStore("nb-metrics");
    const { blobs } = await store.list({ prefix: "ev/" });
    // 키가 `ev/<ts>-...` 라 사전순 = 시간순. 최근 8000건만.
    const keys = blobs.map((b) => b.key).sort().slice(-8000);
    const fetched = await Promise.all(
      keys.map((k) => store.get(k, { type: "json" }) as Promise<{ sid: string; type: string; feature?: string; ts: number } | null>)
    );
    const out = fetched.filter(
      (e): e is { sid: string; type: string; feature?: string; ts: number } => !!e && !!e.sid && !!e.type
    );

    out.sort((a, b) => a.ts - b.ts);
    return new Response(JSON.stringify({ events: out.slice(-8000) }), {
      headers: {
        "content-type": "application/json",
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ events: [], error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
