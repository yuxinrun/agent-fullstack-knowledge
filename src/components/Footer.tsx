import Link from "next/link";
import { domains } from "@/content/tutorials";
import { Hexagon } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-bg-secondary/60">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2 font-semibold text-ink">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <Hexagon size={18} />
            </span>
            企业级 Agent 全栈工程知识中心
          </div>
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            面向企业 AI 工程师、Agent 开发工程师与 AI 架构师的系统化技术学习平台。
            从 Agent 架构、Multi-Agent、MCP、RAG 到 AgentOps、安全治理与企业级部署，
            在一个知识中心完成企业 AI 工程体系学习。
          </p>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-ink">知识领域</div>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            {domains.slice(0, 8).map((d) => (
              <li key={d.id}>
                <Link href={`/domains/${d.slug}`} className="hover:text-primary">
                  {d.index.toString().padStart(2, "0")} {d.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-ink">站点导航</div>
          <ul className="space-y-1.5 text-sm text-ink-muted">
            <li><Link href="/domains" className="hover:text-primary">全部知识领域</Link></li>
            <li><Link href="/learning-paths" className="hover:text-primary">学习路径</Link></li>
            <li><Link href="/architecture" className="hover:text-primary">架构知识中心</Link></li>
            <li><Link href="/labs" className="hover:text-primary">交互实验室</Link></li>
            <li><Link href="/tools" className="hover:text-primary">工程工具箱</Link></li>
            <li><Link href="/glossary" className="hover:text-primary">技术术语库</Link></li>
            <li><Link href="/knowledge-graph" className="hover:text-primary">知识关系图谱</Link></li>
            <li><Link href="/about" className="hover:text-primary">关于知识中心</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <div>© {year} 企业级 Agent 全栈工程知识中心 · 内容仅供学习参考</div>
          <div className="max-w-2xl">
            免责声明：本站内容由 AI 辅助整理，部分案例为<strong className="text-ink-secondary">模拟教学案例</strong>，
            技术参数请以官方文档为准；未获得客户授权不声称真实客户项目。
          </div>
        </div>
      </div>
    </footer>
  );
}
