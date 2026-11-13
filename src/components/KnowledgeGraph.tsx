"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildGraph, getTutorialBySlug } from "@/content/tutorials";
import type { GraphNode, GraphEdge } from "@/content/tutorials";
import { cn } from "@/lib/utils";

const WORLD_W = 1000;
const WORLD_H = 680;

const TYPE_COLOR: Record<GraphNode["type"], string> = {
  domain: "#38D6B0",
  architecture: "#5BC0EB",
  term: "#7C8CFF",
  lab: "#F0B86E",
  tool: "#C79BFF",
};
const TYPE_LABEL: Record<GraphNode["type"], string> = {
  domain: "领域",
  architecture: "架构",
  term: "术语",
  lab: "实验",
  tool: "工具",
};

interface Pos {
  x: number;
  y: number;
}

export default function KnowledgeGraph() {
  const { nodes, edges } = useMemo(() => buildGraph(), []);
  const [pos, setPos] = useState<Record<string, Pos>>({});
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; ox: number; oy: number } | null>(null);
  const pan = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // 一次性力导向布局
  useEffect(() => {
    const p: Record<string, Pos> = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      p[n.id] = {
        x: WORLD_W / 2 + Math.cos(angle) * 220 + (Math.random() - 0.5) * 60,
        y: WORLD_H / 2 + Math.sin(angle) * 160 + (Math.random() - 0.5) * 60,
      };
    });
    const k = 0.04;
    for (let step = 0; step < 320; step++) {
      const disp: Record<string, Pos> = {};
      nodes.forEach((n) => (disp[n.id] = { x: 0, y: 0 }));
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = p[a.id].x - p[b.id].x;
          let dy = p[a.id].y - p[b.id].y;
          let d2 = dx * dx + dy * dy + 0.01;
          const rep = 9000 / d2;
          const d = Math.sqrt(d2);
          dx /= d; dy /= d;
          disp[a.id].x += dx * rep; disp[a.id].y += dy * rep;
          disp[b.id].x -= dx * rep; disp[b.id].y -= dy * rep;
        }
      }
      edges.forEach((e) => {
        const A = p[e.source], B = p[e.target];
        if (!A || !B) return;
        let dx = B.x - A.x, dy = B.y - A.y;
        const d = Math.sqrt(dx * dx + dy * dy) + 0.01;
        const f = (d - 120) * 0.02;
        dx /= d; dy /= d;
        disp[e.source].x += dx * f; disp[e.source].y += dy * f;
        disp[e.target].x -= dx * f; disp[e.target].y -= dy * f;
      });
      nodes.forEach((n) => {
        const c = disp[n.id];
        p[n.id].x += Math.max(-30, Math.min(30, c.x * k * (320 - step))) + (WORLD_W / 2 - p[n.id].x) * 0.002;
        p[n.id].y += Math.max(-30, Math.min(30, c.y * k * (320 - step))) + (WORLD_H / 2 - p[n.id].y) * 0.002;
      });
    }
    setPos(p);
  }, [nodes]);

  const adjacency = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    nodes.forEach((n) => (map[n.id] = new Set()));
    edges.forEach((e) => {
      if (map[e.source]) map[e.source].add(e.target);
      if (map[e.target]) map[e.target].add(e.source);
    });
    return map;
  }, [nodes, edges]);

  const visibleNodes = nodes.filter((n) => filter.size === 0 || filter.has(n.type));
  const visibleIds = new Set(visibleNodes.map((n) => n.id));
  const visibleEdges = edges.filter((e) => visibleIds.has(e.source) && visibleIds.has(e.target));

  const neighbors = selected ? adjacency[selected] ?? new Set() : new Set<string>();

  const q = query.trim().toLowerCase();
  const matchIds = new Set(
    nodes.filter((n) => !q || n.label.toLowerCase().includes(q) || (n.detail ?? "").toLowerCase().includes(q)).map((n) => n.id)
  );

  function onNodeDown(e: React.PointerEvent, id: string) {
    e.stopPropagation();
    const rect = svgRef.current!.getBoundingClientRect();
    drag.current = {
      id,
      ox: (e.clientX - rect.left - tx) / scale,
      oy: (e.clientY - rect.top - ty) / scale,
    };
    setSelected(id);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (drag.current) {
      const rect = svgRef.current!.getBoundingClientRect();
      const nx = (e.clientX - rect.left - tx) / scale;
      const ny = (e.clientY - rect.top - ty) / scale;
      setPos((prev) => ({
        ...prev,
        [drag.current!.id]: {
          x: nx - (drag.current!.ox - pos[drag.current!.id].x),
          y: ny - (drag.current!.oy - pos[drag.current!.id].y),
        },
      }));
    } else if (pan.current) {
      setTx(pan.current.tx + (e.clientX - pan.current.x));
      setTy(pan.current.ty + (e.clientY - pan.current.y));
    }
  }
  function onUp() {
    drag.current = null;
    pan.current = null;
  }
  function onBgDown(e: React.PointerEvent) {
    pan.current = { x: e.clientX, y: e.clientY, tx, ty };
  }
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = -e.deltaY * 0.0015;
    setScale((s) => Math.max(0.4, Math.min(2.4, s * (1 + delta))));
  }

  const selectedNode = nodes.find((n) => n.id === selected) ?? null;
  const relatedTuts = selectedNode?.relatedTutorialSlugs ?? [];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-line p-3">
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(TYPE_COLOR) as GraphNode["type"][]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  setFilter((prev) => {
                    const n = new Set(prev);
                    if (n.has(t)) n.delete(t);
                    else n.add(t);
                    return n;
                  })
                }
                className={cn(
                  "rounded-pill border px-2.5 py-1 text-xs transition-colors",
                  filter.has(t)
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-line text-ink-muted hover:text-ink"
                )}
                style={filter.has(t) ? { borderColor: TYPE_COLOR[t], color: TYPE_COLOR[t] } : undefined}
              >
                {TYPE_LABEL[t]}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索节点…"
            className="ml-auto rounded-lg border border-line bg-surface px-3 py-1.5 text-sm text-ink outline-none focus:border-primary/60"
          />
          <div className="flex items-center gap-1">
            <button onClick={() => setScale((s) => Math.min(2.4, s + 0.15))} className="rounded-md border border-line px-2 py-1 text-sm text-ink-secondary">＋</button>
            <button onClick={() => setScale((s) => Math.max(0.4, s - 0.15))} className="rounded-md border border-line px-2 py-1 text-sm text-ink-secondary">－</button>
            <button onClick={() => { setScale(1); setTx(0); setTy(0); }} className="rounded-md border border-line px-2 py-1 text-xs text-ink-secondary">重置</button>
          </div>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WORLD_W} ${WORLD_H}`}
          className="h-[560px] w-full touch-none"
          onWheel={onWheel}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerDown={onBgDown}
          style={{ cursor: pan.current ? "grabbing" : "grab" }}
        >
          <g transform={`translate(${tx} ${ty}) scale(${scale})`}>
            {visibleEdges.map((e, i) => {
              const a = pos[e.source], b = pos[e.target];
              if (!a || !b) return null;
              const active = selected && (e.source === selected || e.target === selected);
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={active ? "var(--color-primary)" : "var(--color-border)"}
                  strokeWidth={active ? 2 : 1}
                  opacity={selected && !active ? 0.15 : 0.7}
                />
              );
            })}
            {visibleNodes.map((n) => {
              const p = pos[n.id];
              if (!p) return null;
              const isSel = selected === n.id;
              const isNeighbor = neighbors.has(n.id);
              const isMatch = q && matchIds.has(n.id);
              const dim = (selected && !isSel && !isNeighbor) || (q && !isMatch);
              const r = n.type === "domain" ? 13 : 9;
              return (
                <g
                  key={n.id}
                  transform={`translate(${p.x} ${p.y})`}
                  onPointerDown={(e) => onNodeDown(e, n.id)}
                  style={{ cursor: "pointer", opacity: dim ? 0.25 : 1 }}
                >
                  <circle
                    r={r}
                    fill="var(--color-surface)"
                    stroke={TYPE_COLOR[n.type]}
                    strokeWidth={isSel ? 3 : 2}
                  />
                  <circle r={4} fill={TYPE_COLOR[n.type]} />
                  <text
                    x={0}
                    y={r + 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill={isSel ? "var(--color-primary)" : "var(--color-text-muted)"}
                  >
                    {n.label.length > 10 ? n.label.slice(0, 10) + "…" : n.label}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        <div className="border-t border-line p-2 text-center text-xs text-ink-muted">
          拖动节点移动 · 滚轮缩放 · 拖拽空白处平移 · 点击节点查看详情
        </div>
      </div>

      {/* 详情面板 */}
      <div className="card h-fit p-4">
        {selectedNode ? (
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-pill px-2 py-0.5 text-xs" style={{ backgroundColor: `${TYPE_COLOR[selectedNode.type]}1f`, color: TYPE_COLOR[selectedNode.type] }}>
                {TYPE_LABEL[selectedNode.type]}
              </span>
            </div>
            <h3 className="mt-2 text-lg font-semibold text-ink">{selectedNode.label}</h3>
            <p className="mt-2 text-sm text-ink-secondary">{selectedNode.detail}</p>
            {relatedTuts.length > 0 && (
              <div className="mt-4">
                <div className="mb-2 text-xs font-semibold uppercase text-ink-muted">关联教程</div>
                <div className="space-y-1.5">
                  {relatedTuts.map((s) => (
                    <TutLink key={s} slug={s} />
                  ))}
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="mt-4 text-xs text-ink-muted hover:text-ink"
            >
              清除选择
            </button>
          </div>
        ) : (
          <div className="text-sm text-ink-muted">
            <div className="mb-3 font-semibold text-ink">图例</div>
            {(Object.keys(TYPE_COLOR) as GraphNode["type"][]).map((t) => (
              <div key={t} className="mb-1.5 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: TYPE_COLOR[t] }} />
                {TYPE_LABEL[t]}
              </div>
            ))}
            <p className="mt-4">点击任意节点查看详情与关联教程。</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TutLink({ slug }: { slug: string }) {
  const t = getTutorialBySlug(slug);
  if (!t) return null;
  return (
    <Link href={`/tutorials/${slug}`} className="block rounded-lg border border-line bg-surface/40 px-3 py-2 text-sm text-ink-secondary hover:border-primary/40 hover:text-primary">
      {t.title}
    </Link>
  );
}
