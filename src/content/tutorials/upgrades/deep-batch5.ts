import type { Tutorial } from "../../types";

// ============================================================================
// 第五批（前半）· 领域 09 / 10 / 11 · L4 深度升级教程
// 覆盖：语义层与 Text-to-SQL 校验、AgentOps 追踪与评估、AI 安全护栏与治理。
// ============================================================================

const refs = (extra: Tutorial["references"]): Tutorial["references"] => [
  {
    title: "PostgreSQL 官方文档：Row Security Policies",
    url: "https://www.postgresql.org/docs/current/ddl-rowsecurity.html",
    organization: "PostgreSQL", kind: "官方产品文档",
    version: "在线文档，随版本更新；核验于 2026-11-13",
    purpose: "行级权限必须落在数据库策略而非字符串拼接的官方依据",
    verifiedAt: "2026-11-13",
  },
  {
    title: "OWASP Top 10 for LLM Applications",
    url: "https://owasp.org/www-project-top-10-for-large-language-model-applications/",
    organization: "OWASP", kind: "社区实践",
    purpose: "提示注入与敏感信息泄露的威胁分类", verifiedAt: "2026-11-13",
  },
  ...extra,
];

export const deepBatch5: Tutorial[] = [
  {
    id: "t-sl-02",
    slug: "text-to-sql",
    domainId: "d09",
    title: "Text-to-SQL 与语义层：从自然语言到受控查询",
    englishTitle: "Text-to-SQL over a Semantic Layer",
    summary:
      "讲清语义层如何解决口径不一致、Text-to-SQL 的查询规划与 SQL 校验机制、只读与行级权限约束，给出可运行的 SQL 白名单校验器与语义指标定义实现，以及企业案例与评估方法。",
    difficulty: "高级",
    estimatedMinutes: 55,
    prerequisites: ["SQL 基础", "数据仓概念", "Python 基础"],
    learningObjectives: [
      "解释语义层解决的核心问题与指标口径治理",
      "实现 SQL 生成后的静态校验与权限注入",
      "设计只读约束、行级权限与查询预算",
      "建立 Text-to-SQL 的离线评测与回归门禁",
      "排查口径错误、越权查询与慢查询",
    ],
    sections: [
      {
        id: "overview",
        heading: "1. 技术概述 Overview",
        blocks: [
          {
            type: "paragraph",
            text: "Text-to-SQL 让模型把自然语言问题转换为 SQL，语义层（Semantic Layer）则把物理表映射为受治理的业务指标、维度与实体。两者结合解决的核心问题是：同一指标（如「活跃用户」）在不同报表中口径不一致，且直接让模型写 SQL 会带来越权与破坏性风险。",
          },
          {
            type: "paragraph",
            text: "产生背景是业务人员需要自助分析，但直接开放数据库既不安全也要求掌握表结构。语义层提供统一口径与受控的查询面，Text-to-SQL 提供自然语言入口，SQL 校验器则是两者之间的安全闸门。",
          },
          {
            type: "table",
            headers: ["维度", "直接 Text-to-SQL", "基于语义层"],
            rows: [
              ["口径", "由模型猜测表与字段", "由指标定义集中治理"],
              ["权限", "依赖数据库账号", "语义层 + 行级过滤"],
              ["可维护性", "表结构变更即失效", "指标定义隔离物理变化"],
              ["风险", "可能生成 DML/全表扫描", "只读白名单 + 预算"],
            ],
          },
          {
            type: "list",
            items: [
              "适用场景：固定指标的自助问答、经营看板解释、对话式分析。",
              "不适用场景：探索性数据科学、无稳定指标定义的临时分析、需要写操作的任务。",
              "与 BI 的区别：BI 由人拖拽维度，Text-to-SQL 由模型生成查询，但两者应共用同一套指标定义。",
              "与通用 RAG 的区别：这里检索的是结构化指标定义与 Schema 元数据，而非文档片段。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "语义层是安全边界",
            text: "把权限与口径交给提示词「请只查允许的表」不是控制。语义层与 SQL 校验器必须在确定性代码中强制执行。",
          },
        ],
      },
      {
        id: "fundamentals",
        heading: "2. 核心原理 Fundamentals",
        blocks: [
          {
            type: "paragraph",
            text: "核心机制是「指标定义 → 查询规划 → SQL 生成 → 静态校验 → 执行 → 解释」。关键数据结构是语义模型：Metric（名称、表达式、聚合、过滤条件）、Dimension（切分维度、层级）、Entity（业务对象与主键）、以及访问策略（租户列、角色可见字段）。模型只被允许引用语义模型中的对象，生成的 SQL 必须经 AST 级校验。",
          },
          {
            type: "mermaid",
            title: "Text-to-SQL 受控链路",
            source: `flowchart LR
  Q["自然语言问题"] --> RET["检索指标/维度定义"]
  SEM[("语义模型 版本化")] --> RET
  RET --> PLAN["查询规划 指标+维度+过滤"]
  PLAN --> GEN["LLM 生成 SQL"]
  GEN --> VAL["AST 静态校验"]
  VAL -->|拒绝| ERR["回灌原因/转人工"]
  VAL -->|通过| POL["注入行级权限"]
  POL --> COST["成本/行数预算"]
  COST --> EXE["只读副本执行"]
  EXE --> EXP["结果解释 + 口径说明"]`,
            caption: "校验在语义对象级别完成，而非靠字符串黑名单。",
          },
          {
            type: "table",
            headers: ["要素", "定义", "工程含义"],
            rows: [
              ["Metric", "带计算逻辑的业务指标", "表达式集中定义、版本化"],
              ["Dimension", "切分视角与时间粒度", "决定 GROUP BY 与过滤"],
              ["AST 校验", "解析 SQL 结构后校验", "禁止 DML/DDL、多语句、未授权表"],
              ["Row-level Filter", "按租户/角色追加 WHERE", "必须在执行前注入"],
              ["Query Budget", "行数、耗时、扫描量上限", "防止全表扫描拖垮数仓"],
            ],
          },
          {
            type: "paragraph",
            text: "输入是自然语言问题与用户访问上下文；输出是只读查询结果与口径说明；关键状态包括所用指标版本、生成的 SQL、校验决策、预算消耗与执行耗时。系统边界：模型生成的 SQL 与外部数据源内容均不可信，必须经确定性校验；数据库返回的数据同样作为数据处理。",
          },
          {
            type: "list",
            items: [
              "局限一：指标定义未覆盖的问题必然答错，需明确「无法回答」而不是猜测。",
              "局限二：多表 Join 与复杂窗口函数容易生成语义正确但性能极差的 SQL。",
              "局限三：口径变更若不做版本治理，历史问题无法复现。",
              "局限四：模糊问题需多轮澄清，单轮生成容易擅自假设时间范围。",
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
            title: "对话式分析架构",
            source: `flowchart TB
  U["业务用户"] --> GW["API 网关 认证"]
  GW --> ORCH["分析编排器"]
  ORCH --> SEM[("语义模型注册表")]
  ORCH --> LLM["LLM 网关"]
  ORCH --> VAL["SQL 校验器"]
  VAL --> POL["策略引擎 RBAC/ABAC"]
  POL --> DWH[("只读数据副本")]
  ORCH --> AUD[("查询审计")]
  ORCH --> EVAL["评测/回归"]`,
            caption: "语义模型注册表是唯一口径来源，审计记录每次生成的 SQL。",
          },
          {
            type: "table",
            headers: ["组件", "职责", "输入 / 输出", "依赖"],
            rows: [
              ["语义模型注册表", "版本化指标与维度", "模型 ID / 定义", "配置库"],
              ["查询规划器", "确定指标、维度与过滤", "问题 / 计划", "语义模型"],
              ["SQL 生成器", "产出候选 SQL", "计划 + Schema / SQL", "LLM 网关"],
              ["SQL 校验器", "AST 级静态校验", "SQL / 通过或拒绝", "白名单"],
              ["策略引擎", "注入行级权限", "用户上下文 / WHERE", "身份系统"],
              ["审计与评测", "留痕与回归", "查询事件 / 指标", "可观测平台"],
            ],
          },
          {
            type: "list",
            items: [
              "控制流：问题 → 检索定义 → 规划 → 生成 → 校验 → 权限注入 → 预算 → 执行 → 解释。",
              "数据流：语义定义与 Schema 元数据进入生成；结果集经解释后返回并附口径。",
              "状态流：指标版本、SQL 文本、校验决策、行数与耗时写入审计。",
              "外部依赖：语义模型库、LLM 网关、只读数仓副本、身份系统、可观测平台。",
              "异常处理：校验拒绝回灌具体原因并允许改写重试；超时熔断；无法回答时转人工。",
              "扩展方式：新增指标即注册定义；按业务域拆分语义模型；只读副本独立扩缩。",
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
              ["指标注册表", "统一口径", "版本化 YAML/DB 定义", "口径散落在报表 SQL 里"],
              ["SQL 校验器", "安全边界", "SQL 解析 + 白名单 + 只读", "用字符串匹配导致绕过"],
              ["权限注入器", "行级隔离", "在 AST 上追加谓词", "拼字符串造成注入"],
              ["预算守卫", "防止拖垮数仓", "预估行数 + LIMIT + 超时", "无超时导致长查询"],
              ["审计", "可复现与合规", "记录 SQL 与指标版本", "只记录结果文本"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "组件顺序原则",
            text: "校验必须先于权限注入，权限注入必须先于执行。任何「先执行再过滤结果」的做法都是数据泄露。",
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
              "用户提问，网关完成认证并附加租户与角色上下文。",
              "检索语义模型：召回相关指标与维度定义，附版本与口径说明。",
              "查询规划：确定指标、时间范围、维度与必要过滤，模糊项发起澄清。",
              "LLM 生成候选 SQL，仅允许引用已授权语义对象。",
              "AST 静态校验：单语句、只读、表与字段白名单、禁止子查询外的任意表达式。",
              "权限注入：按租户与角色在 AST 上追加行级谓词。",
              "预算检查：强制 LIMIT、扫描量与超时上限。",
              "在只读副本执行，记录 SQL、指标版本、行数与耗时。",
              "结果解释：把数值与口径、时间范围一起返回，标注不确定性。",
              "把问题—SQL—结果三元组写入评测集，支持回归。",
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
              ["语义层 + 模板 SQL", "指标固定的高频问题", "最安全、最稳定", "灵活性低"],
              ["LLM 生成 + AST 校验", "多样化提问", "灵活且可控", "需维护校验器"],
              ["多轮澄清", "时间范围模糊", "减少错误假设", "增加交互轮次"],
              ["SQL 改写重试", "生成语法错误", "提升成功率", "需限制次数与成本"],
              ["只读副本 + 预算", "生产数仓保护", "隔离风险", "数据存在同步延迟"],
            ],
          },
          {
            type: "list",
            items: [
              "常见错误 1：用正则黑名单拦 SQL，被注释或大小写变形绕过。",
              "常见错误 2：把权限判断写进提示词。",
              "常见错误 3：无 LIMIT 与超时，单次查询拖垮数仓。",
              "常见错误 4：口径变更后不记录版本，历史问答无法复现。",
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
              ["关系库只读副本", "绝大多数场景", "成熟 / 低", "中高", "低", "优先"],
              ["SQL 解析库", "AST 级校验", "成熟 / 需覆盖方言", "高", "低", "按数仓方言选"],
              ["语义层/指标平台", "多团队共享口径", "成熟度各异 / 中", "高", "中", "口径治理复杂时"],
              ["向量检索辅助", "从大量指标中召回定义", "成熟 / 中", "高", "低", "指标数量多时"],
              ["LLM 网关", "统一模型与审计", "成熟 / 中", "高", "中", "企业统一治理"],
            ],
          },
          {
            type: "callout",
            variant: "warning",
            title: "版本核验提示",
            text: "上表为定性判断，不含性能数据或排名。SQL 解析器方言覆盖与语义层产品版本须按官方文档核验（需进一步核验）。",
          },
        ],
      },
      {
        id: "hands-on",
        heading: "8. Hands-on 实战：可运行的 SQL 校验器与语义指标",
        blocks: [
          {
            type: "paragraph",
            text: "实验目标：实现语义指标定义、SQL 静态校验（只读/白名单/单语句）、行级权限注入与查询预算，并用离线测试覆盖注入绕过、越权表、DML 与模糊时间范围。代码仅用 Python 标准库，教学模拟的数值结果不依赖真实数据库。",
          },
          {
            type: "code",
            language: "text",
            filename: "项目目录结构",
            caption: "本节多文件项目布局",
            code: String.raw`semantic-sql/
├── requirements.txt
├── semantic.py        # 指标定义、SQL 校验、权限注入、预算
└── test_semantic.py   # 离线测试`,
          },
          {
            type: "code",
            language: "python",
            filename: "semantic.py",
            caption: "核心实现：语义指标注册表、只读校验、谓词注入、LIMIT 与超时预算",
            code: String.raw`"""语义层 + Text-to-SQL 安全校验（教学实现，标准库可运行）。

依赖：仅 Python 3.11+ 标准库
环境变量：无
说明：教学模拟的校验器用受限解析器，生产必须替换为成熟 SQL 解析器
      并按真实数仓方言覆盖语法；此处不连接任何数据库。
"""
from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True)
class Metric:
    name: str
    expression: str
    allowed_tables: tuple[str, ...]
    version: str


SEMANTIC_MODEL: dict[str, Metric] = {
    "active_users": Metric(
        name="active_users",
        expression="COUNT(DISTINCT user_id)",
        allowed_tables=("fact_events",),
        version="v1",
    ),
    "revenue": Metric(
        name="revenue",
        expression="SUM(amount)",
        allowed_tables=("fact_orders",),
        version="v2",
    ),
}

FORBIDDEN = re.compile(
    r"\b(insert|update|delete|drop|alter|truncate|create|grant|"
    r"exec|execute|call|merge|attach|copy|into\s+outfile)\b", re.I)
ALLOWED_TABLES = {"fact_events", "fact_orders", "dim_tenant"}


class SqlRejected(Exception):
    pass


def extract_tables(sql: str) -> set[str]:
    """教学用简化提取：覆盖 FROM/JOIN 后的裸表名。生产需替换为 AST 提取。"""
    found = set(re.findall(r"\b(?:from|join)\s+([a-zA-Z_][a-zA-Z0-9_]*)", sql, re.I))
    return {t.lower() for t in found}


def validate_sql(sql: str, metric: Metric) -> str:
    """静态校验：单语句、只读、表白名单、指标口径一致、无危险关键字。"""
    s = sql.strip().rstrip(";")
    if ";" in s:
        raise SqlRejected("multiple_statements")
    if not re.match(r"^\s*(select|with)\b", s, re.I):
        raise SqlRejected("not_readonly")
    if FORBIDDEN.search(s):
        raise SqlRejected("forbidden_keyword")
    tables = extract_tables(s)
    if not tables or not tables.issubset(ALLOWED_TABLES):
        raise SqlRejected("unauthorized_table:" + ",".join(sorted(tables)))
    if not any(t in tables for t in metric.allowed_tables):
        raise SqlRejected("metric_table_mismatch")
    for name, m in SEMANTIC_MODEL.items():
        if name in s.lower() and m.name != metric.name:
            raise SqlRejected("cross_metric_reference")
    if "--" in s or "/*" in s:
        raise SqlRejected("comment_not_allowed")
    return s


def inject_row_policy(sql: str, tenant: str) -> str:
    """行级权限：在 AST 上追加谓词；此处用结构化包装演示位置与不可绕过性。"""
    if not re.fullmatch(r"[a-zA-Z0-9_-]+", tenant):
        raise SqlRejected("invalid_tenant")
    predicate = f"tenant_id = '{tenant}'"
    # 生产实现应在解析后的 WHERE 节点追加，并保证与已有条件 AND 连接
    if re.search(r"\bwhere\b", sql, re.I):
        return re.sub(r"\bwhere\b", f"WHERE ({predicate}) AND ", sql, count=1, flags=re.I)
    return sql + f" WHERE {predicate}"


def apply_budget(sql: str, max_rows: int = 1000) -> str:
    """查询预算：强制 LIMIT 上限，防止全表返回。"""
    m = re.search(r"\blimit\s+(\d+)", sql, re.I)
    if m and int(m.group(1)) <= max_rows:
        return sql
    if m:
        return re.sub(r"\blimit\s+\d+", f"LIMIT {max_rows}", sql, flags=re.I)
    return sql + f" LIMIT {max_rows}"


def plan(question: str, metric_name: str, tenant: str) -> dict:
    """把自然语言意图落到受控计划（教学模拟：不调用 LLM）。"""
    metric = SEMANTIC_MODEL.get(metric_name)
    if not metric:
        raise SqlRejected("unknown_metric")
    if not re.search(r"\d{4}|本月|上月|近\d+天|今天", question):
        return {"status": "need_clarification", "question": "请明确时间范围"}
    return {"status": "ok", "metric": metric.name, "version": metric.version,
            "tenant": tenant, "expression": metric.expression}


def execute(sql: str, metric: Metric, tenant: str) -> dict:
    """教学模拟执行：真实项目在此调用只读副本，并返回行数与耗时。"""
    checked = validate_sql(sql, metric)
    secured = inject_row_policy(checked, tenant)
    bounded = apply_budget(secured)
    return {"sql": bounded, "metric_version": metric.version,
            "status": "accepted", "rows": 0, "note": "教学模拟，未连接数据库"}`,
          },
          {
            type: "code",
            language: "python",
            filename: "test_semantic.py",
            caption: "离线测试：DML/多语句/越权表/注释绕过、权限注入、预算、口径澄清",
            code: String.raw`import pytest

from semantic import (SEMANTIC_MODEL, SqlRejected, validate_sql,
                      inject_row_policy, apply_budget, plan, execute)

M = SEMANTIC_MODEL["active_users"]
GOOD = "SELECT COUNT(DISTINCT user_id) AS active_users FROM fact_events"


def test_valid_readonly_query():
    assert validate_sql(GOOD, M).startswith("SELECT")


def test_dml_is_rejected():
    with pytest.raises(SqlRejected):
        validate_sql("UPDATE fact_events SET x = 1", M)


def test_multiple_statements_are_rejected():
    with pytest.raises(SqlRejected):
        validate_sql("SELECT 1 FROM fact_events; DROP TABLE fact_events", M)


def test_unauthorized_table_is_rejected():
    with pytest.raises(SqlRejected):
        validate_sql("SELECT * FROM secret_salaries", M)


def test_comment_bypass_is_rejected():
    with pytest.raises(SqlRejected):
        validate_sql(GOOD + " -- ignore rules", M)


def test_metric_table_mismatch():
    with pytest.raises(SqlRejected):
        validate_sql("SELECT 1 FROM dim_tenant", M)


def test_row_policy_injection_is_and_combined():
    secured = inject_row_policy("SELECT 1 FROM fact_events WHERE x = 1", "t1")
    assert "tenant_id = 't1'" in secured and "AND" in secured


def test_budget_enforces_limit():
    assert "LIMIT 1000" in apply_budget(GOOD)
    assert "LIMIT 1000" in apply_budget(GOOD + " LIMIT 999999")


def test_vague_question_needs_clarification():
    assert plan("活跃用户是多少", "active_users", "t1")["status"] == "need_clarification"


def test_full_execute_pipeline():
    out = execute(GOOD, M, "t1")
    assert out["status"] == "accepted" and "tenant_id = 't1'" in out["sql"]`,
          },
          {
            type: "code",
            language: "yaml",
            filename: "metrics.yaml",
            caption: "配置示例：语义指标定义（版本化，作为唯一口径来源）",
            code: String.raw`version: 1
metrics:
  - name: active_users
    expression: "COUNT(DISTINCT user_id)"
    source_table: fact_events
    version: v1
    owner: data-platform
    filters: ["event_type = 'active'"]
    description: "教学模拟定义，非行业口径标准"
  - name: revenue
    expression: "SUM(amount)"
    source_table: fact_orders
    version: v2
    owner: finance-analytics
    description: "教学模拟定义，非行业口径标准"
access:
  row_filter_column: tenant_id
  read_only_replica: true
  max_rows: 1000`,
          },
          {
            type: "code",
            language: "bash",
            filename: "运行方式",
            caption: "环境：Python 3.11+；安装与执行",
            code: String.raw`# requirements.txt
pytest>=8.0

pip install -r requirements.txt
python -m pytest -q test_semantic.py`,
          },
          {
            type: "table",
            headers: ["项目", "内容"],
            rows: [
              ["输入示例", "python -m pytest -q test_semantic.py"],
              ["输出示例", "10 passed in 0.xx s"],
              ["结果解释", "只读校验拦截 DML/多语句/越权表/注释绕过，权限谓词与 LIMIT 被强制执行，模糊时间范围触发澄清"],
              ["常见错误 1", "用正则黑名单代替 AST 校验：本示例的 extract_tables 也仅作教学演示，生产必须换成熟解析器"],
              ["常见错误 2", "权限谓词拼在结果集之后：应先注入再执行"],
              ["常见错误 3", "无 LIMIT/超时：单查询拖垮数仓"],
              ["常见错误 4", "指标定义无版本：口径变更后历史问答不可复现"],
            ],
          },
          {
            type: "callout",
            variant: "tip",
            title: "哪些部分需要替换",
            text: "SQL 提取与校验为受限教学实现、execute 未连接数据库、plan 未调用 LLM；生产需替换为成熟 SQL 解析器（覆盖真实方言）、只读副本连接、语义指标平台与多轮澄清编排。校验顺序与预算策略可直接沿用。",
          },
        ],
      },
      {
        id: "case",
        heading: "9. 企业应用案例：经营指标问答（教学模拟案例）",
        blocks: [
          {
            type: "callout",
            variant: "warning",
            title: "教学模拟案例声明",
            text: "本节为教学模拟案例，指标定义与数据均为虚构，不代表真实客户或生产效果，亦非行业口径标准。",
          },
          {
            type: "paragraph",
            text: "业务背景：区域负责人希望用自然语言查询「本月活跃用户」「上月收入」等指标，但各报表口径不一。业务问题是口径分歧与数据库直连风险。技术目标是建立统一语义层并只允许受控只读查询。",
          },
          {
            type: "table",
            headers: ["环节", "工程细节"],
            rows: [
              ["系统设计", "语义模型注册表 + SQL 校验器 + 策略引擎 + 只读副本"],
              ["数据来源", "事实表、维度表、指标定义（教学模拟）"],
              ["组件选择", "版本化 YAML 定义、SQL 解析校验、行级权限注入、查询审计"],
              ["执行流程", "问题 → 指标检索 → 规划/澄清 → 生成 → 校验 → 权限 → 预算 → 执行 → 解释"],
              ["安全权限", "RBAC 决定可见指标，ABAC 注入 tenant_id；只读账号；禁止 DML"],
              ["异常处理", "校验拒绝回灌原因并允许改写；超时熔断；未知指标转人工"],
              ["部署方案", "分析编排器无状态多副本，只读副本独立，审计集中存储"],
              ["效果评估", "SQL 合法率、口径正确率、越权查询数 = 0、P95 查询耗时、澄清触发率"],
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
              "高可用：编排器无状态化，语义模型缓存，只读副本多实例。",
              "可扩展性：按业务域拆分语义模型；指标多时先向量召回再规划。",
              "并发：查询队列限流，避免多个慢查询同时打满数仓。",
              "延迟与成本：模板 SQL 优先、LLM 生成兜底；缓存高频问答；预算控制扫描量。",
              "超时与重试：执行设超时与熔断；仅对可重入的只读查询改写重试，限制次数。",
              "幂等性：同一问题与指标版本的查询结果可缓存并复现。",
              "状态持久化：SQL、指标版本、校验决策与执行统计入审计库。",
              "日志/监控/追踪：记录生成→校验→执行各阶段耗时与拒绝原因。",
              "灰度发布与版本管理：指标定义版本化，新版本影子评测后再切换。",
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
              "身份认证：查询绑定用户与租户，禁止前端指定可见表。",
              "权限控制：RBAC 决定可见指标，ABAC 注入行级谓词，只读账号执行。",
              "数据保护：结果集按字段分级脱敏；日志不记录敏感值。",
              "输入验证：SQL 以 AST 校验，禁止注释与多语句，禁止未授权表。",
              "输出校验：结果解释附带口径与不确定性；异常结果复核。",
              "工具权限：查询工具只读，禁止暴露写库工具给分析 Agent。",
              "审计：记录问题、SQL、指标版本、行数与耗时，支持回放。",
              "风险控制：LIMIT/扫描量/超时三重预算、应急熔断开关。",
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
              ["SQL 合法性", "执行准确率/语法通过率", "标注问题→SQL 集", "SQL 合法率"],
              ["口径正确性", "结果与标准答案比对", "指标评测集", "口径正确率"],
              ["安全性", "注入/越权/DML 用例", "对抗 SQL 集", "越权成功数 = 0"],
              ["澄清能力", "模糊时间范围问题", "边界问题集", "误假设率"],
              ["回归", "固定评测集 + CI", "定义/模型变更前后", "指标退化即阻断发布"],
              ["成本与延迟", "线上采样", "不同查询复杂度", "P95 耗时、扫描行数"],
            ],
          },
          {
            type: "paragraph",
            text: "回归以「问题—SQL—结果」三元组为断言，test_semantic.py 已覆盖 DML、多语句、越权表、注释绕过、权限注入与预算。把评测集接入 CI，语义定义或生成模型变更即触发回归，口径正确率退化则阻断发布。",
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
              "指标定义集中在语义层并版本化，报表与 Agent 共用。",
              "SQL 必须经 AST 级校验；黑名单与提示词约束不可作为安全边界。",
              "权限谓词在执行前注入，结果不做「事后过滤」。",
              "强制 LIMIT、扫描量与超时预算。",
              "模糊问题先澄清，不擅自假设时间范围。",
              "答案附口径说明与指标版本，支持复现。",
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
              ["同一问题两个答案", "指标口径不一致", "比对所用指标版本", "统一语义定义并升级版本", "口径回归测试"],
              ["越权数据返回", "权限谓词未注入", "审计日志查最终 SQL", "在执行前强制注入", "越权用例纳入门禁"],
              ["数仓被打满", "无 LIMIT/超时", "看扫描行数与耗时", "加预算与查询队列", "慢查询告警"],
              ["SQL 注入绕过", "黑名单校验", "复放对抗用例", "换成 AST 解析校验", "红队用例"],
              ["历史结果无法复现", "指标定义无版本", "查审计中 version 字段", "版本化并快照", "定义变更评审"],
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
              "相关教程：企业语义层、对话式数据分析 Agent、企业 RAG 端到端管线、AI-Ready 数据底座。",
              "相关架构：企业语义层架构、数据底座架构。",
              "相关实验：RAG 管线实验、架构设计器。",
              "相关企业案例：数据分析 Agent、IT Operations Agent（项目 A）。",
              "官方资料与社区实践见下方参考资料。",
            ],
          },
          {
            type: "callout",
            variant: "info",
            title: "资料核验说明",
            text: "指标定义与阈值为教学模拟，不代表任何行业口径标准。SQL 解析器与语义层产品版本未按官方文档逐项复核，标注为需进一步核验。",
          },
        ],
      },
      {
        id: "engineering-notes",
        heading: "16. 工程实现补遗：组件交互时序、故障演练与上线验收",
        blocks: [
          {
            type: "paragraph",
            text: "行级权限必须注入到 AST 而非拼接 SQL 字符串。字符串拼接可被 union、子查询或注释绕过；AST 注入才能确保租户谓词作用于目标表且不被后续变换移除。",
          },
          {
            type: "mermaid",
            title: "组件交互时序（含失败分支）",
            source: String.raw`sequenceDiagram
  participant U as 用户
  participant S as 语义层
  participant V as AST 校验器
  participant D as 只读库
  U->>S: 自然语言问题 + 口径版本
  S->>S: 解析 metric/dimension/时间范围
  alt 时间范围模糊
    S-->>U: 请求澄清，不生成 SQL
  else 口径明确
    S->>V: 候选 SQL + 租户策略
    V->>V: 白名单/LIMIT/行级权限注入
    alt 校验通过
      V->>D: 只读执行
      D-->>U: 结果 + 口径版本
    else 越权或超预算
      V-->>U: 拒绝并记录审计
    end
  end`,
            caption: "消息顺序、超时分支与降级路径；箭头方向即控制流方向。",
          },
          {
            type: "table",
            headers: ["组件交互契约", "传递内容", "超时/失败语义"],
            rows: [
              ["语义层 → AST 校验器","候选 SQL + metric + tenant","解析失败即拒绝，不修复后执行"],
              ["AST 校验器 → 只读库","受控 SQL + 行数上限","只读账号，禁止写语句"],
              ["只读库 → 用户","结果 + 口径版本","口径版本随结果一起审计"],
            ],
          },
          {
            type: "table",
            headers: ["类别", "可执行操作", "通过标准"],
            rows: [
              ["故障注入","注入 union 绕过租户谓词的 SQL","AST 校验拒绝"],
              ["故障注入","生成无 LIMIT 的全表扫描","预算守卫强制改写或拒绝"],
              ["上线验收","pytest -q test_semantic.py","校验、权限注入、预算用例通过"],
              ["上线验收","核对结果日志中的口径版本","每次查询可追溯到语义模型版本"],
            ],
          },
          {
            type: "paragraph",
            text: "落地替换点：语义模型接入企业指标平台并版本化，SQL 解析库按所选方言官方文档配置，只读账号与行级策略由 DBA 统一分配。口径变更需走评审与回放对比，不能直接改线上 YAML。",
          },
        ],
      },
    ],
    tags: ["Semantic Layer", "Text-to-SQL", "SQL 校验", "行级权限"],
    architectureIds: ["a11", "a10"],
    relatedTutorialIds: [
      "semantic-layer",
      "conversational-analytics",
      "ai-ready-data",
      "agent-guardrails",
      "agentops-overview",
    ],
    nextTutorialSlugs: ["conversational-analytics", "semantic-layer"],
    relatedLabSlugs: ["architecture-designer"],
    relatedCaseSlugs: ["data-analyst-agent", "it-operations-agent"],
    references: refs([
      {
        title: "PostgreSQL SELECT / 权限官方文档",
        url: "https://www.postgresql.org/docs/current/sql-select.html",
        organization: "PostgreSQL", kind: "官方产品文档",
        purpose: "只读查询语法与权限模型参考；具体版本需进一步核验",
        verifiedAt: "2026-11-13",
      },
      {
        title: "Building Effective Agents",
        url: "https://www.anthropic.com/research/building-effective-agents",
        organization: "Anthropic", kind: "官方产品文档",
        purpose: "确定性与模型决策混合编排的建议", verifiedAt: "2026-11-13",
      },
    ]),
    updatedAt: "2026-11-13",
    status: "published",
    qualityLevel: "L5",
  },
];
