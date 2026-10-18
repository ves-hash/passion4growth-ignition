import { GhostNode, SkillNode } from './SkillNode';
import { focusFor } from './focus';
import { OWNER_STYLES, Owner, map, phaseLabel, placementsFor } from './model';

const COLUMNS: { title: string; owners: Owner[] }[] = [
  { title: 'Claude', owners: ['claude'] },
  { title: 'Споделени', owners: ['claude+hermes', 'hermes+claude'] },
  { title: 'Hermes', owners: ['hermes'] },
];

const order = (phase: string) => {
  const pl = placementsFor(phase)[0];
  return phase === 'all' ? -1 : pl.start + (pl.end - pl.start) / 10;
};

interface OwnerViewProps {
  active: string | null;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
}

const OwnerView = ({ active, onSelect, onHover }: OwnerViewProps) => (
  <div className="grid gap-4 lg:grid-cols-3">
    {COLUMNS.map((col) => {
      const count = map.skills.filter((s) => col.owners.includes(s.owner)).length;
      return (
        <section key={col.title} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <header className="flex items-baseline justify-between gap-2 border-b border-border pb-3">
            <h3 className="text-lg font-bold">{col.title}</h3>
            <span className="text-xs text-muted-foreground">{count} скила</span>
          </header>
          <div className="mt-3 space-y-5">
            {col.owners.map((owner) => {
              const skills = map.skills.filter((s) => s.owner === owner).sort((a, b) => order(a.phase) - order(b.phase));
              const missing = map.missing_skills.filter((m) => m.owner === owner);
              if (!skills.length && !missing.length) return null;
              const meaning = map.owners[owner];
              return (
                <div key={owner}>
                  <div className="mb-2 flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: OWNER_STYLES[owner].color }} />
                    <div>
                      <p className="text-sm font-semibold">{OWNER_STYLES[owner].label}</p>
                      {meaning && <p className="text-xs text-muted-foreground">{meaning}</p>}
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {skills.map((s) => (
                      <li key={s.id}>
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{phaseLabel(s.phase)}</p>
                        <SkillNode skill={s} focus={focusFor(s.id, active)} showLane onSelect={onSelect} onHover={onHover} />
                      </li>
                    ))}
                    {missing.map((m) => (
                      <li key={m.id}>
                        <GhostNode missing={m} showPhase={phaseLabel(m.phase)} onSelect={onSelect} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      );
    })}
  </div>
);

export default OwnerView;
