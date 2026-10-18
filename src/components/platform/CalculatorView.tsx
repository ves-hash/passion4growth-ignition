import { useState } from 'react';
import { AlertTriangle, ChevronDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

// Limits from outreach-deliverability; prices researched 2026-10 (approximate, USD).
const DEFAULTS = {
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
  verifyPerEmail: 0.0037,
  twilio: 10,
  // Lead-source processing (apify-actors, Starter tier), USD per 1,000 companies
  apifyPlan: 19,
  crawlPerK: 1,
  serperPerK: 0.6,
  contactPerK: 10,
  signalsPerK: 6,
};

// Lead sources (outreach-lead-sourcing, apify-actors, prospect-source-finder). We collect from every source,
// merge, clean and dedupe (lead-data-hygiene), check the ICP, and only then look for people in fit companies.
// rows = raw companies from the source; fit = share of its unique companies that pass the ICP check;
// perK = USD per 1,000 raw companies.
interface LeadSource {
  id: string;
  name: string;
  tool: string;
  on: boolean;
  rows: number;
  fit: number;
  perK: number;
  fixed: number;
  sharedFixed: boolean;
  apify: boolean;
}
const SOURCES: LeadSource[] = [
  { id: 'aiark', name: 'AI Ark (търсене и look-alike)', tool: 'AI Ark $49, споделен', on: true, rows: 1000, fit: 60, perK: 0, fixed: 49, sharedFixed: true, apify: false },
  { id: 'maps', name: 'Google Maps', tool: 'Apify compass/crawler-google-places: места $3 + контакти $2 + филтър $1 на 1 000', on: true, rows: 1500, fit: 30, perK: 6, fixed: 0, sharedFixed: false, apify: true },
  { id: 'directories', name: 'Справочници и асоциации', tool: 'directory-browser-extractor (Playwright); само токени за извличане', on: true, rows: 900, fit: 50, perK: 2, fixed: 0, sharedFixed: false, apify: false },
  { id: 'europages', name: 'Europages', tool: 'Apify memo23/europages-scraper, $6 + $1 допълнителни данни', on: false, rows: 700, fit: 50, perK: 7, fixed: 0, sharedFixed: false, apify: true },
  { id: 'fairs', name: 'Изложители на панаири', tool: 'Apify skython/exhibitor-list-scraper', on: false, rows: 300, fit: 50, perK: 4.5, fixed: 0, sharedFixed: false, apify: true },
  { id: 'marketplaces', name: 'Маркетплейси (Allegro, eMAG)', tool: 'Apify memo23/allegro-scraper и др.; контактите се плащат отделно', on: false, rows: 400, fit: 30, perK: 3, fixed: 0, sharedFixed: false, apify: true },
  { id: 'registers', name: 'Търговски регистри (платен API)', tool: 'По държава; въведете цената на доставчика', on: false, rows: 2000, fit: 40, perK: 0, fixed: 0, sharedFixed: false, apify: false },
];
const SOURCE_OPTS = { overlap: 20, refresh: 10, signals: true, signalChecks: 2 };

// Claude API, USD per 1M tokens (claude-api skill, 2026-10). Batch API halves token cost.
const MODELS = {
  opus: { name: 'Opus 5.5', input: 4, output: 20 },
  sonnet: { name: 'Sonnet 5.5', input: 2, output: 10 },
  haiku: { name: 'Haiku 5.5', input: 0.1, output: 0.5 },
} as const;
type ModelKey = keyof typeof MODELS;
const tokenCost = (m: ModelKey, inK: number, outK: number) => (inK * MODELS[m].input + outK * MODELS[m].output) / 1000;

const AI_DEFAULTS = {
  model: 'sonnet' as ModelKey,
  batch: true,
  abShare: 40,
  dossierInK: 60,
  dossierOutK: 5,
  searches: 10,
  searchPrice: 0.01,
  replyRate: 3,
  reportsMonthly: 15,
  hermes: 10,
};

// Operator and pricing. Hours per client are estimates from the human steps in the skills;
// replace them with timed numbers from the first clients.
type Mode = 'managed' | 'self';
const MODE_DEFAULTS: Record<Mode, { hours: number; onboarding: number; margin: number; price: number }> = {
  managed: { hours: 17, onboarding: 22, margin: 63, price: 2500 },
  self: { hours: 4, onboarding: 5, margin: 55, price: 1350 },
};
const OP_DEFAULTS = {
  mode: 'managed' as Mode,
  operatorCost: 2500,
  productiveHours: 120,
  newClientsPerMonth: 1,
  overhead: 15,
  usdToEur: 0.92,
  ...MODE_DEFAULTS.managed,
};
const roundUp50 = (n: number) => Math.ceil(n / 50) * 50;
const eur = (n: number) => `€${fmt(n)}`;

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
  const [ai, setAi] = useState(AI_DEFAULTS);
  const [op, setOp] = useState(OP_DEFAULTS);
  const [src, setSrc] = useState<LeadSource[]>(SOURCES);
  const [sx, setSx] = useState(SOURCE_OPTS);
  const setSource = (id: string, patch: Partial<LeadSource>) => setSrc(src.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const setOpNum = (k: keyof typeof OP_DEFAULTS) => (n: number) => setOp({ ...op, [k]: n });
  const setAiNum = (k: keyof typeof AI_DEFAULTS) => (n: number) => setAi({ ...ai, [k]: n });
  const set = (k: keyof Inputs) => (n: number) => setV({ ...v, [k]: n });
  const setPrice = (k: keyof Prices) => (n: number) => setP({ ...p, [k]: n });

  // Capacity
  const liveInboxes = v.liveDomains * v.inboxesPerDomain;
  const totalInboxes = (v.liveDomains + v.spareDomains) * v.inboxesPerDomain;
  const emailsMonth = liveInboxes * v.emailsPerInboxDay * v.workingDays;
  const emailPeopleMonth = v.sequenceSteps > 0 ? emailsMonth / v.sequenceSteps : 0;
  const linkedinMonth = v.linkedinProfiles * v.invitesPerWeek * (52 / 12);

  // Lead sources → merge, clean, dedupe → ICP check → TAM. The whole TAM is built in the first month;
  // every month after, `refresh`% of the rows are collected again for new companies.
  const share = Math.max(1, v.sharedClients);
  const active = src.filter((s) => s.on);
  const keepF = Math.min(1, Math.max(0, 1 - sx.overlap / 100));
  const sources = active.map((s) => {
    const unique = s.rows * keepF;
    const fitCompanies = unique * (s.fit / 100);
    const build = (s.rows * s.perK) / 1000;
    return { ...s, unique, fitCompanies, build, fixedMonth: s.sharedFixed ? s.fixed / share : s.fixed };
  });
  const refreshF = Math.min(1, Math.max(0, sx.refresh / 100));
  const rawTotal = sources.reduce((a, s) => a + s.rows, 0);
  const uniqueTotal = sources.reduce((a, s) => a + s.unique, 0);
  const tamCompanies = sources.reduce((a, s) => a + s.fitCompanies, 0);
  const processBuild = (uniqueTotal * (p.crawlPerK + p.serperPerK)) / 1000;
  const contactBuild = (tamCompanies * (1 - v.namedShare / 100) * p.contactPerK) / 1000;
  const sourcesBuild = sources.reduce((a, s) => a + s.build, 0) + processBuild + contactBuild;
  const signalsMonth = sx.signals ? (tamCompanies * sx.signalChecks * p.signalsPerK) / 1000 : 0;
  const apifyBuild = sources.reduce((a, s) => a + (s.apify ? s.build : 0), 0) + (uniqueTotal * p.crawlPerK) / 1000 + contactBuild;
  const apifyUsageMonth = apifyBuild * refreshF + signalsMonth;
  const apifyTopUp = Math.max(0, p.apifyPlan / share - apifyUsageMonth);
  const sourceLines = [
    ...sources.map((s) => ({
      label: `${s.name}: ~${fmt(s.rows * refreshF)} фирми на месец`,
      tool: s.tool,
      cost: s.fixedMonth + s.build * refreshF,
    })),
    { label: `Текст от сайта и ключови думи за ~${fmt(uniqueTotal * refreshF)} фирми без дубли`, tool: 'Apify website-content-crawler + Serper', cost: processBuild * refreshF },
    { label: 'Контакти от сайта на годни фирми без личен имейл', tool: 'Apify vdrmota/contact-info-scraper', cost: contactBuild * refreshF },
    ...(sx.signals
      ? [{ label: `Сигнали: ${sx.signalChecks} проверки на месец за ${fmt(tamCompanies)} фирми`, tool: 'Apify: обяви за работа, реклами', cost: signalsMonth }]
      : []),
    ...(apifyTopUp > 0 ? [{ label: 'Apify план: минимумът над използваното', tool: `Starter $${p.apifyPlan}, споделен между ${share} клиента`, cost: apifyTopUp }] : []),
  ];

  // Market: companies with a named contact get 1-3 prospects; the rest go to the office-email play
  // (for A accounts only after named_lookup = not_found, per prospect-tiering).
  const lo = Math.max(1, Math.min(v.prospectsMin, v.prospectsMax));
  const hi = Math.max(lo, v.prospectsMax);
  const avg = (lo + hi) / 2;
  const namedCompanies = tamCompanies * (v.namedShare / 100);
  const officeCompanies = (tamCompanies - namedCompanies) * (v.officeShare / 100);
  const unreachable = tamCompanies - namedCompanies - officeCompanies;
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
    ...sourceLines,
    { label: 'WhatsApp, SMS, проверка на номера', tool: 'Twilio', cost: p.twilio },
  ];
  const tools = lines.reduce((s, l) => s + l.cost, 0);

  // AI (Claude API) and Hermes
  const batchF = ai.batch ? 0.5 : 1;
  const reachableCompanies = namedCompanies + officeCompanies;
  const companiesMonth = reachablePeople > 0 ? reachableCompanies * (peopleThisMonth / reachablePeople) : 0;
  const dossierUnit = tokenCost(ai.model, ai.dossierInK, ai.dossierOutK) * batchF + ai.searches * ai.searchPrice;
  const aiLines = [
    { label: `ICP проверка на ~${fmt(uniqueTotal * refreshF)} нови фирми без дубли`, tool: `${MODELS.haiku.name}, ~10k токена`, cost: uniqueTotal * refreshF * tokenCost('haiku', 10, 1) * batchF },
    {
      label: `Досиета и Entry Plan за ~${fmt(companiesMonth * (ai.abShare / 100))} A/B фирми`,
      tool: `${MODELS[ai.model].name}, ${ai.dossierInK}k / ${ai.dossierOutK}k токена + ${ai.searches} търсения${ai.batch ? ', Batch' : ''}`,
      cost: companiesMonth * (ai.abShare / 100) * dossierUnit,
    },
    { label: `Персонализация за ~${fmt(peopleThisMonth)} души`, tool: `${MODELS.sonnet.name}, ~5k / 1k токена${ai.batch ? ', Batch' : ''}`, cost: peopleThisMonth * tokenCost('sonnet', 5, 1) * batchF },
    { label: `Отговори: ~${fmt(peopleThisMonth * (ai.replyRate / 100))} класификации и чернови`, tool: MODELS.sonnet.name, cost: peopleThisMonth * (ai.replyRate / 100) * tokenCost('sonnet', 10, 1) },
    { label: 'Бриф, оферти, седмични отчети', tool: MODELS.opus.name, cost: ai.reportsMonthly },
  ];
  const aiTotal = aiLines.reduce((s, l) => s + l.cost, 0);
  const monthly = tools + aiTotal + ai.hermes;

  // First month: domains for the year, warm-up weeks with no sending, the whole TAM built and researched at once
  const domainsYear = (v.liveDomains + v.spareDomains) * p.domainYear;
  const warmupCost = totalInboxes * p.inbox * 0.75;
  const tamResearch = reachableCompanies * (ai.abShare / 100) * dossierUnit + uniqueTotal * tokenCost('haiku', 10, 1) * batchF;
  const researchExtra = Math.max(0, tamResearch - aiLines[0].cost - aiLines[1].cost);
  const sourcesExtra = sourcesBuild * (1 - refreshF);
  const oneTime = domainsYear;
  const firstMonth = monthly + domainsYear + warmupCost + researchExtra + sourcesExtra;

  // Operator capacity and price (EUR)
  const opHourly = op.productiveHours > 0 ? op.operatorCost / op.productiveHours : 0;
  const clientsPerOperator =
    op.hours > 0 ? Math.max(0, Math.floor((op.productiveHours - op.newClientsPerMonth * op.onboarding) / op.hours)) : 0;
  const clientsSteady = op.hours > 0 ? Math.floor(op.productiveHours / op.hours) : 0;
  const machineEur = monthly * op.usdToEur;
  const operatorEur = op.hours * opHourly;
  const costEur = (machineEur + operatorEur) * (1 + op.overhead / 100);
  const marginF = Math.min(0.95, Math.max(0, op.margin / 100));
  const recommended = roundUp50(costEur / (1 - marginF));
  const setupCostEur = (op.onboarding * opHourly + (firstMonth - monthly) * op.usdToEur) * (1 + op.overhead / 100);
  const setupFee = roundUp50(setupCostEur / (1 - marginF));
  const yourMargin = op.price > 0 ? 1 - costEur / op.price : 0;
  const opRevenue = clientsPerOperator * op.price;
  const opProfit = clientsPerOperator * (op.price - costEur);
  const reachedMonth = peopleThisMonth + linkedinMonth;
  const perPerson = reachedMonth > 0 ? monthly / reachedMonth : 0;

  const warnings = [
    v.inboxesPerDomain > 3 && 'Над 3 инбокса на домейн (Google / Microsoft) нарушава правилото в outreach-deliverability.',
    v.emailsPerInboxDay > 30 && 'Над 30 имейла на инбокс на ден е над абсолютния максимум.',
    v.emailsPerInboxDay > 20 && v.emailsPerInboxDay <= 30 && 'Над 20 имейла на ден е позволено, но над нормата 15–20.',
    v.liveDomains < 6 && 'Под минимума от 6 активни домейна.',
    v.spareDomains < v.liveDomains && 'Резервните домейни са по-малко от активните (правилото е 100% резерв).',
    smartleadUse > 1 && 'Обемът на всички клиенти надхвърля и най-големия план на Smartlead.',
    op.price > 0 && op.price < costEur && 'Вашата цена е под себестойността.',
    clientsPerOperator < 1 && 'Часовете на клиент не се побират в месеца на един оператор.',
    active.length === 0 && 'Няма включен източник на лийдове.',
    active.length > 0 && tamCompanies < 1 && 'Нито една фирма не минава ICP проверката: проверете процентите.',
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
            setAi(AI_DEFAULTS);
            setOp(OP_DEFAULTS);
            setSalesNav(false);
            setSrc(SOURCES);
            setSx(SOURCE_OPTS);
          }}
        >
          <RotateCcw /> По подразбиране
        </Button>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Inputs */}
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">1. Лийд източници</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Събираме от всички включени източници, сливаме, чистим и махаме дублите, после проверяваме ICP. Сменете бройките и процентите с измереното на първия списък.
            </p>
            <ul className="mt-4 space-y-3">
              {src.map((s) => (
                <li key={s.id} className={cn('rounded-xl border p-3', s.on ? 'border-border' : 'border-dashed border-border/70')}>
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      id={`src-${s.id}`}
                      type="checkbox"
                      checked={s.on}
                      onChange={(e) => setSource(s.id, { on: e.target.checked })}
                      className="mt-1 accent-primary"
                    />
                    <span className="min-w-0">
                      <span className={cn('block text-sm font-medium', !s.on && 'text-muted-foreground')}>{s.name}</span>
                      <span className="block text-xs text-muted-foreground">{s.tool}</span>
                    </span>
                  </label>
                  {s.on && (
                    <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                      <Field id={`src-${s.id}-rows`} label="Фирми от източника" value={s.rows} onChange={(n) => setSource(s.id, { rows: n })} step={100} />
                      <Field id={`src-${s.id}-fit`} label="Минават ICP" value={s.fit} onChange={(n) => setSource(s.id, { fit: n })} step={5} suffix="%" />
                      <Field id={`src-${s.id}-perk`} label="На 1 000 фирми" value={s.perK} onChange={(n) => setSource(s.id, { perK: n })} step={0.5} suffix="$" />
                      {(s.fixed > 0 || s.id === 'registers') && (
                        <Field
                          id={`src-${s.id}-fixed`}
                          label={s.sharedFixed ? 'План на месец (делим)' : 'Абонамент на месец'}
                          value={s.fixed}
                          onChange={(n) => setSource(s.id, { fixed: n })}
                          suffix="$"
                        />
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="src-overlap" label="Дубли между източниците" hint="Махат се при сливането (lead-data-hygiene)" value={sx.overlap} onChange={(n) => setSx({ ...sx, overlap: n })} step={5} suffix="%" />
              <Field id="src-refresh" label="Повторно събиране на месец" hint="Дял от редовете, за нови фирми" value={sx.refresh} onChange={(n) => setSx({ ...sx, refresh: n })} suffix="%" />
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input id="src-signals" type="checkbox" checked={sx.signals} onChange={(e) => setSx({ ...sx, signals: e.target.checked })} className="accent-primary" />
                Следене на сигнали (обяви, реклами)
              </label>
              {sx.signals && (
                <Field id="src-checks" label="Проверки на месец" value={sx.signalChecks} onChange={(n) => setSx({ ...sx, signalChecks: n })} />
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">2. Хората в годните фирми</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Търсим ги само в {fmt(tamCompanies)} фирми, минали ICP проверката: Prospeo, после AI Ark; офис имейл само ако няма човек.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
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
            <h2 className="font-bold">3. Инфраструктура</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field id="calc-steps" label="Имейли в секвенцията" value={v.sequenceSteps} onChange={set('sequenceSteps')} min={1} />
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
                hint="Smartlead, AI Ark и Apify се делят"
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
                <Field id="pr-ver" label="Проверка на имейл" value={p.verifyPerEmail} onChange={setPrice('verifyPerEmail')} step={0.0005} suffix="$" />
                <Field id="pr-apify" label="Apify план на месец" hint="Starter $19; включва толкова използване" value={p.apifyPlan} onChange={setPrice('apifyPlan')} suffix="$" />
                <Field id="pr-crawl" label="Текст от сайт, на 1 000 фирми" hint="~5 страници × $0.2 на 1 000" value={p.crawlPerK} onChange={setPrice('crawlPerK')} step={0.1} suffix="$" />
                <Field id="pr-serper" label="Serper, на 1 000 фирми" hint="~2 търсения × $0.30 на 1 000" value={p.serperPerK} onChange={setPrice('serperPerK')} step={0.1} suffix="$" />
                <Field id="pr-contact" label="Контакти от сайт, на 1 000 фирми" hint="~5 страници × $2 на 1 000" value={p.contactPerK} onChange={setPrice('contactPerK')} suffix="$" />
                <Field id="pr-signals" label="Сигнали, на 1 000 проверки" hint="Обяви $1 + реклами $5" value={p.signalsPerK} onChange={setPrice('signalsPerK')} suffix="$" />
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

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">AI (Claude) и Hermes</h2>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-medium">Модел за досиетата</p>
                <div className="mt-1.5 inline-flex flex-wrap rounded-lg bg-secondary p-0.5">
                  {(Object.keys(MODELS) as ModelKey[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={ai.model === m}
                      onClick={() => setAi({ ...ai, model: m })}
                      className={cn('rounded-md px-3 py-1.5 text-sm font-medium', ai.model === m ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                    >
                      {MODELS[m].name}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ${MODELS[ai.model].input} / ${MODELS[ai.model].output} за 1M входящи / изходящи токена
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input id="calc-batch" type="checkbox" checked={ai.batch} onChange={(e) => setAi({ ...ai, batch: e.target.checked })} className="accent-primary" />
                Batch API (−50% на токените; резултатът идва до 24 часа)
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="ai-ab" label="Дял A/B фирми" hint="Само те получават пълно досие" value={ai.abShare} onChange={setAiNum('abShare')} step={5} suffix="%" />
                <Field id="ai-search" label="Търсения на досие" hint="~$10 за 1 000 търсения" value={ai.searches} onChange={setAiNum('searches')} />
                <Field id="ai-in" label="Входящи токени на досие" value={ai.dossierInK} onChange={setAiNum('dossierInK')} step={5} suffix="k" />
                <Field id="ai-out" label="Изходящи токени на досие" value={ai.dossierOutK} onChange={setAiNum('dossierOutK')} suffix="k" />
                <Field id="ai-reply" label="Дял отговори" value={ai.replyRate} onChange={setAiNum('replyRate')} step={0.5} suffix="%" />
                <Field id="ai-hermes" label="Hermes сървър на клиент" hint="Допускане; сменете с реалната цена" value={ai.hermes} onChange={setAiNum('hermes')} suffix="$" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="font-bold">Оператор и цена</h2>
            <div className="mt-4 space-y-4">
              <div className="inline-flex rounded-lg bg-secondary p-0.5">
                {(['managed', 'self'] as Mode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={op.mode === m}
                    onClick={() => setOp({ ...op, mode: m, ...MODE_DEFAULTS[m] })}
                    className={cn('rounded-md px-3 py-1.5 text-sm font-medium', op.mode === m ? 'bg-background shadow-sm' : 'text-muted-foreground')}
                  >
                    {m === 'managed' ? 'С оператор' : 'Самообслужване'}
                  </button>
                ))}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="op-cost" label="Разход за оператор на месец" hint="Заплата + осигуровки; сменете с реалния" value={op.operatorCost} onChange={setOpNum('operatorCost')} step={100} suffix="€" />
                <Field id="op-prod" label="Продуктивни часове на месец" hint="~160 × 75%" value={op.productiveHours} onChange={setOpNum('productiveHours')} step={5} />
                <Field id="op-hours" label="Часове на клиент на месец" hint="С оператор ~17, сам ~4; засечете реалните" value={op.hours} onChange={setOpNum('hours')} />
                <Field id="op-onb" label="Часове за онбординг" hint="С оператор ~22, сам ~5" value={op.onboarding} onChange={setOpNum('onboarding')} />
                <Field id="op-new" label="Нови клиенти на месец на оператор" value={op.newClientsPerMonth} onChange={setOpNum('newClientsPerMonth')} />
                <Field id="op-over" label="Общи разходи" hint="Управление, продажби, счетоводство, Claude абонаменти" value={op.overhead} onChange={setOpNum('overhead')} suffix="%" />
                <Field id="op-margin" label="Целеви брутен марж" hint="Агенция 60–70%" value={op.margin} onChange={setOpNum('margin')} suffix="%" />
                <Field id="op-price" label="Вашата цена на месец" value={op.price} onChange={setOpNum('price')} step={50} suffix="€" />
                <Field id="op-fx" label="Курс USD → EUR" hint="Сменете с текущия" value={op.usdToEur} onChange={setOpNum('usdToEur')} step={0.01} />
              </div>
            </div>
          </section>
        </div>

        {/* Results */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat strong label="Цена на месец без човешки труд" value={usd(monthly)} sub={`първи месец ~${usd(firstMonth)}`} />
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

          <section className="rounded-2xl border-2 border-primary/30 bg-card p-5 shadow-sm">
            <h2 className="font-bold">Цена за клиента · {op.mode === 'managed' ? 'с оператор' : 'самообслужване'}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat strong label="Препоръчителна цена" value={`${eur(recommended)}/мес.`} sub={`при ${op.margin}% марж`} />
              <Stat label="Такса при старта" value={eur(setupFee)} sub="онбординг, домейни, загряване" />
              <Stat label="Себестойност" value={`${eur(costEur)}/мес.`} sub={`AI и инструменти ${eur(machineEur)} · оператор ${eur(operatorEur)}`} />
              <Stat label="Клиенти на оператор" value={fmt(clientsPerOperator)} sub={`${fmt(clientsSteady)} без нови онбординги`} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-muted-foreground">Марж при вашата цена</dt>
                <dd className={cn('font-semibold tabular-nums', yourMargin < 0.5 ? 'text-amber-700' : 'text-emerald-700')}>
                  {fmt(yourMargin * 100)}% при {eur(op.price)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Долна граница (0% марж)</dt>
                <dd className="font-semibold tabular-nums">{eur(costEur)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Приход на оператор</dt>
                <dd className="font-semibold tabular-nums">{eur(opRevenue)}/мес.</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Брутна печалба на оператор</dt>
                <dd className="font-semibold tabular-nums">{eur(opProfit)}/мес.</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-muted-foreground">
              Минимален срок 3 месеца: първият месец е за загряване и подготовка. Цената е за един пакет обем (тези домейни и LinkedIn профили); по-голям TAM е следващ пакет.
            </p>
          </section>

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
            <h2 className="font-bold">От източниците до хората</h2>
            <ol className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {[
                { k: 'Събрани фирми', n: fmt(rawTotal), s: `${active.length} източника` },
                { k: 'След почистване и дубли', n: fmt(uniqueTotal), s: `−${fmt(sx.overlap)}% дубли` },
                { k: 'Минават ICP (TAM)', n: fmt(tamCompanies), s: uniqueTotal > 0 ? `${fmt((tamCompanies / uniqueTotal) * 100)}% от уникалните` : '' },
                { k: 'Адреси на хора', n: `${fmt(reachableFor(lo))}–${fmt(reachableFor(hi))}`, s: `${fmt(namedCompanies)} фирми с човек · ${fmt(officeCompanies)} офис` },
              ].map((x, i) => (
                <li key={x.k} className="rounded-xl bg-secondary/60 p-3">
                  <p className="text-xs text-muted-foreground">
                    {i + 1}. {x.k}
                  </p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums">{x.n}</p>
                  <p className="text-xs text-muted-foreground">{x.s}</p>
                </li>
              ))}
            </ol>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="py-1.5 pr-3 font-medium">Източник</th>
                    <th className="py-1.5 pr-3 text-right font-medium">Събрани</th>
                    <th className="py-1.5 pr-3 text-right font-medium">Без дубли</th>
                    <th className="py-1.5 pr-3 text-right font-medium">Годни</th>
                    <th className="py-1.5 pr-3 text-right font-medium">Събиране</th>
                    <th className="py-1.5 text-right font-medium">На годна фирма</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sources.map((s) => (
                    <tr key={s.id}>
                      <td className="py-2 pr-3">{s.name}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(s.rows)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(s.unique)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{fmt(s.fitCompanies)}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">{usd(s.build, 2)}</td>
                      <td className="py-2 text-right tabular-nums">{s.fitCompanies > 0 ? usd(s.build / s.fitCompanies, 3) : '—'}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td className="py-2 pr-3">Общо, с проверка на сайтовете и контакти</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(rawTotal)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(uniqueTotal)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{fmt(tamCompanies)}</td>
                    <td className="py-2 pr-3 text-right tabular-nums">{usd(sourcesBuild, 2)}</td>
                    <td className="py-2 text-right tabular-nums">{tamCompanies > 0 ? usd(sourcesBuild / tamCompanies, 3) : '—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Ред: събиране от всички източници → сливане, почистване и махане на дублите (lead-data-hygiene) → ICP проверка само на уникалните → хора и имейли само в годните фирми. Събирането на целия TAM влиза в първия месец; след това ~{fmt(sx.refresh)}% на месец за нови фирми. Нов източник се добавя след тест в prospect-source-finder.
            </p>
          </section>

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
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Инструменти · {usd(tools)}</p>
            <ul className="mt-1 divide-y divide-border">
              {lines.map((l) => (
                <li key={l.label} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.tool}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{usd(l.cost)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI (Claude API) · {usd(aiTotal)}</p>
            <ul className="mt-1 divide-y divide-border">
              {aiLines.map((l) => (
                <li key={l.label} className="flex items-start justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0">
                    <span className="block">{l.label}</span>
                    <span className="block text-xs text-muted-foreground">{l.tool}</span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums">{usd(l.cost)}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-2 divide-y divide-border border-t border-border">
              <li className="flex items-start justify-between gap-3 py-2 text-sm">
                <span>
                  Hermes сървър
                  <span className="block text-xs text-muted-foreground">дял на клиент (допускане)</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums">{usd(ai.hermes)}</span>
              </li>
              <li className="flex items-center justify-between gap-3 pt-3 text-base font-bold">
                <span>Общо без човешки труд</span>
                <span className="tabular-nums">{usd(monthly)}</span>
              </li>
            </ul>

            <div className="mt-5 rounded-xl bg-secondary/70 p-4">
              <p className="text-sm font-semibold">Първи месец: ~{usd(firstMonth)}</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li className="flex justify-between gap-3"><span>Месечната сума</span><span className="tabular-nums">{usd(monthly)}</span></li>
                <li className="flex justify-between gap-3"><span>Домейни за година ({v.liveDomains + v.spareDomains})</span><span className="tabular-nums">{usd(oneTime)}</span></li>
                <li className="flex justify-between gap-3"><span>Загряване: ~3 седмици инбокси без изпращане</span><span className="tabular-nums">{usd(warmupCost)}</span></li>
                <li className="flex justify-between gap-3"><span>Събиране на целия TAM от източниците (над месечното)</span><span className="tabular-nums">{usd(sourcesExtra)}</span></li>
                <li className="flex justify-between gap-3"><span>Проучване на целия TAM наведнъж (над месечното)</span><span className="tabular-nums">{usd(researchExtra)}</span></li>
              </ul>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Не са включени: времето на екипа, абонаментите на екипа за Claude (на човек), Viber (~$197 на изпращач), SMS изпращач с име ($220). AI сумите са прогноза: сменете токените и модела с реалните от Anthropic Console.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CalculatorView;
