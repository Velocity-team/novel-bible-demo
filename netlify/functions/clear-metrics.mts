import { getStore } from "@netlify/blobs";

/**
 * 중앙 지표(Netlify Blobs)를 비운다. 비공개 키가 있어야 동작한다.
 * GET /.netlify/functions/clear-metrics?key=...
 */
function env(name: string): string {
  return Netlify.env.get(name) ?? process.env[name] ?? "";
}

export default async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const adminKey = env("CLEAR_METRICS_KEY");
  if (!adminKey || url.searchParams.get("key") !== adminKey) {
    return new Response("forbidden", { status: 403 });
  }
  try {
    const store = getStore("nb-metrics");
    let deleted = 0;
    // list가 결과적 일관성이라 몇 번 반복해 비운다.
    for (let pass = 0; pass < 3; pass++) {
      const { blobs } = await store.list();
      if (blobs.length === 0) break;
      await Promise.all(blobs.map((b) => store.delete(b.key)));
      deleted += blobs.length;
    }
    return new Response(JSON.stringify({ ok: true, deleted }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
