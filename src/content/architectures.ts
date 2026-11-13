import type { Architecture } from "./types";

export const architectures: Architecture[] = [
  {
    id: "a01",
    slug: "enterprise-agent-reference",
    title: "企业级 Agent 参考架构",
    summary:
      "贯穿用户、Agent Runtime、Multi-Agent、MCP、RAG、Memory、Workflow 与企业系统的统一参考架构。",
    scenario:
      "作为整个知识中心的顶层蓝图，适用于所有需要把 LLM 能力落地为企业可管控系统的场景。",
    diagramSource: `flowchart TB
  U["用户 / 业务系统"] --> GW["API 网关 & 鉴权"]
  GW --> ORCH["Agent 编排层 Orchestration"]
  ORCH --> SA["单 Agent / Multi-Agent"]
  ORCH --> WF["工作流引擎 Workflow"]
  SA --> RT["Agent Runtime"]
  RT --> TC["工具调用 Tool Calling"]
  TC --> MCP["MCP 网关"]
  MCP --> EXT["企业系统 ERP/CRM/DB"]
  RT --> MEM["记忆与上下文 Memory"]
  RT --> RAG["检索增强 RAG"]
  RAG --> VDB["向量 / 图数据库"]
  RT --> LLM["LLM / 模型网关"]
  ORCH --> OBS["AgentOps 可观测"]
  ORCH --> GOV["安全治理 Guardrails"]
  OBS --> LOG["日志 / 追踪 / 指标"]
  style U fill:#172033,stroke:#38D6B0
  style ORCH fill:#1d2940,stroke:#7C8CFF
  style RT fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "API 网关 & 鉴权", role: "统一入口、身份认证、速率限制与多租户路由" },
      { name: "Agent 编排层", role: "路由请求到单 Agent / 多 Agent / 工作流" },
      { name: "Agent Runtime", role: "执行循环、状态管理、工具调用与记忆" },
      { name: "MCP 网关", role: "标准化接入企业工具与数据源" },
      { name: "记忆与上下文", role: "短期 / 长期 / 语义记忆与上下文工程" },
      { name: "检索增强 RAG", role: "企业知识检索与上下文构建" },
      { name: "AgentOps", role: "追踪、日志、指标与评估" },
      { name: "安全治理", role: "护栏、输出校验与审计" },
    ],
    dataFlow: [
      "用户请求经 API 网关完成身份验证与租户路由",
      "编排层根据任务复杂度决定单 Agent / 多 Agent / 工作流",
      "Runtime 执行推理-行动-观察循环，调用工具与记忆",
      "MCP 网关把工具调用安全转发到企业系统",
      "RAG 从知识库检索上下文并注入提示",
      "可观测与安全模块贯穿全链路采集与校验",
    ],
    callFlow: [
      "编排层 → Runtime：提交任务与目标",
      "Runtime → Memory：加载用户偏好与历史",
      "Runtime → LLM：推理并决定动作",
      "Runtime → MCP：调用工具，返回观察",
      "Runtime → 编排层：返回最终答案或触发工作流",
    ],
    techOptions: [
      { category: "编排", options: ["LangGraph", "自研状态机", "Temporal"] },
      { category: "记忆", options: ["Redis", "Postgres + pgvector", "专用向量库"] },
      { category: "模型网关", options: ["自研网关", "LiteLLM", "云厂商网关"] },
    ],
    deployment:
      "容器化部署于 Kubernetes，编排层与 Runtime 解耦，MCP 网关独立扩缩容，敏感工具后端部署在内网。",
    security:
      "网关统一鉴权，工具调用最小权限，所有数据访问经策略引擎校验，完整审计日志。",
    extensibility:
      "通过注册中心新增 Agent / 工具 / 数据源，新增能力不影响既有编排逻辑。",
    designConsiderations: [
      "优先用确定性工作流处理可预测流程，Agent 处理不确定性决策",
      "记忆与 RAG 分离，避免上下文污染",
      "可观测性从第一天就内建，而非事后补",
      "安全边界放在工具与数据访问层，而非仅依赖 Prompt",
    ],
    relatedDomains: ["d01", "d02", "d03", "d04", "d10", "d11", "d12"],
    relatedTutorialSlugs: ["agent-runtime", "agent-execution-loop", "enterprise-agent-architecture"],
  },
  {
    id: "a02",
    slug: "single-agent",
    title: "单 Agent 架构",
    summary: "一个 Agent 通过执行循环独立完成任务的经典架构。",
    scenario: "任务边界清晰、工具集稳定、无需多角色协作的场景。",
    diagramSource: `flowchart LR
  U["用户"] --> A["Agent"]
  A --> R["推理 Reasoning"]
  R --> P["规划 Planning"]
  P --> T["工具选择 Tool"]
  T --> E["工具执行 Execute"]
  E --> O["观察 Observation"]
  O --> R
  O --> F["最终答案 Final"]
  F --> U
  style A fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "推理模块", role: "理解意图、生成计划与决策" },
      { name: "工具集", role: "可被调用的外部能力" },
      { name: "记忆", role: "保存对话与任务状态" },
    ],
    dataFlow: ["用户输入 → 推理 → 规划 → 工具 → 观察 → 回到推理 → 最终答案"],
    callFlow: ["Agent 内部循环：Reason → Act → Observe 直至完成"],
    techOptions: [{ category: "实现", options: ["ReAct 循环", "Plan-and-Execute", "函数调用"] }],
    deployment: "单实例无状态 Runtime，状态外置到记忆服务。",
    security: "工具权限最小化，输入与输出均经校验。",
    extensibility: "通过配置新增工具与记忆后端。",
    designConsiderations: [
      "循环需设最大步数防止失控",
      "每步保留可追溯的推理轨迹",
      "失败需可重试并回退",
    ],
    relatedDomains: ["d01"],
    relatedTutorialSlugs: ["agent-fundamentals", "react-pattern", "tool-calling"],
  },
  {
    id: "a03",
    slug: "multi-agent",
    title: "Multi-Agent 架构",
    summary: "多个角色 Agent 通过编排协同完成复杂企业任务。",
    scenario: "单一 Agent 难以覆盖的复杂任务，需要拆解、研究、分析、执行与复核。",
    diagramSource: `flowchart TB
  USER["用户需求"] --> SUP["Supervisor 主管"]
  SUP --> P["Planner 规划"]
  SUP --> RS["Researcher 研究"]
  SUP --> AN["Analyst 分析"]
  SUP --> EX["Executor 执行"]
  SUP --> RV["Reviewer 复核"]
  P --> RS
  RS --> AN
  AN --> EX
  EX --> RV
  RV --> USER
  style SUP fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "Supervisor", role: "任务分发与结果汇总" },
      { name: "Planner", role: "拆解任务与制定计划" },
      { name: "Researcher", role: "检索知识与数据" },
      { name: "Analyst", role: "分析与推理" },
      { name: "Executor", role: "调用企业系统落地" },
      { name: "Reviewer", role: "校验结果质量" },
    ],
    dataFlow: [
      "需求进入 Supervisor 进行意图识别与角色路由",
      "Planner 产出子任务计划",
      "Researcher / Analyst 并行或串行产出中间结果",
      "Executor 调用工具落地",
      "Reviewer 校验，Supervisor 汇总返回",
    ],
    callFlow: ["Supervisor 维护共享黑板（Blackboard）传递中间产物"],
    techOptions: [{ category: "协作模式", options: ["Supervisor", "Hierarchical", "Swarm", "Debate"] }],
    deployment: "各 Agent 独立部署，经消息总线 / 共享状态通信。",
    security: "每个 Agent 仅持有完成任务所需的最小工具权限。",
    extensibility: "新增角色 Agent 只需注册到编排器。",
    designConsiderations: [
      "明确角色边界，避免职责重叠",
      "使用共享状态或消息协议解耦",
      "设定冲突解决与超时机制",
    ],
    relatedDomains: ["d02", "d01", "d03"],
    relatedTutorialSlugs: ["supervisor-pattern", "multi-agent-communication", "planner-executor-pattern"],
  },
  {
    id: "a04",
    slug: "agent-runtime",
    title: "Agent Runtime 架构",
    summary: "承载 Agent 执行循环、状态、工具、记忆与错误处理的运行时。",
    scenario: "需要稳定、可恢复、可观测地运行 Agent 的生产环境。",
    diagramSource: `flowchart TB
  IN["任务输入"] --> LOOP["执行循环 Engine"]
  LOOP --> REASON["LLM 推理"]
  LOOP --> TOOL["工具调度"]
  LOOP --> MEM["状态读写"]
  LOOP --> CHECK["护栏校验"]
  CHECK -->|通过| LOOP
  CHECK -->|终止| OUT["结果输出"]
  LOOP --> CP["检查点 Checkpoint"]
  CP --> STORE["持久化"]
  style LOOP fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "执行引擎", role: "驱动 Reason-Act-Observe 循环" },
      { name: "工具调度", role: "加载、校验、调用工具" },
      { name: "状态存储", role: "保存运行中状态与检查点" },
      { name: "护栏", role: "输入/输出与行为校验" },
    ],
    dataFlow: ["输入 → 循环(推理/工具/状态) → 护栏 → 输出或下一轮"],
    callFlow: ["引擎每轮向 LLM 请求决策，根据返回执行工具或结束"],
    techOptions: [{ category: "持久化", options: ["Redis", "Postgres", "对象存储"] }],
    deployment: "无状态计算 + 有状态存储，支持水平扩展与断点恢复。",
    security: "循环内每步均经护栏，工具调用带作用域令牌。",
    extensibility: "插件化工具与模型适配层。",
    designConsiderations: [
      "检查点保证长任务可恢复",
      "最大步数与超时防止死循环",
      "错误分类（可重试 / 终止）",
    ],
    relatedDomains: ["d01", "d03"],
    relatedTutorialSlugs: ["agent-runtime", "agent-execution-loop", "agent-error-handling"],
  },
  {
    id: "a05",
    slug: "agent-workflow",
    title: "Agent Workflow 架构",
    summary: "确定性工作流编排与 Agent 节点结合的混合架构。",
    scenario: "既有可控业务流程，又需在关键节点引入自主决策的混合场景。",
    diagramSource: `flowchart LR
  START["开始"] --> A["任务节点"]
  A --> C{"条件分支"}
  C -->|是| B["Agent 决策"]
  C -->|否| D["自动节点"]
  B --> E["人工审批"]
  D --> E
  E --> END["结束"]
  style B fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "Workflow Engine", role: "状态机 / DAG 调度与持久化" },
      { name: "Agent 节点", role: "在流程中嵌入自主决策" },
      { name: "人工审批", role: "Human-in-the-loop 闸口" },
    ],
    dataFlow: ["开始 → 任务 → 条件 → (Agent 或自动) → 审批 → 结束"],
    callFlow: ["引擎按 DAG 驱动，Agent 节点作为可恢复的子流程"],
    techOptions: [{ category: "引擎", options: ["Temporal", "Airflow", "自研状态机"] }],
    deployment: "引擎持久化运行，节点可独立扩缩容。",
    security: "审批节点强制人工或策略校验。",
    extensibility: "节点即插件，新增节点无需改引擎。",
    designConsiderations: [
      "能用确定性流程就不用 Agent",
      "Agent 节点需有超时与回退",
      "长时流程必须可恢复",
    ],
    relatedDomains: ["d03", "d01"],
    relatedTutorialSlugs: ["workflow-vs-agent", "agentic-workflow", "human-approval"],
  },
  {
    id: "a06",
    slug: "mcp",
    title: "MCP 架构",
    summary: "Model Context Protocol 的标准化 Host/Client/Server 工具连接架构。",
    scenario: "需要把大量异构企业系统以统一协议安全地接入 Agent。",
    diagramSource: `flowchart LR
  HOST["MCP Host (Agent App)"] --> CLIENT["MCP Client"]
  CLIENT -->|"协议 JSON-RPC"| SERVER["MCP Server"]
  SERVER --> TOOL["Tools"]
  SERVER --> RES["Resources"]
  SERVER --> PROMPT["Prompts"]
  SERVER --> SYS["企业系统"]
  style HOST fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "MCP Host", role: "承载 Agent 与应用" },
      { name: "MCP Client", role: "与 Server 建立连接、发现能力" },
      { name: "MCP Server", role: "封装工具/资源/提示并暴露协议" },
      { name: "能力原语", role: "Tools / Resources / Prompts" },
    ],
    dataFlow: ["Host 启动 Client → 连接 Server → 发现能力 → 调用 → 返回结果"],
    callFlow: ["Client 通过 initialize / tools/list / tools/call 与 Server 交互"],
    techOptions: [{ category: "传输", options: ["stdio", "SSE", "HTTP Streamable"] }],
    deployment: "Server 独立部署在网关后，统一鉴权与审计。",
    security: "每台 Server 限定可访问资源，调用需授权与审计。",
    extensibility: "新增能力只需新部署 Server 并注册到网关。",
    designConsiderations: [
      "MCP 是传输协议，不是 Agent 本身",
      "权限在 Server 与网关两侧校验",
      "优先用网关集中治理",
    ],
    relatedDomains: ["d04", "d01", "d12"],
    relatedTutorialSlugs: ["mcp-fundamentals", "mcp-server-development", "mcp-gateway"],
  },
  {
    id: "a07",
    slug: "agent-memory",
    title: "Agent Memory 架构",
    summary: "分层记忆与上下文工程支撑长期可用性的 Agent 记忆架构。",
    scenario: "需要跨会话记住用户偏好、任务状态与业务知识的持续型 Agent。",
    diagramSource: `flowchart TB
  IN["交互输入"] --> SEL["上下文选择"]
  SEL --> STM["短期记忆 Working"]
  SEL --> LTM["长期记忆"]
  LTM --> SEM["语义记忆"]
  LTM --> EPI["情景记忆"]
  LTM --> PROC["程序性记忆"]
  SEM --> RET["检索 Retrieval"]
  RET --> INJ["上下文注入"]
  INJ --> LLM["LLM 推理"]
  style LTM fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "短期/工作记忆", role: "当前会话的窗口与状态" },
      { name: "语义记忆", role: "事实与知识" },
      { name: "情景记忆", role: "事件与经验" },
      { name: "程序性记忆", role: "流程与技能" },
      { name: "检索与注入", role: "挑选并组装上下文" },
    ],
    dataFlow: ["输入 → 选择 → 检索长期记忆 → 注入 → 推理"],
    callFlow: ["每次推理前执行检索-压缩-注入，避免窗口溢出"],
    techOptions: [{ category: "存储", options: ["向量库", "KV", "图数据库"] }],
    deployment: "记忆服务独立部署，按租户与用户隔离。",
    security: "记忆数据按用户归属隔离，敏感记忆加密。",
    extensibility: "新增记忆类型即新增检索策略。",
    designConsiderations: [
      "记忆需有衰减与巩固机制",
      "上下文选择比盲目堆叠更重要",
      "隔离不同用户与任务的记忆",
    ],
    relatedDomains: ["d05", "d01"],
    relatedTutorialSlugs: ["context-engineering", "memory-architecture", "semantic-memory"],
  },
  {
    id: "a08",
    slug: "rag",
    title: "RAG 架构",
    summary: "从文档摄取到生成的企业检索增强生成全链路架构。",
    scenario: "需要基于企业私有知识问答、且要求可溯源的几乎所有场景。",
    diagramSource: `flowchart LR
  DOC["企业文档"] --> ING["摄取/解析"]
  ING --> CHK["切片 Chunking"]
  CHK --> EMB["向量化 Embedding"]
  EMB --> IDX["向量索引"]
  Q["用户问题"] --> QR["Query 改写"]
  QR --> RET["检索 Retrieval"]
  IDX --> RET
  RET --> RR["重排 Rerank"]
  RR --> CTX["上下文构建"]
  CTX --> LLM["LLM 生成"]
  style LLM fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "摄取与解析", role: "文档清洗、OCR、结构化" },
      { name: "切片与向量化", role: "切分并生成嵌入" },
      { name: "混合检索", role: "稠密 + 稀疏 + 元数据" },
      { name: "重排", role: "相关性精排" },
      { name: "上下文构建", role: "组装提示并生成" },
    ],
    dataFlow: ["离线：文档→解析→切片→向量→索引；在线：问题→检索→重排→生成"],
    callFlow: ["检索与生成解耦，可分别优化"],
    techOptions: [{ category: "向量库", options: ["pgvector", "Milvus", "Weaviate", "Qdrant"] }],
    deployment: "离线管线与在线服务分离，索引定期重建。",
    security: "检索前按用户权限过滤元数据。",
    extensibility: "新增数据源只需接入摄取管线。",
    designConsiderations: [
      "Chunking 策略决定检索上限",
      "混合检索优于单一向量",
      "重排显著提升精度",
    ],
    relatedDomains: ["d06", "d05", "d07"],
    relatedTutorialSlugs: ["rag-fundamentals", "chunking-strategy", "hybrid-search", "reranking"],
  },
  {
    id: "a09",
    slug: "agentic-rag",
    title: "Agentic RAG 架构",
    summary: "由 Agent 自主决定检索策略、迭代与多源融合的 RAG。",
    scenario: "问题复杂、需多轮检索、跨源推理或自适应查询改写。",
    diagramSource: `flowchart TB
  Q["问题"] --> AG["RAG Agent"]
  AG -->|"规划检索"| P["查询改写/子问题"]
  P --> R1["向量库"]
  P --> R2["知识图谱"]
  P --> R3["数据库"]
  R1 --> AG
  R2 --> AG
  R3 --> AG
  AG -->|"足够"| ANS["答案+引用"]
  AG -->|"不足"| P
  style AG fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "RAG Agent", role: "决策检索计划与终止条件" },
      { name: "多源检索", role: "向量/图谱/数据库" },
      { name: "自我反思", role: "判断是否需要更多检索" },
    ],
    dataFlow: ["问题 → Agent 规划 → 多源检索 → 反思 → 答案或继续"],
    callFlow: ["Agent 在检索与生成间迭代直到满足置信度"],
    techOptions: [{ category: "检索源", options: ["向量库", "GraphRAG", "SQL"] }],
    deployment: "Agent 驱动检索，检索服务独立扩缩容。",
    security: "每源按权限过滤，引用可追溯。",
    extensibility: "新增检索源即注册适配器。",
    designConsiderations: [
      "需设最大迭代步数",
      "多源结果需去重与冲突处理",
      "引用必须可溯源",
    ],
    relatedDomains: ["d06", "d07", "d02"],
    relatedTutorialSlugs: ["agentic-rag", "graphrag", "self-rag"],
  },
  {
    id: "a10",
    slug: "graphrag",
    title: "GraphRAG 架构",
    summary: "以知识图谱增强检索与全局推理的 RAG 变体。",
    scenario: "需要跨实体关系推理、全局摘要或复杂多跳问答。",
    diagramSource: `flowchart TB
  DOC["文档"] --> EX["实体/关系抽取"]
  EX --> G["知识图谱"]
  G --> COMM["社区摘要 Community"]
  Q["问题"] --> MAP["Map 检索社区"]
  COMM --> MAP
  MAP --> RED["Reduce 汇总"]
  RED --> ANS["答案"]
  style G fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "抽取管线", role: "从文本抽取实体与关系" },
      { name: "知识图谱", role: "存储实体与关系" },
      { name: "社区摘要", role: "图社区层次化摘要" },
      { name: "Map-Reduce", role: "全局问答聚合" },
    ],
    dataFlow: ["文档→抽取→图谱→社区摘要；问题→Map 社区→Reduce→答案"],
    callFlow: ["全局问题用社区摘要聚合，局部问题走图遍历"],
    techOptions: [{ category: "图库", options: ["Neo4j", "NebulaGraph", "JanusGraph"] }],
    deployment: "图谱与向量库并行，检索路由按问题类型选择。",
    security: "图权限与向量权限一致控制。",
    extensibility: "新增关系类型即扩展本体。",
    designConsiderations: [
      "抽取质量决定图谱上限",
      "适合全局性、概括性问题",
      "与向量 RAG 互补而非替代",
    ],
    relatedDomains: ["d07", "d06"],
    relatedTutorialSlugs: ["graphrag", "knowledge-graph", "ontology-modeling"],
  },
  {
    id: "a11",
    slug: "enterprise-knowledge",
    title: "企业知识架构",
    summary: "统一连接非结构化文档、结构化数据、术语、本体与知识图谱的企业知识层。",
    scenario: "需要把分散在各业务系统中的知识沉淀为可治理、可推理资产。",
    diagramSource: `flowchart TB
  DOC["非结构化文档"] --> KE["知识工程层"]
  STR["结构化数据"] --> KE
  TERM["业务术语"] --> KE
  KE --> ONTO["Ontology/Taxonomy"]
  KE --> KG["知识图谱"]
  KE --> VEC["向量库"]
  KG --> RAG["RAG / Agent"]
  VEC --> RAG
  ONTO --> SEM["语义层"]
  style KE fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "知识工程层", role: "抽取、建模与治理" },
      { name: "Ontology", role: "统一概念与关系定义" },
      { name: "知识图谱", role: "实体关系网络" },
      { name: "向量库", role: "语义检索" },
    ],
    dataFlow: ["多源 → 知识工程 → 图谱/向量/Ontology → 服务 RAG 与语义层"],
    callFlow: ["知识资产统一注册到治理与血缘系统"],
    techOptions: [{ category: "治理", options: ["Data Catalog", "血缘工具", "本体编辑器"] }],
    deployment: "知识管线离线运行，服务层在线提供。",
    security: "知识资产分级分类与访问控制。",
    extensibility: "新增源与类型即扩展本体与管线。",
    designConsiderations: [
      "本体先行，避免图谱失序",
      "知识需有生命周期治理",
      "与 RAG、语义层协同而非独立",
    ],
    relatedDomains: ["d07", "d06", "d09"],
    relatedTutorialSlugs: ["knowledge-engineering-overview", "ontology-modeling", "knowledge-graph"],
  },
  {
    id: "a12",
    slug: "semantic-layer",
    title: "语义层架构",
    summary: "把物理数据映射为统一业务语义，支撑 Text-to-SQL 与对话式分析。",
    scenario: "业务用户用自然语言查询指标、需要统一口径与权限控制。",
    diagramSource: `flowchart TB
  Q["自然语言"] --> NLU["意图与指标识别"]
  NLU --> GEN["SQL 生成"]
  SEM["语义模型 指标/维度"] --> GEN
  GEN --> VAL["SQL 校验"]
  VAL --> DB["数据仓库"]
  DB --> RES["结果 + 解释"]
  style SEM fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "语义模型", role: "指标定义与维度映射" },
      { name: "NLU", role: "识别意图与指标" },
      { name: "SQL 生成与校验", role: "生成并校验可执行 SQL" },
    ],
    dataFlow: ["问题 → 识别指标 → 结合语义模型生成 SQL → 校验 → 查询 → 解释"],
    callFlow: ["语义模型是生成正确 SQL 的关键上下文"],
    techOptions: [{ category: "语义层", options: ["dbt Semantic Layer", "Cube", "自研"] }],
    deployment: "语义层服务独立，查询路由到数仓。",
    security: "指标级与行级权限控制。",
    extensibility: "新增指标即配置语义模型。",
    designConsiderations: [
      "语义模型保证口径一致",
      "SQL 必须校验与限流",
      "结果需业务化解释",
    ],
    relatedDomains: ["d09", "d08"],
    relatedTutorialSlugs: ["semantic-layer-overview", "text-to-sql", "conversational-analytics"],
  },
  {
    id: "a13",
    slug: "agentops",
    title: "AgentOps 架构",
    summary: "覆盖追踪、日志、指标、评估与持续改进的可观测运维架构。",
    scenario: "多 Agent 同时运行，需要成本、质量与稳定性统一管理。",
    diagramSource: `flowchart TB
  AG["Agent 运行"] --> TR["追踪 Tracing"]
  AG --> LOG["日志 Logging"]
  AG --> MET["指标 Metrics"]
  TR --> OBS["可观测平台"]
  LOG --> OBS
  MET --> OBS
  OBS --> EVAL["评估 Evaluation"]
  EVAL --> CI["持续迭代"]
  style OBS fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "追踪", role: "记录每步推理与工具调用" },
      { name: "日志/指标", role: "成本、延迟、成功率" },
      { name: "评估", role: "质量与回归测试" },
    ],
    dataFlow: ["运行 → 追踪/日志/指标 → 平台 → 评估 → 迭代"],
    callFlow: ["每次调用生成 trace 供复盘与评估"],
    techOptions: [{ category: "平台", options: ["LangSmith", "自研", "OpenTelemetry"] }],
    deployment: "采集 SDK 注入 Runtime，数据入可观测后端。",
    security: "日志脱敏，避免泄露 PII。",
    extensibility: "新指标即新增采集点。",
    designConsiderations: [
      "追踪需结构化便于复盘",
      "成本与质量指标实时可见",
      "评估内建到发布流程",
    ],
    relatedDomains: ["d10", "d11", "d12"],
    relatedTutorialSlugs: ["agentops-overview", "agent-tracing", "agent-evaluation"],
  },
  {
    id: "a14",
    slug: "ai-security",
    title: "企业 AI 安全架构",
    summary: "覆盖身份、权限、工具调用、数据访问与审计的端到端安全治理架构。",
    scenario: "Agent 拥有系统操作权限，必须满足合规与最小权限。",
    diagramSource: `flowchart TB
  U["用户身份"] --> AUTH["认证 Authorization"]
  AUTH --> AG["Agent"]
  AG --> PERM["工具权限检查"]
  PERM --> POL["策略引擎 Policy"]
  POL --> TOOL["工具调用"]
  TOOL --> AUDIT["审计日志 Audit"]
  AG --> GUARD["护栏 Guardrails"]
  GUARD --> OUT["安全输出"]
  style POL fill:#1d2940,stroke:#FC8181`,
    components: [
      { name: "身份认证", role: "用户与 Agent 身份" },
      { name: "策略引擎", role: "权限与数据访问校验" },
      { name: "工具权限", role: "最小权限工具调用" },
      { name: "护栏", role: "输入/输出校验" },
      { name: "审计", role: "完整可追溯日志" },
    ],
    dataFlow: ["身份 → 认证 → 权限检查 → 策略 → 工具 → 审计；输出经护栏"],
    callFlow: ["每次工具调用前经策略引擎，事后写入审计"],
    techOptions: [{ category: "策略", options: ["OPA", "自研", "云 IAM"] }],
    deployment: "策略引擎与护栏部署在关键路径。",
    security: "本架构即安全核心，需独立审计。",
    extensibility: "新工具即注册权限策略。",
    designConsiderations: [
      "安全边界在工具与数据层",
      "Prompt Injection 需纵深防御",
      "所有操作可审计可追溯",
    ],
    relatedDomains: ["d11", "d04", "d01"],
    relatedTutorialSlugs: ["ai-security-overview", "prompt-injection", "agent-guardrails"],
  },
  {
    id: "a15",
    slug: "agent-platform",
    title: "企业 AI 平台架构",
    summary: "统一模型、Agent、工具、MCP、知识与记忆服务的企业级平台参考架构。",
    scenario: "多团队复用 AI 能力，需统一治理、隔离与上线流程。",
    diagramSource: `flowchart TB
  DEV["开发者门户"] --> REG["注册中心"]
  REG --> MR["模型注册"]
  REG --> AR["Agent 注册"]
  REG --> TR["工具注册"]
  REG --> MCPG["MCP 网关"]
  DEV --> RT["Runtime 平台"]
  RT --> MEM["记忆服务"]
  RT --> KNOWS["知识服务"]
  RT --> OBS["可观测"]
  RT --> GOV["平台治理"]
  style REG fill:#1d2940,stroke:#7C8CFF`,
    components: [
      { name: "注册中心", role: "模型/Agent/工具/MCP 统一注册" },
      { name: "Runtime 平台", role: "执行 Agent" },
      { name: "记忆/知识服务", role: "复用能力底座" },
      { name: "治理", role: "多租户、配额、审计" },
    ],
    dataFlow: ["开发者门户 → 注册 → 平台调度运行 → 共享记忆/知识/可观测"],
    callFlow: ["能力注册后供各 Agent 声明式引用"],
    techOptions: [{ category: "部署", options: ["Kubernetes", "容器化", "多租户隔离"] }],
    deployment: "平台层与租户工作负载隔离，K8s 部署。",
    security: "多租户资源与数据隔离，平台级审计。",
    extensibility: "新能力即注册，无需改平台内核。",
    designConsiderations: [
      "复用优于重复造轮子",
      "多租户隔离是底线",
      "治理内建到发布链路",
    ],
    relatedDomains: ["d12", "d04", "d10"],
    relatedTutorialSlugs: ["ai-platform-overview", "mcp-gateway", "model-gateway"],
  },
  {
    id: "a16",
    slug: "digital-twin-agent",
    title: "数字孪生 + Agent 架构",
    summary: "工业数字孪生与 Agent 结合的监测、预测与优化闭环架构。",
    scenario: "制造、设备、供应链等需要基于物理模型与实时数据做智能决策。",
    diagramSource: `flowchart TB
  SEN["传感器/IIoT"] --> DT["数字孪生模型"]
  DT --> SIM["仿真 Simulation"]
  DT --> TS["时序数据库"]
  EV["异常事件"] --> AG["工业 Agent"]
  AG --> TS
  AG --> KB["维修知识库 RAG"]
  AG --> SIM
  AG --> WO["工单系统"]
  AG --> HU["人工确认"]
  style DT fill:#1d2940,stroke:#76E4F7`,
    components: [
      { name: "数字孪生", role: "物理资产映射与仿真" },
      { name: "时序数据", role: "设备运行历史" },
      { name: "工业 Agent", role: "分析、预测与建议" },
      { name: "知识库", role: "维修手册与案例" },
    ],
    dataFlow: ["传感 → 孪生/时序 → 事件 → Agent 分析(知识/仿真) → 工单/人工"],
    callFlow: ["Agent 结合仿真与知识给出可执行建议"],
    techOptions: [{ category: "孪生", options: ["自研仿真", "工业数字孪生平台"] }],
    deployment: "边缘采集 + 中心孪生与 Agent 服务。",
    security: "OT/IT 隔离，工单操作需审批。",
    extensibility: "新增设备即扩展孪生模型。",
    designConsiderations: [
      "仿真需与真实偏差可控",
      "预测需有置信度与回退",
      "关键操作人工确认",
    ],
    relatedDomains: ["d14", "d13", "d06"],
    relatedTutorialSlugs: ["digital-twin-overview", "predictive-maintenance", "industrial-agent"],
  },
];

export function getArchitecture(slug: string): Architecture | undefined {
  return architectures.find((a) => a.slug === slug);
}
