import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Check, CheckCircle2, Circle, FileAudio, Loader2, MessageSquare, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { CLIENT_REQUEST, COUNTRY_RISK, DEMO_CLIENTS, MANAGED_DEMO, PORTAL } from '@/data/platform-demo';
import { OWNER_STYLES, skillById } from '@/components/system/model';

const STEPS = ['Данни', 'Агентите работят', 'Преглед на брифа', 'Kickoff среща', 'Гейт 1 и старт'];
const LEADS = ['Вес', 'Мария', 'Иван'];
const RISK_STYLE = { Low: 'bg-emerald-50 text-emerald-800', Medium: 'bg-amber-50 text-amber-800', High: 'bg-rose-50 text-rose-800' };

type Collect = 'meeting' | 'email';
type Access = 'reports' | 'portal' | 'none';

const memory = {
  step: 0,
  name: MANAGED_DEMO.name,
  website: MANAGED_DEMO.website,
  countries: MANAGED_DEMO.countries,
  lead: 'Вес',
  progress: 0,
  domainsBought: false,
  lineOk: {} as Record<string, boolean>,
  collect: {} as Record<string, Collect>,
  transcript: false,
  answers: {} as Record<string, string>,
  received: {} as Record<string, boolean>,
  c1Approved: false,
  c1By: '',
  access: 'reports' as Access,
};

const SkillChip = ({ id }: { id: string }) => {
  const s = skillById.get(id)!;
  return (
    <span className="inline-flex items-center gap-1 rounded bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-foreground/70">
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: OWNER_STYLES[s.owner].color }} />
      {id}
    </span>
  );
};

interface NewClientWizardProps {
  onCancel: () => void;
  onDone: (clientId: string) => void;
}

