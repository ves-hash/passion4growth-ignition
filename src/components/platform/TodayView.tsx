import { AlertTriangle, ArrowRight, Check, MessageSquareReply, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEMO_CLIENTS, DEMO_REPLIES } from '@/data/platform-demo';
import { OWNER_STYLES } from '@/components/system/model';
import { blockedFor, runningFor, waitingFor } from './tasks';

interface TodayViewProps {
  resolved: Set<string>;
  repliesLeft: number;
  onResolve: (key: string, label: string) => void;
  onOpenClient: (id: string) => void;
  onOpenReplies: () => void;
}

const TodayView = ({ resolved, repliesLeft, onResolve, onOpenClient, onOpenReplies }: TodayViewProps) => {
  const decisions = DEMO_CLIENTS.flatMap((c) =>
    waitingFor(c).map((t) => ({ key: `${c.id}:${t.skill.id}`, client: c, task: t }))
  ).filter((d) => !resolved.has(d.key));
  const blocked = DEMO_CLIENTS.flatMap((c) => blockedFor(c).map((t) => ({ client: c, task: t })));
  const running = DEMO_CLIENTS.flatMap((c) => runningFor(c).map((t) => ({ client: c, task: t })));
  const interested = DEMO_REPLIES.filter((r) => r.cls === 'interested').length;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Събота, 17 октомври</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Добро утро, Вес</h1>
        <p className="mt-2 text-muted-foreground">
          Агентите работят по {running.length} задачи. От теб се чакат{' '}
          <span className="font-semibold text-foreground">{decisions.length} решения</span> и{' '}
          <span className="font-semibold text-foreground">{repliesLeft} отговора</span>.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onOpenReplies}
          className="group rounded-2xl bg-gradient-to-br from-primary to-accent p-4 text-left text-white shadow-soft transition-transform hover:-translate-y-0.5"
        >
          <MessageSquareReply className="h-5 w-5" />
          <p className="mt-3 text-3xl font-bold tabular-nums">{repliesLeft}</p>
          <p className="text-sm text-white/85">отговора за одобрение · {interested} с интерес</p>
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold">
            Към отговорите <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </p>
        </button>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <UserRound className="h-5 w-5 text-primary" />
          <p className="mt-3 text-3xl font-bold tabular-nums">{decisions.length}</p>
          <p className="text-sm text-muted-foreground">решения чакат човек</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <p className="mt-3 text-3xl font-bold tabular-nums">{blocked.length}</p>
          <p className="text-sm text-muted-foreground">блокирани задачи</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <h2 className="mb-3 text-lg font-bold">Чака теб</h2>
          {decisions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Няма чакащи решения. Агентите продължават сами.
            </p>
          ) : (
            <ul className="space-y-2">
              {decisions.map(({ key, client, task }) => (
                <li key={key} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onOpenClient(client.id)}
                      className="rounded-full bg-secondary px-2 py-0.5 font-medium hover:bg-secondary/70"
                    >
                      {client.name}
                    </button>
                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: OWNER_STYLES[task.skill.owner].color }} />
                      подготвено от {OWNER_STYLES[task.skill.owner].label}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{task.note ?? task.label}</p>
                  <p className="text-sm text-muted-foreground">{task.label}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="primary" onClick={() => onResolve(key, task.note ?? task.label)}>
                      <Check /> Готово
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => onOpenClient(client.id)}>
                      Отвори клиента
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {blocked.length > 0 && (
            <>
              <h2 className="mb-3 mt-6 text-lg font-bold">Блокирано</h2>
              <ul className="space-y-2">
                {blocked.map(({ client, task }) => (
                  <li key={`${client.id}:${task.skill.id}`} className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/60 p-4">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-semibold">
                        {task.label} · {client.name}
                      </p>
                      <p className="text-sm text-foreground/75">{task.note}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold">Работи в момента</h2>
          <ul className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
            {running.map(({ client, task }) => (
              <li key={`${client.id}:${task.skill.id}`} className="flex items-center gap-3 px-4 py-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span
                    className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-50"
                    style={{ backgroundColor: OWNER_STYLES[task.skill.owner].color }}
                  />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: OWNER_STYLES[task.skill.owner].color }} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{task.label}</p>
                  <p className="truncate text-xs text-muted-foreground">{client.name}</p>
                </div>
                <span className={cn('shrink-0 text-[11px] font-medium')} style={{ color: OWNER_STYLES[task.skill.owner].color }}>
                  {OWNER_STYLES[task.skill.owner].label}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default TodayView;
