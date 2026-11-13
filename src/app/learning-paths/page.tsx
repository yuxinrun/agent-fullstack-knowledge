import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "lucide-react";
import { learningPaths } from "@/content/tutorials";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "学习路径",
  description: "按角色与目标组织的企业 Agent 工程学习路线。",
};

export default function LearningPathsPage() {
  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "学习路径" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="学习路径"
          title="四条主线，循序渐进"
          description="按角色与目标选择学习路径，每路径标注阶段、顺序与预计学习时间。"
        />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {learningPaths.map((p) => (
          <Link key={p.id} href={`/learning-paths/${p.slug}`} className="card card-hover flex flex-col p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
                <Compass size={20} />
              </span>
              <div>
                <h3 className="font-semibold text-ink">{p.title}</h3>
                <div className="text-xs text-ink-muted">面向：{p.audience}</div>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-ink-secondary">{p.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-ink-muted">
              <span>{p.steps.length} 个阶段</span>
              <span>约 {p.estimatedHours} 小时</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
