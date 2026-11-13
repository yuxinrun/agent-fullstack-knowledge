import type { Metadata } from "next";
import { caseStudies } from "@/content/tutorials";
import { CaseCard } from "@/components/cards";
import { Breadcrumb, SectionHeading, Badge } from "@/components/ui";

export const metadata: Metadata = {
  title: "企业案例",
  description: "贯穿多知识领域的企业 AI 落地案例，均标注案例类型。",
};

export default function CaseStudiesPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "企业案例" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="企业案例"
          title="企业 AI 落地案例"
          description="案例均明确标注类型：模拟教学案例、参考案例、公开案例或真实案例。无客户授权不声称真实客户项目。"
        />
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {Array.from(new Set(caseStudies.map((c) => c.industry))).map((ind) => (
          <Badge key={ind} color="#7C8CFF">
            {ind}
          </Badge>
        ))}
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {caseStudies.map((c) => (
          <CaseCard key={c.id} item={c} />
        ))}
      </div>
    </div>
  );
}
