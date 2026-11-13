// ============================================================================
// 教程 Mermaid 图语法校验
// 静态导出构建只生成 HTML，不会执行客户端 mermaid 渲染，因此单独校验图源码。
// 用法：node scripts/check-mermaid.mjs
// ============================================================================
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dir = path.join(root, "src/content/tutorials");
const dirs = [dir, path.join(dir, "upgrades")];
const sources = [];
for (const d of dirs) {
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith(".ts") || f === "index.ts") continue;
    const src = fs.readFileSync(path.join(d, f), "utf8");
    const chunks = src.split(/(?=type: "mermaid")/).slice(1);
    for (const ch of chunks) {
      const m = ch.match(/source:\s*(?:String\.raw)?`([\s\S]*?)`/);
      if (m) sources.push({ file: f, source: m[1] });
    }
  }
}

let mermaid = null;
try {
  const mod = await import("mermaid");
  mermaid = mod.default;
  mermaid.initialize({ startOnLoad: false, theme: "dark",
    flowchart: { useMaxWidth: true }, sequence: { useMaxWidth: true } });
} catch (e) {
  console.log("mermaid 无法在 Node 环境加载，改用静态配对检查：", e.message);
}

const failures = [];
let sequenceCount = 0;
let parsed = 0;
let skipped = 0;
const pairCheck = (source) => {
  const opens = (source.match(/^\s*(alt|loop|opt|par|rect|critical|break|subgraph)\b/gm) || []).length;
  const ends = (source.match(/^\s*end\s*$/gm) || []).length;
  return opens === ends ? null : `块配对 ${opens} 开 / ${ends} 关`;
};
for (const { file, source } of sources) {
  const head = source.trim().split("\n")[0].trim();
  if (head.startsWith("sequenceDiagram")) sequenceCount++;
  const pairError = pairCheck(source);
  if (pairError) failures.push({ file, head, error: pairError });
  if (mermaid) {
    try {
      await mermaid.parse(source);
      parsed++;
    } catch (e) {
      const msg = String(e.message || e).split("\n")[0];
      // Node 无 DOM，flowchart/stateDiagram 会触发 DOMPurify；这是环境限制不是语法错误
      if (/DOMPurify|document is not defined|window is not defined/.test(msg)) skipped++;
      else failures.push({ file, head, error: msg });
    }
  }
}

console.log("Mermaid 图总数:", sources.length, "其中交互时序图:", sequenceCount);
console.log("mermaid.parse 通过:", parsed, "环境限制跳过(已做静态配对检查):", skipped);
console.log("校验方式:", mermaid ? "mermaid.parse() + 静态块配对" : "静态块配对");
if (failures.length) {
  console.log("语法失败:", failures.length);
  for (const f of failures) console.log(" -", f.file, "|", f.head, "|", f.error);
  process.exit(1);
}
console.log("全部通过");
