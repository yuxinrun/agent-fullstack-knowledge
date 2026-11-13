import type { Metadata } from "next";
import { Suspense } from "react";
import { allTutorials, domains } from "@/content/tutorials";
import { TutorialsBrowser, type TutorialListItem } from "@/components/TutorialsBrowser";
import { Breadcrumb, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "全部教程",
  description: "企业级 Agent 全栈工程全部技术教程，可按知识领域筛选。",
};

export default function TutorialsPage() {
  const tutorialList: TutorialListItem[] = allTutorials.map((t) => ({
    id: t.id,
    slug: t.slug,
    title: t.title,
    summary: t.summary,
    difficulty: t.difficulty,
    estimatedMinutes: t.estimatedMinutes,
    tags: t.tags,
    status: t.status,
    domainId: t.domainId,
  }));

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "教程" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="教程中心"
          title="全部技术教程"
          description="覆盖 15 大知识领域的系统化教程。点击筛选查看具体领域。"
        />
      </div>

      <Suspense fallback={null}>
        <TutorialsBrowser tutorials={tutorialList} domains={domains} />
      </Suspense>
    </div>
  );
}
