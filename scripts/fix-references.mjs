// ============================================================================
// 全站交叉引用修复工具（V2.0）
// 用法：node scripts/fix-references.mjs
//
// 只在「关联数组字段」内部做重定向，绝不修改 `slug:` 定义行，
// 因此不会改变任何页面 URL / 路由（这是硬约束）。
// 处理字段：relatedTutorialIds / relatedTutorialSlugs / tutorialSlugs
// 同时在替换后对数组去重，避免同一个推荐链接出现两次。
// 修复后请运行 `node scripts/audit-content.mjs` 重新校验。
// ============================================================================
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const tutorialDir = path.join(root, "src/content/tutorials");
const contentDir = path.join(root, "src/content");

// 语义映射：历史上引用了不存在的教程 slug → 真实存在的教程 slug
const MAP = {
  "agent-security-fundamentals": "ai-security-fundamentals",
  "agent-deployment": "deployment",
  "token-cost-calculator": "agentops-overview",
  "anomaly-detection": "predictive-maintenance",
  reranking: "hybrid-search",
  "mcp-server-development": "mcp-server-dev",
  "semantic-memory": "memory-types",
  "agentic-workflow": "workflow-vs-agent",
  "ai-security-overview": "ai-security-fundamentals",
  "token-cost": "agent-evaluation",
  "ai-platform-overview": "ai-platform-architecture",
  "enterprise-solutions-overview": "itops-agent",
  "digital-twin-overview": "digital-twin",
  graphrag: "graphrag-advanced",
  "semantic-layer-overview": "semantic-layer",
  "business-process-automation": "automation-vs-agent",
  "finance-agent": "conversational-analytics",
  "ai-data-infra-overview": "ai-ready-data",
  lakehouse: "ai-ready-data",
  "data-catalog": "data-pipeline-cdc",
  "knowledge-engineering-overview": "ontology-taxonomy",
  "kubernetes-deployment": "ai-platform-architecture",
  "ontology-modeling": "ontology-taxonomy",
  "manufacturing-agent": "industrial-agent",
  "solution-architecture": "enterprise-agent-architecture",
  "enterprise-deployment": "deployment",
};

const ARRAY_FIELDS = /(relatedTutorialIds|relatedTutorialSlugs|tutorialSlugs):\s*\[([\s\S]*?)\]/g;

const targets = [
  ...fs.readdirSync(tutorialDir)
    .filter((f) => f.endsWith(".ts"))
    .map((f) => path.join(tutorialDir, f)),
  ...["labs.ts", "tools.ts", "caseStudies.ts", "learningPaths.ts", "glossary.ts"]
    .map((f) => path.join(contentDir, f)),
];

let replaced = 0;
let deduped = 0;
for (const p of targets) {
  const src = fs.readFileSync(p, "utf8");
  let hits = 0;
  let dups = 0;
  const out = src.replace(ARRAY_FIELDS, (whole, field, body) => {
    // 1) 在数组体内做映射（只匹配被引号包裹的 slug 字面量）
    let next = body.replace(/"([^"]+)"/g, (q, s) => {
      if (MAP[s] && MAP[s] !== s) {
        hits++;
        return `"${MAP[s]}"`;
      }
      return q;
    });
    // 2) 数组内去重，保持原有顺序与排版
    const seen = new Set();
    next = next.replace(/"([^"]+)"/g, (q, s) => {
      if (seen.has(s)) {
        dups++;
        return "__DUP__";
      }
      seen.add(s);
      return q;
    });
    if (dups > 0) {
      next = next
        .replace(/,?\s*__DUP__/g, "")
        .replace(/__DUP__\s*,?/g, "");
    }
    return `${field}: [${next}]`;
  });
  if (hits > 0 || dups > 0) {
    fs.writeFileSync(p, out, "utf8");
    console.log(`${path.relative(root, p)}: 重定向 ${hits} 处，去重 ${dups} 处`);
    replaced += hits;
    deduped += dups;
  }
}
console.log(`合计：重定向 ${replaced} 处，去重 ${deduped} 处。`);
