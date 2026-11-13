import type { Metadata } from "next";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "关于知识中心",
  description: "企业级 Agent 全栈工程知识中心的定位、内容范围与免责声明。",
};

export default function AboutPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "关于" }]} />
      <div className="mt-6 max-w-3xl">
        <SectionHeading eyebrow="关于" title="企业级 Agent 全栈工程知识中心" />
        <div className="prose-content">
          <p>
            本知识中心面向企业 AI 工程师、Agent 开发工程师、AI 架构师、技术负责人与数字化转型团队，
            提供从 Agent 架构、Multi-Agent、MCP、RAG 到 AgentOps、安全治理与企业级部署的系统化技术学习平台。
          </p>
          <h2>内容范围</h2>
          <p>
            网站聚合 15 大企业 AI 与 Agent 核心技术领域，提供教程、技术原理、架构设计、工程实践、
            代码示例、交互实验、选型工具和企业落地案例。所有内容采用结构化数据管理，便于持续扩展。
          </p>
          <h2>设计原则</h2>
          <ul>
            <li>内容深度优先：每个主题覆盖是什么、为什么、原理、架构、实现与最佳实践。</li>
            <li>从理论到工程：概念 → 原理 → 架构 → 实现 → 实践 → 案例 → 部署。</li>
            <li>知识体系完整：15 个领域通过知识关系相互连接，而非彼此孤立。</li>
            <li>工程师可动手：代码示例、架构图、交互实验与选型工具。</li>
          </ul>
          <h2>技术栈</h2>
          <p>
            前端基于 Next.js、React、TypeScript 与 Tailwind CSS；图表采用 Mermaid；
            交互实验与工具为客户端组件。内容与 UI 分离，便于维护与扩展。
          </p>
          <h2>免责声明</h2>
          <CalloutLocal />
          <ul>
            <li>内容由 AI 辅助整理，技术参数请以官方文档为准，部分内容标注"待核实"。</li>
            <li>案例明确标注类型（模拟教学 / 参考 / 公开 / 真实），无客户授权不声称真实客户项目。</li>
            <li>未接入用户认证前，学习进度仅保存在本地浏览器，不具备云端同步能力。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CalloutLocal() {
  return (
    <div className="my-4 rounded-lg border-l-4 border-[#F0B86E] bg-[rgba(240,184,110,0.08)] p-4 text-sm text-ink-secondary">
      本站为教学与学习用途的技术知识站点；不提供投资、医疗等专业性保证，生产环境请结合官方文档与合规要求。
    </div>
  );
}
