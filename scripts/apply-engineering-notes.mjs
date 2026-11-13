// ============================================================================
// 工程实现补遗注入（一次性数据迁移，可重复执行时会跳过已注入的篇目）
//
// 背景：V2.0 教程已覆盖 15 章，但严格技术审查发现跨篇共性缺口：
//   1) 只有 flowchart 结构图，缺少组件交互时序（含失败分支）；
//   2) 故障处理多为原则列表，缺少「注入 → 观测 → 恢复断言」；
//   3) 生产部署缺少可执行的验收命令；
//   4) 企业案例为教学模拟数据，缺少「模拟 → 真实」替换映射。
// 本脚本按 slug 为每篇追加一个定制的「16. 工程实现补遗」章节，
// 内容全部使用现有 ContentBlock 类型，不改动任何页面组件与样式。
//
// 用法：node scripts/apply-engineering-notes.mjs
// ============================================================================
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const upgradeDir = path.join(root, "src/content/tutorials/upgrades");

// 每篇定制：p1=机制关键点，seq=交互时序，contract=组件契约，
// ops=故障演练/上线验收，p2=模拟到真实的替换点，code=可选可运行验收脚本
const notes = {
  "agent-execution-loop": {
    p1: "终止条件不只由模型输出决定：max_steps、token 预算、连续工具失败数与幂等键共同构成终止集合。任一项触发都必须写入终态并停止循环，否则模型自报完成或持续重试会形成不可控循环。",
    seq: ["sequenceDiagram", "  participant C as 调用方", "  participant R as Runtime", "  participant P as 策略引擎", "  participant T as 工具执行器", "  participant S as Checkpoint", "  C->>R: run(request, run_id)", "  R->>S: 载入/创建检查点", "  R->>P: 校验工具与参数", "  alt 允许执行", "    P->>T: call(tool, args, idempotency_key)", "    T-->>R: observation(含耗时/错误码)", "    R->>S: 提交步骤快照", "  else 拒绝或超时", "    P-->>R: deny(reason)", "    R->>S: 记录终态与原因", "  end", "  R-->>C: RunResult(终态, trace, usage)"],
    contract: [["Runtime → 策略引擎", "结构化 Action 候选 + 会话上下文", "纯函数裁决，异常一律 deny"], ["策略引擎 → 工具执行器", "工具名 + 已校验参数 + 幂等键", "超时返回 error，不重试未知状态"], ["工具执行器 → Checkpoint", "observation 摘要 + 步骤序号", "先落快照再推进下一步"]],
    ops: [["故障注入", "让工具连续抛 TimeoutError 3 次", "达到连续失败阈值后终止，终态含原因"], ["故障注入", "在步骤提交前杀掉进程再重启", "从检查点恢复，已提交写步骤不重放"], ["上线验收", "pytest -q test_runtime.py", "全部用例通过，无真实密钥依赖"], ["上线验收", "核对 trace 中 max_steps 与 usage 字段", "每步有 run_id，token 累计不为负"]],
    p2: "落地替换点：把 mock 模型换成按官方 SDK 实现的适配器（凭据从环境变量读取），把模拟工具换成真实 ITSM/监控 API 并在执行器侧保留幂等表，把内存 Checkpoint 换成带唯一约束的关系表。模拟数据与真实接口边界已在 Hands-on 中标注；本节不新增任何虚构的产品 API。",
  },
  "supervisor-pattern": {
    p1: "共享状态的版本号是冲突裁决的前提：Worker 回写时携带 base_version，Supervisor 只在版本匹配时合并，不匹配则要求重读后重试。缺少版本号的并发合并会造成后写覆盖，且轨迹无法解释结果。",
    seq: ["sequenceDiagram", "  participant S as Supervisor", "  participant W1 as Worker A", "  participant W2 as Worker B", "  participant ST as SharedState", "  S->>ST: read(version=v)", "  S->>W1: delegate(task1, base_version=v)", "  S->>W2: delegate(task2, base_version=v)", "  W1-->>S: ResultMessage(v)", "  W2-->>S: ResultMessage(v)", "  S->>ST: arbitrate + merge", "  alt 版本仍为 v", "    ST-->>S: commit(v+1)", "  else 版本已推进", "    ST-->>S: conflict", "    S->>W2: 重读后重试(带预算上限)", "  end", "  S-->>S: 汇总答案与 trace"],
    contract: [["Supervisor → Worker", "DelegationMessage(goal, inputs, base_version, deadline)", "超时返回 timeout，计入重试预算"], ["Worker → Supervisor", "ResultMessage(status, evidence, version)", "Schema 解析失败视为失败结果"], ["Supervisor → SharedState", "合并后的状态与冲突裁决记录", "冲突不静默覆盖，必须留痕"]],
    ops: [["故障注入", "让 W2 延迟超过 deadline", "Supervisor 降级或换人，trace 标记 timeout"], ["故障注入", "并发回写同一 base_version", "仅一次提交成功，其余进入重试或冲突分支"], ["上线验收", "npx tsx --test supervisor.test.ts", "委派、超时、冲突裁决用例全通过"], ["上线验收", "检查跨 Agent trace 是否共享 run_id", "轨迹连续无断裂"]],
    p2: "落地替换点：把内存 SharedState 换成带乐观锁的版本化存储，把 mock Worker 换成真实 Agent 服务并在调用侧透传 run_id，把预算守卫接入平台配额服务。角色权限与租户隔离策略需按企业 IAM 重新配置，不要沿用示例中的宽松角色。",
  },
  "workflow-engine": {
    p1: "检查点必须在副作用提交之后、节点标记完成之前写入。若顺序颠倒（先标记完成再落快照），进程崩溃后重启会认为节点未执行而重放已完成的写操作；这是 Saga 补偿也无法补救的顺序问题。",
    seq: ["sequenceDiagram", "  participant C as 调用方", "  participant E as WorkflowEngine", "  participant N as 节点执行器", "  participant S as CheckpointStore", "  C->>E: start(flow, params)", "  E->>E: assertAcyclic(flow)", "  E->>N: run(node, idempotency_key)", "  alt 节点成功", "    N-->>E: result", "    E->>S: save(完成节点, 结果摘要)", "    E->>E: 计算下一批可运行节点", "  else 节点失败", "    N-->>E: error", "    E->>N: 逆序 compensate(已完成写节点)", "    E->>S: save(compensated)", "  end", "  E-->>C: instance 终态"],
    contract: [["Engine → 节点执行器", "node + 幂等键 + 超时上限", "未知状态先查重再决定是否重试"], ["节点执行器 → Checkpoint", "结果摘要与补偿句柄", "写节点必须提供逆操作"], ["Engine → 调用方", "instance_id + 终态", "审批挂起状态可恢复"]],
    ops: [["故障注入", "在补偿途中让逆操作抛异常", "实例置 failed 并进入死信队列，不静默完成"], ["故障注入", "注入带环的流程定义", "assertAcyclic 在启动前拒绝"], ["上线验收", "npx tsx --test engine.test.ts", "环检测、补偿、审批恢复用例通过"], ["上线验收", "重启进程后 resume(instance_id)", "已完成写节点不重复执行"]],
    p2: "落地替换点：CheckpointStore 换成带事务的关系库，补偿句柄换成真实逆操作或人工工单，审批队列接入企业审批系统并配置超时策略。流程定义必须版本化，运行中的实例按创建时版本继续，不中途切换语义。",
  },
  "mcp-fundamentals": {
    p1: "能力协商发生在 initialize 阶段：Server 声明的 capabilities 决定后续哪些请求合法。tools/list 返回的 JSON Schema 是 Host 构造参数校验的唯一依据；工具描述文本属于不可信数据，不能当作指令执行。",
    seq: ["sequenceDiagram", "  participant H as Host", "  participant C as MCP Client", "  participant S as MCP Server", "  H->>C: 建立会话", "  C->>S: initialize(protocolVersion, capabilities)", "  S-->>C: 协商结果(能力集, 版本)", "  C->>S: tools/list", "  S-->>C: tools Schema(只读)", "  H->>C: 用户确认调用某工具", "  C->>S: tools/call(name, args)", "  alt 执行成功", "    S-->>C: structured_content / content", "  else 工具报错或越权", "    S-->>C: JSON-RPC error", "    C-->>H: 结构化错误 + 审计", "  end", "  C-->>H: 结果(标记为数据)"],
    contract: [["Host → Client", "用户授权范围与工具候选", "未获同意不得发起 tools/call"], ["Client → Server", "JSON-RPC 请求 + 协商后的版本", "传输断开按重连与超时策略处理"], ["Server → Client", "Schema 与结构化结果", "描述文本与返回值均视为不可信数据"]],
    ops: [["故障注入", "让 Server 返回带指令文本的 resource", "Host 不执行其中指令，审计标记注入信号"], ["故障注入", "stdio 进程中途退出", "Client 按重连上限恢复，失败则降级为人工"], ["上线验收", "按官方 SDK 运行 test_tools.py", "能力协商与结构化结果解析通过"], ["上线验收", "核对工具白名单与最小权限", "未注册工具一律拒绝"]],
    p2: "落地替换点：把示例 Server 换成企业工具服务并按官方规范实现传输层，凭据由 Server 侧从密钥服务读取，Host 侧保留用户同意与审计记录。SDK 方法名、协议版本与字段必须按对应官方文档核验后替换，本节不假定任何具体版本。",
  },
  "context-engineering": {
    p1: "预算分配是逐级回收的：先为 system 与 user 保留硬下限，再按 trust 降序填充片段。低信任片段被截断时必须在 ContextTrace 中记录丢弃原因与 doc_id，否则上线后无法解释「答案为何缺少某段证据」。",
    seq: ["sequenceDiagram", "  participant R as Runtime", "  participant B as ContextBuilder", "  participant T as TokenBudget", "  participant K as 片段来源(RAG/Memory/Tool)", "  participant M as 模型", "  R->>B: build(system, task, fragments)", "  B->>T: reserve(system + task)", "  B->>K: 按 trust 与新鲜度排序", "  K-->>B: 带 trust/provenance 的片段", "  alt 预算充足", "    B->>B: 包裹为不可信数据块", "  else 预算不足", "    B->>B: 丢弃低信任片段并记入 trace", "  end", "  B-->>R: messages + ContextTrace", "  R->>M: 推理(仅数据块可截断)", "  M-->>R: 结构化输出"],
    contract: [["Runtime → ContextBuilder", "system / task / fragments / run_id", "片段缺失不得静默补写"], ["ContextBuilder → TokenBudget", "预留与回收请求", "超预算先丢 low trust，保留 system"], ["ContextBuilder → Runtime", "messages + ContextTrace", "trace 需含丢弃原因与 doc_id"]],
    ops: [["故障注入", "注入超长低信任片段", "system 完整保留，丢弃记入 trace"], ["故障注入", "把 Memory 片段标为 system", "租户/信任校验拒绝该写入"], ["上线验收", "pytest -q test_builder.py", "预算裁剪与信任继承用例通过"], ["上线验收", "抽样比对 ContextTrace 与最终答案", "证据缺失均可追溯到丢弃记录"]],
    p2: "落地替换点：把内存片段源换成企业 RAG 与长期记忆服务，TokenBudget 的计数换成与目标模型一致的分词器，ContextTrace 接入可观测平台并与 run_id 关联。租户隔离与 trust 继承规则必须在写入侧强制，不能依赖模型判断。",
  },
  "rag-fundamentals": {
    p1: "RRF 的 k=60 只是排序融合常数，真正影响效果的是元数据/权限过滤发生在融合之前还是之后。若在融合之后过滤，top_k 会被越权文档占满，合法文档被挤出，表现为「检索召回莫名下降」。",
    seq: ["sequenceDiagram", "  participant U as 用户", "  participant I as Ingestion", "  participant V as 向量索引", "  participant B as BM25 索引", "  participant F as 融合/过滤", "  participant G as 生成层", "  I->>V: 写入向量 + ACL 标签", "  I->>B: 写入倒排 + ACL 标签", "  U->>F: query(tenant, acl)", "  F->>V: 稠密检索(先按 ACL 过滤)", "  F->>B: 稀疏检索(先按 ACL 过滤)", "  V-->>F: 候选 + 分数", "  B-->>F: 候选 + 分数", "  F->>F: RRF 融合 → rerank → ContextBuilder", "  alt 有证据", "    F-->>G: 带 doc_id 的上下文", "  else 无证据", "    F-->>U: 明确转人工，不编造", "  end"],
    contract: [["Ingestion → 索引", "Chunk + embedding + ACL 标签 + 版本", "写入失败进死信队列，不丢 schema"], ["检索层 → 融合层", "带分数的候选集", "过滤必须在融合前完成"], ["融合层 → 生成层", "带 doc_id 的上下文与 trace", "无证据时禁止自由发挥"]],
    ops: [["故障注入", "让向量索引返回越权文档", "ACL 过滤后该文档不进入候选"], ["故障注入", "Embedding 服务超时", "降级为 BM25 并标注低置信"], ["上线验收", "pytest -q test_pipeline.py", "摄取、混合检索、评估用例通过"], ["上线验收", "回放评测集统计 Recall@K 与忠实度", "指标有基线且与权限过滤一致"]],
    p2: "落地替换点：把内存索引换成企业向量库与搜索引擎，Embedding 服务按官方 SDK 接入并配置超时/预算，ACL 标签来自统一权限系统而非文档正文，评测集由真实业务问答与人工标注构建。文中 RRF 参数与阈值是教学示例，需用自身数据回放后重新标定。",
  },
  "ontology-taxonomy": {
    p1: "本体校验必须在 upsert 之前执行。若先写后校验，违规三元组会进入图谱并污染路径查询与 GraphRAG 摘要；事后清理无法恢复已被下游消费的错误关系。时态关系还需记录 valid_from/valid_to。",
    seq: ["sequenceDiagram", "  participant E as 抽取器", "  participant K as KnowledgeStore", "  participant O as 本体规则表", "  participant G as 图查询", "  E->>K: upsert(三元组候选)", "  K->>O: 读取 subject/predicate/object 约束", "  alt 符合约束", "    O-->>K: valid", "    K->>K: 消歧 + 写入(带来源与版本)", "    K-->>G: 可查询路径", "  else 违反约束", "    O-->>K: invalid(reason)", "    K-->>E: 拒绝并进死信队列", "  end", "  G-->>G: neighbors / paths 查询"],
    contract: [["抽取器 → KnowledgeStore", "候选三元组 + provenance", "缺来源标注的写入直接拒绝"], ["KnowledgeStore → 本体规则表", "类型与谓词约束查询", "规则版本随写入一起记录"], ["KnowledgeStore → 图查询", "已校验实体与关系", "时态关系必须带有效期"]],
    ops: [["故障注入", "写入 subject_type 不匹配的三元组", "校验拒绝，库中无该关系"], ["故障注入", "同一实体多个别名指向不同 id", "消歧结果唯一或转人工"], ["上线验收", "pytest -q test_model.py", "校验、消歧、路径查询用例通过"], ["上线验收", "核对三元组 provenance 覆盖率", "100% 关系可追溯到来源与版本"]],
    p2: "落地替换点：把内存 KnowledgeStore 换成图数据库或带约束的三元组表，本体规则由领域专家评审并版本化，实体消歧接入企业主数据。RDF/OWL 相关序列化与推理能力需按所选引擎官方文档核验，示例只覆盖关系型校验。",
  },
  "data-pipeline-cdc": {
    p1: "位点（LSN/binlog offset）与业务写入必须在同一本地事务提交。若先写业务表再单独更新位点，崩溃后会重放；反之会丢事件。这也是「至少一次投递」必须由幂等键兜底的原因。",
    seq: ["sequenceDiagram", "  participant DB as 源库", "  participant C as CdcConsumer", "  participant T as 目标存储", "  participant O as 位点账本", "  DB->>C: ChangeEvent(before/after, lsn)", "  C->>C: 校验 schema + 生成幂等键", "  alt 首次处理", "    C->>T: 写入业务数据", "    C->>O: 同一事务提交位点", "    O-->>C: ack", "  else 重复或乱序", "    C->>O: 查幂等表命中", "    C-->>C: 跳过并计数", "  end", "  alt 校验失败", "    C->>C: 写死信队列 + 告警", "  end"],
    contract: [["源库 → Consumer", "带 before/after image 与位点的事件", "迟到事件按水位线单独处理"], ["Consumer → 目标存储", "幂等写入 + schema 版本", "删除事件需墓碑标记"], ["Consumer → 位点账本", "与业务写入原子提交", "位点回退即触发重放保护"]],
    ops: [["故障注入", "重复投递同一 lsn", "幂等表命中，目标无重复行"], ["故障注入", "注入 schema 不兼容事件", "进死信队列且不推进位点"], ["上线验收", "pytest -q test_consumer.py", "幂等、位点、死信用例通过"], ["上线验收", "监控新鲜度延迟与 DLQ 大小", "延迟有 SLO，DLQ 有人工值守"]],
    p2: "落地替换点：把模拟事件列表换成真实 CDC 连接器（Debezium/数据库原生日志等，接口需按官方文档核验），位点账本换成与目标库同事务的存储，Schema Registry 管理版本演进。删除墓碑、DDL 变更与回灌策略需按现场数据规范另行设计。",
  },
  "text-to-sql": {
    p1: "行级权限必须注入到 AST 而非拼接 SQL 字符串。字符串拼接可被 union、子查询或注释绕过；AST 注入才能确保租户谓词作用于目标表且不被后续变换移除。",
    seq: ["sequenceDiagram", "  participant U as 用户", "  participant S as 语义层", "  participant V as AST 校验器", "  participant D as 只读库", "  U->>S: 自然语言问题 + 口径版本", "  S->>S: 解析 metric/dimension/时间范围", "  alt 时间范围模糊", "    S-->>U: 请求澄清，不生成 SQL", "  else 口径明确", "    S->>V: 候选 SQL + 租户策略", "    V->>V: 白名单/LIMIT/行级权限注入", "    alt 校验通过", "      V->>D: 只读执行", "      D-->>U: 结果 + 口径版本", "    else 越权或超预算", "      V-->>U: 拒绝并记录审计", "    end", "  end"],
    contract: [["语义层 → AST 校验器", "候选 SQL + metric + tenant", "解析失败即拒绝，不修复后执行"], ["AST 校验器 → 只读库", "受控 SQL + 行数上限", "只读账号，禁止写语句"], ["只读库 → 用户", "结果 + 口径版本", "口径版本随结果一起审计"]],
    ops: [["故障注入", "注入 union 绕过租户谓词的 SQL", "AST 校验拒绝"], ["故障注入", "生成无 LIMIT 的全表扫描", "预算守卫强制改写或拒绝"], ["上线验收", "pytest -q test_semantic.py", "校验、权限注入、预算用例通过"], ["上线验收", "核对结果日志中的口径版本", "每次查询可追溯到语义模型版本"]],
    p2: "落地替换点：语义模型接入企业指标平台并版本化，SQL 解析库按所选方言官方文档配置，只读账号与行级策略由 DBA 统一分配。口径变更需走评审与回放对比，不能直接改线上 YAML。",
  },
  "agent-tracing": {
    p1: "span 栈是上下文局部变量：跨线程或协程必须用 contextvars（或等效上下文传播机制）保存当前 span，否则父子关系会错乱，整条 trace 变成扁平列表，关键路径分析失效。",
    seq: ["sequenceDiagram", "  participant R as Runtime", "  participant T as Tracer", "  participant X as 采集器", "  participant S as 只写存储", "  R->>T: start_trace(run_id)", "  T->>T: contextvars 保存当前 span", "  R->>T: span(model.infer)", "  T->>T: 嵌套 parent_span_id", "  alt 步骤异常", "    R->>T: raise / timeout", "    T->>T: status=error, 强制全采", "  else 正常", "    R->>T: usage(model, tokens)", "  end", "  T->>X: 脱敏后的 trace 批次", "  alt 采集器可用", "    X->>S: 写入(只追加)", "  else 采集器故障", "    X->>X: 本地缓冲 + 告警，不阻塞主流程", "  end"],
    contract: [["Runtime → Tracer", "run_id + span 名 + 脱敏属性", "跨进程必须透传 run_id"], ["Tracer → 采集器", "批量 trace + 采样决策", "错误与超时轨迹强制全采"], ["采集器 → 存储", "只写追加记录", "不可用时不阻断业务"]],
    ops: [["故障注入", "让采集器返回 5xx", "业务成功，告警与本地缓冲生效"], ["故障注入", "在 span 属性里放入 api_key", "落库前被替换为 REDACTED"], ["上线验收", "pytest -q test_tracer.py", "嵌套、脱敏、成本、断言用例通过"], ["上线验收", "回放失败轨迹并生成回归用例", "关键步骤序列断言成立"]],
    p2: "落地替换点：把内存 Tracer 换成 OpenTelemetry SDK 导出到企业可观测后端，单价表从账单系统同步并版本化，采样与脱敏策略由安全团队评审。示例中的单价与阈值均为教学占位值，不能直接用于成本核算。",
  },
  "prompt-injection": {
    p1: "策略引擎必须是纯函数：任何网络调用或由另一个 LLM 裁决，都会让「拒绝」变得不可复现，回归测试也无法覆盖全部规则组合。可审计性来自确定性，不来自更强的检测模型。",
    seq: ["sequenceDiagram", "  participant U as 用户", "  participant N as 净化/标注", "  participant M as 模型", "  participant P as 策略引擎", "  participant H as 人工审批", "  participant A as 审计", "  U->>N: 请求 + 外部内容", "  N->>M: system 与数据块分通道", "  M->>P: 结构化 Action 候选", "  P->>P: 白名单/RBAC/参数/租户校验", "  alt 只读且合规", "    P->>A: allow + 决策依据", "  else 副作用或风险信号", "    P->>H: need_approval(挂起)", "    alt 人工批准", "      H->>A: approved + 审批人", "    else 拒绝或超时", "      H->>A: denied(自动拒绝)", "    end", "  else 未注册/越权", "    P->>A: deny(reason)", "  end"],
    contract: [["净化层 → 模型", "带 trust 与来源的数据块", "伪系统标记整段丢弃"], ["模型 → 策略引擎", "Action 候选(JSON)", "解析失败即拒绝"], ["策略引擎 → 审计", "三态决策 + 原因 + 参数摘要", "审计失败按配置 fail-closed 或缓冲"]],
    ops: [["故障注入", "在 RAG 片段嵌入伪 system 标记", "片段被 BLOCKED，模型看不到"], ["故障注入", "让模型输出跨租户 tenant 参数", "策略引擎 deny 并记录原因"], ["上线验收", "pytest -q test_guard.py", "隔离、白名单、越权、审批用例通过"], ["上线验收", "核对审计中的 decision.reason", "每个 deny 都有可解释原因"]],
    p2: "落地替换点：策略规则外置为版本化配置或企业策略引擎，工具元数据来自注册中心，审批与审计接入工单/合规系统，凭据由执行器从密钥服务读取。注入检测只能作为告警信号，不能替代最小权限与人工审批。",
  },
  "model-gateway": {
    p1: "预扣与结算必须成对出现，超时路径也要结算。若只有调用前预扣、没有按实际用量回冲，账本只增不减，租户会在未完成任何请求的情况下耗尽预算。",
    seq: ["sequenceDiagram", "  participant A as Agent", "  participant G as Gateway", "  participant L as 限流/预算", "  participant C as 熔断器", "  participant P as Provider", "  A->>G: chat(tenant, task, maxTokens)", "  G->>L: tryAcquire + reserve", "  alt 配额或预算不足", "    L-->>A: 429 / BUDGET_EXHAUSTED", "  else 放行", "    G->>C: allow(主模型)", "    alt 熔断打开", "      C-->>G: skip", "      G->>P: fallback 模型", "    else 正常", "      G->>P: 主模型(带 timeout)", "    end", "    alt 成功", "      P-->>G: 归一化结果 + usage", "      G->>L: settle(实际用量)", "    else 超时或 5xx", "      P-->>G: error", "      G->>C: onFailure", "      G->>L: settle(0 或已计用量)", "    end", "    G->>A: 结果或聚合错误", "  end"],
    contract: [["Gateway → 限流/预算", "tenant + 预估 token", "并发下需原子扣减"], ["Gateway → 熔断器", "模型名 + 成功/失败事件", "半开只放一个探测请求"], ["Gateway → Provider", "归一化请求 + 超时", "4xx 不重试，幂等键随重试透传"]],
    ops: [["故障注入", "主模型持续返回 503", "熔断打开并切 fallback，成功率不归零"], ["故障注入", "Provider 永不响应", "超时后 fallback，定时器被清理"], ["上线验收", "npx tsx --test gateway.test.ts", "6 组用例全通过"], ["上线验收", "核对预算账本预扣与结算差额", "无只增不减的悬挂预扣"]],
    p2: "落地替换点：把 mock Provider 换成按官方 SDK 实现的适配器，限流/预算状态换成集中式存储（多实例必须如此），价格表从账单系统同步并版本化，凭据由网关从密钥服务读取。示例配额与单价均为教学值。",
  },
  "rpa-integration": {
    p1: "Adapter 超时属于「未知状态」而不是「确认失败」：必须先按幂等键查重，再决定是否重试，否则会把「已执行但响应丢失」当成「没执行」而重复提交。",
    seq: ["sequenceDiagram", "  participant E as 事件", "  participant O as Saga 编排器", "  participant S as Checkpoint", "  participant A as Adapter", "  participant H as 人工审批", "  participant Q as 死信队列", "  E->>O: start(instance_id)", "  O->>S: 载入检查点", "  O->>A: 只读步骤(先查重)", "  alt 命中幂等键", "    A-->>O: 复用首次结果", "  else 未命中", "    A-->>O: 执行结果 + 写快照", "  end", "  O->>H: 审批挂起(写工具)", "  alt 批准", "    H->>O: approved(重校验前置条件)", "    O->>A: 写步骤", "  else 失败或补偿失败", "    A-->>O: error", "    O->>A: 逆序 compensate", "    O->>Q: 无法补偿则转人工", "  end"],
    contract: [["编排器 → Checkpoint", "实例状态与已完成步骤栈", "未完成步骤不得标记成功"], ["编排器 → Adapter", "幂等键 + 业务参数", "未知状态先查重"], ["编排器 → 死信队列", "补偿失败的步骤与原因", "必须人工介入，不静默完成"]],
    ops: [["故障注入", "写步骤超时后重放请求", "查重命中，无重复单据"], ["故障注入", "让 compensate 抛异常", "实例 failed 并进 DLQ"], ["上线验收", "pytest -q test_orchestrator.py", "幂等、补偿、审批用例通过"], ["上线验收", "审批超时演练", "超时自动拒绝且无副作用"]],
    p2: "落地替换点：Checkpoint 与幂等表换成带唯一约束的关系库，Adapter 换成真实 RPA/BPM/ITSM 接口（方法名与版本按官方文档核验），审批接入企业流程系统并配置超时补偿，死信队列配套值守与告警。",
  },
  "predictive-maintenance": {
    p1: "迟到数据不得触发新告警，只能更新已闭合窗口的统计。若允许迟到测点生成告警，边缘断连恢复后的批量补传会造成告警风暴，并让「首次告警时间」失去评估意义。",
    seq: ["sequenceDiagram", "  participant S as 传感器", "  participant B as 摄取/去重", "  participant F as 窗口特征", "  participant A as 异常评分", "  participant T as TwinStore", "  participant H as 人工确认", "  S->>B: reading(device_id, ts, mode)", "  B->>B: 去重 + 水位线判定", "  alt 迟到数据", "    B->>F: 仅更新已闭合窗口统计", "  else 正常数据", "    B->>F: 聚合窗口", "    F->>A: 特征 + 基线版本", "    A->>A: 稳健 z + 趋势累积", "    alt 达到连续阈值", "      A->>T: 幂等写入快照(带证据)", "      A->>H: 告警候选(工单草稿)", "    else 未达到", "      A->>A: 仅记录分数", "    end", "  end"],
    contract: [["摄取层 → 特征层", "去重后的有序窗口 + 工况标签", "断流标记 stale，不生成新告警"], ["特征层 → 评分层", "均值/斜率 + 基线版本", "基线缺失降级并标注低置信"], ["评分层 → TwinStore", "带 ts 的状态快照", "迟到快照不得覆盖新状态"]],
    ops: [["故障注入", "重放 10 分钟前的迟到测点", "不产生新告警，ts 较小快照被拒"], ["故障注入", "切换工况但不更新标签", "按 operating_mode 回放暴露误报并触发基线重估"], ["上线验收", "pytest -q test_features.py", "稳健基线、趋势、抑制、幂等用例通过"], ["上线验收", "影子模式对照人工巡检", "告警确认率与漏报有记录"]],
    p2: "落地替换点：采集网关与时序库按现场协议与平台文档接入，基线按设备与工况分别标定并版本化，设备图谱与维修台账接入资产管理系统，工单草稿接入 ITSM 且保留人工确认。所有阈值均为教学模拟值，不得直接用于真实设备。",
  },
  "project-manufacturing-agent": {
    p1: "device_id 是跨层聚合根，run_id 只关联一次运行；审计回放需要两者共同定位。只按 run_id 检索会把同一设备多次运行混在一起，无法判断「这次告警时孪生状态是什么」。",
    seq: ["sequenceDiagram", "  participant I as IoT 摄取", "  participant SC as 评分器", "  participant TW as 孪生/图谱", "  participant D as 诊断 Agent", "  participant O as 编排器", "  participant H as 人工确认", "  I->>SC: 窗口(去重, 水位线)", "  SC->>TW: 分数 + 证据包", "  TW->>D: 孪生状态 + 部件链", "  D->>O: 结构化建议(不可信)", "  O->>O: 生成 instance 与检查点", "  O->>H: waiting_approval", "  alt 批准", "    H->>O: approved", "    O->>O: 工单草稿 + 审计", "  else 拒绝/超时", "    H->>O: rejected", "    O->>O: 补偿，无副作用", "  end", "  O->>O: 指标按 run_id + device_id 归因"],
    contract: [["摄取 → 评分器", "带 device_id/ts/mode 的窗口", "重复 (device_id, ts) 直接丢弃"], ["评分器 → 诊断 Agent", "分数、基线版本、图谱路径", "建议必须结构化，解析失败即拒绝"], ["编排器 → 审计", "run_id + device_id + 审批结果", "事件只追加，含证据 hash"]],
    ops: [["故障注入", "未审批直接调用工单接口", "drafts 为空，状态仍 waiting_approval"], ["故障注入", "诊断 Agent 不可用", "只输出特征证据并转人工，不自动派工"], ["上线验收", "pytest -q test_plant_agent.py", "去重、审批、幂等、审计用例通过"], ["上线验收", "核对 OT 网络流向", "分析层无控制指令下发通道"]],
    p2: "落地替换点：模拟 IoT 网关、时序库、设备台账、诊断 LLM 与 ITSM 分别替换为按官方文档核验的真实适配器；编排器状态与审计落库；OT/IT 隔离、停机审批与备件流程按现场安全规范评审。教学模拟数据不得用于真实设备决策。",
  },
  "itops-agent": {
    p1: "Memory 必须继承原始 trust。若把来自 RAG 或工具返回的内容写入记忆时提升为 system，间接提示注入就获得了持久化的高权限通道，且重启后仍然生效。",
    seq: ["sequenceDiagram", "  participant U as 用户/告警", "  participant G as 入口网关", "  participant R as Runtime", "  participant K as RAG(ACL)", "  participant B as ContextBuilder", "  participant P as 策略引擎", "  participant T as 工具注册表", "  participant A as 审批", "  U->>G: IncidentRequest", "  G->>R: 归一化 + tenant/role", "  R->>K: 检索(先按 ACL 过滤)", "  K-->>B: 带 doc_id 的低信任片段", "  B->>R: messages + 已用 token", "  R->>P: 结构化计划步骤", "  alt 只读工具合规", "    P->>T: call(query_metric)", "    T-->>R: observation(视为数据)", "  else 写工具", "    P->>A: waiting_approval", "    alt 批准", "      A->>T: call(create_ticket, 再校验)", "    else 拒绝", "      A->>R: compensated", "    end", "  end", "  R->>R: trace + 成本 + 轨迹断言"],
    contract: [["入口 → Runtime", "IncidentRequest(tenant, role, text)", "tenant 由上下文注入，不由模型指定"], ["RAG → ContextBuilder", "带 trust 与 doc_id 的片段", "超预算先丢低信任内容"], ["Runtime → 策略引擎", "结构化 Action 候选", "未注册工具与跨租户一律拒绝"]],
    ops: [["故障注入", "高危请求未审批", "status=waiting_approval 且工单为空"], ["故障注入", "把工具返回内容写入 Memory 并标 system", "信任继承校验拒绝"], ["上线验收", "pytest -q test_ops_agent.py", "租户、预算、闸门、审批、轨迹用例通过"], ["上线验收", "一键熔断演练", "全部写工具关闭，只读能力保留"]],
    p2: "落地替换点：模拟 Planner 换成按官方 SDK 接入的模型服务并配置超时/预算，RAG 换成企业检索与权限系统，工具注册表换成真实 MCP 风格注册中心（协议字段需核验），ITSM/Monitoring 换成真实 API 且凭据只在执行器侧。项目中的 SOP、指标与工单均为教学模拟数据。",
  },
  "project-itops-agent": {
    p1: "门禁断言必须可自动化；人工评审项若未指定角色与抽样方式，就无法判定一次发布是否通过。把「权限矩阵已评审」写成布尔检查项，比写成原则更有工程价值。",
    seq: ["sequenceDiagram", "  participant D as 开发者", "  participant CI as CI 门禁", "  participant T as 回归测试", "  participant S as 安全评审", "  participant R as 灰度发布", "  D->>CI: 提交策略/工具/模型变更", "  CI->>T: 运行 pytest + 轨迹断言", "  alt 测试失败", "    T-->>D: 阻断发布 + 失败用例", "  else 测试通过", "    T->>S: 权限矩阵与 SOP 人工抽检", "    alt 未签字", "      S-->>D: 阻断发布", "    else 已签字", "      S->>R: 允许灰度", "      R->>R: 只开只读与草稿工单", "      R->>CI: 监控越权拒绝数与审批时延", "    end", "  end"],
    contract: [["CI → 回归测试", "变更集 + acceptance-gate.yaml", "任一用例失败即阻断"], ["回归测试 → 安全评审", "测试结果 + 权限矩阵 diff", "人工项需指定角色与抽样方式"], ["安全评审 → 灰度发布", "签字记录 + 配置版本", "回滚时代码/策略/Schema 一起回退"]],
    ops: [["故障注入", "删除写工具的审批标记", "门禁用例失败并阻断"], ["故障注入", "回滚代码但保留新策略配置", "配置版本校验失败并告警"], ["上线验收", "python -m pytest -q test_milestones.py", "里程碑结构与断言字段校验通过"], ["上线验收", "核对 required_tests 与真实测试名", "清单无缺失、无虚构用例"]],
    p2: "落地替换点：把 JSON 里程碑清单换成企业发布系统的检查模板，CI 门禁接入真实流水线，人工评审签字接入审批系统，灰度与熔断配置接入平台配置中心。本地验收安装 python -m pip install pytest 后执行 python -m pytest -q test_milestones.py（读取同目录 milestone.json，无需网络与密钥）；清单中的用例名对应 itops-agent 教程里真实可运行的 pytest 测试，不是占位标题。",
    code: { name: "test_milestones.py", lang: "python", caption: "离线验收：校验里程碑清单结构与门禁字段（与 milestone.json 配套运行）", body: "import json\nfrom pathlib import Path\n\nDATA = json.loads(Path(\"milestone.json\").read_text(encoding=\"utf-8\"))\n\n\ndef test_project_is_identified():\n    assert DATA[\"project\"] == \"enterprise-itops-agent\"\n\n\ndef test_milestone_ids_are_unique_and_complete():\n    ids = [m[\"id\"] for m in DATA[\"milestones\"]]\n    assert len(ids) == len(set(ids))\n    assert ids == [\"M\" + str(i) for i in range(1, 13)]\n\n\ndef test_every_milestone_has_assertion():\n    for m in DATA[\"milestones\"]:\n        assert m[\"name\"].strip()\n        assert m[\"assertion\"].strip()\n\n\ndef test_regression_gate_milestone_exists():\n    assert \"M10\" in [m[\"id\"] for m in DATA[\"milestones\"]]" },
  },
};

