# Yasashii Ippun

English | [日本語](README.ja.md)

**A Chrome extension (Manifest V3): a 60-second break guide and a rephraser that turns sharp sentences gentle. Everything runs in the browser and nothing is ever sent outside.**

A small Chrome extension ("yasashii ippun" means "one gentle minute"): a 60-second breathing break and a simple rule-based softener for blunt Japanese sentences. Everything runs locally. The extension interface is Japanese.

## Features
- **60-second break**: the toolbar button shows a 60-second guide paced to your breathing.
- **Scroll-break suggestions**: only when you scroll a lot on sites you list in settings. Off by default.
- **Gentle rephrasing**: select a sentence, right-click, and pick the rephrase item "やさしく言い換える" (menu labels are in Japanese). Rule-based only; no AI is used.
- **Tracking**: today's count, streak days, and total count are stored in the browser.

## Install

### Method 1: load the zip (Windows, Mac, Linux)
1. Download and unpack `yasashii-ippun-<version>.zip` from [Releases](https://github.com/johnknash2025/yasashii-ippun/releases/latest)
2. Open `chrome://extensions` in Chrome and turn on "Developer mode" (top right)
3. Click "Load unpacked extension" and select the unpacked folder

If you use the source directly, the `extension/` folder in this repository loads the same way.

### Method 2: .crx file (mostly Linux)
Drag and drop the `.crx` from Releases onto `chrome://extensions`. Chrome on Windows and Mac usually rejects .crx files from outside the store, so use Method 1 there.

## Permissions
| Permission | Why |
| --- | --- |
| storage | save settings and break records |
| contextMenus | the right-click "やさしく言い換える" item |
| activeTab, scripting | show the overlay only in the tab where you clicked the button or menu item |
| site access (optional) | requested only for the sites you list in settings, when you save them |

## Development
```
npm install
npm test        # unit tests for the logic
npm run pack    # builds zip and crx in dist/ (key via KEY_PATH, never stored in the repo)
```

## Status
| Verified | How |
| --- | --- |
| site matching, stats, rephrase rules | automated tests pass (5 tests) |
| syntax of all scripts | Node.js syntax check |
| **Not verified** | |
| a full run in a real Chrome | not yet tried start-to-finish in a local Chrome |

Bugs and requests: open an [Issue](https://github.com/johnknash2025/yasashii-ippun/issues/new?template=feedback.yml).

## License
[MIT](LICENSE) © johnkhappy
