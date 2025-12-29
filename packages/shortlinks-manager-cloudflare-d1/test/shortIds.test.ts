import { test, expect, beforeAll, afterAll } from "bun:test";
import { Miniflare } from "miniflare";
import { lightFormat } from "date-fns";
import { createD1Backend } from "src";
import type { IShortLinksManagerBackend } from "@potonz/shortlinks-manager";

let mf: Miniflare;
let db: D1Database;
let backend: IShortLinksManagerBackend;

beforeAll(async () => {
    mf = new Miniflare({
        modules: true,
        script: `
export default {
    async fetch(request, env, ctx) {
        return new Response("Hello Miniflare!");
    }
}
`,
        d1Databases: {
            DB: "018648ab-e976-4825-847e-91c9293f2137",
        },
    });

    await mf.ready;

    db = await mf.getD1Database("DB");
    backend = createD1Backend(db);
    await backend.init?.();
});

afterAll(async () => {
    await mf.dispose();
});

test("create a short link", async () => {
    const expected = ["aB0", "https://poto.nz"] as const;

    expect(backend.createShortLink(expected[0], expected[1])).resolves.toBeUndefined();
});

test("get url by short id", async () => {
    const shortId = "abCD90";
    const expected = "https://poto.nz";

    await db.prepare("INSERT INTO sl_links_map (short_id, target_url) VALUES (?, ?)")
        .bind(shortId, expected)
        .run();

    const url = backend.getTargetUrl(shortId);

    expect(url).resolves.toStrictEqual(expected);
});

test("get unused short links", async () => {
    const expectedRemoved = "abc";
    const expectedExist = "def";

    await db.prepare("INSERT INTO sl_links_map (short_id, target_url, last_accessed_at) VALUES (?, ?, ?), (?, ?, ?)")
        .bind(
            expectedExist, "https://poto.nz", lightFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
            expectedRemoved, "https://poto.nz", "1970-01-01 00:00:00",
        )
        .run();

    await backend.cleanUnusedLinks(1);

    const removedUrl = backend.getTargetUrl(expectedRemoved);
    expect(removedUrl).resolves.toBeNull();
    const existUrl = backend.getTargetUrl(expectedExist);
    expect(existUrl).resolves.not.toBeNull();
});

test("get non-existing short id", async () => {
    expect(backend.getTargetUrl("does-not-exist")).resolves.toBeNull();
});
