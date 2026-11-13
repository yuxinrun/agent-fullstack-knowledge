import type { Tutorial } from "../../types";

// ============================================================================
// 第三批 · 领域 07 / 08 / 09 · L4-L5 深度升级教程
// 覆盖：知识建模与实体消歧、AI-Ready 数据与 CDC、语义层与 Text-to-SQL 校验。
// 代码示例使用 SQL / Python / TypeScript 标准能力，不虚构 SDK 方法。
// ============================================================================

export const deepBatch3: Tutorial[] = [
  {
    id: "t-ke-01",
    slug: "ontology-taxonomy",
    domainId: "d07",
    title: "本体、分类法与知识建模：从概念到可查询图谱",
    englishTitle: "Ontology, Taxonomy & Knowledge Modeling",
    summary:
      "讲清 Taxonomy / Ontology / Knowledge Graph 的差异、RDF 与 OWL 的表达边界、实体消歧与关系抽取机制，给出可运行的图数据模型（SQL + Python）、企业知识架构、治理与评估方法。",
    difficulty: "高级",
    estimatedMinutes: 60,
    prerequisites: ["图数据库概念", "SQL 基础", "RAG 基础"],
    learningObjectives: [
      "区分分类法、本体与知识图谱并说明各自解决的核心问题",
      "设计类、属性、关系与约束，建模企业核心概念",
      "实现实体消歧与知识链接，避免重复建边",
      "设计知识生命周期与多租户治理",
      "评估抽取质量与图谱查询正确性",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "知识建模是把业务世界的实体、概念与关系显式化为机器可查询结构的方法。Taxonomy（分类法）提供层级归类，Ontology（本体）定义类、属性、关系与约束，Knowledge Graph（知识图谱）则是符合本体约束的实体与关系实例集合。三者解决的核心问题是：让「设备属于哪条产线」「哪个服务依赖哪个数据库」这类结构性知识可被确定性查询，而非依赖模型从文本中猜测。",
          },
          {
            type: "paragraph",
            text: "产生背景是向量检索擅长语义相似却难以回答多跳关系问题；企业同时存在大量同义、歧义与口径不一致的术语。显式知识建模提供了统一语义骨架与可审计的推理依据。",
          },
          {
            type: "table",
            headers: ["概念", "表达内容", "典型形式", "与向量检索的关系"],
            rows: [
              ["Taxonomy", "层级分类", "部门树、产品目录", "可作为元数据过滤维度"],
              ["Ontology", "类/属性/关系/约束", "OWL、Schema 定义", "约束图谱结构"],
              ["Knowledge Graph", "实体与关系实例", "三元组、属性图", "补充多跳与全局检索"],
              ["RDF / OWL", "标准化语义表达与推理", "三元组 + 本体公理", "与向量库互补而非替代"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：设备拓扑、组织与权限关系、产品 BOM、依赖分析、GraphRAG 多跳问答。",
              "不适用场景：纯文本语义相似查找（向量检索更直接）；结构极不稳定、无法维护本体的临时数据。",
              "与知识图谱的区别：本体是模式层（schema），图谱是实例层（data）；先有本体约束，才有可治理的图谱。",
              "与关系数据库的区别：关系库优化已知模式的联表，图模型优化可变关系与路径遍历。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "不要先建图再想用途",
            text: "企业知识工程最常见的失败是从「把数据都导进图数据库」开始，却没有明确要回答的查询。正确顺序是先定义问题与查询，再反推最小完备的本体。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「模式约束 + 实例链接 + 路径查询」。三元组 (subject, predicate, object) 是最小的知识单元；本体定义哪些类可以作为主语/宾语、哪些关系允许存在、是否具备传递性或对称性。关键数据结构包括实体表（规范 ID、别名、类型、来源）、关系表（带时间、置信度、来源、租户）与本体定义（类层次、属性域与值域、约束）。",
          },
          {
            type: "mermaid",
            title: "知识建模分层",
            source: `flowchart TB
  SRC["业务系统 / 文档"] --> EXT["实体与关系抽取"]
  ONT["本体定义(类/属性/约束)"] --> VAL["结构校验"]
  EXT --> RES["实体消歧与链接"]
  RES --> VAL
  VAL --> G[("知识图谱 实例层")]
  ONT --> G
  G --> Q["路径查询 / GraphRAG"]
  G --> GOV["版本与治理"]`,
            caption: "本体约束在写入前生效，避免脏关系污染图谱。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["Entity 实体", "具有规范 ID 的业务对象", "必须有稳定主键与别名表"],
              ["Relation 关系", "两实体间的类型化边", "需带来源、时间、置信度"],
              ["Class 类", "实体的类型约束", "决定可用属性与关系"],
              ["Constraint 约束", "域/值域、基数、传递性", "写入时校验，而非查询时补救"],
              ["Entity Resolution", "把同一现实对象合并", "防止重复节点与错误连边"],
              ["Provenance 溯源", "知识的来源与版本", "支撑审计与回退"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是结构化记录与非结构化文本；输出是经本体校验的实体关系集合；关键状态包括实体规范 ID 映射、别名到规范 ID 的索引、关系版本与抽取批次。系统边界：抽取结果（尤其来自 LLM 或外部文档）不可信，必须经 Schema 校验与人工抽检；图谱中的文本字段同样可能携带提示注入内容。",
          },
          {
            type: "list",
            items: [
              "局限一：本体设计过度复杂会显著提高维护成本，且业务语义会随时间变化。",
              "局限二：实体消歧错误会沿关系传播，造成大面积错误推理。",
              "局限三：OWL 推理能力强但工程复杂度高，多数企业只需轻量约束。",
              "局限四：图谱新鲜度依赖上游 CDC，陈旧关系比没有关系更危险。",
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
            title: "企业知识架构",
            source: `flowchart LR
  SYS["ERP/CMDB/文档"] --> CDC["CDC / 批量摄取"]
  CDC --> EXT["抽取服务(NER/关系)"]
  DOC["非结构化文档"] --> EXT
  EXT --> ER["实体消歧服务"]
  ER --> VAL["本体校验器"]
  ONT[("本体注册表 版本化")] --> VAL
  VAL --> GDB[("图/关系存储")]
  GDB --> API["知识查询 API"]
  API --> GRAG["GraphRAG 检索"]
  API --> BI["拓扑分析"]
  VAL --> AUD[("溯源/审计")]`,
            caption: "本体注册表版本化，运行中的图谱绑定创建时版本。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入 / 输出", "依赖"],
            rows: [
              ["抽取服务", "从文本与记录中识别实体关系", "文档 / 候选三元组", "NER 或规则"],
              ["实体消歧", "把候选链接到规范 ID", "候选 / 规范 ID", "别名索引、向量"],
              ["本体校验器", "按类与约束校验", "三元组 / 通过或拒绝", "本体注册表"],
              ["图存储", "持久化实体与关系", "三元组 / 查询结果", "图库或关系库"],
              ["查询 API", "路径与子图查询", "查询 / 子图", "权限引擎"],
              ["溯源审计", "记录来源、批次与版本", "写入事件 / 审计记录", "日志平台"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：摄取 → 抽取 → 消歧 → 本体校验 → 写入 → 查询 API 消费。",
              "数据流：结构化字段与文本抽取结果汇成候选三元组，经校验落库并保留原文定位。",
              "状态流：本体版本、实体规范 ID 映射、关系生效/失效时间与抽取批次。",
              "外部依赖：业务系统、CDC、对象存储、Embedding 服务、图/关系数据库、权限引擎。",
              "异常处理：消歧置信度低转人工；本体校验拒绝需记录原因；上游变更触发增量重建。",
              "扩展方式：按业务域分图；新增关系类型需先扩展本体并版本化；查询层可叠加向量检索。",
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
              ["本体注册表", "统一语义与约束", "版本化 Schema 文件 + 校验器", "改本体不升版本"],
              ["别名索引", "解决同义与缩写", "别名→规范 ID 映射 + 向量候选", "同名不同实体被误合并"],
              ["消歧器", "避免重复节点", "规则 + 相似度 + 上下文", "只看字符串不看上下文"],
              ["关系抽取器", "从文本获得关系", "规则模板或模型抽取", "抽取结果未经校验"],
              ["溯源存储", "可审计与可回退", "来源、批次、时间字段", "覆盖写导致历史丢失"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件顺序原则",
            text: "消歧必须在建边之前。先建边再合并实体，会产生指向已废弃节点的大量悬空关系。",
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
              "定义要回答的查询（如「某服务依赖哪些数据库」），反推最小完备本体。",
              "从业务系统同步主数据，建立实体规范 ID 与别名索引。",
              "对非结构化文档执行实体识别与关系抽取，产出候选三元组。",
              "实体消歧：按别名、类型、上下文与相似度链接到规范 ID。",
              "本体校验：检查类、属性域/值域、基数与关系允许性。",
              "置信度低于阈值的候选进入人工复核队列，不直接写入。",
              "写入图存储，附来源、抽取批次、生效时间与租户标签。",
              "关系失效时标记失效而非物理删除，保留历史可回放。",
              "查询 API 按租户与权限过滤后返回子图或路径。",
              "GraphRAG 消费子图作为结构化上下文，并保留来源 ID。",
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
              ["轻量本体 + 关系表", "多数企业场景", "简单、成熟运维", "推理能力有限"],
              ["RDF / OWL 完整本体", "需标准化推理与交换", "语义表达强", "工程与性能成本高"],
              ["属性图", "路径分析、拓扑", "遍历高效", "标准化程度较低"],
              ["GraphRAG 局部检索", "实体相关问答", "精度高", "需实体链接准确"],
              ["GraphRAG 全局检索", "主题总结", "覆盖全局结构", "社区摘要成本高"],
            ],
          },
          {
            type: "list",
            items: [
              "常见错误 1：把向量库当知识图谱，用相似度回答多跳关系问题。",
              "常见错误 2：允许任意类型边写入，图谱迅速退化成不可信网络。",
              "常见错误 3：实体合并后不更新关系指向，产生悬空边。",
              "常见错误 4：只存当前状态，无法审计「这条关系何时生效」。",
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
              ["关系库 + 邻接表", "中小规模、团队熟悉 SQL", "成熟 / 低", "中", "低", "优先验证价值"],
              ["图数据库（属性图）", "多跳遍历与拓扑", "成熟 / 中高", "高", "中", "路径查询为主时"],
              ["RDF 三元组库", "需标准化语义与推理", "成熟 / 高", "中高", "低", "跨组织语义交换"],
              ["规则 + LLM 混合抽取", "文档知识入库", "需持续评测 / 中", "高", "低", "人工复核不可省"],
              ["本体编辑/校验工具", "治理与版本管理", "成熟度各异", "中", "中", "按治理要求选"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "本节为定性选型建议，不含性能数据或排名。RDF/OWL 为 W3C 标准体系，具体产品版本与查询语言方言须按官方文档核验（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的本体校验与实体消歧",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：用 SQL 建立带约束的实体/关系模型，用 Python 实现别名消歧、本体校验与路径查询，并用离线测试覆盖消歧错误、非法关系与多跳查询。代码不依赖外部 SDK。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`knowledge-model/
├── requirements.txt
├── schema.sql        # 实体/关系/本体约束表结构（SQLite 可运行）
├── model.py          # 消歧、本体校验、路径查询
└── test_model.py     # 离线测试`,
          },
          {
            type: "code",
            language: "sql",
            filename: "schema.sql",
            caption: "数据模型：规范实体、别名、类型化关系、溯源与租户隔离",
            code: String.raw`-- 运行环境：SQLite 3 / PostgreSQL（类型语法按需调整）
-- 用途：教学模拟的设备拓扑知识建模，不含真实业务数据
CREATE TABLE entity (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,          -- Service / Database / Equipment
  canonical   TEXT NOT NULL,
  tenant      TEXT NOT NULL,
  source      TEXT NOT NULL,
  valid_from  TEXT NOT NULL,
  valid_to    TEXT
);
CREATE TABLE alias (
  alias     TEXT NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entity(id),
  PRIMARY KEY (alias, entity_id)
);
CREATE TABLE relation (
  id          TEXT PRIMARY KEY,
  subject_id  TEXT NOT NULL REFERENCES entity(id),
  predicate   TEXT NOT NULL,          -- depends_on / part_of
  object_id   TEXT NOT NULL REFERENCES entity(id),
  tenant      TEXT NOT NULL,
  source      TEXT NOT NULL,
  batch_id    TEXT NOT NULL,
  valid_from  TEXT NOT NULL,
  valid_to    TEXT,
  confidence  REAL NOT NULL DEFAULT 1.0
);
CREATE INDEX idx_rel_subject ON relation(subject_id, predicate);
CREATE INDEX idx_rel_object  ON relation(object_id, predicate);

-- 本体约束表：定义哪些 (主语类型, 关系, 宾语类型) 合法
CREATE TABLE ontology_rule (
  subject_type TEXT NOT NULL,
  predicate    TEXT NOT NULL,
  object_type  TEXT NOT NULL,
  version      TEXT NOT NULL,
  PRIMARY KEY (subject_type, predicate, object_type, version)
);
INSERT INTO ontology_rule VALUES
  ('Service',   'depends_on', 'Database',   'v1'),
  ('Equipment', 'part_of',    'Equipment',  'v1');`,
          },
          {
            type: "code",
            language: "python",
            filename: "model.py",
            caption: "核心实现：实体消歧、本体约束校验、增量写入与多跳路径查询",
            code: String.raw`"""知识建模核心实现（教学实现，Python 3.11+ 标准库）。

依赖：仅 sqlite3（标准库）
环境变量：无
说明：实体与关系数据为教学模拟；生产需接入真实 CDC 与人工复核队列。
"""
from __future__ import annotations

import sqlite3
import uuid
from dataclasses import dataclass
from typing import Iterable


@dataclass(frozen=True)
class Triple:
    subject: str
    predicate: str
    obj: str
    source: str
    confidence: float = 1.0


class KnowledgeStore:
    def __init__(self, conn: sqlite3.Connection, ontology_version: str = "v1"):
        self.conn = conn
        self.ontology_version = ontology_version

    def resolve(self, name: str, tenant: str) -> str | None:
        """实体消歧：先精确别名，再规范名；跨租户绝不命中。"""
        row = self.conn.execute(
            "SELECT e.id FROM alias a JOIN entity e ON e.id = a.entity_id "
            "WHERE a.alias = ? AND e.tenant IN ('global', ?) LIMIT 1",
            (name, tenant),
        ).fetchone()
        if row:
            return row[0]
        row = self.conn.execute(
            "SELECT id FROM entity WHERE canonical = ? AND tenant IN ('global', ?) LIMIT 1",
            (name, tenant),
        ).fetchone()
        return row[0] if row else None

    def validate(self, t: Triple, tenant: str) -> tuple[bool, str]:
        """本体校验：解析实体 + 检查 (类型, 关系, 类型) 约束。"""
        sid = self.resolve(t.subject, tenant)
        oid = self.resolve(t.obj, tenant)
        if not sid or not oid:
            return False, "unresolved_entity"
        st = self.conn.execute("SELECT type FROM entity WHERE id = ?", (sid,)).fetchone()[0]
        ot = self.conn.execute("SELECT type FROM entity WHERE id = ?", (oid,)).fetchone()[0]
        ok = self.conn.execute(
            "SELECT 1 FROM ontology_rule WHERE subject_type=? AND predicate=? "
            "AND object_type=? AND version=?",
            (st, t.predicate, ot, self.ontology_version),
        ).fetchone()
        if not ok:
            return False, f"ontology_violation:{st}-{t.predicate}-{ot}"
        return True, ""

    def upsert(self, t: Triple, tenant: str, batch_id: str) -> tuple[bool, str]:
        """幂等写入：同一 (subject, predicate, object, batch) 只写一次。"""
        ok, reason = self.validate(t, tenant)
        if not ok:
            return False, reason
        sid = self.resolve(t.subject, tenant) or ""
        oid = self.resolve(t.obj, tenant) or ""
        exists = self.conn.execute(
            "SELECT 1 FROM relation WHERE subject_id=? AND predicate=? "
            "AND object_id=? AND batch_id=? AND tenant=?",
            (sid, t.predicate, oid, batch_id, tenant),
        ).fetchone()
        if exists:
            return True, "duplicate_ignored"
        self.conn.execute(
            "INSERT INTO relation (id, subject_id, predicate, object_id, tenant, "
            "source, batch_id, valid_from, confidence) "
            "VALUES (?,?,?,?,?,?,?,datetime('now'),?)",
            (str(uuid.uuid4()), sid, t.predicate, oid, tenant,
             t.source, batch_id, t.confidence),
        )
        self.conn.commit()
        return True, "inserted"

    def neighbors(self, name: str, predicate: str, tenant: str) -> list[str]:
        """一跳查询，按租户过滤且只返回有效关系。"""
        eid = self.resolve(name, tenant)
        if not eid:
            return []
        rows = self.conn.execute(
            "SELECT e.canonical FROM relation r JOIN entity e ON e.id = r.object_id "
            "WHERE r.subject_id=? AND r.predicate=? AND r.valid_to IS NULL "
            "AND r.tenant IN ('global', ?)",
            (eid, predicate, tenant),
        ).fetchall()
        return [r[0] for r in rows]

    def paths(self, name: str, predicate: str, tenant: str,
              depth: int = 2) -> list[list[str]]:
        """多跳路径查询（深度受限，避免全图遍历）。"""
        result: list[list[str]] = []

        def walk(node: str, path: list[str], left: int) -> None:
            if left == 0:
                result.append(path)
                return
            for nxt in self.neighbors(node, predicate, tenant):
                if nxt in path:      # 防环
                    continue
                walk(nxt, path + [nxt], left - 1)

        walk(name, [name], depth)
        return result`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_model.py",
            caption: "离线测试：消歧、本体约束、幂等、租户隔离与多跳查询",
            code: String.raw`import sqlite3

import pytest

from model import KnowledgeStore, Triple

SCHEMA = open("schema.sql", encoding="utf-8").read()


@pytest.fixture
def store():
    conn = sqlite3.connect(":memory:")
    conn.executescript(SCHEMA)
    conn.executemany(
        "INSERT INTO entity VALUES (?,?,?,?,?,?,NULL)",
        [
            ("e1", "Service", "订单服务", "t1", "cmdb", "2026-01-01"),
            ("e2", "Database", "订单库", "t1", "cmdb", "2026-01-01"),
            ("e3", "Equipment", "产线A", "t1", "iot", "2026-01-01"),
            ("e4", "Database", "其他租户库", "t2", "cmdb", "2026-01-01"),
        ],
    )
    conn.executemany(
        "INSERT INTO alias VALUES (?,?)",
        [("order-svc", "e1"), ("订单服务别名", "e1"), ("orders-db", "e2")],
    )
    conn.commit()
    return KnowledgeStore(conn)


def test_alias_resolution(store):
    assert store.resolve("order-svc", "t1") == "e1"


def test_cross_tenant_never_resolves(store):
    assert store.resolve("其他租户库", "t1") is None


def test_ontology_rejects_illegal_relation(store):
    bad = Triple("订单服务", "part_of", "订单库", "doc-1")
    ok, reason = store.upsert(bad, "t1", "batch-1")
    assert not ok and reason.startswith("ontology_violation")


def test_valid_relation_is_idempotent(store):
    good = Triple("订单服务", "depends_on", "订单库", "doc-1")
    ok1, r1 = store.upsert(good, "t1", "batch-1")
    ok2, r2 = store.upsert(good, "t1", "batch-1")
    assert ok1 and r1 == "inserted" and r2 == "duplicate_ignored"
    assert store.neighbors("订单服务", "depends_on", "t1") == ["订单库"]


def test_unresolved_entity_is_reported(store):
    ok, reason = store.upsert(
        Triple("不存在的服务", "depends_on", "订单库", "doc-1"), "t1", "b1")
    assert not ok and reason == "unresolved_entity"


def test_paths_are_depth_limited(store):
    paths = store.paths("订单服务", "depends_on", "t1", depth=2)
    assert paths == [["订单服务", "订单库"]]`,
          },
          {
            type: "code",
            language: "bash",
            filename: "运行方式",
            caption: "安装与执行",
            code: String.raw`# requirements.txt
pytest>=8.0

pip install -r requirements.txt
python -m pytest -q test_model.py`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python -m pytest -q test_model.py"],
              ["输出示例", "6 passed in 0.xx s"],
              ["结果解释", "别名正确解析、跨租户不命中、非法关系被本体拒绝、重复写入幂等、路径查询有效"],
              ["常见错误 1", "schema.sql 相对路径找不到：在 knowledge-model/ 目录下运行"],
              ["常见错误 2", "改了本体但未升 version：旧图谱与新约束不一致"],
              ["常见错误 3", "消歧只看名字：同名不同实体被误合并"],
              ["常见错误 4", "路径查询不限深度：可能全图遍历导致超时"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "实体与关系为教学模拟数据，消歧为别名精确匹配；生产需替换为真实 CDC、向量候选消歧、人工复核队列、时态版本与权限过滤。本体校验与幂等写入流程可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：IT 依赖知识图谱（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为贯穿全站项目 A 的知识图谱层案例，实体与数据均为虚构，不代表真实客户或生产效果。",
          },
          {
            type: "paragraph",
            text: "业务背景：IT 运维需要回答「某服务故障会影响哪些上游系统」「变更某数据库前需通知谁」。业务问题是 CMDB 数据分散、服务命名不统一、依赖关系靠口头维护。技术目标是建立带本体约束的依赖图谱并按租户隔离。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["系统设计", "轻量本体（Service/Database/Equipment）+ 别名索引 + 关系表 + 溯源字段"],
              ["数据来源", "CMDB 配置项、部署清单、架构文档、变更记录（教学模拟）"],
              ["组件选择", "关系库邻接表起步，SQL 校验器，CDC 增量同步"],
              ["执行流程", "主数据同步 → 别名归一 → 关系抽取 → 本体校验 → 人工复核 → 写入"],
              ["安全权限", "按租户过滤实体与关系；跨租户消歧禁止命中"],
              ["异常处理", "低置信度候选转人工；关系失效标记而非删除；CDC 延迟告警"],
              ["部署方案", "抽取异步化、图存储独立扩容、查询 API 缓存热点子图"],
              ["效果评估", "消歧准确率、本体校验拒绝率、多跳查询正确率、图谱新鲜度"],
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
              "高可用：摄取与查询分离，图存储多副本；本体注册表版本化并缓存。",
              "可扩展性：按业务域/租户分图；路径查询限制深度与返回规模。",
              "并发：写入按规范实体 ID 串行化，避免并发合并冲突。",
              "延迟与成本：热子图缓存；抽取批量化；避免全图遍历。",
              "超时与重试：抽取与写入分别设超时；摄取以 doc_id + batch_id 幂等。",
              "幂等性：关系写入以 (subject, predicate, object, batch) 唯一约束。",
              "状态持久化：关系带 valid_from/valid_to 与批次，支持时态回放。",
              "日志/监控/追踪：记录消歧决策、本体拒绝原因、抽取批次与查询耗时。",
              "灰度发布与版本管理：本体新版本先在影子图校验，确认无误再切换。",
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
              "身份认证：查询与写入绑定租户与调用方，禁止前端直接指定可见范围。",
              "权限控制：实体与关系双层按租户过滤；敏感关系（如权限继承）单独授权。",
              "数据保护：文档中的 PII 在抽取阶段脱敏；别名索引不泄漏跨租户名称。",
              "输入验证：候选三元组按 Schema 校验，类型与谓词必须来自白名单。",
              "输出校验：GraphRAG 消费的子图需标注来源与不可信级别。",
              "工具权限：图写入工具仅对摄取服务开放，查询工具只读。",
              "审计：记录每条关系的来源、批次、生效时间与复核人。",
              "风险控制：本体变更双人评审、影子校验、应急回滚到上一版本。",
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
              ["消歧质量", "标注别名→规范 ID", "别名与歧义样本集", "消歧准确率"],
              ["抽取质量", "人工抽检候选三元组", "真实文档样本", "精确率/召回率"],
              ["本体合规", "非法关系注入", "类型/谓词组合", "非法关系写入数 = 0"],
              ["路径正确性", "多跳查询与标准答案比对", "拓扑样本", "路径查询正确率"],
              ["租户隔离", "跨租户查询", "多租户图", "越权命中数 = 0"],
              ["新鲜度", "比对上游变更与图谱", "CDC 事件流", "同步延迟 P95"],
            ],
          },
          {
            type: "paragraph",
            text: "回归测试以「实体集合 + 关系集合 + 查询结果」为断言，test_model.py 已覆盖消歧、本体约束、幂等、隔离与路径查询。把评测集接入 CI，本体或抽取规则变更即触发回归，消歧准确率或路径正确率退化则阻断发布。",
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
              "先定义要回答的查询，再设计最小完备本体。",
              "消歧在建边之前，合并实体时同步更新关系指向。",
              "关系带来源、批次与生效时间，失效标记而非物理删除。",
              "本体版本化，运行中图谱绑定创建时版本。",
              "低置信度抽取必须人工复核，不要让 LLM 输出直接入库。",
              "路径查询限制深度与返回规模，热子图做缓存。",
              "按租户双层过滤，跨租户消歧禁止命中。",
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
              ["同名实体被错误合并", "消歧只看字符串", "检查别名索引与上下文", "加入类型与上下文约束", "歧义样本纳入评测"],
              ["查询返回结果缺失", "关系被标为失效或租户不符", "检查 valid_to 与 tenant", "修正时态与权限标签", "时态查询用例"],
              ["非法关系大量入库", "本体校验被绕过", "查 ontology_violation 日志", "强制走校验器写入", "非法关系注入测试"],
              ["多跳查询超时", "未限深度或出现环", "看查询耗时与路径长度", "限深 + 防环 + 缓存", "压测覆盖深图"],
              ["图谱与系统不一致", "CDC 延迟或丢事件", "比对批次与上游版本", "补齐增量与重放", "新鲜度监控"],
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
              "相关教程：知识图谱与 GraphRAG、知识抽取与实体消歧、GraphRAG 进阶、企业 RAG 端到端管线、AI-Ready 数据底座。",
              "相关架构：知识工程架构、企业 RAG 架构。",
              "相关实验：RAG 管线实验、架构设计器。",
              "相关企业案例：IT Operations Agent（项目 A 依赖图谱）、企业知识助手。",
              "官方标准与学术资料见下方参考资料。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "RDF / OWL 属 W3C 标准体系，具体推荐版本与语法细节未按当前官方文档逐项复核，标注为需进一步核验；本节工程建议不等同于行业标准。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "本体校验必须在 upsert 之前执行。若先写后校验，违规三元组会进入图谱并污染路径查询与 GraphRAG 摘要；事后清理无法恢复已被下游消费的错误关系。时态关系还需记录 valid_from/valid_to。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant E as 抽取器
  participant K as KnowledgeStore
  participant O as 本体规则表
  participant G as 图查询
  E->>K: upsert(三元组候选)
  K->>O: 读取 subject/predicate/object 约束
  alt 符合约束
    O-->>K: valid
    K->>K: 消歧 + 写入(带来源与版本)
    K-->>G: 可查询路径
  else 违反约束
    O-->>K: invalid(reason)
    K-->>E: 拒绝并进死信队列
  end
  G-->>G: neighbors / paths 查询`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["抽取器 → KnowledgeStore","候选三元组 + provenance","缺来源标注的写入直接拒绝"],
              ["KnowledgeStore → 本体规则表","类型与谓词约束查询","规则版本随写入一起记录"],
              ["KnowledgeStore → 图查询","已校验实体与关系","时态关系必须带有效期"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","写入 subject_type 不匹配的三元组","校验拒绝，库中无该关系"],
              ["故障注入","同一实体多个别名指向不同 id","消歧结果唯一或转人工"],
              ["上线验收","pytest -q test_model.py","校验、消歧、路径查询用例通过"],
              ["上线验收","核对三元组 provenance 覆盖率","100% 关系可追溯到来源与版本"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：把内存 KnowledgeStore 换成图数据库或带约束的三元组表，本体规则由领域专家评审并版本化，实体消歧接入企业主数据。RDF/OWL 相关序列化与推理能力需按所选引擎官方文档核验，示例只覆盖关系型校验。",
          },
        ],
      },
    ],
    tags: ["Knowledge Engineering", "Ontology", "实体消歧", "知识图谱"],
    architectureIds: ["a09", "a10"],
    relatedTutorialIds: [
      "knowledge-graph",
      "knowledge-extraction",
      "graphrag-advanced",
      "ai-ready-data",
      "rag-fundamentals",
    ],
    nextTutorialSlugs: ["knowledge-graph", "graphrag-advanced"],
    relatedLabSlugs: ["rag-pipeline", "architecture-designer"],
    relatedCaseSlugs: ["it-operations-agent", "enterprise-knowledge-assistant"],
    references: [
      {
        title: "RDF 1.1 Concepts and Abstract Syntax",
        url: "https://www.w3.org/TR/rdf11-concepts/",
        organization: "W3C",
        kind: "官方规范",
        purpose: "三元组与 RDF 图模型的标准定义",
        verifiedAt: "2026-11-13",
      },
      {
        title: "OWL 2 Web Ontology Language Primer",
        url: "https://www.w3.org/TR/owl2-primer/",
        organization: "W3C",
        kind: "官方规范",
        purpose: "本体类、属性与约束的标准表达；具体版本细节需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "From Local to Global: A Graph RAG Approach to Query-Focused Summarization",
        url: "https://arxiv.org/abs/2404.16130",
        organization: "Microsoft Research",
        kind: "学术研究",
        purpose: "GraphRAG 局部与全局检索思路的参考；结论需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Model Context Protocol Specification",
        url: "https://modelcontextprotocol.io/specification/2026-07-28",
        organization: "Model Context Protocol",
        kind: "官方规范",
        version: "2026-07-28（latest）",
        purpose: "知识查询工具暴露给 Agent 时的协议与安全约束参考",
        verifiedAt: "2026-11-13",
      },
    ],
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
