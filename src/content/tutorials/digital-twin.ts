import type { Tutorial } from "../types";

export const digitalTwinTutorials: Tutorial[] = [
  {
    id: "t-dt-01",
    slug: "digital-twin",
    domainId: "d14",
    title: "数字孪生基础",
    englishTitle: "Digital Twin Fundamentals",
    summary: "理解物理-虚拟映射、仿真与工业数据如何支撑数字孪生。",
    difficulty: "专家",
    estimatedMinutes: 24,
    prerequisites: ["企业数据基础设施基础"],
    learningObjectives: ["理解孪生映射", "设计虚拟模型", "接入实时数据"],
    sections: [
      {
        id: "concept",
        heading: "一、什么是数字孪生",
        blocks: [
          {
            type: "paragraph",
            text: "数字孪生是对物理资产（设备、产线、供应链）的高保真虚拟映射，结合实时传感数据与仿真模型，支持监测、预测与优化。Agent 可在孪生之上做决策。",
          },
        ],
      },
      {
        id: "layers",
        heading: "二、关键层",
        blocks: [
          {
            type: "list",
            items: [
              "感知层：传感器/IIoT 采集。",
              "模型层：物理/机理/数据驱动模型。",
              "孪生层：状态同步与仿真。",
              "应用层：监测、预测、优化（Agent）。",
            ],
          },
        ],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["模型可校验", "数据实时", "闭环可控"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["预测性维护", "工业 Agent", "AI-Ready 数据底座"] }],
      },
    ],
    tags: ["Digital Twin", "孪生", "工业"],
    architectureIds: ["a12"],
    relatedTutorialIds: ["predictive-maintenance", "industrial-agent", "ai-ready-data"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-dt-02",
    slug: "predictive-maintenance",
    domainId: "d14",
    title: "预测性维护",
    englishTitle: "Predictive Maintenance",
    summary: "基于时序与异常检测对设备健康进行预测，减少非计划停机。",
    difficulty: "专家",
    estimatedMinutes: 28,
    prerequisites: ["数字孪生基础"],
    learningObjectives: ["处理时序数据", "设计异常检测", "输出维护建议"],
    sections: [
      {
        id: "flow",
        heading: "一、方法流程",
        blocks: [
          {
            type: "list",
            items: [
              "采集：振动、温度、电流等时序信号。",
              "特征：时域/频域特征与统计指标。",
              "检测：阈值/统计/模型异常识别。",
              "预测：剩余寿命（RUL）估计。",
              "决策：生成维护工单建议。",
            ],
          },
        ],
      },
      {
        id: "practice",
        heading: "二、工程实践",
        blocks: [{ type: "list", items: ["缺失与漂移处理", "误报率控制", "建议可解释"] }],
      },
      {
        id: "best",
        heading: "三、最佳实践",
        blocks: [{ type: "list", items: ["数据质量优先", "误报可抑制", "建议可落地"] }],
      },
      {
        id: "next",
        heading: "四、延伸阅读",
        blocks: [{ type: "list", items: ["工业 Agent", "数字孪生基础", "异常检测"] }],
      },
    ],
    tags: ["Digital Twin", "维护", "预测"],
    architectureIds: ["a12"],
    relatedTutorialIds: ["digital-twin", "industrial-agent", "predictive-maintenance"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
  {
    id: "t-dt-03",
    slug: "industrial-agent",
    domainId: "d14",
    title: "工业 Agent 与制造优化",
    englishTitle: "Industrial Agent",
    summary: "把 Agent 嵌入生产与供应链，结合数字孪生实现闭环优化。",
    difficulty: "专家",
    estimatedMinutes: 26,
    prerequisites: ["数字孪生基础", "预测性维护"],
    learningObjectives: ["设计工业 Agent", "结合孪生决策", "保障安全"],
    sections: [
      {
        id: "role",
        heading: "一、Agent 的角色",
        blocks: [
          {
            type: "paragraph",
            text: "工业 Agent 在孪生环境中监测状态、分析异常、生成排产/调度/维护建议，并经审批后下发到执行系统。决策在虚拟侧验证，降低对真实产线的风险。",
          },
        ],
      },
      {
        id: "best",
        heading: "二、最佳实践",
        blocks: [{ type: "list", items: ["先在孪生验证", "关键动作审批", "安全边界内运行"] }],
      },
      {
        id: "next",
        heading: "三、延伸阅读",
        blocks: [{ type: "list", items: ["数字孪生基础", "预测性维护", "企业 AI 安全"] }],
      },
    ],
    tags: ["Digital Twin", "工业", "Agent"],
    architectureIds: ["a12"],
    relatedTutorialIds: ["digital-twin", "predictive-maintenance", "agent-human-in-the-loop"],
    references: [],
    updatedAt: "2026-11-11",
    status: "published",
  },
];
