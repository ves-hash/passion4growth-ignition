import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Diamond } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EchoChip, GhostNode, SkillNode } from './SkillNode';
import { focusFor } from './focus';
import { LANES, LANE_LABELS, Placement, Skill, map, phaseIndex, placementsFor, skillById } from './model';

interface Block {
  key: string;
  start: number;
  end: number;
  skills: Skill[];
  echoes: Skill[];
  missing: typeof map.missing_skills;
  row: number;
}

const MISSING_LANE = '__missing';

const colWidth = (i: number) => {
  const p = map.phases[i];
  if (p.gate) return 196;
  if (p.id === 'phase1') return 416;
  if (p.id === 'launch') return 156;
  return 212;
};

/** Packs a lane's placements into sub-rows so spanning skills never overlap single-phase ones. */
const packLane = (lane: string): Block[] => {
  const byKey = new Map<string, Block>();
  const add = (pl: Placement, put: (b: Block) => void) => {
    const key = `${pl.start}-${pl.end}`;
    if (!byKey.has(key)) byKey.set(key, { key, start: pl.start, end: pl.end, skills: [], echoes: [], missing: [], row: 0 });
    put(byKey.get(key)!);
  };
  if (lane === MISSING_LANE) {
    map.missing_skills.forEach((m) => placementsFor(m.phase).forEach((pl) => add(pl, (b) => b.missing.push(m))));
  } else {
    map.skills
      .filter((s) => s.lane === lane)
      .forEach((s) => placementsFor(s.phase).forEach((pl) => add(pl, (b) => (pl.echo ? b.echoes : b.skills).push(s))));
  }
  const blocks = Array.from(byKey.values()).sort((a, b) => a.end - a.start - (b.end - b.start) || a.start - b.start);
  const rows: Block[][] = [];
  for (const b of blocks) {
    let r = rows.findIndex((row) => row.every((o) => b.end < o.start || b.start > o.end));
    if (r === -1) r = rows.push([]) - 1;
    rows[r].push(b);
    b.row = r;
  }
  return blocks;
};

interface Edge {
  from: string;
  to: string;
  d: string;
}

