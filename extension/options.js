import { DEFAULTS, matchPatterns, normalizeHost } from "./lib/core.js";

const $ = (id) => document.getElementById(id);

async function load() {
  const cfg = await chrome.storage.sync.get(DEFAULTS);
  $("sites").value = cfg.sites.join("\n");
  $("scrollScreens").value = cfg.scrollScreens;
  $("cooldownMinutes").value = cfg.cooldownMinutes;
  $("sound").checked = cfg.sound;
}

$("save").addEventListener("click", async () => {
  const sites = [...new Set($("sites").value.split(/\s+/).map(normalizeHost).filter(Boolean))];
  const origins = matchPatterns(sites);
  // サイトへのアクセスは、ここで書いたサイトの分だけ許可を求める
  const granted = origins.length ? await chrome.permissions.request({ origins }) : true;
  if (!granted) {
    $("status").textContent = "サイトへのアクセスが許可されなかったため、保存していません。";
    return;
  }
  await chrome.storage.sync.set({
    sites,
    scrollScreens: Math.max(5, Number($("scrollScreens").value) || DEFAULTS.scrollScreens),
    cooldownMinutes: Math.max(1, Number($("cooldownMinutes").value) || DEFAULTS.cooldownMinutes),
    sound: $("sound").checked
  });
  $("sites").value = sites.join("\n");
  $("status").textContent = "保存しました。";
});

load();
