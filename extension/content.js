// やさしい一分: ページ内の表示（休憩ガイド・言い換えダイアログ・スクロール検知）
(() => {
  if (window.__yasashiiIppun) return;
  window.__yasashiiIppun = true;

  const DEFAULTS = { sites: [], scrollScreens: 40, cooldownMinutes: 20, sound: false };

  function mount(html, css) {
    const host = document.createElement("div");
    host.style.cssText = "all:initial;position:fixed;inset:0;z-index:2147483647;";
    const root = host.attachShadow({ mode: "closed" });
    root.innerHTML = `<style>
      :host{all:initial}
      .back{position:fixed;inset:0;background:rgba(20,28,24,.55);display:flex;align-items:center;justify-content:center;font-family:system-ui,"Hiragino Sans","Noto Sans JP",sans-serif}
      .card{background:#f7f5ef;color:#24302a;border-radius:16px;padding:28px 32px;max-width:420px;width:calc(100% - 48px);box-shadow:0 12px 40px rgba(0,0,0,.25);text-align:center}
      button{font:inherit;border:0;border-radius:999px;padding:8px 18px;margin:6px;cursor:pointer;background:#dfe8e1;color:#24302a}
      button.primary{background:#4f7a62;color:#fff}
      ${css}</style>${html}`;
    document.documentElement.appendChild(host);
    return { root, close: () => host.remove() };
  }

  function beep() {
    try {
      const ctx = new AudioContext();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 528;
      g.gain.setValueAtTime(0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 1.2);
    } catch {}
  }

  async function showBreak() {
    const { sound } = await chrome.storage.sync.get({ sound: DEFAULTS.sound });
    const { root, close } = mount(
      `<div class="back"><div class="card">
        <div class="circle"></div>
        <p class="guide">吸って…</p>
        <p class="time">60</p>
        <button class="stop">やめる</button>
      </div></div>`,
      `.circle{width:120px;height:120px;margin:8px auto 16px;border-radius:50%;background:#9cc3a9;animation:breathe 8s ease-in-out infinite}
       @keyframes breathe{0%,100%{transform:scale(.6)}50%{transform:scale(1)}}
       .guide{font-size:20px;margin:4px 0}.time{font-size:14px;opacity:.7}`
    );
    let left = 60;
    const timeEl = root.querySelector(".time");
    const guideEl = root.querySelector(".guide");
    const t = setInterval(async () => {
      left--;
      timeEl.textContent = String(left);
      guideEl.textContent = left % 8 >= 4 ? "吸って…" : "吐いて…";
      if (left <= 0) {
        clearInterval(t);
        if (sound) beep();
        await chrome.runtime.sendMessage({ type: "breakDone" });
        guideEl.textContent = "おつかれさまでした";
        timeEl.textContent = "";
        root.querySelector(".stop").textContent = "閉じる";
      }
    }, 1000);
    root.querySelector(".stop").addEventListener("click", () => {
      clearInterval(t);
      close();
    });
  }

  function showRewrite(original, softened) {
    const { root, close } = mount(
      `<div class="back"><div class="card">
        <p class="label">元の文</p><p class="orig"></p>
        <p class="label">やわらかくした文</p><textarea class="out"></textarea>
        <div><button class="primary copy">コピー</button><button class="close">閉じる</button></div>
        <p class="note">単純なルールでの言い換えです。最後は自分の言葉で整えてください。</p>
      </div></div>`,
      `.card{text-align:left}.label{font-size:12px;opacity:.6;margin:10px 0 2px}
       .orig{margin:0;white-space:pre-wrap}
       textarea{width:100%;box-sizing:border-box;min-height:90px;font:inherit;border:1px solid #c9d3cc;border-radius:8px;padding:8px;background:#fff;color:#24302a}
       .note{font-size:12px;opacity:.6;margin-top:10px}`
    );
    root.querySelector(".orig").textContent = original;
    const out = root.querySelector(".out");
    out.value = softened;
    root.querySelector(".copy").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(out.value);
        root.querySelector(".copy").textContent = "コピーしました";
      } catch {
        out.select();
      }
    });
    root.querySelector(".close").addEventListener("click", close);
  }

  function offerBreak() {
    const { root, close } = mount(
      `<div class="toast"><span>たくさんスクロールしました。60秒休憩しませんか？</span>
        <button class="primary yes">休憩する</button><button class="no">あとで</button></div>`,
      `.toast{position:fixed;right:20px;bottom:20px;background:#f7f5ef;color:#24302a;border-radius:14px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,.2);font-family:system-ui,"Hiragino Sans",sans-serif;font-size:14px;max-width:360px}`
    );
    // トーストはページ全体を覆わず、右下だけに置く
    root.host.style.cssText = "all:initial;position:fixed;right:0;bottom:0;z-index:2147483647;";
    root.querySelector(".yes").addEventListener("click", () => {
      close();
      showBreak();
    });
    root.querySelector(".no").addEventListener("click", close);
    setTimeout(close, 15000);
  }

  // スクロール検知（登録されたサイトでのみこのスクリプトが自動で読み込まれる）
  let scrolled = 0;
  let lastY = window.scrollY;
  window.addEventListener(
    "scroll",
    async () => {
      const y = window.scrollY;
      scrolled += Math.abs(y - lastY) / Math.max(1, window.innerHeight);
      lastY = y;
      const cfg = await chrome.storage.sync.get(DEFAULTS);
      if (scrolled < cfg.scrollScreens) return;
      const { lastOffer = 0 } = await chrome.storage.local.get("lastOffer");
      scrolled = 0;
      if (Date.now() - lastOffer < cfg.cooldownMinutes * 60000) return;
      await chrome.storage.local.set({ lastOffer: Date.now() });
      offerBreak();
    },
    { passive: true }
  );

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === "showBreak") showBreak();
    if (msg?.type === "rewrite") showRewrite(msg.original, msg.softened);
  });
})();
