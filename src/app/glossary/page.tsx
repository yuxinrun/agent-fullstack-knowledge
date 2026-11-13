import type { Metadata } from "next";
import { glossary, getTutorialBySlug } from "@/content/tutorials";
import { Breadcrumb, SectionHeading, Badge, Callout } from "@/components/ui";

export const metadata: Metadata = {
  title: "技术术语库",
  description: "企业 AI 与 Agent 核心术语库，含易混淆概念辨析与关联教程。",
};

export default function GlossaryPage() {
  const categories = Array.from(new Set(glossary.map((g) => g.category)));

  return (
    <div className="container-page py-10">
      <Breadcrumb items={[{ label: "首页", href: "/" }, { label: "术语库" }]} />
      <div className="mt-6">
        <SectionHeading
          eyebrow="术语库"
          title="企业 AI 与 Agent 核心术语"
          description="每个术语含定义、用途、相关概念与关联教程；对易混淆概念提供明确辨析。"
        />
      </div>

      <div className="space-y-10">
        {categories.map((cat) => (
          <section key={cat}>
            <h2 className="mb-4 text-xl font-bold text-primary">{cat}</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {glossary
                .filter((g) => g.category === cat)
                .map((g) => {
                  const tuts = g.relatedTutorialSlugs
                    .map((s) => getTutorialBySlug(s))
                    .filter(Boolean);
                  return (
                    <div key={g.id} id={g.id} className="card scroll-mt-24 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-lg font-semibold text-ink">{g.term}</h3>
                          <div className="text-xs text-ink-muted">{g.englishTerm}</div>
                        </div>
                        <Badge color="#7C8CFF">{g.category}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-ink-secondary">{g.definition}</p>
                      {g.howItWorks && (
                        <p className="mt-2 text-sm text-ink-muted">原理：{g.howItWorks}</p>
                      )}
                      {g.distinguishes && (
                        <Callout variant="tip" title="辨析">
                          {g.distinguishes}
                        </Callout>
                      )}
                      {g.relatedTerms.length > 0 && (
                        <div className="mt-3 text-sm text-ink-muted">
                          相关概念：{g.relatedTerms.join("、")}
                        </div>
                      )}
                      {tuts.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tuts.map(
                            (t) =>
                              t && (
                                <a
                                  key={t.id}
                                  href={`/tutorials/${t.slug}`}
                                  className="rounded-pill border border-line bg-surface-2 px-2 py-0.5 text-xs text-ink-muted hover:text-primary"
                                >
                                  {t.title}
                                </a>
                              )
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
