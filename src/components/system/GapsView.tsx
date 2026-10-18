import { CircleDashed, FileClock, Plug } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GhostNode, SkillNode } from './SkillNode';
import { INTEGRATION_STATUS, map, phaseLabel } from './model';

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 } as const;

interface GapsViewProps {
  onSelect: (id: string) => void;
}

const Section = ({ icon: Icon, title, hint, children }: { icon: typeof Plug; title: string; hint: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
    <h3 className="flex items-center gap-2 text-lg font-bold">
      <Icon className="h-5 w-5 text-primary" />
      {title}
    </h3>
    <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    <div className="mt-4">{children}</div>
  </section>
);

const GapsView = ({ onSelect }: GapsViewProps) => {
  const proposed = map.skills.filter((s) => s.status === 'proposed');
  const missing = [...map.missing_skills].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  const undecided = map.integrations.filter((i) => i.status === 'undecided');
  const notConfirmed = map.integrations.filter((i) => i.status === 'proposed' || i.status === 'recommended');

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section icon={CircleDashed} title={`Липсващи скилове (${missing.length})`} hint="Стъпки без скил. Подредени по приоритет.">
        <div className="grid gap-2 sm:grid-cols-2">
          {missing.map((m) => (
            <GhostNode key={m.id} missing={m} showPhase={phaseLabel(m.phase)} onSelect={onSelect} />
          ))}
        </div>
      </Section>

      <Section icon={FileClock} title={`Предложени скилове (${proposed.length})`} hint="Описани са, но не са запазени в акаунта.">
        <div className="grid gap-2 sm:grid-cols-2">
          {proposed.map((s) => (
            <SkillNode key={s.id} skill={s} showLane onSelect={onSelect} />
          ))}
        </div>
      </Section>

      <Section icon={Plug} title={`Нерешени интеграции (${undecided.length})`} hint="Скиловете, които зависят от тях, нямат избран доставчик.">
        <ul className="space-y-2">
          {undecided.map((i) => {
            const users = map.skills.filter((s) => s.tools.some((t) => t.toLowerCase().includes(i.name.split(/[ /]/)[0].toLowerCase())));
            return (
              <li key={i.name} className="rounded-lg border-[1.5px] border-dashed border-rose-300 bg-rose-50/50 p-3">
                <p className="text-sm font-semibold">{i.name}</p>
                <p className="text-xs text-muted-foreground">{i.purpose}</p>
                {users.length > 0 && (
                  <p className="mt-2 flex flex-wrap items-center gap-1 text-xs">
                    <span className="text-muted-foreground">Засяга:</span>
                    {users.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onSelect(s.id)}
                        className="rounded bg-background px-1.5 py-0.5 font-medium text-foreground underline-offset-2 hover:underline"
                      >
                        {s.id}
                      </button>
                    ))}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {notConfirmed.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground">Още непотвърдени:</p>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {notConfirmed.map((i) => (
                <li key={i.name} className={cn('rounded-full border px-2 py-0.5 text-xs', INTEGRATION_STATUS[i.status]?.className)}>
                  {i.name} · {INTEGRATION_STATUS[i.status]?.label ?? i.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section icon={CircleDashed} title="Други налични скилове" hint="Съществуват в акаунта, но не са в картата на системата.">
        <ul className="flex flex-wrap gap-1.5">
          {map.existing_user_skills.map((id) => (
            <li key={id} className="rounded-md border border-border bg-secondary px-2 py-1 text-xs font-medium">
              {id}
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};

export default GapsView;
