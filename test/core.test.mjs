import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeHost, isSiteEnabled, matchPatterns, recordBreak, streak, soften } from "../extension/lib/core.js";

test("normalizeHost", () => {
  assert.equal(normalizeHost("https://www.X.com/home"), "x.com");
  assert.equal(normalizeHost("youtube.com"), "youtube.com");
  assert.equal(normalizeHost("  "), "");
});

test("isSiteEnabled matches subdomains only for listed sites", () => {
  assert.ok(isSiteEnabled("m.youtube.com", ["youtube.com"]));
  assert.ok(!isSiteEnabled("notyoutube.com", ["youtube.com"]));
  assert.ok(!isSiteEnabled("x.com", []));
});

test("matchPatterns", () => {
  assert.deepEqual(matchPatterns(["x.com"]), ["*://x.com/*", "*://*.x.com/*"]);
  assert.deepEqual(matchPatterns([]), []);
});

test("recordBreak and streak", () => {
  const d1 = new Date("2026-11-01T10:00:00Z");
  const d2 = new Date("2026-11-02T10:00:00Z");
  let s = recordBreak(null, d1);
  s = recordBreak(s, d2);
  s = recordBreak(s, d2);
  assert.equal(s.total, 3);
  assert.equal(s.byDay["2026-11-02"], 2);
  assert.equal(streak(s, d2), 2);
});

test("soften", () => {
  assert.equal(soften("早くしろ！！"), "早くしていただけると助かります。");
  assert.equal(soften("いや、それ普通はやらないでしょ"), "それ一般的にはやらないでしょ");
  assert.equal(soften("意味わからんwww"), "意味がつかめませんでした");
});