const q = (s) => JSON.stringify(s);
const rows = (arr) => arr.map((r) => "              " + q(r) + ",").join("\n");

function buildSection(note) {
  const blocks = [];
  blocks.push("          {\n            type: \"paragraph\",\n            text: " + q(note.p1) + ",\n          },");
  blocks.push("          {\n            type: \"mermaid\",\n            title: \"组件交互时序（含失败分支）\",\n            source: String.raw`" + note.seq.join("\n") + "`,\n            caption: \"消息顺序、超时分支与降级路径；箭头方向即控制流方向。\",\n          },");
  blocks.push("          {\n            type: \"table\",\n            headers: [\"组件交互契约\", \"传递内容\", \"超时/失败语义\"],\n            rows: [\n" + rows(note.contract) + "\n            ],\n          },");
  blocks.push("          {\n            type: \"table\",\n            headers: [\"类别\", \"可执行操作\", \"通过标准\"],\n            rows: [\n" + rows(note.ops) + "\n            ],\n          },");
  if (note.code) {
    blocks.push("          {\n            type: \"code\",\n            language: " + q(note.code.lang) + ",\n            filename: " + q(note.code.name) + ",\n            caption: " + q(note.code.caption) + ",\n            runnable: true,\n            code: String.raw`" + note.code.body + "`,\n          },");
  }
  blocks.push("          {\n            type: \"paragraph\",\n            text: " + q(note.p2) + ",\n          },");
  return "      {\n        id: \"engineering-notes\",\n        heading: \"16. 工程实现补遗：组件交互时序、故障演练与上线验收\",\n        blocks: [\n" + blocks.join("\n") + "\n        ],\n      },\n";
}

