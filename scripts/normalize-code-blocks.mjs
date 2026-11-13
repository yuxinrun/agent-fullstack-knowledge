// ============================================================================
// 教程代码块转义归一化工具
//
// 背景：教程数据用 TypeScript 模板字符串保存代码。普通模板字符串会解释
// \b(退格)、\d / \s / \w(丢反斜杠)、\n(真实换行) 等序列，导致页面展示的
// Python / Shell / YAML 代码被破坏。加 String.raw 前缀后，代码文本按字面保留。
//
// 用法：
//   node scripts/normalize-code-blocks.mjs           # 只统计，不改动
//   node scripts/normalize-code-blocks.mjs --write  # 执行归一化
// ============================================================================
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tutorialDir = path.join(root, "src/content/tutorials");
const upgradeDir = path.join(tutorialDir, "upgrades");
const files = [];
for (const f of fs.readdirSync(tutorialDir)) {
  if (f.endsWith(".ts") && f !== "index.ts") files.push(path.join(tutorialDir, f));
}
if (fs.existsSync(upgradeDir)) {
  for (const f of fs.readdirSync(upgradeDir)) {
    if (f.endsWith(".ts") && f !== "index.ts") files.push(path.join(upgradeDir, f));
  }
}

const write = process.argv.includes("--write");
const blockRe = /code:[ \t]*(String\.raw)?`([\s\S]*?)`/g;
const stats = { files: files.length, blocks: 0, alreadyRaw: 0, converted: 0,
  withBackslash: 0, withInterpolation: 0, withDoubleBackslash: 0 };
const risky = [];

for (const f of files) {
  let src = fs.readFileSync(f, "utf8");
  const blocks = [...src.matchAll(blockRe)];
  for (const m of blocks) {
    stats.blocks++;
    if (m[1]) stats.alreadyRaw++;
    if (/\\/.test(m[2])) stats.withBackslash++;
    if (/\\\\/.test(m[2])) stats.withDoubleBackslash++;
    if (/\$\{/.test(m[2])) {
      stats.withInterpolation++;
      risky.push(path.relative(root, f) + " 含 ${...}，String.raw 仍会插值，需人工处理");
    }
  }
  if (!write) continue;
  if (stats.withInterpolation > 0 && risky.some((r) => r.startsWith(path.relative(root, f)))) {
    continue; // 存在插值风险的文件跳过，避免生成坏代码
  }
  const next = src.replace(/code:[ \t]*(String\.raw)?`([\s\S]*?)`/g,
    (all, raw, body) => {
      if (raw) return all;
      stats.converted++;
      // 原作者为抵消模板转义写下的 \\ 需还原为字面单个 \，
      // 否则加上 String.raw 后会显示成两个反斜杠。
      return "code: String.raw`" + body.replace(/\\\\/g, "\\") + "`";
    });
  if (next !== src) fs.writeFileSync(f, next, "utf8");
}

console.log(JSON.stringify(stats, null, 2));
if (risky.length) console.log("需人工处理:\n" + risky.join("\n"));
if (!write) console.log("dry-run：未写入任何文件。加 --write 执行归一化。");
