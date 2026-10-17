import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Diamond, ScrollText, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TASK_LABELS } from '@/data/platform-demo';
import { OWNER_STYLES, Owner, map, placementsFor } from '@/components/system/model';
import { PRACTICE, PracticeTarget } from './onboarding';

const GLOSSARY: { term: string; text: string }[] = [
  { term: 'ICP / anti-ICP', text: 'Към кого пишем и към кого никога не пишем. Anti-ICP е толкова подробен, колкото ICP: изключени държави, конкуренти, фирми, които клиентът не може да обслужи.' },
  { term: 'Гейт', text: 'Точка, в която клиентът одобрява. Без одобрение следващата фаза не започва.' },
  { term: 'Етикет A / B / M / R / CTX', text: 'Оценка на фирмата само по Company Fit: A ≥ 75, B 60–74, M 40–59 или слаби доказателства, R отпада, CTX е само пазарен контекст.' },
  { term: 'P1 / P2 / P3 / Hold', text: 'Приоритет на контакта. P1: A или B, купувач и сигнал до 90 дни. P2: A или B и купувач. P3: A или B без купувач. Hold: етикет M или ниска увереност.' },
  { term: 'Entry Plan', text: 'Планът за всяка A и B фирма: защо тях, защо сега, нужда, ъгъл, оферта, доказателство, през кого влизаме, по кой канал и с какъв език.' },
  { term: 'named_lookup', text: 'За всяка A фирма първо търсим конкретния човек (Prospeo, после AI Ark). Общ имейл като office@ е позволен само ако човекът не е намерен.' },
  { term: 'Do Not Contact', text: 'Един общ списък за всички кампании: настоящи клиенти на клиента, изключени фирми и всеки, който се е отписал. Проверява се преди всяко качване.' },
  { term: 'Загряване', text: 'Нови домейни и инбокси се загряват 2–3 седмици преди първия студен имейл.' },
];

const STEPS = ['Как работим', 'Пътят на клиента', 'Кой какво прави', 'Правила и речник', 'Първи задачи'];

interface OnboardingViewProps {
  step: number;
  setStep: (step: number) => void;
  practiced: Set<string>;
  onPractice: (id: string, to: PracticeTarget) => void;
}

