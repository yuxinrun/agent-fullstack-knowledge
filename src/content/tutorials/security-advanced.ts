import type { Tutorial } from "../types";

export const securityAdvancedTutorials: Tutorial[] = [
  {
    id: "t-sec-a1",
    slug: "agent-supply-chain",
    domainId: "d11",
    title: "Agent 供应链安全",
    englishTitle: "Agent Supply Chain Security",
    summary: "审视 MCP Server、提示与模型等供应链环节，防范投毒与依赖滥用。",
    difficulty: "专家",
    estimatedMinutes: 30,
    prerequisites: ["MCP 网关与企业级部署", "企业 AI 安全基础"],
    learningObjectives: ["识别供应链风险", "审查 MCP Server 依赖", "防护提示/模型投毒"],
    sections: [
      {
        id: "risk",
        heading: "一、供应链风险面",
        blocks: [
          {
            type: "table",
            headers: ["环节", "风险", "后果"],
            rows: [
              ["MCP Server", "恶意/被劫持的依赖", "工具执行非预期动作"],
              ["Prompt/模板", "提示投毒", "行为被诱导偏移"],
              ["模型", "训练/权重投毒", "隐蔽后门"],
              ["检索内容", "间接注入", "泄露/误动作"],
            ],
          },
        ],
      },
      {
        id: "server",
        heading: "二、MCP Server 审查",
        blocks: [
          {
            type: "list",
            items: [
              "来源可信：仅从受控仓库/签名发布引入。",
              "依赖扫描：CI 中做 SCA 与 CVE 检查。",
              "最小权限：Server 仅拥有所需范围。",
              "行为审计：记录其对外调用与返回。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["签名与校验", "依赖可审计", "隔离运行"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["MCP 网关", "Prompt Injection", "Agent 护栏"] }],
      },
    ],
    tags: ["Security", "供应链", "MCP"],
    architectureIds: ["a14", "a06"],
    relatedTutorialIds: ["mcp-gateway", "prompt-injection", "agent-guardrails"],
    references: [{ title: "OWASP LLM01-10" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-sec-a2",
    slug: "data-leakage-privacy",
    domainId: "d11",
    title: "数据泄露防护与 PII 处理",
    englishTitle: "Data Leakage & PII Protection",
    summary: "用最小化、脱敏、隔离与 DLP 策略防止敏感数据进入提示或外发。",
    difficulty: "专家",
    estimatedMinutes: 28,
    prerequisites: ["企业 AI 安全基础", "上下文工程"],
    learningObjectives: ["设计数据最小化", "实现脱敏与隔离", "落地 DLP 护栏"],
    sections: [
      {
        id: "minimize",
        heading: "一、数据最小化",
        blocks: [
          {
            type: "paragraph",
            text: "只把完成任务必需的数据注入上下文，且按租户/角色过滤。能不取的不取，能延迟取的不提前取，从源头降低泄露面。",
          },
        ],
      },
      {
        id: "mask",
        heading: "二、脱敏与隔离",
        blocks: [
          {
            type: "list",
            items: [
              "PII 识别：正则/分类器定位姓名、证件、联系方式。",
              "脱敏：替换为占位或令牌，必要时可还原（令牌化）。",
              "隔离：敏感字段存安全区，仅授权工具访问。",
            ],
          },
        ],
      },
      {
        id: "dlp",
        heading: "三、输出侧 DLP",
        blocks: [
          {
            type: "mermaid",
            title: "DLP 护栏",
            source: `flowchart LR
  CTX["上下文"] --> GEN["生成"]
  GEN --> DLP["DLP 扫描"]
  DLP -->|"含敏感"| BLOCK["拦截/改写"]
  DLP -->|"安全"| OUT["输出"]`,
            caption: "输出前扫描敏感内容。",
          },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["最小化优先", "脱敏可还原", "输出必检"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Prompt Injection", "Agent 护栏", "企业 AI 治理"] }],
      },
    ],
    tags: ["Security", "PII", "DLP"],
    architectureIds: ["a14"],
    relatedTutorialIds: ["ai-security-fundamentals", "prompt-injection", "agent-guardrails"],
    references: [],
    updatedAt: "2026-11-12",
    status: "published",
  },
  {
    id: "t-sec-a3",
    slug: "red-teaming-agents",
    domainId: "d11",
    title: "Agent 红队测试与对抗评估",
    englishTitle: "Red Teaming Agents",
    summary: "以对抗方式系统性探测 Agent 的安全边界与失败模式。",
    difficulty: "专家",
    estimatedMinutes: 32,
    prerequisites: ["Prompt Injection", "Agent 护栏"],
    learningObjectives: ["设计红队用例", "度量抵御能力", "形成修复闭环"],
    sections: [
      {
        id: "scope",
        heading: "一、红队范围",
        blocks: [
          {
            type: "list",
            items: [
              "越权：试图调用无权限工具/数据。",
              "注入：直接/间接提示注入诱导偏离。",
              "泄露：诱导输出敏感信息。",
              "持久化：试图绕过护栏或审批。",
            ],
          },
        ],
      },
      {
        id: "loop",
        heading: "二、对抗闭环",
        blocks: [
          {
            type: "paragraph",
            text: "构造攻击用例 → 运行 Agent → 观察是否越界 → 记录漏洞 → 加固（护栏/权限/提示） → 回归。红队用例随修复不断积累为回归集。",
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["用例覆盖多语言/编码绕过", "记录每次越界链路", "与评估门禁联动"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["攻防常态化", "漏洞可量化", "加固可回归"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Prompt Injection", "Agent 护栏", "Agent 评估"] }],
      },
    ],
    tags: ["Security", "红队", "对抗"],
    architectureIds: ["a14", "a13"],
    relatedTutorialIds: ["prompt-injection", "agent-guardrails", "agent-evaluation"],
    references: [{ title: "NIST AI Risk Management Framework" }],
    updatedAt: "2026-11-12",
    status: "published",
  },
];
