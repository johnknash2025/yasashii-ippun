// やさしい一分: 純粋ロジック（ブラウザAPIに依存しない。テスト対象）

export const DEFAULTS = Object.freeze({
  sites: [],            // 自動休憩を有効にするホスト名（例: "x.com"）。既定は空 = 自動提案オフ
  scrollScreens: 40,    // 画面何枚分スクロールしたら提案するか
  cooldownMinutes: 20,  // 提案後、次に提案するまでの間隔
  sound: false
});

/** "https://www.x.com/home" や "x.com" を正規化したホスト名にする */
export function normalizeHost(input) {
  let s = String(input || "").trim().toLowerCase();
  if (!s) return "";
  if (!/^[a-z]+:\/\//.test(s)) s = "https://" + s;
  try {
    return new URL(s).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/** ホストがリスト内のサイト（サブドメイン含む）に該当するか */
export function isSiteEnabled(host, sites) {
  const h = normalizeHost(host);
  if (!h) return false;
  return sites.map(normalizeHost).some((s) => s && (h === s || h.endsWith("." + s)));
}

/** 権限要求・コンテンツスクリプト登録用のマッチパターン */
export function matchPatterns(sites) {
  const out = new Set();
  for (const s of sites.map(normalizeHost).filter(Boolean)) {
    out.add(`*://${s}/*`);
    out.add(`*://*.${s}/*`);
  }
  return [...out];
}

/** 休憩の統計を更新（日付キーごとの回数と合計） */
export function recordBreak(stats, date = new Date()) {
  const day = date.toISOString().slice(0, 10);
  const next = { total: 0, byDay: {}, ...(stats || {}) };
  next.byDay = { ...next.byDay, [day]: (next.byDay[day] || 0) + 1 };
  next.total = (next.total || 0) + 1;
  // 直近60日分だけ残す
  const keys = Object.keys(next.byDay).sort();
  for (const k of keys.slice(0, Math.max(0, keys.length - 60))) delete next.byDay[k];
  return next;
}

/** 連続日数（今日を含めてさかのぼる） */
export function streak(stats, date = new Date()) {
  const byDay = (stats && stats.byDay) || {};
  let n = 0;
  const d = new Date(date);
  while (byDay[d.toISOString().slice(0, 10)]) {
    n++;
    d.setUTCDate(d.getUTCDate() - 1);
  }
  return n;
}

const RULES = [
  [/[!！]{2,}/g, "！"],
  [/[?？]{2,}/g, "？"],
  [/([^\s])！/g, "$1。"],
  [/^(いや|は\?|はぁ|ていうか|てか|つーか|まじで|マジで)[、,\s]*/g, ""],
  [/(しろ|やれ)(よ)?(。|$)/g, "していただけると助かります$3"],
  [/(するな|やめろ)(よ)?(。|$)/g, "は控えていただけるとうれしいです$3"],
  [/だろ(う)?(が)?(。|$)/g, "だと思います$3"],
  [/じゃん(。|$)/g, "ですね$1"],
  [/(意味|わけ)(が)?わからん/g, "$1がつかめませんでした"],
  [/普通は/g, "一般的には"],
  [/絶対に?/g, "できれば"],
  [/[wｗ]{2,}/g, ""]
];

/** 日本語の文を、単純なルールでやわらかくする（AIは使わない） */
export function soften(text) {
  let out = String(text || "");
  out = out
    .split(/\n/)
    .map((line) => {
      let l = line.trim();
      for (const [re, rep] of RULES) l = l.replace(re, rep);
      return l;
    })
    .join("\n")
    .replace(/。{2,}/g, "。");
  return out;
}
