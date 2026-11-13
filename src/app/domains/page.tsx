import type { Metadata } from "next";
import { domains } from "@/content/tutorials";
import { DomainCard } from "@/components/cards";
import { SectionHeading, Breadcrumb } from "@/components/ui";

export const metadata: Metadata = {
  title: "全部知识领域",
  description: "15 大企业 AI 与 Agent 核心技术领域，覆盖工程、架构、运维、安全与落地。",
};

export default function DomainsPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "知识领域" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="知识领域"
          title="15 大企业 AI 与 Agent 核心技术领域"
          description="每个领域拥有独立的领域首页、知识目录、详细教程、架构说明、实践内容与相关推荐，领域之间通过知识关系相互连接。"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => (
          <DomainCard key={d.id} domain={d} />
        ))}
      </div>
    </div>
  );
}
