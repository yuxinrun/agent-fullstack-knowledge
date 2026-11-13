import type { Metadata } from "next";
import { tools } from "@/content/tutorials";
import { ToolCard } from "@/components/cards";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "工程工具箱",
  description: "架构选型、RAG 成本估算、安全与上线清单等实用工程工具。",
};

export default function ToolsPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "工具箱" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="工程工具箱"
          title="选型与评估工具"
          description="清晰的输入、合理的默认值、实时计算与可复制结果。动态数据（价格、版本等）均以可维护配置管理并标注来源。"
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </div>
  );
}