const OnboardingView = ({ step, setStep, practiced, onPractice }: OnboardingViewProps) => {
  const [phase, setPhase] = useState(map.phases[0].id);
  const picked = map.phases.find((p) => p.id === phase)!;
  const phaseIdx = map.phases.indexOf(picked);
  const phaseTasks = map.skills.filter((s) => s.phase !== 'all' && placementsFor(s.phase).some((pl) => !pl.echo && pl.start === phaseIdx));
  const humanSteps = map.skills.filter((s) => s.human_step);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Първи стъпки</p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">Добре дошли в екипа</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Пет кратки стъпки: как работи системата, през какво минава всеки клиент, кое решавате вие и с какво да започнете.
        </p>
      </div>

      {/* Progress */}
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
        <h2 className="mt-1 text-2xl font-bold">{STEPS[step]}</h2>

        {step === 0 && (
          <div className="mt-5 space-y-5">
            <p className="max-w-2xl text-foreground/85">
              Агентите вършат проучването, списъците и изпращането. Вие решавате на ключовите места и говорите с хората. Системата има три слоя:
            </p>
            <ul className="grid gap-3 md:grid-cols-3">
              {[
                { t: 'Портал за клиента', d: 'Клиентът вижда етапа, какво се иска от него и резултатите. Не вижда агенти и скилове.' },
                { t: 'Платформа за екипа', d: 'Тук работите вие: решения, блокажи, клиенти и отговори за одобрение.' },
                { t: 'Под капака', d: '24 скила, които агентите изпълняват. Отваряте ги само когато искате да разберете защо нещо е станало.' },
              ].map((l, i) => (
                <li key={l.t} className={cn('rounded-xl border p-4', i === 1 ? 'border-primary/40 bg-primary/[0.04]' : 'border-border')}>
                  <p className="font-semibold">{l.t}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{l.d}</p>
                  {i === 1 && <p className="mt-2 text-xs font-semibold text-primary">Вие сте тук</p>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5 grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
            <ol className="space-y-1">
              {map.phases.map((p, i) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => setPhase(p.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                      p.id === phase ? 'bg-secondary font-semibold' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                    )}
                  >
                    {p.gate ? (
                      <Diamond className="h-3.5 w-3.5 shrink-0 fill-primary text-primary" />
                    ) : (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold">{i + 1}</span>
                    )}
                    {p.name}
                  </button>
                </li>
              ))}
            </ol>
            <div className="rounded-xl bg-secondary/50 p-4 sm:p-5">
              <p className="text-lg font-bold">{picked.name}</p>
              {picked.gate && (
                <p className="mt-2 rounded-lg border-2 border-dashed border-primary/40 bg-background p-3 text-sm">
                  <span className="font-semibold text-primary">Условие за преминаване: </span>
                  {picked.criteria}
                </p>
              )}
              {picked.note && <p className="mt-2 text-sm text-foreground/80">{picked.note}</p>}
              {phaseTasks.length > 0 && (
                <>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Какво се случва</p>
                  <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
                    {phaseTasks.map((s) => (
                      <li key={s.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: OWNER_STYLES[s.owner].color }} />
                        <span>
                          {TASK_LABELS[s.id]}
                          {s.human_step && <UserRound className="ml-1 inline h-3.5 w-3.5 text-primary" aria-label="решава човек" />}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <div className="mt-5 flex gap-2">
                <Button size="sm" variant="secondary" disabled={phaseIdx === 0} onClick={() => setPhase(map.phases[phaseIdx - 1].id)}>
                  <ArrowLeft /> Предишна
                </Button>
                <Button size="sm" variant="secondary" disabled={phaseIdx === map.phases.length - 1} onClick={() => setPhase(map.phases[phaseIdx + 1].id)}>
                  Следваща <ArrowRight />
                </Button>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5 space-y-6">
            <ul className="grid gap-3 sm:grid-cols-3">
              {(['claude', 'claude+hermes', 'hermes'] as Owner[]).map((o) => (
                <li key={o} className="rounded-xl border border-border p-4">
                  <p className="flex items-center gap-2 font-semibold">
                    <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: OWNER_STYLES[o].color }} />
                    {OWNER_STYLES[o].label}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{map.owners[o]}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{map.skills.filter((s) => s.owner === o).length} скила</p>
                </li>
              ))}
            </ul>
            <div>
              <p className="flex items-center gap-2 font-semibold">
                <UserRound className="h-4 w-4 text-primary" />
                Къде решава човек ({humanSteps.length} места)
              </p>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {humanSteps.map((s) => (
                  <li key={s.id} className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-sm font-medium">{TASK_LABELS[s.id]}</span>
                    <span className="text-xs text-muted-foreground">{s.human_step}</span>
                  </li>
                ))}
                <li className="flex flex-col gap-0.5 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <span className="text-sm font-medium">Отговори на проспекти</span>
                  <span className="text-xs text-muted-foreground">одобрение в Telegram преди изпращане</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl bg-muted p-4 text-white sm:p-5">
              <p className="flex items-center gap-2 font-semibold">
                <ScrollText className="h-4 w-4 text-accent-light" />
                Правила, които не се нарушават
              </p>
              <ul className="mt-3 space-y-2.5">
                {map.policies.map((p) => (
                  <li key={p} className="flex gap-2.5 text-sm leading-snug text-white/85">
                    <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <dl className="space-y-3">
              {GLOSSARY.map((g) => (
                <div key={g.term} className="rounded-xl border border-border p-3">
                  <dt className="text-sm font-semibold">{g.term}</dt>
                  <dd className="mt-0.5 text-sm text-muted-foreground">{g.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {step === 4 && (
          <div className="mt-5">
            <p className="text-foreground/85">Четири упражнения върху примерните клиенти. Нищо не се изпраща наистина.</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {PRACTICE.map((t, i) => {
                const done = practiced.has(t.id);
                return (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => onPractice(t.id, t.to)}
                      className={cn(
                        'flex h-full w-full items-start gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5',
                        done ? 'border-emerald-200 bg-emerald-50/50' : 'border-border hover:border-primary/40 hover:shadow-soft'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                          done ? 'bg-emerald-600 text-white' : 'bg-secondary'
                        )}
                      >
                        {done ? <Check className="h-4 w-4" /> : i + 1}
                      </span>
                      <span>
                        <span className="block font-semibold">{t.title}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{t.hint}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Готови: {practiced.size} от {PRACTICE.length}
              {practiced.size === PRACTICE.length && ' · Можете да започнете с „Днес“.'}
            </p>
          </div>
        )}

        <div className="mt-7 flex justify-between gap-2 border-t border-border pt-5">
          <Button variant="secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>
            <ArrowLeft /> Назад
          </Button>
          {step < STEPS.length - 1 && (
            <Button variant="primary" onClick={() => setStep(step + 1)}>
              Напред <ArrowRight />
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default OnboardingView;