const files = fs.readdirSync(upgradeDir).filter((f) => f.endsWith(".ts") && f !== "index.ts");
let inserted = 0;
const missing = [];
for (const f of files) {
  const p = path.join(upgradeDir, f);
  const raw = fs.readFileSync(p, "utf8");
  // 自愈：移除早期误插到 sections 数组之外的片段，保证重复执行结果一致
  const src = raw.replace(/      \{\r?\n        id: "engineering-notes",[\s\S]*?\n      \},\r?\n/g, "");
  const parts = src.split(/(?=^\s{4}slug: ")/m);
  const next = parts.map((ch) => {
    const m = ch.match(/^\s{4}slug: "([^"]+)"/m);
    if (!m || !notes[m[1]]) return ch;
    const marker = /(\r?\n)(    \],\r?\n)(    tags: \[)/;
    if (!marker.test(ch)) { missing.push(f + " :: " + m[1] + " (锚点未匹配)"); return ch; }
    inserted++;
    // section 必须位于 sections 数组闭合方括号之前
    return ch.replace(marker, (all, nl, close, tags) =>
      nl + buildSection(notes[m[1]]) + close + tags);
  }).join("");
  if (next !== raw) fs.writeFileSync(p, next, "utf8");
}

for (const slug of Object.keys(notes)) {
  if (!files.some((f) => fs.readFileSync(path.join(upgradeDir, f), "utf8").includes('slug: "' + slug + '"'))) {
    missing.push(slug + " (教程未找到)");
  }
}
console.log("已注入补遗章节:", inserted, "/", Object.keys(notes).length);
if (missing.length) console.log("需人工处理:\n" + missing.join("\n"));
