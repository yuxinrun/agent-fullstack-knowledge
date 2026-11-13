import type { Tutorial } from "../types";

export const aiSecurityTutorials: Tutorial[] = [
  {
    id: "t-sec-01",
    slug: "ai-security-fundamentals",
    domainId: "d11",
    title: "企业 AI 安全基础",
    englishTitle: "Enterprise AI Security Fundamentals",
    summary: "建立 Agent 安全威胁模型：识别 Prompt Injection、数据泄露与权限滥用风险。",
    difficulty: "专家",
    estimatedMinutes: 28,
    prerequisites: ["Agent 基础", "Tool Calling"],
    learningObjectives: ["建立威胁模型", "识别核心风险", "定义防护边界"],
    sections: [
      {
        id: "threat",
        heading: "一、威胁模型",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 拥有调用工具与访问数据的权限，其攻击面远超普通应用。核心威胁包括：Prompt Injection（诱导模型执行非预期动作）、数据泄露（越权读取/外发）、权限滥用（工具被恶意调用）与输出失控。",
          },
        ],
      },
      {
        id: "risk",
        heading: "二、核心风险",
        blocks: [
          {
            type: "table",
            headers: ["风险", "来源", "影响"],
            rows: [
              ["Prompt Injection", "外部/被检索内容", "执行非预期动作"],
              ["数据泄露", "越权检索", "敏感信息外泄"],
              ["权限滥用", "工具无约束", "破坏/资损"],
            ],
          },
        ],
      },
      {
        id: "boundary",
        heading: "三、防护边界",
        blocks: [
          {
            type: "list",
            items: [
              "输入：对不可信内容做隔离与标注。",
              "行为：工具调用走策略校验与审批。",
              "输出：护栏校验后返回。",
              "审计：全链路记录可追溯。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["最小权限", "默认拒绝", "纵深防御"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Prompt Injection", "Agent 护栏", "MCP 网关"] }],
      },
    ],
    tags: ["Security", "安全", "威胁"],
    architectureIds: ["a14"],
    relatedTutorialIds: ["prompt-injection", "agent-guardrails", "mcp-gateway"],
    references: [{ title: "OWASP Top 10 for LLM Applications" }],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-sec-02",
    slug: "prompt-injection",
    domainId: "d11",
    title: "Prompt Injection 提示注入",
    englishTitle: "Prompt Injection",
    summary: "理解直接与间接提示注入的原理、危害与缓解手段。",
    difficulty: "专家",
    estimatedMinutes: 26,
    prerequisites: ["企业 AI 安全基础"],
    learningObjectives: ["区分直接与间接注入", "理解 Retrieval 风险", "实施缓解"],
    sections: [
      {
        id: "types",
        heading: "一、两类注入",
        blocks: [
          {
            type: "list",
            items: [
              "直接注入：用户在输入中直接给出恶意指令。",
              "间接注入：恶意指令藏在被检索的网页/文档/工具返回中，模型“读到后执行”。",
            ],
          },
        ],
      },
      {
        id: "why",
        heading: "二、为什么危险",
        blocks: [
          {
            type: "callout",
            variant: "danger",
            title: "风险",
            text: "Agent 若不加区分地把检索内容当作指令，攻击者可借一篇文档让 Agent 泄露数据或调用危险工具。间接注入尤为隐蔽。",
          },
        ],
      },
      {
        id: "mitigate",
        heading: "三、缓解手段",
        blocks: [
          {
            type: "list",
            items: [
              "数据与指令分离：检索内容明确标注为“数据”而非“指令”。",
              "权限约束：敏感工具需独立审批，不依赖模型自律。",
              "输出校验：对含敏感动作的结果二次确认。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["不信任外部内容", "权限兜底", "行为可审计"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Agent 护栏", "企业 AI 安全基础", "MCP 网关"] }],
      },
    ],
    tags: ["Security", "注入", "Prompt"],
    architectureIds: ["a14"],
    relatedTutorialIds: ["ai-security-fundamentals", "agent-guardrails", "mcp-gateway"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-sec-03",
    slug: "agent-guardrails",
    domainId: "d11",
    title: "Agent 护栏与权限治理",
    englishTitle: "Agent Guardrails",
    summary: "用护栏、输出校验、RBAC/ABAC 与沙箱约束 Agent 行为。",
    difficulty: "专家",
    estimatedMinutes: 30,
    prerequisites: ["企业 AI 安全基础", "Prompt Injection"],
    learningObjectives: ["设计输入/输出护栏", "实现最小权限", "落地沙箱与审计"],
    sections: [
      {
        id: "layers",
        heading: "一、护栏层次",
        blocks: [
          {
            type: "mermaid",
            title: "护栏层次",
            source: `flowchart TB
  IN["输入"] --> GI["输入护栏"]
  GI --> M["模型/工具"]
  M --> GO["输出护栏"]
  GO --> AUD["审计"]
  M --> POL["策略引擎 RBAC/ABAC"]
  POL --> SB["沙箱"]`,
            caption: "多层防护，层层兜底。",
          },
        ],
      },
      {
        id: "policy",
        heading: "二、权限模型",
        blocks: [
          {
            type: "list",
            items: [
              "RBAC：按角色分配可用工具与数据范围。",
              "ABAC：按属性（租户/时间/环境）动态决策。",
              "最小权限：默认无权限，按需显式授予。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "三、工程实践",
        blocks: [{ type: "list", items: ["敏感工具走审批", "写操作在沙箱/隔离环境", "全量审计留痕"] }],
      },
      {
        id: "best",
        heading: "四、最佳实践",
        blocks: [{ type: "list", items: ["默认拒绝", "权限最小化", "审计全覆盖"] }],
      },
      {
        id: "next",
        heading: "五、延伸阅读",
        blocks: [{ type: "list", items: ["Prompt Injection", "MCP 网关", "企业 AI 治理"] }],
      },
    ],
    tags: ["Security", "护栏", "治理"],
    architectureIds: ["a14"],
    relatedTutorialIds: ["ai-security-fundamentals", "prompt-injection", "mcp-gateway"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
