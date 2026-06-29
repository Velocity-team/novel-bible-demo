import { getStore } from "@netlify/blobs";

/**
 * 방문 이벤트를 중앙(Netlify Blobs)에 저장한다.
 * 이벤트 1건 = blob 1개(`ev/` 프리픽스). 읽기-수정-쓰기가 없어 동시 이벤트가 유실되지 않는다.
 * POST body: { sid, type, feature?, ts? }
 */
export default async (req: Request): Promise<Response> => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }
  let body: { sid?: string; type?: string; feature?: string; ts?: number };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const sid = typeof body.sid === "string" ? body.sid.slice(0, 80) : "";
  const type = typeof body.type === "string" ? body.type.slice(0, 40) : "";
  if (!sid || !type) return new Response("missing sid/type", { status: 400 });

  const ev = {
    type,
    feature: typeof body.feature === "string" ? body.feature.slice(0, 80) : undefined,
    ts: typeof body.ts === "number" ? body.ts : Date.now(),
  };

  try {
    const store = getStore("nb-metrics");
    const key = `ev/${ev.ts}-${Math.random().toString(36).slice(2, 9)}`;
    await store.setJSON(key, { sid, type, feature: ev.feature, ts: ev.ts });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
};
