import { streak } from "./lib/core.js";

const statsEl = document.getElementById("stats");
const msgEl = document.getElementById("msg");

async function render() {
  const { stats } = await chrome.storage.local.get({ stats: null });
  const today = new Date().toISOString().slice(0, 10);
  const n = stats?.byDay?.[today] || 0;
  statsEl.textContent = `今日 ${n} 回・連続 ${streak(stats)} 日・合計 ${stats?.total || 0} 回`;
}

document.getElementById("start").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const ok = tab?.id && (await chrome.runtime.sendMessage({ type: "startBreakInTab", tabId: tab.id }));
  if (ok) window.close();
  else msgEl.textContent = "このページでは表示できません。普通のWebページで試してください。";
});

render();
