import type { Tutorial } from "../../types";

// ============================================================================
// 第四批 · 领域 08 / 09 / 10 / 11 · L4 深度升级教程
// 覆盖：AI-Ready 数据与 CDC、语义层与 Text-to-SQL 校验、AgentOps 追踪评估、
//       AI 安全威胁建模与护栏。
// 所有企业案例明确标注为教学模拟；代码使用标准库 / SQL / TypeScript。
// ============================================================================

const REF_MCP = {
  title: "Model Context Protocol Specification",
  url: "https://modelcontextprotocol.io/specification/2026-07-28",
  organization: "Model Context Protocol",
  kind: "官方规范" as const,
  version: "2026-07-28（latest）",
  purpose: "工具描述不可信、调用需用户同意的协议级安全原则",
  verifiedAt: "2026-11-13",
};
const REF_OWASP = {
  title: "OWASP Top 10 for Large Language Model Applications",
  url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
  organization: "OWASP",
  kind: "社区实践" as const,
  purpose: "LLM 应用威胁分类（提示注入、敏感信息泄露等）",
  verifiedAt: "2026-11-13",
};
const REF_FC = {
  title: "OpenAI Function Calling 指南",
  url: "https://developers.openai.com/api/docs/guides/function-calling",
  organization: "OpenAI",
  kind: "官方产品文档" as const,
  purpose: "工具定义与调用的真实请求/响应结构",
  verifiedAt: "2026-11-13",
};
const REF_AGENTS = {
  title: "Building Effective Agents",
  url: "https://www.anthropic.com/research/building-effective-agents",
  organization: "Anthropic",
  kind: "官方产品文档" as const,
  purpose: "Workflow 与 Agent 的架构边界与复杂度控制建议",
  verifiedAt: "2026-11-13",
};

