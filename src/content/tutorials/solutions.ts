import type { Tutorial } from "../types";

export const solutionsTutorials: Tutorial[] = [
  {
    id: "t-so-01",
    slug: "itops-agent",
    domainId: "d15",
    title: "IT 运维 Agent（AIOps）",
    englishTitle: "IT Operations Agent",
    summary: "面向告警、排障、工单的 IT 运维 Agent 设计与落地。",
    difficulty: "中级",
    estimatedMinutes: 28,
    prerequisites: ["企业级 Agent 参考架构"],
    learningObjectives: ["设计运维闭环", "接入监控与 CMDB", "保障安全"],
    sections: [
      {
        id: "loop",
        heading: "一、运维闭环",
        blocks: [
          {
            type: "paragraph",
            text: "Agent 接收告警，结合监控指标、日志与 CMDB 做根因分析，生成处置建议或执行受控动作（重启、隔离、建单），并记录复盘。",
          },
        ],
      },
      {
        id: "data",
        heading: "二、数据来源",
        blocks: [
          { type: "list", items: ["监控指标与日志", "CMDB/拓扑", "Runbook/知识库", "工单系统"] },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["先分析后执行", "动作受控审批", "沉淀 Runbook"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["企业知识助手", "客服 Agent", "AgentOps 概览"] }],
      },
    ],
    tags: ["Solutions", "AIOps", "运维"],
    architectureIds: ["a01"],
    relatedTutorialIds: ["knowledge-assistant", "customer-service-agent", "agentops-overview"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-so-02",
    slug: "customer-service-agent",
    domainId: "d15",
    title: "客服 Agent",
    englishTitle: "Customer Service Agent",
    summary: "以 RAG + 工单 + 人工兜底构建企业级智能客服。",
    difficulty: "中级",
    estimatedMinutes: 26,
    prerequisites: ["企业 RAG 基础"],
    learningObjectives: ["设计问答闭环", "接入业务系统", "人工兜底"],
    sections: [
      {
        id: "design",
        heading: "一、系统设计",
        blocks: [
          {
            type: "paragraph",
            text: "客服 Agent 基于知识库 RAG 回答常见问题，复杂/高风险诉求转人工；可调用订单、物流等系统工具查询与办理，全程记录便于质检。",
          },
        ],
      },
      {
        id: "best",
        heading: "二、最佳实践",
        blocks: [{ type: "list", items: ["知识可溯源", "敏感动作审批", "人工无缝接管"] }],
      },
      {
        id: "next",
        heading: "三、延伸阅读",
        blocks: [{ type: "list", items: ["企业知识助手", "IT 运维 Agent", "Agent 安全"] }],
      },
    ],
    tags: ["Solutions", "客服", "Copilot"],
    architectureIds: ["a01"],
    relatedTutorialIds: ["knowledge-assistant", "itops-agent", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-so-03",
    slug: "knowledge-assistant",
    domainId: "d15",
    title: "企业知识助手",
    englishTitle: "Enterprise Knowledge Assistant",
    summary: "聚合多源企业知识，提供检索、问答与导览的统一助手。",
    difficulty: "中级",
    estimatedMinutes: 24,
    prerequisites: ["企业 RAG 基础", "知识图谱"],
    learningObjectives: ["整合多源知识", "设计问答与导览", "保障权限"],
    sections: [
      {
        id: "design",
        heading: "一、能力设计",
        blocks: [
          {
            type: "list",
            items: [
              "统一检索：文档、Wiki、工单、代码。",
              "问答：RAG + 图谱多跳。",
              "导览：按角色推荐学习路径。",
              "权限：按用户可见范围过滤结果。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "二、最佳实践",
        blocks: [{ type: "list", items: ["结果带来源", "权限内检索", "持续更新索引"] }],
      },
      {
        id: "next",
        heading: "三、延伸阅读",
        blocks: [{ type: "list", items: ["IT 运维 Agent", "客服 Agent", "企业 RAG"] }],
      },
    ],
    tags: ["Solutions", "知识", "助手"],
    architectureIds: ["a01"],
    relatedTutorialIds: ["itops-agent", "customer-service-agent", "rag-fundamentals"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