const NewClientWizard = ({ onCancel, onDone }: NewClientWizardProps) => {
  const [, force] = useState(0);
  const set = (patch: Partial<typeof memory>) => {
    Object.assign(memory, patch);
    force((n) => n + 1);
  };
  const { step } = memory;
  const go = (n: number) => {
    set({ step: n });
    window.scrollTo({ top: 0 });
  };

  // Day 0: the brief and the compliance check run in parallel as soon as step 2 opens.
  useEffect(() => {
    if (step !== 1 || memory.progress >= 100) return;
    const t = setInterval(() => {
      memory.progress = Math.min(100, memory.progress + 7);
      force((n) => n + 1);
      if (memory.progress >= 100) clearInterval(t);
    }, 180);
    return () => clearInterval(t);
  }, [step]);

  const lines = [...MANAGED_DEMO.icp, ...MANAGED_DEMO.anti];
  const toAsk = lines.filter((l) => memory.lineOk[l] === false);
  const required = CLIENT_REQUEST.provide.filter((p) => p.required);
  const gate = [
    { label: 'A1 · Настоящи клиенти', done: !!memory.received.A1 },
    { label: 'A2 · Откази и нежелани фирми', done: !!memory.received.A2 },
    { label: 'C1 · Клиентът одобри ICP и anti-ICP', done: memory.c1Approved },
    { label: 'Домейните са купени (загряването тече 2–3 седмици)', done: memory.domainsBought },
  ];
  const gateOpen = gate.every((g) => g.done);

  const finish = () => {
    const id = `managed-${DEMO_CLIENTS.length}`;
    DEMO_CLIENTS.push({
      id,
      name: memory.name,
      niche: MANAGED_DEMO.niche,
      countries: memory.countries,
      lead: memory.lead,
      phase: 'phase1',
      mode: 'managed',
      overrides: {},
      gateDone: { gate1: [true, true], gate2: [false, false, false] },
    });
    PORTAL[id] = {
      period: 'първа седмица',
      summary: 'Профилът е одобрен. Започнахме списъците с фирми и подготовката на офертите.',
      actions: [],
      noResultsReason: 'Още не пишем на никого. Първо ще ви покажем примерни фирми, персони и оферти за одобрение.',
      next: ['Списъци от асоциации, изложения и Google Maps', 'Предложение за 5–6 оферти', 'Одобрение на примерни фирми и персони (C2–C6)'],
    };
    Object.assign(memory, { step: 0, progress: 0, domainsBought: false, lineOk: {}, collect: {}, transcript: false, answers: {}, received: {}, c1Approved: false, c1By: '' });
    toast.success('Клиентът е във Фаза 1', { description: 'Агентите започват списъците и офертите.' });
    onDone(id);
  };

  const briefDone = memory.progress >= 100;

  return (
    <div className="space-y-6">
      <button type="button" onClick={onCancel} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Всички клиенти
      </button>
      <div>
        <p className="text-sm font-medium text-primary">Нов клиент · ние управляваме</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Онбординг на клиент</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Вие въвеждате сайта, агентите правят брифа, а клиентът само говори с вас на kickoff срещата. Одобренията му записвате тук.
        </p>
      </div>

      <ol className="grid grid-cols-5 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s}>
            <button type="button" onClick={() => go(i)} className="group w-full text-left">
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
        <h2 className="mt-1 text-2xl font-bold">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="nc-name" className="text-sm font-medium">Име на клиента</label>
                <Input id="nc-name" className="mt-1.5" value={memory.name} onChange={(e) => set({ name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="nc-site" className="text-sm font-medium">Сайт на клиента <span className="text-primary">*</span></label>
                <Input id="nc-site" className="mt-1.5" value={memory.website} onChange={(e) => set({ website: e.target.value })} />
                <p className="mt-1 text-xs text-muted-foreground">Единственото задължително поле. От него агентът прави брифа.</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Целеви държави</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(COUNTRY_RISK).map(([code, c]) => {
                  const on = memory.countries.includes(code);
                  return (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set({ countries: on ? memory.countries.filter((x) => x !== code) : [...memory.countries, code] })}
                      className={cn(
                        'rounded-full border px-3 py-1 text-sm transition-colors',
                        on ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-foreground/40'
                      )}
                    >
                      {code}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Кой води клиента</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {LEADS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    aria-pressed={memory.lead === l}
                    onClick={() => set({ lead: l })}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
                      memory.lead === l ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground/40'
                    )}
                  >
                    <UserRound className="h-3.5 w-3.5" />
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <p className="rounded-xl bg-secondary/70 p-3 text-sm text-muted-foreground">
              По желание после: записи на разговори (tl;dv), документи от клиента, известни клиенти. Брифът тръгва и без тях.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 space-y-4">
            <p className="text-sm text-muted-foreground">Ден 0: трите задачи вървят паралелно.</p>
            <ul className="grid gap-3 lg:grid-cols-3">
              <li className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">Бриф за нишата и ICP</p>
                  {briefDone ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Loader2 className="h-5 w-5 animate-spin text-sky-600" />}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${memory.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {briefDone ? 'Готово: чернова на ICP, anti-ICP, персони, език на нишата и списък какво да поискаме.' : `Чете ${memory.website} и проучва индустрията…`}
                </p>
                <div className="mt-3"><SkillChip id="client-niche-brief" /></div>
              </li>
              <li className={cn('rounded-xl border p-4', memory.domainsBought ? 'border-border' : 'border-primary/40')}>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">Домейни и инбокси</p>
                  {memory.domainsBought ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <UserRound className="h-5 w-5 text-primary" />}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  2–3 инбокса на домейн, загряване 2–3 седмици преди първия имейл. Агентът е подготвил списък с домейни.
                </p>
                {!memory.domainsBought ? (
                  <Button size="sm" variant="primary" className="mt-3" onClick={() => set({ domainsBought: true })}>
                    <Check /> Купих домейните
                  </Button>
                ) : (
                  <p className="mt-3 text-xs font-medium text-emerald-700">Купени. Загряването започна.</p>
                )}
                <div className="mt-3"><SkillChip id="outreach-deliverability" /></div>
              </li>
              <li className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">Правна проверка по държави</p>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <ul className="mt-2 space-y-1.5">
                  {memory.countries.map((c) => (
                    <li key={c} className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="w-20 font-medium">{COUNTRY_RISK[c].name}</span>
                      <span className={cn('rounded px-1.5 py-px font-semibold', RISK_STYLE[COUNTRY_RISK[c].risk])}>{COUNTRY_RISK[c].risk}</span>
                      <span className="text-muted-foreground">обаждания: {COUNTRY_RISK[c].calls}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3"><SkillChip id="outreach-compliance-cee" /></div>
              </li>
            </ul>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-6">
            {!briefDone && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Брифът още се прави. Върнете се на стъпка 2.</p>}
            <div>
              <p className="text-sm text-muted-foreground">
                Прегледайте черновата преди срещата. Маркирайте „Питай клиента“ за всеки ред, в който не сте сигурни. Тези редове влизат в дневния ред.
              </p>
              {[{ title: 'Пишем на', items: MANAGED_DEMO.icp, tone: 'text-emerald-700' }, { title: 'Никога не пишем на', items: MANAGED_DEMO.anti, tone: 'text-rose-700' }].map((g) => (
                <div key={g.title} className="mt-4">
                  <p className={cn('text-sm font-semibold', g.tone)}>{g.title}</p>
                  <ul className="mt-2 space-y-2">
                    {g.items.map((l) => (
                      <li key={l} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm">{l}</span>
                        <span className="flex shrink-0 gap-1.5">
                          {[true, false].map((ok) => (
                            <button
                              key={String(ok)}
                              type="button"
                              aria-pressed={memory.lineOk[l] === ok}
                              onClick={() => set({ lineOk: { ...memory.lineOk, [l]: ok } })}
                              className={cn(
                                'rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors',
                                memory.lineOk[l] === ok
                                  ? ok
                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                    : 'border-accent bg-accent text-white'
                                  : 'border-border hover:border-foreground/40'
                              )}
                            >
                              {ok ? 'Изглежда вярно' : 'Питай клиента'}
                            </button>
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div>
              <p className="font-semibold">Какво ни трябва от клиента</p>
              <p className="text-sm text-muted-foreground">За всяко нещо изберете дали да го поискате на срещата или по имейл след нея.</p>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {CLIENT_REQUEST.provide.map((p) => {
                  const c = memory.collect[p.id] ?? (p.required ? 'meeting' : 'email');
                  return (
                    <li key={p.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-sm">
                        <span className="mr-1.5 font-mono text-xs text-muted-foreground">{p.id}</span>
                        {p.title}
                      </span>
                      <span className="inline-flex shrink-0 rounded-lg bg-secondary p-0.5 text-xs">
                        {(['meeting', 'email'] as Collect[]).map((v) => (
                          <button
                            key={v}
                            type="button"
                            aria-pressed={c === v}
                            onClick={() => set({ collect: { ...memory.collect, [p.id]: v } })}
                            className={cn('rounded-md px-2.5 py-1 font-medium', c === v ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                          >
                            {v === 'meeting' ? 'На срещата' : 'По имейл'}
                          </button>
                        ))}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
            <div className="space-y-4">
              <div className="rounded-xl bg-secondary/70 p-4">
                <p className="flex items-center gap-2 font-semibold">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Дневен ред (45 минути)
                </p>
                <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm">
                  <li>Как работим и какво получава клиентът</li>
                  <li>Минаваме ICP и anti-ICP ред по ред{toAsk.length > 0 && <span className="text-accent"> ({toAsk.length} {toAsk.length === 1 ? 'въпрос' : 'въпроса'} от брифа)</span>}</li>
                  <li>Въпроси B1–B7</li>
                  <li>
                    Искаме на срещата:{' '}
                    {CLIENT_REQUEST.provide.filter((p) => (memory.collect[p.id] ?? (p.required ? 'meeting' : 'email')) === 'meeting').map((p) => p.id).join(', ')}
                  </li>
                  <li>Следващи стъпки и кой отговаря от тяхна страна</li>
                </ol>
              </div>
              <div className="rounded-xl border border-border p-4">
                <p className="font-semibold">Запис от срещата</p>
                <p className="mt-1 text-sm text-muted-foreground">Качете записа или транскрипта от tl;dv. Агентът попълва отговорите, вие ги проверявате.</p>
                {memory.transcript ? (
                  <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> kickoff-transcript.txt · отговорите са попълнени
                  </p>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    className="mt-3"
                    onClick={() => {
                      set({ transcript: true, answers: { ...MANAGED_DEMO.kickoffAnswers, ...memory.answers } });
                      toast.success('Транскриптът е обработен', { description: 'Попълнени са 7 отговора. Проверете ги.' });
                    }}
                  >
                    <FileAudio /> Качи транскрипт
                  </Button>
                )}
              </div>
              <div className="rounded-xl border border-primary/40 p-4">
                <p className="font-semibold">Одобрения и данни от клиента</p>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {required.map((p) => (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-start gap-2">
                        <input
                          id={`recv-${p.id}`}
                          type="checkbox"
                          className="mt-0.5 accent-primary"
                          checked={!!memory.received[p.id]}
                          onChange={(e) => set({ received: { ...memory.received, [p.id]: e.target.checked } })}
                        />
                        <span>
                          {p.id} получено <span className="text-muted-foreground">(файл или списък от клиента)</span>
                        </span>
                      </label>
                    </li>
                  ))}
                  <li>
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        id="c1-approved"
                        type="checkbox"
                        className="mt-0.5 accent-primary"
                        checked={memory.c1Approved}
                        onChange={(e) => set({ c1Approved: e.target.checked })}
                      />
                      <span>C1: клиентът одобри ICP и anti-ICP</span>
                    </label>
                    {memory.c1Approved && (
                      <Input
                        id="c1-by"
                        className="mt-2"
                        placeholder="Кой одобри и как (напр. управителят, на срещата)"
                        value={memory.c1By}
                        onChange={(e) => set({ c1By: e.target.value })}
                      />
                    )}
                  </li>
                </ul>
              </div>
            </div>
            <ol className="space-y-4">
              {CLIENT_REQUEST.answer.map((a) => (
                <li key={a.id}>
                  <label htmlFor={`kick-${a.id}`} className="flex gap-2 text-sm font-medium">
                    <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                    {a.q}
                  </label>
                  <Textarea
                    id={`kick-${a.id}`}
                    value={memory.answers[a.id] ?? ''}
                    onChange={(e) => set({ answers: { ...memory.answers, [a.id]: e.target.value } })}
                    placeholder="Отговор на клиента"
                    className={cn('mt-1.5 min-h-[64px]', memory.transcript && MANAGED_DEMO.kickoffAnswers[a.id] && 'border-sky-300 bg-sky-50/40')}
                  />
                  {memory.transcript && MANAGED_DEMO.kickoffAnswers[a.id] && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-sky-700">
                      <Bot className="h-3.5 w-3.5" /> попълнено от транскрипта
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {step === 4 && (
          <div className="mt-5 space-y-6">
            <ul className="space-y-2">
              {gate.map((g) => (
                <li key={g.label} className="flex items-center gap-2.5 text-sm">
                  {g.done ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5 text-primary" />}
                  <span className={cn(g.done && 'text-muted-foreground')}>{g.label}</span>
                </li>
              ))}
            </ul>
            <div>
              <p className="font-semibold">Какво вижда клиентът</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
                {([
                  { v: 'reports', t: 'Седмичен отчет', d: 'Резултати, срещи и какво ни трябва. Без попълване.' },
                  { v: 'portal', t: 'Пълен портал', d: 'Клиентът одобрява оферти и фирми сам в портала.' },
                  { v: 'none', t: 'Без достъп', d: 'Всичко минава през срещи и имейл.' },
                ] as { v: Access; t: string; d: string }[]).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    aria-pressed={memory.access === o.v}
                    onClick={() => set({ access: o.v })}
                    className={cn(
                      'rounded-xl border p-3 text-left transition-colors',
                      memory.access === o.v ? 'border-primary bg-primary/5' : 'border-border hover:border-foreground/30'
                    )}
                  >
                    <p className="text-sm font-semibold">{o.t}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{o.d}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" disabled={!gateOpen} onClick={finish}>
                <Check /> Отвори Фаза 1
              </Button>
              {!gateOpen && <span className="text-sm text-muted-foreground">Списъците не започват, докато Гейт 1 не е изпълнен.</span>}
            </div>
          </div>
        )}

        {step < 4 && (
          <div className="mt-7 flex justify-between gap-2 border-t border-border pt-5">
            <Button variant="secondary" onClick={() => (step === 0 ? onCancel() : go(step - 1))}>
              <ArrowLeft /> {step === 0 ? 'Отказ' : 'Назад'}
            </Button>
            <Button variant="primary" disabled={step === 0 && !memory.website.trim()} onClick={() => go(step + 1)}>
              {step === 0 ? 'Пусни агентите' : 'Напред'} <ArrowRight />
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};

export default NewClientWizard;
