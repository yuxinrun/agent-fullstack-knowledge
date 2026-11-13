import type { Metadata } from "next";
import { architectures, domains } from "@/content/tutorials";
import { ArchitectureCard } from "@/components/cards";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "架构知识中心",
  description: "企业级 Agent 系统核心架构集中展示，含可维护的 Mermaid 图表与组件解析。",
};

export default function ArchitecturePage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "架构中心" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="架构中心"
          title="企业 Agent 核心架构"
          description="所有核心架构集中展示与学习入口。每篇含架构目标、适用场景、组件说明、数据流、技术选型、部署方式与安全考虑。架构图以可维护的 Mermaid 源码保存，支持放大与复制。"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {architectures.map((a) => (
          <ArchitectureCard key={a.id} arch={a} />
        ))}
      </div>
    </div>
  );
}
