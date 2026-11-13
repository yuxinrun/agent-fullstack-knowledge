import type { CaseStudy } from "./types";

export const caseStudies: CaseStudy[] = [
  {
    id: "c01",
    slug: "it-operations-agent",
    title: "企业 IT 运维 Agent（贯穿案例 A）",
    industry: "IT 运维 / AIOps",
    summary:
      "面向企业员工的 IT 故障自助处理 Agent，覆盖理解、检索、分析、调用工具到生成报告与人工审批的全链路。",
    businessProblem: [
      "员工提交 IT 故障后等待人工响应时间长",
      "重复性工单占用大量 L1 支持人力",
      "历史工单与知识分散，难以复用",
    ],
    solution: [
      "Agent 理解故障描述并拆解步骤",
      "检索企业知识库与历史工单",
      "查询监控系统分析根因",
      "调用 ITSM 工具创建或更新工单",
      "必要时请求人工审批，最终生成处理报告",
    ],
    architecture: `flowchart TB
  U["员工"] --> A["IT Ops Agent"]
  A --> KB["企业知识库 RAG"]
  A --> HIS["历史工单检索"]
  A --> MON["监控/CMDB"]
  A --> TS["ITSM 工具 MCP"]
  TS --> WO["工单系统"]
  A --> HU["人工审批"]
  A --> RPT["处理报告"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent Runtime", "RAG", "MCP", "Workflow", "Memory", "AgentOps"],
    implementationSteps: [
      "梳理知识库与历史工单，建立 RAG 检索",
      "通过 MCP 接入 ITSM 与监控",
      "设计 Agent 执行循环与工具权限",
      "加入人工审批与审计日志",
      "接入 AgentOps 监控成本与质量",
    ],
    evaluation: [
      { metric: "L1 工单自动解决率", result: "教学模拟：目标 40%-60%" },
      { metric: "平均响应时间", result: "教学模拟：从小时级降至分钟级" },
      { metric: "人工介入率", result: "教学模拟：高敏操作仍 100% 审批" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d01", "d02", "d03", "d04", "d05", "d06", "d10", "d11"],
    relatedTutorialSlugs: [
      "agent-execution-loop",
      "rag-fundamentals",
      "mcp-server-development",
      "human-approval",
      "agent-guardrails",
    ],
    references: ["本案例为教学模拟数据，不含真实客户信息"],
  },
  {
    id: "c02",
    slug: "manufacturing-ops-agent",
    title: "制造业智能运维 Agent（贯穿案例 B）",
    industry: "制造 / 工业 AI",
    summary:
      " factory 设备异常时，Agent 结合传感器、孪生模型与维修知识进行原因分析、风险预测与维修建议。",
    businessProblem: [
      "设备异常发现晚，停机损失大",
      "维修依赖老师傅经验，难以复制",
      "传感器与维修手册数据割裂",
    ],
    solution: [
      "接收设备异常事件并查询传感器数据",
      "查询设备历史故障与维修手册（RAG）",
      "结合数字孪生仿真分析故障原因",
      "预测风险并生成维修建议",
      "调用工单系统并请求人工确认",
    ],
    architecture: `flowchart TB
  EV["设备异常事件"] --> A["工业 Agent"]
  A --> TS["时序数据"]
  A --> DT["数字孪生仿真"]
  A --> KB["维修知识库 RAG"]
  A --> WO["工单系统"]
  A --> HU["人工确认"]
  style A fill:#1d2940,stroke:#76E4F7`,
    technologyStack: ["Agent", "Digital Twin", "RAG", "Time-series DB", "Workflow", "Security"],
    implementationSteps: [
      "接入 IIoT 传感器与设备孪生模型",
      "构建维修手册知识库与异常检测",
      "设计 Agent 分析与建议流程",
      "工单集成与人工确认闸口",
      "监控预测准确率与误报率",
    ],
    evaluation: [
      { metric: "异常提前预警", result: "教学模拟：提前数小时至数天" },
      { metric: "维修建议采纳率", result: "教学模拟：需人工校验后统计" },
      { metric: "误报率", result: "教学模拟：持续优化目标 < 10%" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d14", "d08", "d13", "d06", "d03"],
    relatedTutorialSlugs: ["digital-twin-overview", "predictive-maintenance", "industrial-agent", "rag-fundamentals"],
    references: ["本案例为教学模拟数据，不含真实工厂信息"],
  },
  {
    id: "c03",
    slug: "enterprise-knowledge-assistant",
    title: "企业知识助手",
    industry: "通用 / 知识管理",
    summary: "基于企业文档与知识图谱的智能问答助手，支持溯源与多跳推理。",
    businessProblem: ["知识分散在大量文档中难以检索", "新员工上手成本高"],
    solution: ["统一文档摄取与向量化", "GraphRAG 支持多跳问答", "答案附带引用溯源"],
    architecture: `flowchart LR
  DOC["企业文档"] --> RAG["RAG + GraphRAG"]
  Q["问题"] --> RAG
  RAG --> A["知识助手"]
  A --> ANS["带引用的答案"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["RAG", "GraphRAG", "Vector DB", "Semantic Search"],
    implementationSteps: ["文档接入与解析", "向量与图谱双索引", "检索-重排-生成管线", "引用与反馈"],
    evaluation: [
      { metric: "答案可溯源率", result: "教学模拟：目标 > 90%" },
      { metric: "多跳问题准确率", result: "教学模拟：图谱增强后提升" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d06", "d07", "d05"],
    relatedTutorialSlugs: ["rag-fundamentals", "graphrag", "knowledge-graph"],
    references: ["教学模拟案例"],
  },
  {
    id: "c04",
    slug: "data-analyst-agent",
    title: "企业数据分析 Agent",
    industry: "数据分析 / BI",
    summary: "用户用自然语言提问，Agent 结合语义层生成 SQL 并给出业务解释。",
    businessProblem: ["业务人员依赖数据团队取数", "口径不一致"],
    solution: ["语义层统一指标", "Text-to-SQL 生成与校验", "结果业务化解释"],
    architecture: `flowchart LR
  Q["自然语言"] --> NLU["意图识别"]
  NLU --> GEN["SQL 生成"]
  SEM["语义层"] --> GEN
  GEN --> DB["数仓"]
  DB --> EXP["业务解释"]
  style GEN fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Semantic Layer", "Text-to-SQL", "Warehouse", "Agent"],
    implementationSteps: ["建设语义层", "SQL 生成与校验", "权限与限流", "结果解释"],
    evaluation: [
      { metric: "SQL 可执行率", result: "教学模拟：校验后目标 > 85%" },
      { metric: "口径一致率", result: "教学模拟：依赖语义层保障" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d09", "d08", "d06"],
    relatedTutorialSlugs: ["semantic-layer-overview", "text-to-sql", "conversational-analytics"],
    references: ["教学模拟案例"],
  },
  {
    id: "c05",
    slug: "procurement-agent",
    title: "智能采购 Agent",
    industry: "采购 / 供应链",
    summary: "从需求识别、供应商比对到合同与审批的采购流程自动化 Agent。",
    businessProblem: ["采购流程长、环节多", "比价与合规依赖人工"],
    solution: ["需求解析与品类匹配", "供应商知识检索与比价", "审批流集成与合规校验"],
    architecture: `flowchart LR
  REQ["采购需求"] --> A["采购 Agent"]
  A --> SUP["供应商知识库"]
  A --> APR["审批流"]
  A --> ERP["ERP"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent", "Workflow", "RAG", "ERP Integration", "Guardrails"],
    implementationSteps: ["需求结构化", "供应商检索比价", "合规与审批", "ERP 落地"],
    evaluation: [
      { metric: "流程周期缩短", result: "教学模拟：目标缩短 30%-50%" },
      { metric: "合规校验通过率", result: "教学模拟：策略引擎保障" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d13", "d15", "d03", "d11"],
    relatedTutorialSlugs: ["business-process-automation", "human-approval", "agent-guardrails"],
    references: ["教学模拟案例"],
  },
  {
    id: "c06",
    slug: "finance-agent",
    title: "财务智能体 Agent",
    industry: "财务",
    summary: "面向财务对账、报表问答与费用审批的智能 Agent。",
    businessProblem: ["对账耗时", "报表查询依赖人工", "费用合规检查繁琐"],
    solution: ["自动对账与异常识别", "报表自然语言查询", "费用合规策略校验"],
    architecture: `flowchart LR
  DATA["财务数据"] --> A["财务 Agent"]
  A --> RULE["合规规则"]
  A --> RPT["报表/对账"]
  A --> APR["审批"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent", "Semantic Layer", "Rules Engine", "Guardrails"],
    implementationSteps: ["数据接入", "对账与异常", "报表问答", "合规审批"],
    evaluation: [
      { metric: "对账效率", result: "教学模拟：自动化覆盖例常项" },
      { metric: "合规拦截率", result: "教学模拟：策略引擎统计" },
    ],
    caseType: "模拟教学案例",
    relatedDomains: ["d15", "d09", "d11", "d13"],
    relatedTutorialSlugs: ["finance-agent", "semantic-layer-overview", "agent-guardrails"],
    references: ["教学模拟案例"],
  },
  {
    id: "c07",
    slug: "customer-service-copilot",
    title: "电信客服 Copilot Agent（贯穿案例 C）",
    industry: "客户服务 / 电信",
    summary: "面向海量用户的智能客服 Copilot，结合知识库 RAG、业务系统工具与人工兜底，提升首解率与满意度。",
    businessProblem: [
      "咨询量大且重复，人工坐席压力大",
      "套餐、账单、故障等知识更新频繁易出错",
      "跨系统查询依赖人工切换，响应慢",
    ],
    solution: [
      "Agent 基于最新知识库 RAG 回答产品与账单问题",
      "调用订单/CRM/网络诊断工具查询与办理",
      "高风险或复杂诉求平滑转人工并带上下文",
      "会话沉淀为知识反馈，持续优化答案",
    ],
    architecture: `flowchart LR
  U["用户"] --> A["客服 Copilot"]
  A --> KB["知识库 RAG"]
  A --> TOOL["订单/CRM/诊断 MCP"]
  A --> HU["人工坐席"]
  A --> ANS["答案+溯源"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent Runtime", "RAG", "MCP", "Memory", "Guardrails", "AgentOps"],
    implementationSteps: [
      "接入最新产品/账单知识库并设更新管线",
      "通过 MCP 连接订单、CRM 与诊断系统",
      "设计高风险动作审批与人工接管闸口",
      "建立会话质检与知识回流机制",
    ],
    evaluation: [
      { metric: "首解率（自助解决）", result: "教学模拟：目标提升 20%-35%" },
      { metric: "平均处理时长", result: "教学模拟：下降 30%+" },
      { metric: "人工接管率", result: "教学模拟：复杂场景仍需人工" },
    ],
    caseType: "参考案例",
    relatedDomains: ["d15", "d06", "d11", "d01"],
    relatedTutorialSlugs: ["customer-service-agent", "rag-fundamentals", "agent-guardrails", "knowledge-assistant"],
    references: ["本案例为教学模拟数据，不含真实客户信息"],
  },
  {
    id: "c08",
    slug: "code-review-agent",
    title: "研发代码评审 Agent（贯穿案例 D）",
    industry: "研发效能 / DevEx",
    summary: "在 Pull Request 流程中自动评审代码：静态检查、最佳实践比对与安全扫描，并给出可执行的改进建议。",
    businessProblem: [
      "评审依赖资深工程师，瓶颈明显",
      "规范与最佳实践难以一致落地",
      "安全隐患常在合并后才被发现",
    ],
    solution: [
      "Agent 拉取 PR 差异并结合仓库上下文",
      "比对团队规范与最佳实践知识库（RAG）",
      "调用静态分析与安全扫描工具",
      "生成行内评论与总结，严重问题转人工",
    ],
    architecture: `flowchart LR
  PR["Pull Request"] --> A["评审 Agent"]
  A --> REPO["仓库上下文"]
  A --> KB["规范/最佳实践 RAG"]
  A --> SCAN["静态/安全扫描"]
  A --> CMT["行内评论"]
  A --> HU["人工确认"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent Runtime", "RAG", "Static Analysis", "Guardrails", "AgentOps"],
    implementationSteps: [
      "接入代码托管与 CI 流水线",
      "建设规范与最佳实践知识库",
      "配置安全扫描与敏感信息检测",
      "设定评论分级与人工升级策略",
    ],
    evaluation: [
      { metric: "评审覆盖度", result: "教学模拟：例常项自动覆盖" },
      { metric: "有效建议采纳率", result: "教学模拟：需持续校准" },
      { metric: "高危问题拦截", result: "教学模拟：安全类优先转人工" },
    ],
    caseType: "参考案例",
    relatedDomains: ["d01", "d11", "d10"],
    relatedTutorialSlugs: ["agent-execution-loop", "agent-design-patterns", "agent-error-handling", "agent-guardrails"],
    references: ["本案例为教学模拟数据，不含真实代码仓库"],
  },
  {
    id: "c09",
    slug: "hr-agent",
    title: "HR 员工服务与招聘 Agent（贯穿案例 E）",
    industry: "人力资源 / HR",
    summary: "面向员工与候选人的 HR Agent：政策问答、流程办理与招聘初筛，结合知识库与审批流。",
    businessProblem: [
      "HR 重复咨询（假勤、报销、政策）占用大量时间",
      "招聘初筛与面试安排流程长",
      "政策更新频繁，人工答复易不一致",
    ],
    solution: [
      "Agent 基于 HR 政策知识库 RAG 回答员工问题",
      "衔接入职/请假/报销等工作流并触发审批",
      "招聘场景做简历初筛与面试日程协调",
      "敏感与合规事项转 HR 专员",
    ],
    architecture: `flowchart LR
  E["员工/候选人"] --> A["HR Agent"]
  A --> KB["政策知识库 RAG"]
  A --> WF["工作流/审批"]
  A --> ATS["招聘系统"]
  A --> HU["HR 专员"]
  style A fill:#1d2940,stroke:#7C8CFF`,
    technologyStack: ["Agent Runtime", "RAG", "Workflow", "Guardrails", "Memory"],
    implementationSteps: [
      "梳理 HR 政策与流程并建知识库",
      "通过工作流编排假勤/报销/入职节点",
      "接入招聘系统做初筛与排期",
      "设置合规与隐私审批闸口",
    ],
    evaluation: [
      { metric: "咨询自助解决率", result: "教学模拟：目标 50%-70%" },
      { metric: "流程周期", result: "教学模拟：例常流程显著缩短" },
      { metric: "合规转人工率", result: "教学模拟：敏感项 100% 转专员" },
    ],
    caseType: "参考案例",
    relatedDomains: ["d15", "d03", "d06", "d01"],
    relatedTutorialSlugs: ["rag-fundamentals", "workflow-vs-agent", "agent-human-in-the-loop"],
    references: ["本案例为教学模拟数据，不含真实员工信息"],
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
