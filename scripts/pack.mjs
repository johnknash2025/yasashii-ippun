// 配布用の .zip と .crx を dist/ に作る。
// 鍵は KEY_PATH（既定: ./yasashii-ippun.pem）。無ければ新しく作られるので、
// 同じ拡張機能IDを保つためにその鍵は安全な場所に保管し、リポジトリには入れないこと。
import crx3 from "crx3";
import { readFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const version = JSON.parse(readFileSync("extension/manifest.json", "utf8")).version;
const keyPath = process.env.KEY_PATH || "yasashii-ippun.pem";
mkdirSync("dist", { recursive: true });

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    statSync(p).isDirectory() ? walk(p) : files.push(p);
  }
})("extension");

await crx3(files, {
  keyPath,
  crxPath: `dist/yasashii-ippun-${version}.crx`,
  zipPath: `dist/yasashii-ippun-${version}.zip`
});
console.log(`dist/yasashii-ippun-${version}.{crx,zip} を作成しました`);
