import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CalendarCheck, Check, CheckCircle2, Circle, Clock, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CLIENT_STAGES, DEMO_CLIENTS, PORTAL, PortalAction } from '@/data/platform-demo';

const ActionCard = ({ action, done, onDone }: { action: PortalAction; done: boolean; onDone: (msg: string) => void }) => {
  const [picked, setPicked] = useState<string[]>([]);
  return (
    <li className={cn('rounded-2xl border bg-card p-5 shadow-sm transition-opacity', done ? 'border-emerald-200 opacity-70' : 'border-primary/30')}>
      <div className="flex items-start gap-3">
        {done ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{action.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{action.why}</p>

          {!done && action.kind === 'choose' && action.options && (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {action.options.map((o) => {
                const on = picked.includes(o);
                return (
                  <button
                    key={o}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPicked(on ? picked.filter((x) => x !== o) : [...picked, o])}
                    className={cn(
                      'flex items-start gap-2 rounded-xl border p-3 text-left text-sm transition-colors',
                      on ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                    )}
                  >
                    <span className={cn('mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-primary bg-primary text-white' : 'border-foreground/30')}>
                      {on && <Check className="h-3 w-3" />}
                    </span>
                    {o}
                  </button>
                );
              })}
            </div>
          )}

          {!done && (
            <div className="mt-4 flex flex-wrap gap-2">
              {action.kind === 'upload' && (
                <Button variant="primary" onClick={() => onDone('Файлът е получен')}>
                  <Upload /> Качи файл
                </Button>
              )}
              {action.kind === 'approve' && (
                <>
                  <Button variant="primary" onClick={() => onDone('Одобрено')}>
                    <Check /> Одобрявам
                  </Button>
                  <Button variant="secondary" onClick={() => toast('Ще се свържем с вас за корекциите.')}>
                    Искам промени
                  </Button>
                </>
              )}
              {action.kind === 'choose' && (
                <Button variant="primary" disabled={picked.length === 0} onClick={() => onDone(`Избрахте ${picked.length} оферти`)}>
                  <Check /> Потвърди избора
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
};

const Portal = () => {
  const [params, setParams] = useSearchParams();
  const client = DEMO_CLIENTS.find((c) => c.id === params.get('client')) ?? DEMO_CLIENTS[2];
  const data = PORTAL[client.id];
  const [done, setDone] = useState<Set<string>>(new Set());
  const stageAt = CLIENT_STAGES.findIndex((s) => s.phases.includes(client.phase));
  const open = data.actions.filter((a) => !done.has(a.id)).length;

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `${client.name} · Passion4Growth`;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, [client.name]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/70 to-background">
      <div className="bg-accent/10 px-4 py-1.5 text-center text-xs text-accent">
        Прототип на клиентския портал с примерни данни.{' '}
        <span className="inline-flex flex-wrap justify-center gap-x-2.5 gap-y-1">
          Виж като:
          {DEMO_CLIENTS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setParams({ client: c.id });
                setDone(new Set());
              }}
              className={cn('underline-offset-2 hover:underline', c.id === client.id && 'font-semibold underline')}
            >
              {c.name.replace('Демо · ', '')}
            </button>
          ))}
        </span>
      </div>

      <header className="border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">P4G</span>
            <span className="hidden font-bold sm:inline">Passion4Growth</span>
          </span>
          <span className="truncate text-sm font-medium text-muted-foreground">{client.name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-8 px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Седмичен отчет · {data.period}</p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">{CLIENT_STAGES[stageAt].name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{data.summary}</p>
          <p className="mt-3 text-sm text-muted-foreground">Води вашата кампания: {client.lead}, Passion4Growth</p>
        </section>

        {/* Journey */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <ol className="grid gap-4 sm:grid-cols-5 sm:gap-2">
            {CLIENT_STAGES.map((s, i) => {
              const state = i < stageAt ? 'done' : i === stageAt ? 'now' : 'next';
              return (
                <li key={s.id} className="flex gap-3 sm:flex-col sm:gap-2">
                  <div className="flex items-center sm:w-full">
                    <span
                      className={cn(
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                        state === 'done' && 'bg-foreground text-background',
                        state === 'now' && 'bg-primary text-white ring-4 ring-primary/20',
                        state === 'next' && 'border-2 border-foreground/20 text-muted-foreground'
                      )}
                    >
                      {state === 'done' ? <Check className="h-4 w-4" /> : i + 1}
                    </span>
                    {i < CLIENT_STAGES.length - 1 && (
                      <span className={cn('ml-2 hidden h-0.5 flex-1 sm:block', i < stageAt ? 'bg-foreground' : 'bg-foreground/15')} />
                    )}
                  </div>
                  <div>
                    <p className={cn('text-sm font-semibold', state === 'now' && 'text-primary', state === 'next' && 'text-muted-foreground')}>{s.name}</p>
                    <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{s.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* What we need */}
        <section>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            Какво ни трябва от вас
            {open > 0 && <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">{open}</span>}
          </h2>
          {data.actions.length === 0 ? (
            <p className="mt-3 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Тази седмица нищо. Работим по следващите стъпки.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {data.actions.map((a) => (
                <ActionCard
                  key={a.id}
                  action={a}
                  done={done.has(a.id)}
                  onDone={(msg) => {
                    setDone(new Set(done).add(a.id));
                    toast.success(msg, { description: 'Благодарим! Екипът продължава.' });
                  }}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Results */}
        <section>
          <h2 className="text-xl font-bold">Резултати</h2>
          {data.results ? (
            <dl className="mt-3 grid gap-3 sm:grid-cols-3">
              {data.results.map((r) => (
                <div key={r.label} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <dt className="text-sm text-muted-foreground">{r.label}</dt>
                  <dd className="mt-1 text-3xl font-bold tabular-nums">{r.value}</dd>
                  <dd className="mt-1 text-xs text-muted-foreground">{r.note}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="mt-3 flex items-start gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm">{data.noResultsReason}</p>
            </div>
          )}
        </section>

        {data.meetings && (
          <section>
            <h2 className="text-xl font-bold">Уговорени срещи</h2>
            <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
              {data.meetings.map((m) => (
                <li key={m.company + m.when} className="flex items-center gap-3 px-4 py-3">
                  <CalendarCheck className="h-5 w-5 shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.company}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.role}</p>
                  </div>
                  <span className="shrink-0 text-sm font-medium">{m.when}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-2xl bg-muted p-5 text-white">
          <h2 className="text-lg font-bold">Следващи стъпки</h2>
          <ul className="mt-3 space-y-2">
            {data.next.map((n) => (
              <li key={n} className="flex gap-2.5 text-sm text-white/85">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {n}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
};

export default Portal;