interface FlowGridProps {
  active: string | null;
  showArrows: boolean;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const FlowGrid = ({ active, showArrows, onSelect, onHover }: FlowGridProps) => {
  const lanes = useMemo(() => {
    let row = 2;
    return [...LANES, MISSING_LANE].map((lane) => {
      const blocks = packLane(lane);
      const rowCount = Math.max(1, ...blocks.map((b) => b.row + 1));
      const entry = { lane, blocks, rowStart: row, rowCount };
      row += rowCount;
      return entry;
    });
  }, []);

  const containerRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const base = el.getBoundingClientRect();
      const rect = (id: string) => {
        const n = el.querySelector<HTMLElement>(`[data-node="${id}"]`);
        if (!n) return null;
        const r = n.getBoundingClientRect();
        return { l: r.left - base.left, r: r.right - base.left, t: r.top - base.top, b: r.bottom - base.top };
      };
      const next: Edge[] = [];
      for (const s of map.skills) {
        for (const dep of s.depends_on) {
          const f = rect(dep);
          const t = rect(s.id);
          if (!f || !t) continue;
          let d: string;
          if (t.l >= f.r + 8) {
            const [x1, y1, x2, y2] = [f.r, (f.t + f.b) / 2, t.l, (t.t + t.b) / 2];
            const dx = Math.max(28, (x2 - x1) / 2);
            d = `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
          } else {
            const down = t.t >= f.b;
            const x1 = Math.min(f.r - 16, Math.max(f.l + 16, (t.l + t.r) / 2));
            const x2 = Math.min(t.r - 16, Math.max(t.l + 16, (f.l + f.r) / 2));
            const y1 = down ? f.b : f.t;
            const y2 = down ? t.t : t.b;
            const dy = Math.max(18, Math.abs(y2 - y1) / 2) * (down ? 1 : -1);
            d = `M${x1},${y1} C${x1},${y1 + dy} ${x2},${y2 - dy} ${x2},${y2}`;
          }
          next.push({ from: dep, to: s.id, d });
        }
      }
      setEdges(next);
      setSize({ w: el.scrollWidth, h: el.scrollHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, []);

  const template = `132px ${map.phases.map((_, i) => `${colWidth(i)}px`).join(' ')}`;
  const totalRows = lanes[lanes.length - 1].rowStart + lanes[lanes.length - 1].rowCount;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-soft">
      <div
        ref={containerRef}
        className="relative grid gap-x-0 gap-y-0"
        style={{ gridTemplateColumns: template }}
      >
        {/* Phase headers */}
        <div className="sticky left-0 z-30 border-b border-border bg-card" style={{ gridRow: 1, gridColumn: 1 }} />
        {map.phases.map((p, i) => (
          <div
            key={p.id}
            className={cn('border-b border-border px-3 pb-3 pt-4', p.gate ? 'bg-primary/[0.04]' : 'bg-card')}
            style={{ gridRow: 1, gridColumn: i + 2 }}
          >
            {p.gate ? (
              <>
                <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                  <Diamond className="h-4 w-4 fill-primary" />
                  {p.name}
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-foreground/75">{p.criteria}</p>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] font-semibold text-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-sm font-bold leading-tight text-foreground">{p.name}</span>
                </div>
                {p.note && <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{p.note}</p>}
                {p.parallel_lanes && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <span className="text-[10px] font-medium uppercase tracking-wide text-accent">паралелно:</span>
                    {p.parallel_lanes.map((l) => (
                      <span key={l} className="rounded bg-accent/10 px-1.5 text-[10px] font-medium text-accent">
                        {LANE_LABELS[l]}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {/* Lane labels and background cells */}
        {lanes.map(({ lane, rowStart, rowCount }) => (
          <div key={lane} className="contents">
            <div
              className={cn(
                'sticky left-0 z-30 flex items-start border-b border-r border-border bg-card px-3 py-3 text-xs font-semibold',
                lane === MISSING_LANE ? 'text-muted-foreground' : 'text-foreground'
              )}
              style={{ gridRow: `${rowStart} / span ${rowCount}`, gridColumn: 1 }}
            >
              {lane === MISSING_LANE ? 'Липсващи скилове' : LANE_LABELS[lane]}
            </div>
            {map.phases.map((p, i) => (
              <div
                key={p.id}
                aria-hidden
                className={cn(
                  'border-b border-border/70',
                  i < map.phases.length - 1 && 'border-r border-r-border/50',
                  p.gate && 'bg-primary/[0.03]',
                  p.parallel_lanes?.includes(lane) && 'bg-accent/[0.06]',
                  lane === MISSING_LANE && 'bg-secondary/40'
                )}
                style={{ gridRow: `${rowStart} / span ${rowCount}`, gridColumn: i + 2 }}
              />
            ))}
          </div>
        ))}

        {/* Gate rails */}
        {map.phases.map((p, i) =>
          p.gate ? (
            <div
              key={`rail-${p.id}`}
              aria-hidden
              className="pointer-events-none flex justify-center"
              style={{ gridRow: `2 / ${totalRows}`, gridColumn: i + 2 }}
            >
              <div className="w-0 border-l-2 border-dashed border-primary/40" />
            </div>
          ) : null
        )}

        {/* Arrows */}
        {showArrows && (
          <svg
            className="pointer-events-none absolute left-0 top-0 z-10"
            width={size.w}
            height={size.h}
            aria-hidden
          >
            <defs>
              <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--foreground) / 0.35)" />
              </marker>
              <marker id="arrow-hot" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 z" fill="hsl(var(--primary))" />
              </marker>
            </defs>
            {edges.map((e) => {
              const hot = active !== null && (e.from === active || e.to === active);
              const dim = active !== null && !hot && skillById.has(active);
              return (
                <path
                  key={`${e.from}>${e.to}`}
                  d={e.d}
                  fill="none"
                  stroke={hot ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.22)'}
                  strokeWidth={hot ? 2 : 1.25}
                  opacity={dim ? 0.25 : 1}
                  markerEnd={hot ? 'url(#arrow-hot)' : 'url(#arrow)'}
                  className="transition-all duration-200"
                />
              );
            })}
          </svg>
        )}

        {/* Nodes */}
        {lanes.map(({ lane, blocks, rowStart }) =>
          blocks.map((b) => {
            const wide = b.end > b.start;
            return (
              <div
                key={`${lane}-${b.key}`}
                className={cn('relative z-20 p-2', wide ? 'flex gap-2' : 'grid gap-2', !wide && b.start === phaseIndex.get('phase1') && 'grid-cols-2 content-start')}
                style={{ gridRow: rowStart + b.row, gridColumn: `${b.start + 2} / ${b.end + 3}` }}
              >
                {b.skills.map((s) => (
                  <SkillNode
                    key={s.id}
                    skill={s}
                    focus={focusFor(s.id, active)}
                    onSelect={onSelect}
                    onHover={onHover}
                    className={wide ? 'flex-1' : undefined}
                  />
                ))}
                {b.echoes.map((s) => (
                  <EchoChip key={`echo-${s.id}`} skill={s} onSelect={onSelect} />
                ))}
                {b.missing.map((m) => (
                  <GhostNode key={m.id} missing={m} onSelect={onSelect} className={wide ? 'flex-1' : undefined} />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default FlowGrid;
