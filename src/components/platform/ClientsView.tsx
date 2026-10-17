import { ChevronRight } from 'lucide-react';
import { DEMO_CLIENTS } from '@/data/platform-demo';
import { map } from '@/components/system/model';
import PhaseStepper from './PhaseStepper';
import { blockedFor, waitingFor } from './tasks';

interface ClientsViewProps {
  onOpenClient: (id: string) => void;
}

const ClientsView = ({ onOpenClient }: ClientsViewProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold sm:text-4xl">Клиенти</h1>
      <p className="mt-2 text-muted-foreground">Всеки клиент минава през едни и същи 8 фази. Ромбовете са гейтовете с одобрение.</p>
    </div>
    <ul className="grid gap-3 lg:grid-cols-2">
      {DEMO_CLIENTS.map((c) => {
        const phase = map.phases.find((p) => p.id === c.phase)!;
        const waiting = waitingFor(c).length;
        const blocked = blockedFor(c).length;
        return (
          <li key={c.id}>
            <button
              type="button"
              onClick={() => onOpenClient(c.id)}
              className="group w-full rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-lg font-bold">{c.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {c.niche} · {c.countries.join(', ')} · води {c.lead}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4">
                <PhaseStepper phase={c.phase} />
                <p className="mt-2 text-sm font-medium text-primary">{phase.name}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {waiting > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{waiting} чакат решение</span>}
                {blocked > 0 && <span className="rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-800">{blocked} блокирани</span>}
                {waiting === 0 && blocked === 0 && <span className="rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-800">върви само</span>}
              </div>
              {c.metrics && (
                <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4">
                  {c.metrics.map((m) => (
                    <div key={m.label}>
                      <dd className="text-lg font-bold tabular-nums">{m.value}</dd>
                      <dt className="text-[11px] text-muted-foreground">{m.label}</dt>
                    </div>
                  ))}
                </dl>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

export default ClientsView;
