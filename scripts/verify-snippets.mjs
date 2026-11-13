// ============================================================================
// 教程代码块可运行性验证
//
// 从升级教程数据中抽出带 filename 的代码块，写入临时目录后：
//   - 运行 python -m pytest -q（Python 示例与其回归测试）
//   - 运行 node --experimental-strip-types --test（TypeScript 示例与测试）
// 验证结束打印结果并删除临时目录。
//
// 用法：node scripts/verify-snippets.mjs
// ============================================================================
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const upgradeDir = path.join(root, "src/content/tutorials/upgrades");
const outDir = path.join(root, ".snippet-check");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "package.json"),
  JSON.stringify({ type: "module", private: true }), "utf8");

// 默认只验证「纯标准库、可离线运行」的批次；传 --all 可扫描全部升级文件，
// 但依赖 openai / mcp 等真实 SDK 的示例需要在对应环境单独验证。
const args = process.argv.slice(2);
const files = args.includes("--all")
  ? fs.readdirSync(upgradeDir).filter((f) => f.endsWith(".ts") && f !== "index.ts")
  : (args.length ? args : ["deep-batch7.ts", "deep-batch8.ts"]);
const seen = new Set();
let extracted = 0;
for (const f of files) {
  const src = fs.readFileSync(path.join(upgradeDir, f), "utf8");
  const chunks = src.split(/(?=\{\s*type: "code")/);
  for (const c of chunks) {
    const fn = c.match(/filename:\s*"([^"]+)"/);
    const code = c.match(/code:\s*String\.raw`([\s\S]*?)`/);
    if (!fn || !code) continue;
    const name = fn[1];
    if (!/\.(py|ts|yaml|yml|json|txt|sql|bash)$/.test(name)) continue;
    // Node 的类型剥离模式需要显式 .ts 扩展；教程中的 .js 导入是 bundler 写法
    const body = name.endsWith(".ts")
      ? code[1].replace(/(from\s+["']\.\/[^"']+)\.js(["'])/g, "$1.ts$2")
      : code[1];
    fs.writeFileSync(path.join(outDir, name), body, "utf8");
    if (!seen.has(name)) { seen.add(name); extracted++; }
  }
}

console.log("提取文件数:", extracted, "→", [...seen].join(", "));

const run = (label, cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: outDir, encoding: "utf8" });
  console.log("\n===== " + label + " (exit " + r.status + ") =====");
  if (r.stdout) console.log(r.stdout.trim());
  if (r.stderr) console.log(r.stderr.trim());
  return r.status;
};

const pyFiles = [...seen].filter((n) => n.startsWith("test_") && n.endsWith(".py"));
let failed = 0;
if (pyFiles.length) failed += run("pytest", "python", ["-m", "pytest", "-q", ...pyFiles]) === 0 ? 0 : 1;
const tsTests = [...seen].filter((n) => n.endsWith(".test.ts"));
for (const t of tsTests) {
  failed += run("node --test " + t, process.execPath,
    ["--experimental-strip-types", "--test", t]) === 0 ? 0 : 1;
}

fs.rmSync(outDir, { recursive: true, force: true });
console.log("\n失败组数:", failed);
process.exit(failed ? 1 : 0);
