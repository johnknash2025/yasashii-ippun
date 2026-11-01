import { DEFAULTS, matchPatterns, recordBreak, soften } from "./lib/core.js";

const SCRIPT_ID = "yasashii-auto";

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.create({
    id: "soften",
    title: "やさしく言い換える",
    contexts: ["selection"]
  });
  await syncAutoScript();
});

chrome.runtime.onStartup.addListener(syncAutoScript);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.sites) syncAutoScript();
});
chrome.permissions.onAdded.addListener(syncAutoScript);
chrome.permissions.onRemoved.addListener(syncAutoScript);

/** 許可済みのサイトにだけ、スクロール検知のスクリプトを登録する */
async function syncAutoScript() {
  const { sites } = await chrome.storage.sync.get({ sites: DEFAULTS.sites });
  const wanted = matchPatterns(sites);
  const granted = [];
  for (const p of wanted) {
    if (await chrome.permissions.contains({ origins: [p] })) granted.push(p);
  }
  const existing = await chrome.scripting.getRegisteredContentScripts({ ids: [SCRIPT_ID] });
  if (existing.length) await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
  if (granted.length) {
    await chrome.scripting.registerContentScripts([
      { id: SCRIPT_ID, matches: granted, js: ["content.js"], runAt: "document_idle" }
    ]);
  }
}

async function inject(tabId) {
  await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "soften" || !tab?.id) return;
  const original = info.selectionText || "";
  try {
    await inject(tab.id);
    await chrome.tabs.sendMessage(tab.id, { type: "rewrite", original, softened: soften(original) });
  } catch (e) {
    console.warn("このページでは使えません", e);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg?.type === "breakDone") {
    chrome.storage.local.get({ stats: null }).then(({ stats }) =>
      chrome.storage.local.set({ stats: recordBreak(stats) }).then(() => sendResponse(true))
    );
    return true;
  }
  if (msg?.type === "startBreakInTab" && msg.tabId) {
    inject(msg.tabId)
      .then(() => chrome.tabs.sendMessage(msg.tabId, { type: "showBreak" }))
      .then(() => sendResponse(true))
      .catch(() => sendResponse(false));
    return true;
  }
  return false;
});
