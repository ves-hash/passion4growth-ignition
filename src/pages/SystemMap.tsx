import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CircleDashed, Columns2, Diamond, GitBranch, ScrollText, Spline, UserRound, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import DetailSheet from '@/components/system/DetailSheet';
import FlowGrid from '@/components/system/FlowGrid';
import FlowList from '@/components/system/FlowList';
import GapsView from '@/components/system/GapsView';
import OwnerView from '@/components/system/OwnerView';
import { INTEGRATION_STATUS, OWNER_STYLES, Owner, map, skillById } from '@/components/system/model';

const VIEWS = [
  { id: 'flow', label: 'Поток', icon: GitBranch },
  { id: 'owner', label: 'Собственик', icon: Users },
  { id: 'gaps', label: 'Пропуски', icon: CircleDashed },
] as const;

type View = (typeof VIEWS)[number]['id'];

const isKnown = (id: string | null) => !!id && (skillById.has(id) || map.missing_skills.some((m) => m.id === id));

const SystemMap = () => {
  const [params, setParams] = useSearchParams();
  const view = (VIEWS.some((v) => v.id === params.get('view')) ? params.get('view') : 'flow') as View;
  const selected = isKnown(params.get('skill')) ? params.get('skill') : null;
  const [hovered, setHovered] = useState<string | null>(null);
  const [showArrows, setShowArrows] = useState(true);

  const update = (next: Record<string, string | null>) => {
    const p = new URLSearchParams(params);
    Object.entries(next).forEach(([k, v]) => (v ? p.set(k, v) : p.delete(k)));
    setParams(p, { replace: true });
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Система за студен outreach · P4G';
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    return () => {
      document.title = prevTitle;
      robots.remove();
    };
  }, []);

  const saved = map.skills.filter((s) => s.status === 'saved').length;
  const proposed = map.skills.length - saved;
  const humanSteps = map.skills.filter((s) => s.human_step).length;
  const gates = map.phases.filter((p) => p.gate).length;
  const active = hovered ?? selected;

  const stats = [
    { value: map.skills.length, label: 'скила в картата' },
    { value: proposed, label: 'предложени' },
    { value: map.missing_skills.length, label: 'липсващи' },
    { value: gates, label: 'гейта' },
    { value: humanSteps, label: 'човешки стъпки' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary/60 to-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex h-14 max-w-[1800px] items-center justify-between gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
              P4G
            </span>
            <span className="truncate font-bold">Outreach система</span>
          </Link>
          <Link to="/" className="flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Към сайта</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 pb-20 pt-8 sm:px-6 sm:pt-12">
        {/* Intro */}
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{map.system} · v{map.version}</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-5xl">
              Кой скил работи кога,
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> кой го движи </span>
              и къде решава човек.
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              От брифа на клиента до отговорите и седмичния цикъл. Натиснете скил, за да видите входове, изходи, инструменти и файла му.
            </p>
          </div>
          <dl className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:w-[560px]">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-card px-3 py-3 shadow-sm">
                <dt className="sr-only">{s.label}</dt>
                <dd className="text-2xl font-bold tabular-nums">{s.value}</dd>
                <dd className="text-[11px] leading-tight text-muted-foreground">{s.label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Controls + legend */}
        <section className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div role="tablist" aria-label="Изглед" className="inline-flex w-full rounded-xl border border-border bg-card p-1 shadow-sm sm:w-auto">
            {VIEWS.map((v) => {
              const Icon = v.icon;
              const on = view === v.id;
              return (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={on}
                  type="button"
                  onClick={() => update({ view: v.id === 'flow' ? null : v.id })}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-all sm:flex-none',
                    on ? 'bg-primary text-primary-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {v.label}
                </button>
              );
            })}
          </div>

          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-foreground/80">
            {(Object.keys(OWNER_STYLES) as Owner[]).map((o) => (
              <li key={o} className="flex items-center gap-1.5" title={map.owners[o]}>
                <span aria-hidden className="h-3 w-3 rounded-sm" style={{ backgroundColor: OWNER_STYLES[o].color }} />
                {OWNER_STYLES[o].label}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="h-3 w-5 rounded-sm border-[1.5px] border-dashed border-foreground/50" />
              предложен
            </li>
            <li className="flex items-center gap-1.5">
              <CircleDashed className="h-3.5 w-3.5 text-muted-foreground" />
              липсващ
            </li>
            <li className="flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5 text-primary" />
              човешка стъпка
            </li>
            <li className="flex items-center gap-1.5">
              <Diamond className="h-3.5 w-3.5 fill-primary text-primary" />
              гейт
            </li>
            <li className="flex items-center gap-1.5">
              <Columns2 className="h-3.5 w-3.5 text-accent" />
              паралелно
            </li>
            {view === 'flow' && (
              <li className="hidden xl:block">
                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1">
                  <input type="checkbox" checked={showArrows} onChange={(e) => setShowArrows(e.target.checked)} className="accent-primary" />
                  <Spline className="h-3.5 w-3.5" />
                  зависимости
                </label>
              </li>
            )}
          </ul>
        </section>

        {/* Views */}
        <section className="mt-6" aria-live="polite">
          {view === 'flow' && (
            <>
              <div className="hidden xl:block">
                <FlowGrid active={active} showArrows={showArrows} onSelect={(id) => update({ skill: id })} onHover={setHovered} />
                <p className="mt-2 text-xs text-muted-foreground">
                  Стрелка: зависимост → скил. Оцветените клетки са линиите, които текат паралелно в съответната фаза. Задръжте върху скил, за да видите връзките му. Решетката се превърта хоризонтално.
                </p>
              </div>
              <div className="xl:hidden">
                <FlowList active={selected} onSelect={(id) => update({ skill: id })} />
              </div>
            </>
          )}
          {view === 'owner' && <OwnerView active={active} onSelect={(id) => update({ skill: id })} onHover={setHovered} />}
          {view === 'gaps' && <GapsView onSelect={(id) => update({ skill: id })} />}
        </section>

        {/* Integrations + policies */}
        <section className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">Външни системи</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {map.integrations.map((i) => {
                const st = INTEGRATION_STATUS[i.status];
                return (
                  <li key={i.name} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{i.name}</p>
                      <p className="text-xs text-muted-foreground">{i.purpose}</p>
                    </div>
                    <span className={cn('shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium', st?.className)}>
                      {st?.label ?? i.status}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="rounded-2xl bg-muted p-4 text-white shadow-sm sm:p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <ScrollText className="h-5 w-5 text-accent-light" />
              Правила
            </h2>
            <ul className="mt-4 space-y-3">
              {map.policies.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-snug text-white/85">
                  <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <DetailSheet id={selected} onSelect={(id) => update({ skill: id })} onClose={() => update({ skill: null })} />
    </div>
  );
};

export default SystemMap;
