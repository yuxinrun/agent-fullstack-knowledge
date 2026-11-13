"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, Search, BookOpenCheck, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProgress } from "./ProgressProvider";

const NAV = [
  { label: "首页", href: "/" },
  { label: "知识领域", href: "/domains" },
  { label: "学习路径", href: "/learning-paths" },
  { label: "架构中心", href: "/architecture" },
  { label: "实验室", href: "/labs" },
  { label: "工具箱", href: "/tools" },
  { label: "企业案例", href: "/case-studies" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { completedCount } = useProgress();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur supports-[backdrop-filter]:bg-bg/70">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Hexagon size={18} />
          </span>
          <span className="hidden text-[15px] text-ink sm:block">
            企业级 Agent 全栈工程知识中心
          </span>
          <span className="text-[15px] text-ink sm:hidden">Agent 知识中心</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(n.href)
                  ? "text-primary"
                  : "text-ink-secondary hover:text-ink"
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            aria-label="全站搜索"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary hover:text-ink"
          >
            <Search size={17} />
          </Link>
          <Link
            href="/progress"
            className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink-secondary hover:text-ink sm:flex"
          >
            <BookOpenCheck size={16} />
            <span>{completedCount} 已学</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary lg:hidden"
            aria-label="菜单"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-bg lg:hidden">
          <nav className="container-page flex flex-col py-2">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 text-sm",
                  isActive(n.href) ? "text-primary" : "text-ink-secondary"
                )}
              >
                {n.label}
              </Link>
            ))}
            <Link
              href="/progress"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm text-ink-secondary"
            >
              学习进度（{completedCount} 已学）
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
