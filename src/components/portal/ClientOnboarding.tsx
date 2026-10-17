import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, Clock, FileUp, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CLIENT_REQUEST, CLIENT_STAGES, DEMO_ICP_DRAFT, DemoClient } from '@/data/platform-demo';
import { clientOnboardingMemory as memory } from './memory';

const STEPS = ['Добре дошли', 'Проверете профила', 'Вашите данни', 'Няколко въпроса', 'Какво следва'];

type Mark = 'right' | 'wrong';

interface ClientOnboardingProps {
  client: DemoClient;
  onClose: () => void;
}

const ClientOnboarding = ({ client, onClose }: ClientOnboardingProps) => {
  const [step, setStepState] = useState(memory.step);
  const [marks, setMarks] = useState<Record<string, Mark>>(memory.marks);
  const [files, setFiles] = useState<Record<string, string>>(memory.files);
  const [answers, setAnswers] = useState<Record<string, string>>(memory.answers);

  const setStep = (n: number) => {
    memory.step = n;
    setStepState(n);
    window.scrollTo({ top: 0 });
  };
  const mark = (line: string, m: Mark) => {
    const next = { ...marks, [line]: m };
    memory.marks = next;
    setMarks(next);
  };
  const attach = (id: string, name: string) => {
    const next = { ...files, [id]: name };
    memory.files = next;
    setFiles(next);
    toast.success('Файлът е качен', { description: name });
  };
  const answer = (id: string, v: string) => {
    const next = { ...answers, [id]: v };
    memory.answers = next;
    setAnswers(next);
  };

  const icpLines = [...DEMO_ICP_DRAFT.icp, ...DEMO_ICP_DRAFT.anti];
  const c1Done = icpLines.every((l) => marks[l]);
  const required = CLIENT_REQUEST.provide.filter((p) => p.required);
  const gate1 = [
    ...required.map((p) => ({ id: p.id, label: `${p.id} · ${p.id === 'A2' ? 'Откази и нежелани фирми' : p.title}`, done: !!files[p.id] })),
    { id: 'C1', label: 'C1 · Профил на идеалния клиент', done: c1Done },
  ];
  const gateOpen = gate1.every((g) => g.done);

  const MarkRow = ({ line }: { line: string }) => (
    <li className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
      <span className={cn('text-sm', marks[line] === 'wrong' && 'text-muted-foreground line-through')}>{line}</span>
      <span className="flex shrink-0 gap-1.5">
        {(['right', 'wrong'] as Mark[]).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={marks[line] === m}
            onClick={() => mark(line, m)}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
              marks[line] === m
                ? m === 'right'
                  ? 'border-emerald-600 bg-emerald-600 text-white'
                  : 'border-rose-600 bg-rose-600 text-white'
                : 'border-border hover:border-foreground/40'
            )}
          >
            {m === 'right' ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
            {m === 'right' ? 'Вярно' : 'Грешно'}
          </button>
        ))}
      </span>
    </li>
  );

  return (
    <div className="space-y-6">
      <ol className="grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => setStep(i)} className="group w-full text-left">
              <span className={cn('block h-1.5 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-foreground/10 group-hover:bg-foreground/20')} />
              <span className={cn('mt-1.5 hidden text-xs sm:block', i === step ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{s}</span>
            </button>
          </li>
        ))}
      </ol>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Стъпка {step + 1} от {STEPS.length}
        </p>

        {step === 0 && (
          <div className="mt-1 space-y-5">
            <h1 className="text-2xl font-bold sm:text-3xl">Добре дошли, {client.name.replace('Демо · ', '')}</h1>
            <p className="max-w-2xl text-foreground/85">
              Проучихме сайта ви и подготвихме чернова: към кого да пишем, към кого не и какво ни трябва от вас. Попълнихме всичко, което можахме. Вие само потвърждавате или поправяте.
            </p>
            <div className="flex items-center gap-3 rounded-xl bg-secondary/70 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white">{client.lead[0]}</span>
              <div>
                <p className="font-semibold">{client.lead}, Passion4Growth</p>
                <p className="text-sm text-muted-foreground">Води вашата кампания и отговаря на въпросите ви.</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold">Как протича работата</p>
              <ol className="mt-3 grid gap-2 sm:grid-cols-5">
                {CLIENT_STAGES.map((s, i) => (
                  <li key={s.id} className={cn('rounded-xl border p-3', i === 0 ? 'border-primary/40 bg-primary/[0.04]' : 'border-border')}>
                    <p className="text-xs font-bold text-muted-foreground">{i + 1}</p>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="mt-1 text-xs leading-snug text-muted-foreground">{s.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <p className="flex items-start gap-2 rounded-xl border border-dashed border-primary/40 p-3 text-sm">
              <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Две неща зависят от вас: без вашите клиенти, отказите и одобрения профил не започваме списъците. Без одобрени фирми, персони и оферти не изпращаме нищо.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Проверете профила на идеалния клиент</h1>
              <p className="mt-1 text-sm text-muted-foreground">C1 · Отбележете всеки ред като вярно или грешно. Грешните ще поправим заедно.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">Пишем на</p>
              <ul className="mt-2 space-y-2">{DEMO_ICP_DRAFT.icp.map((l) => <MarkRow key={l} line={l} />)}</ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-rose-700">Никога не пишем на</p>
              <ul className="mt-2 space-y-2">{DEMO_ICP_DRAFT.anti.map((l) => <MarkRow key={l} line={l} />)}</ul>
            </div>
            <p className="text-xs text-muted-foreground">
              Отбелязани: {icpLines.filter((l) => marks[l]).length} от {icpLines.length}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="mt-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Вашите данни</h1>
              <p className="mt-1 text-sm text-muted-foreground">A1 и A2 са нужни, за да започнем. Останалите може да изпратите и по-късно.</p>
            </div>
            <ul className="space-y-2">
              {CLIENT_REQUEST.provide.map((p) => {
                const file = files[p.id];
                return (
                  <li
                    key={p.id}
                    className={cn(
                      'flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
                      file ? 'border-emerald-200 bg-emerald-50/40' : p.required ? 'border-primary/40' : 'border-border'
                    )}
                  >
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                        <span className="font-mono text-xs text-muted-foreground">{p.id}</span>
                        {p.title}
                        {p.required && !file && <span className="rounded bg-primary px-1.5 text-[10px] font-semibold uppercase text-white">нужно за старт</span>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{file ? `Качен: ${file}` : p.why}</p>
                    </div>
                    <label
                      className={cn(
                        'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        file ? 'bg-secondary text-foreground hover:bg-secondary/70' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      )}
                    >
                      {file ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <FileUp className="h-4 w-4" />}
                      {file ? 'Смени' : 'Качи файл'}
                      <input
                        id={`file-${p.id}`}
                        type="file"
                        className="sr-only"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) attach(p.id, f.name);
                        }}
                      />
                    </label>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-muted-foreground">Може да качите таблица, списък от имена на фирми или домейни, или експорт от CRM.</p>
          </div>
        )}

        {step === 3 && (
          <div className="mt-1 space-y-5">
            <div>
              <h1 className="text-2xl font-bold">Няколко въпроса</h1>
              <p className="mt-1 text-sm text-muted-foreground">Само това, което не намерихме публично. Където имаме предположение, то е попълнено.</p>
            </div>
            <ol className="space-y-4">
              {CLIENT_REQUEST.answer.map((a) => (
                <li key={a.id}>
                  <label htmlFor={`answer-${a.id}`} className="flex gap-2 text-sm font-medium">
                    <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                    {a.q}
                  </label>
                  <Textarea
                    id={`answer-${a.id}`}
                    value={answers[a.id] ?? a.prefill ?? ''}
                    onChange={(e) => answer(a.id, e.target.value)}
                    placeholder="Вашият отговор"
                    className="mt-1.5 min-h-[72px]"
                  />
                  {a.prefill && answers[a.id] === undefined && <p className="mt-1 text-xs text-accent">Предварително попълнено от нас, проверете.</p>}
                </li>
              ))}
            </ol>
          </div>
        )}

        {step === 4 && (
          <div className="mt-1 space-y-6">
            <div>
              <h1 className="text-2xl font-bold">{gateOpen ? 'Всичко нужно е тук. Започваме.' : 'Почти готово'}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {gateOpen
                  ? 'Започваме проучването на списъците. Ще ви покажем първите фирми за одобрение.'
                  : 'За да започнем списъците, ни трябват още следните неща:'}
              </p>
            </div>
            <ul className="space-y-2">
              {gate1.map((g) => (
                <li key={g.id} className="flex items-center gap-2.5 text-sm">
                  {g.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-primary" />}
                  <span className={cn(g.done && 'text-muted-foreground')}>{g.label}</span>
                </li>
              ))}
            </ul>
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Clock className="h-4 w-4 text-accent" />
                По-късно ще ви покажем за одобрение
              </p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {CLIENT_REQUEST.later.map((c) => (
                  <li key={c.id} className="rounded-xl border border-border p-3">
                    <p className="text-sm font-medium">
                      <span className="mr-1.5 font-mono text-xs text-muted-foreground">{c.id}</span>
                      {c.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.format}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">Не изпращаме нито едно съобщение, преди да одобрите C2–C6.</p>
            </div>
            <Button
              variant="primary"
              onClick={() => {
                toast.success(gateOpen ? 'Изпратено на екипа' : 'Запазено', {
                  description: gateOpen ? `${client.lead} започва проучването.` : 'Може да продължите по всяко време.',
                });
                onClose();
              }}
            >
              <Check /> {gateOpen ? 'Изпрати и започни' : 'Запази и продължи по-късно'}
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-7 flex justify-between gap-2 border-t border-border pt-5">
            <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
              <ArrowLeft /> Назад
            </Button>
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              {step === 0 ? 'Да започнем' : 'Напред'} <ArrowRight />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClientOnboarding;
