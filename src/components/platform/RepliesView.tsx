import { useState } from 'react';
import { CircleDashed, Linkedin, Mail, Pencil, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { DEMO_CLIENTS, DEMO_REPLIES, REPLY_CLASSES } from '@/data/platform-demo';

interface RepliesViewProps {
  handled: Set<string>;
  onHandle: (id: string, verb: string) => void;
}

const RepliesView = ({ handled, onHandle }: RepliesViewProps) => {
  const open = DEMO_REPLIES.filter((r) => !handled.has(r.id));
  const [current, setCurrent] = useState<string | null>(open[0]?.id ?? null);
  const [editing, setEditing] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const reply = open.find((r) => r.id === current) ?? open[0];

  const act = (verb: string) => {
    if (!reply) return;
    onHandle(reply.id, verb);
    setEditing(false);
    const next = open.find((r) => r.id !== reply.id);
    setCurrent(next?.id ?? null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Отговори</h1>
        <p className="mt-2 text-muted-foreground">Hermes класифицира и пише чернова. Ти одобряваш, Hermes изпраща.</p>
      </div>

      <div className="flex items-start gap-2 rounded-xl border border-dashed border-foreground/30 bg-secondary/50 p-3 text-sm">
        <CircleDashed className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p>
          Работи по скила <span className="font-mono text-xs">reply-handling</span> (предложен, още не е записан в акаунта): един етикет на отговор, стоп на последователностите, чернова, одобрение, напомняния. Отговор с интерес получава отговор до 2 работни часа.
        </p>
      </div>

      {open.length === 0 || !reply ? (
        <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">Всички отговори са обработени.</p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ul className="space-y-2">
            {open.map((r) => {
              const cls = REPLY_CLASSES[r.cls];
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrent(r.id);
                      setEditing(false);
                    }}
                    className={cn(
                      'w-full rounded-xl border bg-card p-3 text-left transition-colors',
                      r.id === reply.id ? 'border-primary shadow-soft' : 'border-border hover:border-foreground/30'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold">{r.person}</span>
                      <span className={cn('shrink-0 rounded-full border px-2 py-px text-[11px] font-medium', cls.className)}>{cls.label}</span>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {r.company} · {r.received}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-foreground/75">{r.message}</p>
                  </button>
                </li>
              );
            })}
          </ul>

          <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
            <header className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-bold">{reply.person}</p>
                <p className="text-sm text-muted-foreground">
                  {reply.role} · {reply.company}
                </p>
                <p className="text-xs text-muted-foreground">Клиент: {DEMO_CLIENTS.find((c) => c.id === reply.client)?.name}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-xs">
                {reply.channel === 'Имейл' ? <Mail className="h-3.5 w-3.5" /> : <Linkedin className="h-3.5 w-3.5" />}
                {reply.channel} · {reply.received}
              </span>
            </header>

            <div className="mt-4 rounded-xl bg-secondary/70 p-4 text-sm leading-relaxed">{reply.message}</div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Чернова от Hermes</p>
                <span className={cn('rounded-full border px-2 py-px text-[11px] font-medium', REPLY_CLASSES[reply.cls].className)}>
                  {REPLY_CLASSES[reply.cls].label}
                </span>
              </div>
              {editing ? (
                <Textarea
                  value={drafts[reply.id] ?? reply.draft}
                  onChange={(e) => setDrafts({ ...drafts, [reply.id]: e.target.value })}
                  className="min-h-[120px]"
                />
              ) : (
                <div className="rounded-xl border-l-4 border-primary bg-primary/[0.04] p-4 text-sm leading-relaxed">{drafts[reply.id] ?? reply.draft}</div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">Следваща стъпка: {reply.next}</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="primary" onClick={() => act('Одобрено и изпратено')}>
                <Send /> Одобри и изпрати
              </Button>
              <Button variant="secondary" onClick={() => setEditing(!editing)}>
                <Pencil /> {editing ? 'Готово' : 'Редактирай'}
              </Button>
              <Button variant="ghost" onClick={() => act('Отхвърлено')}>
                <X /> Отхвърли
              </Button>
            </div>
          </article>
        </div>
      )}
    </div>
  );
};

export default RepliesView;
