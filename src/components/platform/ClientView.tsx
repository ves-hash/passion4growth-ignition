import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, Cog, Diamond, ExternalLink } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { DEMO_CLIENTS, GATE_CHECKS } from '@/data/platform-demo';
import { LANE_LABELS, map, phaseIndex } from '@/components/system/model';
import PhaseStepper from './PhaseStepper';
import TaskCard from './TaskCard';
import { tasksFor, tasksInPhase } from './tasks';

interface ClientViewProps {
  clientId: string;
  onBack: () => void;
}

const ClientView = ({ clientId, onBack }: ClientViewProps) => {
  const client = DEMO_CLIENTS.find((c) => c.id === clientId) ?? DEMO_CLIENTS[0];
  const [picked, setPicked] = useState(client.phase);
  const [showSkills, setShowSkills] = useState(false);
  const phase = map.phases.find((p) => p.id === picked)!;
  const tasks = tasksInPhase(client, picked);
  const always = tasksFor(client).filter((t) => t.skill.phase === 'all');
  const lanes = Array.from(new Set(tasks.map((t) => t.skill.lane)));
  const rel = (phaseIndex.get(picked) ?? 0) - (phaseIndex.get(client.phase) ?? 0);
  const openSkill = (id: string) => window.open(`/system?skill=${id}`, '_blank');

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Всички клиенти
      </button>
      <a
        href={`/portal?client=${client.id}`}
        target="_blank"
        rel="noreferrer"
        className="float-right inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
      >
        Виж като клиента <ExternalLink className="h-3.5 w-3.5" />
      </a>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">{client.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {client.niche} · {client.countries.join(', ')} · води {client.lead}
          </p>
        </div>
        {client.metrics && (
          <dl className="grid grid-cols-3 gap-2">
            {client.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
                <dd className="text-xl font-bold tabular-nums">{m.value}</dd>
                <dt className="text-[11px] text-muted-foreground">{m.label}</dt>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card px-4 pb-4 pt-5 shadow-sm">
        <PhaseStepper phase={client.phase} large picked={picked} onPick={setPicked} />
      </div>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {rel === 0 ? 'Текуща фаза' : rel < 0 ? 'Минала фаза' : 'Предстои'}
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold">
              {phase.gate && <Diamond className="h-5 w-5 fill-primary text-primary" />}
              {phase.name}
            </h2>
            {phase.note && <p className="mt-1 text-sm text-muted-foreground">{phase.note}</p>}
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-lg bg-secondary px-3 py-2 text-sm">
            <Cog className="h-4 w-4 text-muted-foreground" />
            Под капака
            <Switch checked={showSkills} onCheckedChange={setShowSkills} />
          </label>
        </div>

        {phase.gate && GATE_CHECKS[phase.id] && (
          <ul className="mt-5 space-y-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/[0.03] p-4">
            {GATE_CHECKS[phase.id].map((c, i) => {
              const ok = client.gateDone[phase.id]?.[i];
              return (
                <li key={c} className="flex items-start gap-2 text-sm">
                  {ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
                  <span className={cn(ok && 'text-muted-foreground line-through')}>{c}</span>
                </li>
              );
            })}
          </ul>
        )}

        {tasks.length === 0 && !phase.gate && (
          <p className="mt-5 rounded-xl border border-dashed border-border p-5 text-sm text-muted-foreground">
            В тази фаза няма отделни задачи; работят постоянните процеси по-долу.
          </p>
        )}

        {lanes.length > 0 && (
          <div className={cn('mt-5 grid gap-4', lanes.length > 1 && 'md:grid-cols-2', lanes.length > 2 && 'xl:grid-cols-4')}>
            {lanes.map((lane) => (
              <div key={lane}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{LANE_LABELS[lane]}</p>
                <div className="space-y-2">
                  {tasks
                    .filter((t) => t.skill.lane === lane)
                    .map((t) => (
                      <TaskCard key={t.skill.id} task={t} showSkills={showSkills} onOpenSkill={openSkill} />
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {lanes.length > 1 && <p className="mt-4 text-xs text-muted-foreground">Тези потоци текат паралелно.</p>}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Постоянни процеси</h2>
        <div className="grid gap-2 sm:grid-cols-3">
          {always.map((t) => (
            <TaskCard key={t.skill.id} task={t} showSkills={showSkills} onOpenSkill={openSkill} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default ClientView;
