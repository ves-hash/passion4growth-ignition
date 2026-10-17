import { useState } from 'react';
import { AlertTriangle, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Limits from outreach-deliverability; prices researched 2026-10 (approximate, USD).
const DEFAULTS = {
  tamCompanies: 1200,
  prospectsMin: 1,
  prospectsMax: 3,
  namedShare: 50,
  officeShare: 90,
  sequenceSteps: 3,
  liveDomains: 6,
  spareDomains: 6,
  inboxesPerDomain: 3,
  emailsPerInboxDay: 20,
  workingDays: 21,
  linkedinProfiles: 1,
  invitesPerWeek: 100,
  sharedClients: 5,
  mobileShare: 5,
};

const PRICES = {
  inbox: 3,
  domainYear: 12,
  getsalesProfile: 95,
  salesNav: 119.99,
  aiArk: 49,
  verifyPerEmail: 0.0037,
  apifySerper: 22,
  twilio: 10,
};

// Smartlead: every plan has unlimited email accounts; the limits are contacts and sends per month.
const SMARTLEAD_TIERS = [
  { name: 'Basic', price: 39, sends: 6000, contacts: 2000 },
  { name: 'Pro', price: 94, sends: 90000, contacts: 30000 },
  { name: 'Unlimited Smart', price: 174, sends: 150000, contacts: Infinity },
  { name: 'Unlimited Prime', price: 379, sends: 510000, contacts: Infinity },
];

const PROSPEO_TIERS = [
  { credits: 2000, price: 49, name: 'Starter' },
  { credits: 5000, price: 99, name: 'Growth' },
  { credits: 15000, price: 249, name: 'Pro' },
];

type Inputs = typeof DEFAULTS;
type Prices = typeof PRICES;

const fmt = (n: number, d = 0) => n.toLocaleString('bg-BG', { maximumFractionDigits: d, minimumFractionDigits: d });
const usd = (n: number, d = 0) => `$${fmt(n, d)}`;

const Field = ({
  id,
  label,
  hint,
  value,
  onChange,
  step = 1,
  min = 0,
  suffix,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) => (
  <div>
    <label htmlFor={id} className="text-sm font-medium">
      {label}
    </label>
    <div className="relative mt-1.5">
      <Input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        step={step}
        value={Number.isFinite(value) ? value : ''}
        onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
        className={cn('tabular-nums', suffix && 'pr-12')}
      />
      {suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
    {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const Stat = ({ label, value, sub, strong }: { label: string; value: string; sub?: string; strong?: boolean }) => (
  <div className={cn('rounded-xl p-4', strong ? 'bg-gradient-to-br from-primary to-accent text-white shadow-soft' : 'border border-border bg-card')}>
    <p className={cn('text-xs font-medium', strong ? 'text-white/85' : 'text-muted-foreground')}>{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    {sub && <p className={cn('mt-0.5 text-xs', strong ? 'text-white/80' : 'text-muted-foreground')}>{sub}</p>}
  </div>
);

const CalculatorView = () => {
  const [v, setV] = useState<Inputs>(DEFAULTS);
  const [p, setP] = useState<Prices>(PRICES);
  const [showPrices, setShowPrices] = useState(false);
  const [salesNav, setSalesNav] = useState(false);
  const set = (k: keyof Inputs) => (n: number) => setV({ ...v, [k]: n });
  const setPrice = (k: keyof Prices) => (n: number) => setP({ ...p, [k]: n });

  // Capacity
  const liveInboxes = v.liveDomains * v.inboxesPerDomain;
  const totalInboxes = (v.liveDomains + v.spareDomains) * v.inboxesPerDomain;
  const emailsMonth = liveInboxes * v.emailsPerInboxDay * v.workingDays;
  const emailPeopleMonth = v.sequenceSteps > 0 ? emailsMonth / v.sequenceSteps : 0;
  const linkedinMonth = v.linkedinProfiles * v.invitesPerWeek * (52 / 12);

  // Market: companies with a named contact get 1-3 prospects; the rest go to the office-email play
  // (for A accounts only after named_lookup = not_found, per prospect-tiering).
  const lo = Math.max(1, Math.min(v.prospectsMin, v.prospectsMax));
  const hi = Math.max(lo, v.prospectsMax);
  const avg = (lo + hi) / 2;
  const namedCompanies = v.tamCompanies * (v.namedShare / 100);
  const officeCompanies = (v.tamCompanies - namedCompanies) * (v.officeShare / 100);
  const unreachable = v.tamCompanies - namedCompanies - officeCompanies;
  const reachableFor = (n: number) => namedCompanies * n + officeCompanies;
  const reachablePeople = reachableFor(avg);
  const months = (people: number) => (emailPeopleMonth > 0 ? people / emailPeopleMonth : Infinity);
  const monthsToCover = months(reachablePeople);
  const monthsLo = months(reachableFor(lo));
  const monthsHi = months(reachableFor(hi));
  const peopleThisMonth = Math.min(emailPeopleMonth, reachablePeople);
  const namedThisMonth = reachablePeople > 0 ? peopleThisMonth * ((namedCompanies * avg) / reachablePeople) : 0;

  // Costs
  const prospeoCredits = namedThisMonth * 1 + namedThisMonth * (v.mobileShare / 100) * 10;
  const prospeoTier = PROSPEO_TIERS.find((t) => t.credits >= prospeoCredits) ?? PROSPEO_TIERS[PROSPEO_TIERS.length - 1];
  const share = Math.max(1, v.sharedClients);
  const allSends = emailsMonth * share;
  const allContacts = reachablePeople * share;
  const smartlead =
    SMARTLEAD_TIERS.find((t) => t.sends >= allSends && t.contacts >= allContacts) ?? SMARTLEAD_TIERS[SMARTLEAD_TIERS.length - 1];
  const smartleadUse = Math.max(allSends / smartlead.sends, smartlead.contacts === Infinity ? 0 : allContacts / smartlead.contacts);
  const lines = [
    { label: `Инбокси (${totalInboxes}: ${liveInboxes} активни + ${totalInboxes - liveInboxes} резервни)`, tool: 'InboxKit, месечно (годишно $2.50); загряването е в Smartlead', cost: totalInboxes * p.inbox },
    { label: `Домейни (${v.liveDomains + v.spareDomains})`, tool: 'годишно, разделено на 12', cost: ((v.liveDomains + v.spareDomains) * p.domainYear) / 12 },
    { label: `LinkedIn изпращане (${v.linkedinProfiles} профил)`, tool: 'GetSales', cost: v.linkedinProfiles * p.getsalesProfile },
    { label: `Данни за ~${fmt(namedThisMonth)} души: ~${fmt(prospeoCredits)} кредита`, tool: `Prospeo ${prospeoTier.name}`, cost: prospeoTier.price },
    { label: `Проверка на ~${fmt(peopleThisMonth)} имейла`, tool: 'MillionVerifier', cost: peopleThisMonth * p.verifyPerEmail },
    { label: `Имейл платформа, споделена между ${share} клиента`, tool: `Smartlead ${smartlead.name} ($${smartlead.price}), неограничени акаунти`, cost: smartlead.price / share },
    ...(salesNav ? [{ label: `Sales Navigator (${v.linkedinProfiles} профил)`, tool: 'LinkedIn', cost: v.linkedinProfiles * p.salesNav }] : []),
    { label: `Търсене на фирми, споделено между ${share} клиента`, tool: 'AI Ark', cost: p.aiArk / share },
    { label: 'Списъци, Maps, сигнали', tool: 'Apify + Serper', cost: p.apifySerper },
    { label: 'WhatsApp, SMS, проверка на номера', tool: 'Twilio', cost: p.twilio },
  ];
  const monthly = lines.reduce((s, l) => s + l.cost, 0);
  const oneTime = (v.liveDomains + v.spareDomains) * p.domainYear;
  const reachedMonth = peopleThisMonth + linkedinMonth;
  const perPerson = reachedMonth > 0 ? monthly / reachedMonth : 0;

  const warnings = [
    v.inboxesPerDomain > 3 && 'Над 3 инбокса на домейн (Google / Microsoft) нарушава правилото в outreach-deliverability.',
    v.emailsPerInboxDay > 30 && 'Над 30 имейла на инбокс на ден е над абсолютния максимум.',
    v.emailsPerInboxDay > 20 && v.emailsPerInboxDay <= 30 && 'Над 20 имейла на ден е позволено, но над нормата 15–20.',
    v.liveDomains < 6 && 'Под минимума от 6 активни домейна.',
    v.spareDomains < v.liveDomains && 'Резервните домейни са по-малко от активните (правилото е 100% резерв).',
    smartleadUse > 1 && 'Обемът на всички клиенти надхвърля и най-големия план на Smartlead.',
    emailPeopleMonth > reachablePeople * 1.5 &&
      'Капацитетът е много над пазара: помислете за 2 инбокса на домейн или ползвайте излишъка за повторен контакт.',
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Калкулатор</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">Капацитет, цена на месец и време за покриване на пазара за един клиент.</p>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setV(DEFAULTS);
            setP(PRICES);
          }}
        >
          <RotateCcw /> По подразбиране
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Inputs */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Пазарът на клиента</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="calc-tam" label="Фирми в TAM" value={v.tamCompanies} onChange={set('tamCompanies')} step={100} />
              <Field id="calc-steps" label="Имейли в секвенцията" value={v.sequenceSteps} onChange={set('sequenceSteps')} min={1} />
              <Field id="calc-pmin" label="Проспекти на фирма, от" value={v.prospectsMin} onChange={set('prospectsMin')} min={1} />
              <Field id="calc-pmax" label="Проспекти на фирма, до" value={v.prospectsMax} onChange={set('prospectsMax')} min={1} />
              <Field
                id="calc-named"
                label="Фирми с личен имейл"
                hint="На поне един човек"
                value={v.namedShare}
                onChange={set('namedShare')}
                step={5}
                suffix="%"
              />
              <Field
                id="calc-office"
                label="От останалите: с офис имейл"
                hint="office@, sales@ (1 на фирма)"
                value={v.officeShare}
                onChange={set('officeShare')}
                step={5}
                suffix="%"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Инфраструктура</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="calc-live" label="Активни домейни" hint="Минимум 6" value={v.liveDomains} onChange={set('liveDomains')} min={1} />
              <Field id="calc-spare" label="Резервни домейни" hint="Колкото активните" value={v.spareDomains} onChange={set('spareDomains')} />
              <div>
                <p className="text-sm font-medium">Инбокси на домейн</p>
                <div className="mt-1.5 inline-flex rounded-lg bg-secondary p-0.5">
                  {[2, 3].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-pressed={v.inboxesPerDomain === n}
                      onClick={() => set('inboxesPerDomain')(n)}
                      className={cn(
                        'rounded-md px-5 py-1.5 text-sm font-medium',
                        v.inboxesPerDomain === n ? 'bg-background shadow-sm' : 'text-muted-foreground'
                      )}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Google / Microsoft: максимум 2–3</p>
              </div>
              <Field
                id="calc-epd"
                label="Имейли на инбокс на ден"
                hint="Норма 15–20, максимум 30"
                value={v.emailsPerInboxDay}
                onChange={set('emailsPerInboxDay')}
              />
              <Field id="calc-days" label="Работни дни в месеца" value={v.workingDays} onChange={set('workingDays')} />
              <Field id="calc-li" label="LinkedIn профили" value={v.linkedinProfiles} onChange={set('linkedinProfiles')} />
              <Field
                id="calc-inv"
                label="LinkedIn покани на седмица"
                hint="Практически лимит ~100"
                value={v.invitesPerWeek}
                onChange={set('invitesPerWeek')}
                step={10}
              />
              <Field
                id="calc-shared"
                label="Клиенти на общите инструменти"
                hint="Smartlead и AI Ark се делят"
                value={v.sharedClients}
                onChange={set('sharedClients')}
                min={1}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card shadow-sm">
            <button
              type="button"
              onClick={() => setShowPrices(!showPrices)}
              aria-expanded={showPrices}
              className="flex w-full items-center justify-between p-5 text-left font-bold"
            >
              Цени на инструментите
              <ChevronDown className={cn('h-5 w-5 transition-transform', showPrices && 'rotate-180')} />
            </button>
            {showPrices && (
              <div className="grid gap-4 border-t border-border p-5 sm:grid-cols-2">
                <Field
                  id="pr-inbox"
                  label="Инбокс на месец"
                  hint="InboxKit $3 месечно, $2.50 годишно; Zapmail ~$3.25–3.90"
                  value={p.inbox}
                  onChange={setPrice('inbox')}
                  step={0.1}
                  suffix="$"
                />
                <Field id="pr-domain" label="Домейн на година" value={p.domainYear} onChange={setPrice('domainYear')} suffix="$" />
                <Field id="pr-gs" label="GetSales на профил" value={p.getsalesProfile} onChange={setPrice('getsalesProfile')} suffix="$" />
                <Field
                  id="pr-sn"
                  label="Sales Navigator на профил"
                  hint="Core: $119.99 месечно, ~$89.99 годишно"
                  value={p.salesNav}
                  onChange={setPrice('salesNav')}
                  step={0.01}
                  suffix="$"
                />
                <Field id="pr-ark" label="AI Ark" value={p.aiArk} onChange={setPrice('aiArk')} suffix="$" />
                <Field id="pr-ver" label="Проверка на имейл" value={p.verifyPerEmail} onChange={setPrice('verifyPerEmail')} step={0.0005} suffix="$" />
                <Field id="pr-apify" label="Apify + Serper на месец" value={p.apifySerper} onChange={setPrice('apifySerper')} suffix="$" />
                <Field id="pr-tw" label="Twilio на месец" value={p.twilio} onChange={setPrice('twilio')} suffix="$" />
                <Field
                  id="pr-mob"
                  label="Дял с мобилен номер"
                  hint="Мобилен = 10 кредита в Prospeo"
                  value={v.mobileShare}
                  onChange={set('mobileShare')}
                  suffix="%"
                />
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Цените са ориентировъчни, от публични тарифи и ревюта (октомври 2026). Проверете ги при доставчиците преди оферта към клиент.
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat strong label="Цена на месец" value={usd(monthly)} sub={`еднократно ${usd(oneTime)} за домейни`} />
            <Stat label="Нови хора на месец" value={fmt(reachedMonth)} sub={`${fmt(peopleThisMonth)} имейл${peopleThisMonth < emailPeopleMonth ? ' (целият пазар)' : ''} · ${fmt(linkedinMonth)} LinkedIn`}
            />
            <Stat label="Цена на достигнат човек" value={usd(perPerson, 2)} />
            <Stat
              label="Покриване на пазара"
              value={Number.isFinite(monthsToCover) ? (monthsToCover < 1 ? '< 1 месец' : `${fmt(monthsToCover, 1)} мес.`) : '—'}
              sub={
                Number.isFinite(monthsLo)
                  ? `от ${fmt(monthsLo, 1)} до ${fmt(monthsHi, 1)} мес. при ${lo}–${hi} проспекта`
                  : undefined
              }
            />
          </div>

          {warnings.length > 0 && (
            <ul className="space-y-2">
              {warnings.map((w) => (
                <li key={w} className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {w}
                </li>
              ))}
            </ul>
          )}

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Изпращащи акаунти</h2>
            <ul className="mt-3 divide-y divide-border text-sm">
              <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">Имейл инбокси</span>
                  <span className="block text-xs text-muted-foreground">
                    {v.liveDomains + v.spareDomains} домейна × {v.inboxesPerDomain}; резервните само загряват
                  </span>
                </span>
                <span className="tabular-nums">
                  <strong>{fmt(liveInboxes)}</strong> активни + {fmt(totalInboxes - liveInboxes)} резервни
                </span>
              </li>
              <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">Smartlead {smartlead.name}</span>
                  <span className="block text-xs text-muted-foreground">
                    Неограничени имейл акаунти; лимит {fmt(smartlead.sends)} имейла
                    {smartlead.contacts === Infinity ? '' : ` и ${fmt(smartlead.contacts)} контакта`} на месец за всички {share} клиента
                  </span>
                </span>
                <span className="tabular-nums">
                  <strong>{fmt(Math.min(999, smartleadUse * 100))}%</strong> заето
                </span>
              </li>
              <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">LinkedIn профили</span>
                  <span className="block text-xs text-muted-foreground">
                    Истински профил на клиента или основателя, одитиран (linkedin-profile-audit); GetSales на профил
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                    <input id="calc-salesnav" type="checkbox" checked={salesNav} onChange={(e) => setSalesNav(e.target.checked)} className="accent-primary" />
                    Sales Navigator
                  </label>
                  <strong className="tabular-nums">{fmt(v.linkedinProfiles)}</strong>
                </span>
              </li>
              <li className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
                <span>
                  <span className="font-medium">WhatsApp / SMS номер</span>
                  <span className="block text-xs text-muted-foreground">Twilio; отделен номер, ако клиентът пише от свое име</span>
                </span>
                <strong className="tabular-nums">1</strong>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Пазарът в адреси</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">С личен имейл</dt>
                <dd className="font-semibold tabular-nums">{fmt(namedCompanies)} фирми</dd>
                <dd className="text-xs text-muted-foreground tabular-nums">
                  {fmt(namedCompanies * lo)}–{fmt(namedCompanies * hi)} души
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Само офис имейл</dt>
                <dd className="font-semibold tabular-nums">{fmt(officeCompanies)} фирми</dd>
                <dd className="text-xs text-muted-foreground">1 адрес на фирма</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Без имейл</dt>
                <dd className="font-semibold tabular-nums">{fmt(unreachable)} фирми</dd>
                <dd className="text-xs text-muted-foreground">LinkedIn или телефон</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Адреси общо</dt>
                <dd className="font-semibold tabular-nums">
                  {fmt(reachableFor(lo))}–{fmt(reachableFor(hi))}
                </dd>
                <dd className="text-xs text-muted-foreground tabular-nums">средно {fmt(reachablePeople)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Правила от prospect-tiering: най-много 2 души от една фирма паралелно (различни роли, с 3+ дни разлика), третият след края на първата секвенция; една фирма не получава имейли от два наши домейна в един ден; офис имейл никога паралелно с човек от същата фирма. При A фирми офис имейл се ползва само след като търсенето на конкретен човек (Prospeo, после AI Ark) не е намерило никого.
            </p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Капацитет по имейл</h2>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Активни инбокси</dt>
                <dd className="font-semibold tabular-nums">{fmt(liveInboxes)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Имейли на ден</dt>
                <dd className="font-semibold tabular-nums">{fmt(liveInboxes * v.emailsPerInboxDay)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Имейли на месец</dt>
                <dd className="font-semibold tabular-nums">{fmt(emailsMonth)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Нови хора на месец</dt>
                <dd className="font-semibold tabular-nums">{fmt(emailPeopleMonth)}</dd>
              </div>
            </dl>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Месечен капацитет спрямо пазара с контакт</span>
                <span className="tabular-nums">{reachablePeople > 0 ? fmt(Math.min(100, (emailPeopleMonth / reachablePeople) * 100)) : 0}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all"
                  style={{ width: `${reachablePeople > 0 ? Math.min(100, (emailPeopleMonth / reachablePeople) * 100) : 0}%` }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Разходи на месец</h2>
            <ul className="mt-3 divide-y divide-border">
              {lines.map((l) => (
                <li key={l.label} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.tool}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{usd(l.cost)}</span>
                </li>
              ))}
              <li className="flex items-center justify-between gap-3 pt-3 text-base font-bold">
                <span>Общо</span>
                <span className="tabular-nums">{usd(monthly)}</span>
              </li>
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Не са включени: времето на екипа, Claude и Hermes, Sales Navigator, Viber (~$197 на изпращач), SMS изпращач с име ($220). През 2–3-те седмици загряване инбоксите се плащат, без да изпращат.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
