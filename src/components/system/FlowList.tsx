import { Columns2, Diamond, Infinity as InfinityIcon } from 'lucide-react';
import { EchoChip, GhostNode, SkillNode } from './SkillNode';
import { focusFor } from './focus';
import { LANE_LABELS, Skill, map, parallelGroups, placementsFor } from './model';

interface FlowListProps {
  active: string | null;
  onSelect: (id: string) => void;
}

/** Phase-by-phase reading of the flow for narrow screens: no arrows, dependencies inline. */
const FlowList = ({ active, onSelect }: FlowListProps) => {
  const always = map.skills.filter((s) => s.phase === 'all');
  const alwaysMissing = map.missing_skills.filter((m) => m.phase === 'all');

  const node = (s: Skill) => (
    <SkillNode key={s.id} skill={s} focus={focusFor(s.id, active)} showLane showDeps onSelect={onSelect} />
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <InfinityIcon className="h-4 w-4 text-accent" />
          Винаги активни
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">Работят през всички фази.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {always.map(node)}
          {alwaysMissing.map((m) => (
            <GhostNode key={m.id} missing={m} onSelect={onSelect} />
          ))}
        </div>
      </section>

      <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-border">
        {map.phases.map((p, i) => {
          const starts = map.skills.filter((s) => s.phase !== 'all' && placementsFor(s.phase).some((pl) => !pl.echo && pl.start === i));
          const echoes = map.skills.filter((s) => placementsFor(s.phase).some((pl) => pl.echo && pl.start === i));
          const missing = map.missing_skills.filter((m) => m.phase === p.id);
          const groups = parallelGroups.filter((g) => g.every((id) => starts.some((s) => s.id === id)));
          const grouped = new Set(groups.flat());
          const rest = starts.filter((s) => !grouped.has(s.id));

          return (
            <li key={p.id} className="relative pl-10">
              <span
                aria-hidden
                className={
                  p.gate
                    ? 'absolute left-[5px] top-3 flex h-[21px] w-[21px] rotate-45 items-center justify-center rounded-[3px] bg-primary'
                    : 'absolute left-[6px] top-3 flex h-[19px] w-[19px] items-center justify-center rounded-full border-2 border-foreground/70 bg-background text-[9px] font-bold'
                }
              >
                {!p.gate && i + 1}
              </span>

              {p.gate ? (
                <div className="rounded-xl border-2 border-dashed border-primary/50 bg-primary/[0.04] p-3">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-primary">
                    <Diamond className="h-4 w-4 fill-primary" />
                    {p.name}
                  </div>
                  <p className="mt-1 text-xs leading-snug text-foreground/80">{p.criteria}</p>
                  {(starts.length > 0 || echoes.length > 0) && (
                    <div className="mt-3 grid gap-2">
                      {starts.map(node)}
                      {echoes.map((s) => (
                        <EchoChip key={s.id} skill={s} onSelect={onSelect} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="pt-2.5 text-base font-bold leading-tight">{p.name}</h3>
                  {p.note && <p className="mt-1 text-xs leading-snug text-muted-foreground">{p.note}</p>}
                  {p.parallel_lanes && (
                    <p className="mt-1.5 text-[11px] text-accent">
                      Паралелни линии: {p.parallel_lanes.map((l) => LANE_LABELS[l]).join(' · ')}
                    </p>
                  )}

                  <div className="mt-3 space-y-3">
                    {groups.map((g) => (
                      <div key={g.join()} className="rounded-xl border border-accent/30 bg-accent/[0.05] p-2">
                        <div className="mb-2 flex items-center gap-1 px-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                          <Columns2 className="h-3.5 w-3.5" />
                          Едновременно
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">{g.map((id) => node(starts.find((s) => s.id === id)!))}</div>
                      </div>
                    ))}
                    {rest.length > 0 && <div className="grid gap-2 sm:grid-cols-2">{rest.map(node)}</div>}
                    {echoes.map((s) => (
                      <EchoChip key={s.id} skill={s} onSelect={onSelect} />
                    ))}
                    {missing.map((m) => (
                      <GhostNode key={m.id} missing={m} onSelect={onSelect} />
                    ))}
                    {starts.length === 0 && echoes.length === 0 && missing.length === 0 && (
                      <p className="text-xs italic text-muted-foreground">Няма скил, който започва тук.</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export default FlowList;