export const deepBatch4: Tutorial[] = [
  {
    id: "t-di-02",
    slug: "data-pipeline-cdc",
    domainId: "d08",
    title: "数据管道与 CDC：让 AI 知识库与业务系统保持同步",
    englishTitle: "Data Pipeline & CDC for AI",
    summary:
      "讲清 ETL/ELT 与变更数据捕获的机制差异、增量同步与幂等写入、数据质量门禁、Schema 演进与血缘，给出可运行的 CDC 消费器与增量索引更新实现，以及企业案例与生产实践。",
    difficulty: "中级",
    estimatedMinutes: 55,
    prerequisites: ["SQL 基础", "数据库事务概念", "Python 基础"],
    learningObjectives: [
      "解释 CDC 相比定时全量同步解决的核心问题",
      "实现带位点、幂等与乱序处理的变更消费者",
      "设计数据质量门禁与 Schema 演进策略",
      "把变更事件映射到 RAG 索引的增量更新",
      "排查丢事件、重复消费与索引陈旧",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "CDC（Change Data Capture，变更数据捕获）通过读取数据库事务日志（如 binlog / WAL）把 INSERT/UPDATE/DELETE 变为有序事件流，让下游系统只处理变化部分。它解决的核心问题是：定时全量重建索引既慢又贵，且无法让 AI 知识库反映刚刚发生的业务变更。",
          },
          {
            type: "paragraph",
            text: "产生背景是企业 Agent 与 RAG 系统需要「新鲜知识」：制度刚更新、工单刚关闭、配置项刚变更，若索引仍停留在昨天，答案就会与真实系统冲突。",
          },
          {
            type: "table",
            headers: ["维度", "定时全量同步", "CDC 增量同步"],
            rows: [
              ["数据新鲜度", "取决于调度周期", "近实时"],
              ["资源开销", "随全量数据线性增长", "随变更量增长"],
              ["实现复杂度", "低", "需位点、幂等、乱序处理"],
              ["失败恢复", "重跑全量", "从位点重放"],
              ["适用", "小型静态数据集", "业务系统持续变化"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：知识库索引、向量库、缓存、数据仓入湖、搜索索引的实时更新。",
              "不适用场景：源系统不允许读日志且无替代事件；变更频率极低且全量成本可接受。",
              "ETL 与 ELT 的区别：ETL 在入仓前转换，ELT 先入仓再转换；现代湖仓多用 ELT，转换逻辑可版本化。",
              "与消息队列的区别：CDC 是「变更来源」，队列是「投递通道」；两者常组合使用。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "新鲜度是有成本的",
            text: "增量同步把复杂度从「重跑」转移到「位点、幂等与顺序」。没有幂等保证的 CDC 消费，重试会造成重复切片、重复计费与索引膨胀。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「日志位点 + 事件 + 幂等应用」。每个事件携带表名、主键、操作类型、变更后镜像、事务 ID 与日志位点（offset/LSN）。消费者持久化已处理位点，崩溃后从该位点重放；由于重放可能重复交付，写入侧必须以 (source, table, pk, version) 作为幂等键。关键状态包括位点、处理批次、失败队列与 Schema 版本。",
          },
          {
            type: "mermaid",
            title: "CDC 增量同步流程",
            source: `flowchart LR
  DB[("业务库 binlog/WAL")] --> CAP["CDC 捕获器"]
  CAP --> BUS["事件总线"]
  BUS --> CON["消费者(位点管理)"]
  CON --> VAL["Schema + 质量校验"]
  VAL -->|通过| IDEM["幂等写入"]
  VAL -->|拒绝| DLQ[("死信队列")]
  IDEM --> IDX[("向量/全文索引")]
  IDEM --> OFF[("位点存储")]
  OFF --> CON`,
            caption: "位点与业务写入需在同一个事务中提交，否则会出现「数据已写但位点未推进」。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["LSN / Offset", "日志位点", "恢复起点，必须与写入原子提交"],
              ["Before/After Image", "变更前/后镜像", "决定是更新还是删除"],
              ["Idempotency Key", "去重键", "防重放造成重复副作用"],
              ["Schema Version", "事件结构版本", "支持演进与兼容"],
              ["Dead Letter Queue", "无法处理的事件", "不阻塞主流程，需人工处置"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是变更事件流；输出是更新后的索引/仓表与推进后的位点；关键状态为位点、批次、失败事件、质量指标与 Schema 版本。系统边界：源库事务与下游写入不是同一个分布式事务，只能通过幂等与重放达到最终一致，不能假设强一致。",
          },
          {
            type: "list",
            items: [
              "局限一：日志保留期有限，长期故障后可能需要全量快照 + 增量重放。",
              "局限二：DDL 变更可能破坏消费者解析，需要 Schema Registry。",
              "局限三：乱序与重复交付是常态，业务侧必须幂等。",
              "局限四：删除事件若被忽略，知识库会残留已失效文档。",
            ],
          },
        ],
      },
      {
        id: "architecture",
        heading: "3. 系统架构 Architecture",
        blocks: [
          {
            type: "mermaid",
            title: "AI-Ready 数据底座",
            source: `flowchart TB
  SRC["ERP / ITSM / 文档库"] --> CAP["CDC + 批量摄取"]
  CAP --> RAW[("原始层 不可变")]
  RAW --> QUAL["质量门禁 去重/校验"]
  QUAL --> STD[("标准化层")]
  STD --> FEAT["特征: 文本/向量/图"]
  FEAT --> VDB[("向量索引")]
  FEAT --> GDB[("图谱/关系")]
  FEAT --> FTS[("全文索引")]
  RAW --> CAT["数据目录 + 血缘"]
  CAT --> GOV["治理 权限/留存"]`,
            caption: "原始层不可变，便于重放；治理与血缘贯穿全链路。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入 / 输出", "依赖"],
            rows: [
              ["捕获器", "读日志产出变更事件", "日志 / 事件", "源库权限"],
              ["消费者", "位点管理、幂等应用", "事件 / 索引更新", "位点存储"],
              ["质量门禁", "Schema、非空、去重校验", "事件 / 通过或死信", "规则配置"],
              ["索引更新器", "按 doc_id 增量重建切片", "变更后镜像 / 索引写入", "Embedding 服务"],
              ["目录与血缘", "记录来源与转换", "元数据 / 血缘图", "元数据库"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：捕获 → 投递 → 消费位点 → 校验 → 幂等写入 → 提交位点。",
              "数据流：变更前/后镜像 → 标准化文档 → 切片与向量 → 多索引。",
              "状态流：位点、批次号、Schema 版本、死信计数与新鲜度指标。",
              "外部依赖：源库、事件总线、对象存储、Embedding 服务、向量库、元数据库。",
              "异常处理：解析失败进死信；依赖超时退避重试；位点未推进则重放。",
              "扩展方式：按表/租户分区消费；新增索引只需订阅同一事件流。",
            ],
          },
        ],
      },
      {
        id: "components",
        heading: "4. 核心组件 Components",
        blocks: [
          {
            type: "table",
            headers: ["组件", "为什么需要", "实现方式", "常见问题"],
            rows: [
              ["位点存储", "崩溃恢复", "与业务写入同事务提交", "位点与数据分离提交导致不一致"],
              ["幂等器", "防重复副作用", "去重表 + 唯一约束", "重试造成重复切片"],
              ["Schema Registry", "DDL 演进兼容", "版本化事件 Schema", "新增字段直接崩溃"],
              ["质量门禁", "脏数据不入库", "规则 + 抽样统计", "只校验存在性不校验取值"],
              ["删除处理", "避免陈旧知识", "墓碑标记 + 索引删除", "忽略 DELETE 事件"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "关键顺序",
            text: "「写业务数据」与「推进位点」必须原子化。先推进位点再写入，崩溃即永久丢事件；先写入再推进位点，则依赖幂等去重。",
          },
        ],
      },
      {
        id: "flow",
        heading: "5. 工作流程 Execution Flow",
        blocks: [
          {
            type: "list",
            ordered: true,
            items: [
              "捕获器从源库日志读取变更，生成带 LSN 与事务 ID 的事件。",
              "事件按主键分区投递，保证同一实体的顺序性。",
              "消费者读取当前位点，拉取批次并按 LSN 排序。",
              "Schema 校验：版本不匹配则查注册表做兼容转换，否则进死信。",
              "质量门禁：非空、取值域、去重、租户标签完整性。",
              "幂等检查：以 (source, table, pk, version) 查去重表，已处理则跳过。",
              "按操作类型处理：UPSERT 重新切片并写索引；DELETE 删除索引并写墓碑。",
              "在同一事务内写入业务结果与位点，提交后释放批次。",
              "更新血缘与新鲜度指标，异常事件进死信并告警。",
              "监控消费延迟；超过日志保留期则触发全量快照 + 增量重放。",
            ],
          },
        ],
      },
      {
        id: "patterns",
        heading: "6. 关键技术与设计模式",
        blocks: [
          {
            type: "table",
            headers: ["模式", "适用场景", "优点", "缺点 / 取舍"],
            rows: [
              ["日志型 CDC", "有事务日志的数据库", "低侵入、近实时", "需源库权限与解析"],
              ["触发器 CDC", "无法读日志", "实现简单", "侵入业务库、性能影响"],
              ["快照 + 增量", "长期故障恢复", "可完整重建", "快照成本高"],
              ["Outbox 模式", "业务事件可靠投递", "与业务事务原子", "需改造写入方"],
              ["批流一体", "同时服务实时与回溯", "口径统一", "架构复杂"],
            ],
          },
          {
            type: "list",
            items: [
              "常见错误 1：忽略 DELETE，知识库残留已撤销制度。",
              "常见错误 2：位点异步推进，崩溃后丢事件。",
              "常见错误 3：无 Schema 版本，DDL 变更直接打断消费。",
              "常见错误 4：全量重建与增量写入并发，产生版本回退。",
            ],
          },
        ],
      },
      {
        id: "stack",
        heading: "7. 技术栈与选型",
        blocks: [
          {
            type: "table",
            headers: ["选项", "适用", "成熟度 / 维护成本", "扩展性", "锁定风险", "选型建议"],
            rows: [
              ["日志解析 CDC 工具", "主流关系库", "成熟 / 需运维连接器", "高", "低", "有 DBA 支持时首选"],
              ["Outbox + 消息总线", "自研业务系统", "简单可靠 / 需改代码", "高", "低", "新系统建议内建"],
              ["流处理引擎", "复杂转换与窗口", "成熟 / 运维成本高", "高", "中", "大流量场景"],
              ["对象存储原始层", "重放与审计", "成熟 / 成本低", "高", "低", "强烈建议保留"],
              ["调度式批处理", "低速变化数据", "成熟 / 低", "中", "低", "小数据集可先用"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。具体 CDC 工具、连接器版本与源库兼容性须按官方文档核验（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的幂等 CDC 消费者",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现一个带位点管理、Schema 校验、幂等去重、乱序保护、删除处理与死信队列的 CDC 消费者，并用离线测试覆盖重放、乱序、非法事件与新鲜度计算。代码仅用 Python 标准库。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`cdc-consumer/
├── requirements.txt
├── consumer.py        # 幂等 CDC 消费者 + 位点管理
└── test_consumer.py   # 离线测试`,
          },
          {
            type: "code",
            language: "python",
            filename: "consumer.py",
            caption: "核心实现：位点、Schema 校验、幂等、乱序保护、删除与死信",
            code: String.raw`"""幂等 CDC 消费者（教学实现，Python 3.11+ 标准库）。

依赖：仅标准库
环境变量：无
说明：事件由教学模拟生成；生产需替换为真实日志解析与消息总线，
      并把 in-memory 存储换为持久化事务存储。
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(frozen=True)
class ChangeEvent:
    lsn: int
    table: str
    pk: str
    op: str                  # UPSERT / DELETE
    after: dict[str, Any] | None
    schema_version: str
    tenant: str


class DeadLetter(Exception):
    pass


class CdcConsumer:
    SUPPORTED_SCHEMAS = {"v1", "v2"}

    def __init__(self) -> None:
        self.offset = 0                       # 已提交位点
        self.applied: set[str] = set()        # 幂等键
        self.store: dict[str, dict[str, Any]] = {}   # 文档索引（教学模拟）
        self.tombstones: set[str] = set()
        self.dead_letters: list[tuple[ChangeEvent, str]] = []
        self.metrics: dict[str, int] = {"upserts": 0, "deletes": 0,
                                        "duplicates": 0, "rejected": 0}

    def _validate(self, e: ChangeEvent) -> None:
        if e.schema_version not in self.SUPPORTED_SCHEMAS:
            raise DeadLetter("unsupported_schema:" + e.schema_version)
        if e.op not in ("UPSERT", "DELETE"):
            raise DeadLetter("unknown_op:" + str(e.op))
        if e.op == "UPSERT" and not e.after:
            raise DeadLetter("missing_after_image")
        if e.op == "UPSERT":
            body = e.after or {}
            if not body.get("tenant") or body["tenant"] != e.tenant:
                raise DeadLetter("tenant_mismatch")
            if not str(body.get("content", "")).strip():
                raise DeadLetter("empty_content")

    def _idem_key(self, e: ChangeEvent) -> str:
        version = (e.after or {}).get("version", "na")
        return f"{e.table}:{e.pk}:{version}:{e.op}"

    def process_batch(self, events: list[ChangeEvent]) -> dict[str, int]:
        """按 LSN 排序处理；位点与业务写入在本实现中同一循环提交。"""
        for e in sorted(events, key=lambda x: x.lsn):
            if e.lsn <= self.offset:
                self.metrics["duplicates"] += 1
                continue
            try:
                self._validate(e)
                key = self._idem_key(e)
                if key in self.applied:
                    self.metrics["duplicates"] += 1
                elif e.op == "UPSERT":
                    doc_id = e.table + ":" + e.pk
                    self.store[doc_id] = dict(e.after or {})
                    self.tombstones.discard(doc_id)
                    self.applied.add(key)
                    self.metrics["upserts"] += 1
                else:
                    doc_id = e.table + ":" + e.pk
                    self.store.pop(doc_id, None)
                    self.tombstones.add(doc_id)
                    self.applied.add(key)
                    self.metrics["deletes"] += 1
            except DeadLetter as err:
                self.dead_letters.append((e, str(err)))
                self.metrics["rejected"] += 1
            finally:
                # 无论成功或进死信，位点都推进，避免坏事件阻塞主流程
                self.offset = max(self.offset, e.lsn)
        return dict(self.metrics)

    def freshness_lag(self, latest_lsn: int) -> int:
        """新鲜度指标：当前位点到最新日志位点的距离。"""
        return max(0, latest_lsn - self.offset)

    def rebuild_index(self, doc_id: str) -> str | None:
        """教学模拟：把文档切成检索片段；真实项目替换为 Embedding + 向量写入。"""
        doc = self.store.get(doc_id)
        if not doc:
            return None
        content = str(doc["content"])
        size = 200
        return "|".join(content[i:i + size] for i in range(0, len(content), size))`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_consumer.py",
            caption: "离线测试：幂等重放、乱序、删除、Schema 拒绝、死信与新鲜度",
            code: String.raw`import pytest

from consumer import CdcConsumer, ChangeEvent


def ev(lsn, op="UPSERT", pk="d1", content="制度内容", ver=1, schema="v1", tenant="t1"):
    after = None if op == "DELETE" else {"content": content, "version": ver, "tenant": tenant}
    return ChangeEvent(lsn, "policy", pk, op, after, schema, tenant)


def test_upsert_and_idempotent_replay():
    c = CdcConsumer()
    c.process_batch([ev(1)])
    c.process_batch([ev(1)])       # 位点为 1 的重放
    assert c.metrics["upserts"] == 1
    assert c.metrics["duplicates"] >= 1


def test_out_of_order_events_are_sorted():
    c = CdcConsumer()
    c.process_batch([ev(3, content="新版"), ev(2, content="旧版")])
    assert "新版" in c.store["policy:d1"]["content"]


def test_delete_removes_document_and_marks_tombstone():
    c = CdcConsumer()
    c.process_batch([ev(1)])
    c.process_batch([ev(2, op="DELETE")])
    assert "policy:d1" not in c.store
    assert "policy:d1" in c.tombstones


def test_unsupported_schema_goes_to_dead_letter_without_blocking():
    c = CdcConsumer()
    c.process_batch([ev(1, schema="v9"), ev(2)])
    assert len(c.dead_letters) == 1
    assert c.offset == 2, "坏事件不得阻塞位点推进"
    assert c.metrics["upserts"] == 1


def test_tenant_mismatch_is_rejected():
    c = CdcConsumer()
    c.process_batch([ChangeEvent(1, "policy", "d1", "UPSERT",
                                 {"content": "x", "version": 1, "tenant": "t2"},
                                 "v1", "t1")])
    assert c.metrics["rejected"] == 1 and not c.store


def test_offset_advances_and_freshness_is_measurable():
    c = CdcConsumer()
    c.process_batch([ev(1), ev(2)])
    assert c.offset == 2
    assert c.freshness_lag(5) == 3


def test_rebuild_index_returns_chunks():
    c = CdcConsumer()
    c.process_batch([ev(1, content="很长的内容" * 100)])
    assert c.rebuild_index("policy:d1")`,
          },
          {
            type: "code",
            language: "bash",
            filename: "运行方式",
            caption: "环境：Python 3.11+；安装与执行",
            code: String.raw`# requirements.txt
pytest>=8.0

pip install -r requirements.txt
python -m pytest -q test_consumer.py`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python -m pytest -q test_consumer.py"],
              ["输出示例", "7 passed in 0.xx s"],
              ["结果解释", "重放不重复写入、乱序按 LSN 排序、DELETE 生效、坏事件进死信但不阻塞位点"],
              ["常见错误 1", "位点与业务写入不在同一事务：崩溃后丢事件或重复"],
              ["常见错误 2", "忽略 DELETE：知识库残留已撤销文档"],
              ["常见错误 3", "Schema 无版本：DDL 变更打断消费"],
              ["常见错误 4", "坏事件不推进位点：主流程被永久阻塞"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "内存位点、去重集合与文档索引为教学模拟；生产需替换为持久化事务存储、真实日志解析/消息总线、Schema Registry、Embedding 与向量库写入，并保留死信处置流程。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：制度文档增量索引（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的数据层案例，系统与数据均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：企业制度库每天有增删改，知识助手夜间全量重建索引，白天答案常与最新制度不符。业务问题是新鲜度不足且全量重建成本高。技术目标是用 CDC 驱动增量索引更新并把新鲜度纳入监控。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["系统设计", "Outbox + CDC 事件流；原始层不可变；向量/全文/图谱三类索引订阅同一事件"],
              ["数据来源", "制度库、文档库、变更审批记录（教学模拟）"],
              ["组件选择", "位点存储 + Schema Registry + 质量门禁 + Embedding 服务 + 向量库"],
              ["执行流程", "变更事件 → 校验 → 幂等 → 重新切片 → 写索引 → 提交位点"],
              ["安全权限", "事件带租户标签；索引按租户分区；跨租户写入直接拒绝"],
              ["异常处理", "坏事件进死信并告警；位点与写入同事务；超保留期触发快照重放"],
              ["部署方案", "消费者按表分区无状态扩缩；原始层存对象存储；索引独立扩容"],
              ["效果评估", "新鲜度延迟 P95、重复写入次数、死信率、索引与源库一致率"],
            ],
          },
        ],
      },
      {
        id: "production",
        heading: "10. Production Engineering",
        blocks: [
          {
            type: "list",
            items: [
              "高可用：消费者无状态多副本，按分区抢占；位点与写入原子提交。",
              "可扩展性：按表/租户分区；新增索引订阅同一事件流，不改捕获侧。",
              "并发：同一主键事件严格有序，不同主键可并行；避免全量重建与增量并发互覆盖。",
              "延迟与成本：批量 Embedding 调用；按变更量而非全量计费；新鲜度 SLA 驱动分区数。",
              "超时与重试：事件处理设超时；仅对幂等操作重试；重试耗尽进死信。",
              "幂等性：以 (source, table, pk, version, op) 唯一约束，重放不产生重复切片。",
              "状态持久化：位点、去重表、Schema 版本与血缘全部外置。",
              "日志/监控/追踪：消费延迟、死信率、写入吞吐、位点推进速率全量上报。",
              "灰度发布与版本管理：Schema 与切片策略版本化，影子索引验证后再切换流量。",
            ],
          },
        ],
      },
      {
        id: "security",
        heading: "11. Security & Governance",
        blocks: [
          {
            type: "list",
            items: [
              "身份认证：捕获器使用最小权限只读账号，消费者按服务身份鉴权。",
              "权限控制：事件携带租户与数据分级，索引按租户分区，查询侧再次过滤。",
              "数据保护：原始层含敏感字段需加密与留存策略；日志脱敏。",
              "输入验证：Schema 版本、必填字段、租户一致性均在写入前校验。",
              "输出校验：索引内容视为不可信数据，进入 RAG 上下文时标注来源与信任级别。",
              "工具权限：索引写入工具仅对摄取服务开放，查询工具只读。",
              "审计：血缘记录来源表、LSN、批次与转换版本，支持答案回溯。",
              "风险控制：删除事件强制生效、死信告警、快照重放演练。",
            ],
          },
        ],
      },
      {
        id: "evaluation",
        heading: "12. Evaluation & Testing",
        blocks: [
          {
            type: "table",
            headers: ["测试目标", "方法", "测试数据", "指标"],
            rows: [
              ["幂等性", "重放同一批次", "重复/乱序事件流", "重复副作用次数 = 0"],
              ["删除正确性", "DELETE 后查询", "增删改序列", "残留文档数 = 0"],
              ["Schema 兼容", "新旧版本事件混合", "DDL 演进样本", "非预期中断次数 = 0"],
              ["新鲜度", "注入位点差", "延迟事件流", "P95 新鲜度延迟"],
              ["一致性", "索引与源库抽样比对", "随机主键样本", "内容一致率"],
              ["回归", "固定事件集 + CI", "消费逻辑变更前后", "指标退化即阻断发布"],
            ],
          },
          {
            type: "paragraph",
            text: "回归断言以「最终索引内容 + 位点 + 死信列表」为准，而非仅看是否抛异常。test_consumer.py 已覆盖重放、乱序、删除、坏事件隔离与新鲜度；把事件集接入 CI，Schema 或切片策略变更即触发回归。",
          },
        ],
      },
      {
        id: "best-practices",
        heading: "13. Best Practices",
        blocks: [
          {
            type: "list",
            items: [
              "位点与业务写入原子提交，所有写入幂等。",
              "保留不可变原始层，支持重放与审计。",
              "DELETE 必须传播到所有下游索引。",
              "Schema 版本化 + 死信队列，坏事件不阻塞主流程。",
              "新鲜度作为一等 SLA 指标监控，而非事后发现。",
              "索引与切片策略版本化，影子验证后再切换。",
              "索引内容在 RAG 中视为不可信数据。",
            ],
          },
        ],
      },
      {
        id: "troubleshooting",
        heading: "14. Troubleshooting",
        blocks: [
          {
            type: "table",
            headers: ["问题表现", "可能原因", "排查方法", "解决方案", "预防方式"],
            rows: [
              ["索引残留已删文档", "忽略 DELETE 事件", "比对墓碑与索引", "补齐删除传播", "删除用例纳入回归"],
              ["崩溃后丢事件", "位点先于写入提交", "检查位点与去重表", "改为原子提交", "故障注入演练"],
              ["重复切片与成本上涨", "写入不幂等", "查去重键命中率", "引入唯一约束", "重放测试"],
              ["消费卡住不动", "坏事件阻塞位点", "查死信队列", "死信 + 位点推进", "坏事件隔离测试"],
              ["新增字段后消费报错", "Schema 未版本化", "查 Registry 版本", "兼容转换后重放", "DDL 变更评审"],
              ["答案引用旧制度", "新鲜度延迟或全量回退", "看位点差与批次", "恢复增量并禁止并发全量覆盖", "新鲜度告警"],
            ],
          },
        ],
      },
      {
        id: "further-reading",
        heading: "15. Further Reading",
        blocks: [
          {
            type: "list",
            items: [
              "相关教程：AI-Ready 数据底座、向量/图/多模态数据存储、Chunking 切片策略、企业 RAG 端到端管线、Context Engineering。",
              "相关架构：企业数据底座架构、企业 RAG 架构。",
              "相关实验：RAG 管线实验。",
              "相关企业案例：IT Operations Agent（项目 A 数据层）、企业知识助手。",
              "官方资料：Outbox 模式与 CDC 工具文档；具体版本需进一步核验。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "CDC 的具体日志格式、连接器版本与源库兼容性因产品而异，本节未按官方文档逐项复核，标注为需进一步核验；工程结论为本站教学实现与工程建议。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "位点（LSN/binlog offset）与业务写入必须在同一本地事务提交。若先写业务表再单独更新位点，崩溃后会重放；反之会丢事件。这也是「至少一次投递」必须由幂等键兜底的原因。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant DB as 源库
  participant C as CdcConsumer
  participant T as 目标存储
  participant O as 位点账本
  DB->>C: ChangeEvent(before/after, lsn)
  C->>C: 校验 schema + 生成幂等键
  alt 首次处理
    C->>T: 写入业务数据
    C->>O: 同一事务提交位点
    O-->>C: ack
  else 重复或乱序
    C->>O: 查幂等表命中
    C-->>C: 跳过并计数
  end
  alt 校验失败
    C->>C: 写死信队列 + 告警
  end`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["源库 → Consumer","带 before/after image 与位点的事件","迟到事件按水位线单独处理"],
              ["Consumer → 目标存储","幂等写入 + schema 版本","删除事件需墓碑标记"],
              ["Consumer → 位点账本","与业务写入原子提交","位点回退即触发重放保护"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","重复投递同一 lsn","幂等表命中，目标无重复行"],
              ["故障注入","注入 schema 不兼容事件","进死信队列且不推进位点"],
              ["上线验收","pytest -q test_consumer.py","幂等、位点、死信用例通过"],
              ["上线验收","监控新鲜度延迟与 DLQ 大小","延迟有 SLO，DLQ 有人工值守"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把模拟事件列表换成真实 CDC 连接器（Debezium/数据库原生日志等，接口需按官方文档核验），位点账本换成与目标库同事务的存储，Schema Registry 管理版本演进。删除墓碑、DDL 变更与回灌策略需按现场数据规范另行设计。",
          },
        ],
      },
    ],
    tags: ["Data Infrastructure", "CDC", "幂等", "增量索引", "数据质量"],
    architectureIds: ["a10", "a08"],
    relatedTutorialIds: [
      "ai-ready-data",
      "vector-graph-store",
      "chunking-strategy",
      "rag-fundamentals",
      "agent-tracing",
    ],
    nextTutorialSlugs: ["ai-ready-data", "vector-graph-store"],
    relatedLabSlugs: ["rag-pipeline"],
    relatedCaseSlugs: ["it-operations-agent"],
    references: [
      {
        title: "SQL 标准与事务日志概念（各数据库官方文档）",
        url: "https://www.postgresql.org/docs/current/wal-intro.html",
        organization: "PostgreSQL",
        kind: "官方产品文档",
        purpose: "WAL 预写日志机制，说明日志型 CDC 的来源；具体版本需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Transactional Outbox 模式",
        url: "https://microservices.io/patterns/data/transactional-outbox.html",
        organization: " microservices.io（社区实践）",
        kind: "社区实践",
        purpose: "业务写入与事件投递原子化的模式参考",
        verifiedAt: "2026-11-13",
      },
      REF_MCP,
      REF_AGENTS,
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
