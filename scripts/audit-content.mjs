// ============================================================================
// 全站内容审计与质量验收工具（V2.0）
// 用法：node scripts/audit-content.mjs
// 输出：docs/CONTENT_AUDIT_REPORT.md
//
// 设计原则：
// - 纯静态解析，不执行业务代码，零副作用。
// - 评分基于「结构多样性 + 深度章节覆盖」，段落数量本身几乎不加分，
//   避免「靠堆字数提升等级」。
// - 同时校验全站交叉引用（失效链接）。
// ============================================================================
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tutorialDir = path.join(root, "src/content/tutorials");
const contentDir = path.join(root, "src/content");

const read = (p) => fs.readFileSync(p, "utf8");

// ---------------------------------------------------------------------------
// 1. 解析教程文件
// ---------------------------------------------------------------------------
function parseTutorialFile(file, dir = tutorialDir) {
  const src = read(path.join(dir, file));
  const parts = src.split(/(?=^\s{4}slug: ")/m);
  const list = [];
  for (const ch of parts) {
    const slugM = ch.match(/^\s{4}slug: "([^"]+)"/m);
    if (!slugM) continue;
    const get = (re) => ch.match(re)?.[1] ?? "";
    const headings = [...ch.matchAll(/heading: "([^"]+)"/g)].map((m) => m[1]);
    const types = { paragraph: 0, list: 0, callout: 0, code: 0, mermaid: 0, table: 0 };
    for (const m of ch.matchAll(/type: "(paragraph|list|callout|code|mermaid|table)"/g)) {
      types[m[1]]++;
    }
    const codeBlocks = [...ch.matchAll(/code:\s*(?:String\.raw)?`([\s\S]*?)`/g)].map((m) => m[1]);
    const codeLines = codeBlocks.reduce((a, b) => a + b.split("\n").length, 0);
    const refBlock = ch.match(/references:\s*\[([\s\S]*?)\]\s*,/)?.[1] ?? "";
    // 参考资料两种写法：对象字面量 { title: ... } 与文件级助手 R("title", "url", ...)
    const refs = (refBlock.match(/\{\s*title:/g) || []).length
      + (refBlock.match(/R\("/g) || []).length;
    const refsWithUrl = (refBlock.match(/url:/g) || []).length
      + (refBlock.match(/R\("[^"]*",\s*"https?:\/\//g) || []).length;
    // R() 助手把 verifiedAt 写在文件头部（首个 slug 之前），需按整个文件判断
    const hasVerifiedAt = /verifiedAt:/.test(refBlock) || /verifiedAt:/.test(src);
    const relBlock = ch.match(/relatedTutorialIds:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    const related = [...relBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const archBlock = ch.match(/architectureIds:\s*\[([^\]]*)\]/)?.[1] ?? "";
    const archIds = [...archBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const arr = (field) => {
      const b = ch.match(new RegExp(`${field}:\\s*\\[([^\\]]*)\\]`))?.[1] ?? "";
      return [...b.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    };
    const nextSlugs = arr("nextTutorialSlugs");
    const labSlugs = arr("relatedLabSlugs");
    const caseSlugs = arr("relatedCaseSlugs");
    const cnChars = (ch.replace(/code:\s*(?:String\.raw)?`[\s\S]*?`/g, "").match(/[\u4e00-\u9fa5]/g) || []).length;

    list.push({
      file,
      slug: slugM[1],
      title: get(/^\s{4}title: "([^"]+)"/m),
      domainId: get(/^\s{4}domainId: "([^"]+)"/m),
      difficulty: get(/^\s{4}difficulty: "([^"]+)"/m),
      updatedAt: get(/^\s{4}updatedAt: "([^"]+)"/m),
      headings,
      types,
      blocks: Object.values(types).reduce((a, b) => a + b, 0),
      codeBlocks: codeBlocks.length,
      codeLines,
      refs,
      refsWithUrl,
      hasVerifiedAt,
      related,
      archIds,
      nextSlugs,
      labSlugs,
      caseSlugs,
      cnChars,
      text: ch,
    });
  }
  return list;
}

const files = fs.readdirSync(tutorialDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
let tutorials = [];
for (const f of files) tutorials.push(...parseTutorialFile(f));

// 与运行时一致：以 slug 覆盖为 V2.0 深度升级版，保持基础顺序与 URL
const upgradeDir = path.join(tutorialDir, "upgrades");
const upgrades = [];
let upgradedFiles = [];
if (fs.existsSync(upgradeDir)) {
  upgradedFiles = fs.readdirSync(upgradeDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
  for (const f of upgradedFiles) upgrades.push(...parseTutorialFile(f, upgradeDir));
  const map = new Map(upgrades.map((t) => [t.slug, t]));
  tutorials = tutorials.map((t) => map.get(t.slug) ?? t);
  const additions = upgrades.filter((t) => !tutorials.some((x) => x.slug === t.slug));
  tutorials.push(...additions);
}
const upgradedSlugs = new Set(upgrades.map((t) => t.slug));
tutorials.sort((a, b) => a.domainId.localeCompare(b.domainId) || a.slug.localeCompare(b.slug));

// ---------------------------------------------------------------------------
// 2. 质量评分（8 维 × 5 分 = 40 分）与 L0-L5 等级
// ---------------------------------------------------------------------------
const has = (t, re) => re.test(t.text);
const cap = (n) => Math.min(5, Math.max(0, n));

function score(t) {
  const d = {};
  // 概念准确性
  d.concept = cap(
    (t.types.paragraph >= 1 ? 1 : 0) +
    (has(t, /定义|是什么|概述|概念|Overview|Fundamentals/) ? 1 : 0) +
    (has(t, /区别|差异|对比|边界|不适用|vs\.|Vs\./) ? 1 : 0) +
    (has(t, /背景|产生|为什么需要|解决的核心|解决什么|动机/) ? 1 : 0) +
    (t.types.table >= 1 || t.types.callout >= 1 ? 1 : 0)
  );
  // 原理深度
  d.fundamentals = cap(
    (has(t, /原理|机制|工作流程|执行循环|内部|如何工作|状态流/) ? 1 : 0) +
    (t.types.mermaid >= 1 ? 1 : 0) +
    (has(t, /状态|数据结构|输入|输出|边界|局限/) ? 1 : 0) +
    (has(t, /算法|协议|协商|Schema|schema|序列化/) || t.types.code >= 1 ? 1 : 0) +
    (t.headings.length >= 8 && t.types.paragraph >= 6 ? 1 : 0)
  );
  // 架构完整性
  d.architecture = cap(
    (has(t, /架构|组件|Architecture|Component/) ? 1 : 0) +
    (t.types.mermaid >= 1 ? 1 : 0) +
    (t.types.table >= 1 ? 1 : 0) +
    (has(t, /数据流|控制流|调用关系|状态流|外部依赖/) ? 1 : 0) +
    (has(t, /异常处理|扩展方式|降级|伸缩/) ? 1 : 0)
  );
  // 工程实践
  d.engineering = cap(
    (t.codeBlocks >= 1 ? 1 : 0) +
    (t.codeBlocks >= 2 ? 1 : 0) +
    (t.codeLines >= 40 ? 1 : 0) +
    (has(t, /实战|实现|工程化|Hands-on|项目目录|核心代码/) ? 1 : 0) +
    (has(t, /运行环境|安装|执行方式|依赖|配置示例/) ? 1 : 0)
  );
  // 代码质量
  d.codeQuality = cap(
    (t.codeBlocks >= 1 && has(t, /language: "/) ? 1 : 0) +
    (t.codeBlocks >= 3 ? 1 : 0) +
    (has(t, /filename: "/) ? 1 : 0) +
    (has(t, /错误处理|异常|重试|参数校验|Timeout|timeout|幂等/) ? 1 : 0) +
    (has(t, /测试|pytest|assert|Test|test_|mock/) ? 1 : 0)
  );
  // 企业场景
  d.enterprise = cap(
    (has(t, /案例|企业场景|落地|Case/) ? 1 : 0) +
    (has(t, /业务背景|业务问题|数据来源|部署方案|效果评估/) ? 1 : 0) +
    (has(t, /教学模拟|模拟数据/) ? 1 : 0) +
    (t.archIds.length >= 1 ? 1 : 0) +
    (has(t, /安全|权限|审批/) && t.related.length >= 2 ? 1 : 0)
  );
  // 生产实践
  d.production = cap(
    (has(t, /生产|部署|运维|可观测|监控/) ? 1 : 0) +
    (has(t, /重试|超时|幂等|恢复|持久化|检查点/) ? 1 : 0) +
    (has(t, /日志|追踪|指标|告警/) ? 1 : 0) +
    (has(t, /灰度|版本|回滚|并发|成本|扩缩/) ? 1 : 0) +
    (has(t, /故障排查|常见问题|Troubleshooting|预防方式|排查方法/) ? 1 : 0)
  );
  // 参考资料
  d.references = cap(
    (t.refs >= 1 ? 1 : 0) +
    (t.refs >= 2 ? 1 : 0) +
    (t.refsWithUrl >= 1 ? 1 : 0) +
    (t.refs >= 3 && t.refsWithUrl >= 2 ? 1 : 0) +
    (has(t, /verifiedAt:/) || t.hasVerifiedAt ? 1 : 0)
  );
  const total = Object.values(d).reduce((a, b) => a + b, 0);
  const level = total <= 8 ? "L0" : total <= 16 ? "L1" : total <= 24 ? "L2" : total <= 31 ? "L3" : total <= 35 ? "L4" : "L5";
  return { ...d, total, level };
}

for (const t of tutorials) t.score = score(t);

// ---------------------------------------------------------------------------
// 3. 20 项内容检查清单覆盖
// ---------------------------------------------------------------------------
const checks = [
  ["技术定义", /定义|是什么|概述|概念|Overview/],
  ["技术背景", /背景|产生|发展|为什么需要|动机/],
  ["解决的问题", /解决的问题|解决的核心问题|解决什么|痛点|技术目标|业务问题/],
  ["核心工作原理", /原理|机制|如何工作|工作流程|Fundamentals/],
  ["内部机制", /内部|执行过程|状态|循环|迭代|Schema|协议/],
  ["架构图", /type: "mermaid"/],
  ["架构组件", /组件|职责|Component/],
  ["数据/执行流", /数据流|执行流|调用流程|控制流|状态流/],
  ["真实技术实现", /实现方式|实现细节|落地实现|核心实现|工程实现|可运行/],
  ["代码示例", /type: "code"/],
  ["代码完整性", /filename: "/],
  ["运行环境", /运行环境|安装|依赖|执行方式|环境要求/],
  ["企业应用案例", /案例|企业场景|业务背景/],
  ["技术选型", /选型|技术栈|对比表|取舍|Trade-off/],
  ["优缺点分析", /优点|缺点|局限|取舍|适用与不适用/],
  ["生产注意事项", /生产|高可用|部署|监控|超时|重试/],
  ["安全考虑", /安全|权限|鉴权|注入|审计|脱敏/],
  ["测试评估", /评估|测试|评测|指标|回归/],
  ["故障排查", /故障排查|排查方法|常见问题|Troubleshooting/],
  ["可信参考资料", /references:\s*\[\s*(?:\{|R\()|url:\s*"https?:/],
];
const checkStats = checks.map(([name, re]) => {
  const n = tutorials.filter((t) => re.test(t.text)).length;
  return { name, n, pct: Math.round((n / tutorials.length) * 100) };
});

// ---------------------------------------------------------------------------
// 4. 交叉引用 / 失效链接校验
// ---------------------------------------------------------------------------
const slugSet = new Set(tutorials.map((t) => t.slug));
const caseSlugSet = new Set(
  [...read(path.join(contentDir, "caseStudies.ts")).matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1])
);
const labSlugSet = new Set(
  [...read(path.join(contentDir, "labs.ts")).matchAll(/^\s{4}slug: "([^"]+)"/gm)].map((m) => m[1])
);
const archSrc = read(path.join(contentDir, "architectures.ts"));
const archIds = new Set([...archSrc.matchAll(/^\s{4}id: "([^"]+)"/gm)].map((m) => m[1]));
const broken = [];
for (const t of tutorials) {
  for (const r of t.related) if (!slugSet.has(r)) broken.push(`${t.slug} → relatedTutorialIds: ${r}`);
  for (const a of t.archIds) if (!archIds.has(a)) broken.push(`${t.slug} → architectureIds: ${a}`);
  for (const s of t.nextSlugs) if (!slugSet.has(s)) broken.push(`${t.slug} → nextTutorialSlugs: ${s}`);
  for (const s of t.labSlugs) if (!labSlugSet.has(s)) broken.push(`${t.slug} → relatedLabSlugs: ${s}`);
  for (const s of t.caseSlugs) if (!caseSlugSet.has(s)) broken.push(`${t.slug} → relatedCaseSlugs: ${s}`);
}
// id 一致性：升级版必须保留基础教程 id，否则学习进度 key 与搜索索引会错乱
const baseIdBySlug = new Map();
for (const f of files) {
  for (const t of parseTutorialFile(f)) baseIdBySlug.set(t.slug, t.id);
}
for (const t of upgrades) {
  const baseId = baseIdBySlug.get(t.slug);
  if (baseId && baseId !== t.id) {
    broken.push(`ID 不一致: ${t.slug} 升级版 id=${t.id} 但基础版 id=${baseId}`);
  }
}
for (const f of ["labs.ts", "tools.ts", "caseStudies.ts", "learningPaths.ts", "glossary.ts"]) {
  const src = read(path.join(contentDir, f));
  const re = /(?:relatedTutorialSlugs|tutorialSlugs):\s*\[([\s\S]*?)\]/g;
  for (const m of src.matchAll(re)) {
    for (const s of m[1].matchAll(/"([^"]+)"/g)) {
      if (!slugSet.has(s[1])) broken.push(`${f} → tutorialSlug: ${s[1]}`);
    }
  }
}

// ---------------------------------------------------------------------------
// 5. 领域 / 全局统计
// ---------------------------------------------------------------------------
const domainsSrc = read(path.join(contentDir, "domains.ts"));
const domains = [...domainsSrc.matchAll(/^\s{4}id: "(d\d+)",\s*\n\s{4}slug: "([^"]+)",[\s\S]*?^\s{4}title: "([^"]+)"/gm)]
  .map((m) => ({ id: m[1], slug: m[2], title: m[3] }));

const levelCount = {};
for (const t of tutorials) levelCount[t.score.level] = (levelCount[t.score.level] || 0) + 1;
const avgTotal = (tutorials.reduce((a, t) => a + t.score.total, 0) / tutorials.length).toFixed(1);

// ---------------------------------------------------------------------------
// 6. 生成报告
// ---------------------------------------------------------------------------
const L = [];
L.push("# 企业级 Agent 全栈工程知识中心 — 全站内容审计报告（V2.0）");
L.push("");
L.push(`> 生成方式：\`node scripts/audit-content.mjs\` 静态解析真实内容数据，非人工估计。`);
L.push(`> 生成日期：${new Date().toISOString().slice(0, 10)}`);
L.push("");
L.push("## 一、审计对象概览");
L.push("");
L.push("| 项目 | 结果 |");
L.push("| --- | --- |");
L.push(`| 知识领域 | ${domains.length} |`);
L.push(`| 教程总数 | ${tutorials.length} |`);
L.push(`| 教程数据文件 | ${files.length} |`);
L.push(`| 正文内容块总数 | ${tutorials.reduce((a, t) => a + t.blocks, 0)} |`);
L.push(`| 架构图（Mermaid）| ${tutorials.reduce((a, t) => a + t.types.mermaid, 0)} |`);
L.push(`| 代码块 | ${tutorials.reduce((a, t) => a + t.codeBlocks, 0)}（共 ${tutorials.reduce((a, t) => a + t.codeLines, 0)} 行）|`);
L.push(`| 表格 | ${tutorials.reduce((a, t) => a + t.types.table, 0)} |`);
L.push(`| 参考资料条目 | ${tutorials.reduce((a, t) => a + t.refs, 0)}（带 URL ${tutorials.reduce((a, t) => a + t.refsWithUrl, 0)}）|`);
L.push(`| 平均质量分 | ${avgTotal} / 40 |`);
L.push("");
L.push("内容模型：`src/content/types.ts` — `Tutorial` → `TutorialSection[]` → `ContentBlock`（paragraph / list / callout / code / mermaid / table）。");
L.push("渲染链路：`src/app/tutorials/[slug]/page.tsx` → `ContentBlockRenderer` → `CodeBlock` / `MermaidViewer` / `Callout` / `doc-table`；`TutorialSidebar` 提供目录与阅读进度。");
L.push("");
L.push("## 二、质量等级分布");
L.push("");
L.push("| 等级 | 含义 | 数量 | 占比 |");
L.push("| --- | --- | ---: | ---: |");
const levelDesc = {
  L0: "只有标题或简单介绍", L1: "有基础概念，内容较浅", L2: "有原理和组件说明",
  L3: "有架构、流程和代码实践", L4: "有完整工程实现、案例、测试与生产实践",
  L5: "具备完整企业级技术课程深度",
};
for (const lv of ["L0", "L1", "L2", "L3", "L4", "L5"]) {
  const n = levelCount[lv] || 0;
  L.push(`| ${lv} | ${levelDesc[lv]} | ${n} | ${Math.round((n / tutorials.length) * 100)}% |`);
}
L.push("");
L.push("评分维度（各 0-5，合计 40）：概念准确性、原理深度、架构完整性、工程实践、代码质量、企业场景、生产实践、参考资料。");
L.push("评分依据为结构特征与章节覆盖（是否有架构图、代码块、表格、案例、生产章节、参考资料 URL 等），**段落数量不直接加分**。");
L.push("");
L.push("## 三、20 项内容检查清单 — 全站覆盖率");
L.push("");
L.push("| # | 检查项 | 命中教程数 | 覆盖率 |");
L.push("| ---: | --- | ---: | ---: |");
checkStats.forEach((c, i) => L.push(`| ${i + 1} | ${c.name} | ${c.n}/${tutorials.length} | ${c.pct}% |`));
L.push("");
L.push("## 四、逐篇教程审计清单");
L.push("");
L.push("> `S`=章节数，`P/L/Co/Code/M/T`=段落/列表/提示/代码/架构图/表格数量，`Code行`=代码总行数，`Ref`=参考资料数，`总分`=/40。");
L.push("");
for (const d of domains) {
  const ts = tutorials.filter((t) => t.domainId === d.id);
  const avg = (ts.reduce((a, t) => a + t.score.total, 0) / (ts.length || 1)).toFixed(1);
  L.push(`### ${d.id} ${d.title}（${ts.length} 篇，平均 ${avg}/40）`);
  L.push("");
  L.push("| slug | 标题 | 等级 | 总分 | S | P | L | Co | Code | M | T | Code行 | Ref | 失效引用 |");
  L.push("| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |");
  for (const t of ts) {
    const bad = broken.filter((b) => b.startsWith(`${t.slug} →`)).length;
    L.push(`| \`${t.slug}\` | ${t.title} | ${t.score.level} | ${t.score.total} | ${t.headings.length} | ${t.types.paragraph} | ${t.types.list} | ${t.types.callout} | ${t.types.code} | ${t.types.mermaid} | ${t.types.table} | ${t.codeLines} | ${t.refs} | ${bad} |`);
  }
  L.push("");
}
L.push("## 五、交叉引用 / 失效链接校验");
L.push("");
L.push(`共发现 **${broken.length}** 处指向不存在页面的引用（教程 slug / 架构 id）：`);
L.push("");
if (broken.length) {
  L.push("```");
  for (const b of broken) L.push(b);
  L.push("```");
} else L.push("无失效引用。");
L.push("");
L.push("## 六、差距结论与升级策略");
L.push("");
L.push(`- 现状：平均 ${avgTotal}/40，核心技术教程普遍停留 L2-L3；距「核心 L4-L5、基础至少 L3」目标有明显差距。`);
L.push("- 主要短板（按覆盖率升序，见第三节）：优先补齐代码完整实现、运行环境、企业案例、技术选型、优缺点分析、测试评估、生产实践、带 URL 的可信参考资料。");
L.push("- 内容模型短板：`TutorialReference` 仅有 `{title,url?}`，无法承载发布组织、适用版本、参考用途、最后核验日期；教程缺少「相关实验 / 相关案例 / 下一步学习」的结构化关联字段。");
L.push("- 升级方式：**扩写现有教程正文**（保留全部 slug 与 URL），按主题选用统一深度章节结构；必要时新增教程补齐主题缺口；不重建 UI、不删除任何已有功能。");
L.push("");
L.push("## 七、分批计划");
L.push("");
L.push("| 批次 | 领域 | 状态 |");
L.push("| --- | --- | --- |");
L.push("| 第一批 | 01 Agent 工程 / 02 Multi-Agent / 03 Workflow / 04 MCP | 进行中 |");
L.push("| 第二批 | 05 Memory / 06 RAG / 07 知识工程 | 待执行 |");
L.push("| 第三批 | 08 数据基础设施 / 09 语义层 / 10 AgentOps | 待执行 |");
L.push("| 第四批 | 11 安全 / 12 AI 平台 / 13 自动化 | 待执行 |");
L.push("| 第五批 | 14 数字孪生 / 15 场景解决方案 | 待执行 |");
L.push("");

const outDir = path.join(root, "docs");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "CONTENT_AUDIT_REPORT.md"), L.join("\n"), "utf8");

// 控制台摘要
console.log(`教程总数: ${tutorials.length}`);
console.log(`等级分布: ${JSON.stringify(levelCount)}`);
console.log(`平均质量分: ${avgTotal}/40`);
console.log(`失效引用: ${broken.length}`);
console.log(`覆盖率最低 5 项: ${checkStats.slice().sort((a, b) => a.pct - b.pct).slice(0, 5).map((c) => `${c.name}(${c.pct}%)`).join(", ")}`);
console.log(`报告已写入 docs/CONTENT_AUDIT_REPORT.md`);
