// Примерни данни за прототипа на екипната платформа. Клиентите, хората и
// числата тук са измислени; фазите, скиловете и човешките стъпки идват от
// system-map.json.

export type TaskStatus = 'done' | 'running' | 'waiting' | 'blocked' | 'todo';

/** Името на всеки скил така, както го вижда екипът: резултат, не инструмент. */
export const TASK_LABELS: Record<string, string> = {
  'cold-outreach-system': 'План на кампанията',
  'p4g-outreach-architecture': 'Разпределение Claude / Hermes',
  'outreach-compliance-cee': 'Правна проверка по държави',
  'client-niche-brief': 'Бриф за нишата и ICP',
  'outreach-deliverability': 'Домейни и инбокси',
  'outreach-icp-onboarding': 'Одобрение на ICP от клиента',
  'google-search-discovery': 'Списъци от асоциации и изложения',
  'directory-browser-extractor': 'Извличане от директории',
  'google-maps-sourcing': 'Фирми от Google Maps',
  'outreach-lead-sourcing': 'TAM: фирми и хора',
  'directory-website-verifier': 'Проверка на сайтовете за ICP',
  'website-keyword-check': 'Ключова дума в сайта',
  'apify-actors': 'Избор на Apify актьори',
  'prospect-source-finder': 'Нови източници при недостиг',
  'lead-data-hygiene': 'Почистване и валидиране',
  'account-intelligence': 'Досиета и Entry Plan',
  'cold-offer-writing': 'Оферти за тест',
  'outreach-infrastructure-channels': 'Канали и проследяване',
  'outreach-evaluation': 'Оценка на списъка и резултатите',
  'prospect-tiering': 'Приоритети P1–P3 и канал',
  'phone-channel-pipeline': 'Телефони и месинджъри',
  'outreach-sequence-copywriting': 'Секвенции по канали',
  'outreach-report-internal': 'Вътрешен отчет',
  'outreach-report-client': 'Отчет за клиента',
};

export const GATE_CHECKS: Record<string, string[]> = {
  gate1: ['Клиентът изпраща клиенти и откази (A1, A2)', 'Клиентът одобрява ICP (C1)'],
  gate2: ['Одобрени фирми, персони, оферти, език (C2–C6)', 'Scorecard на списъка A или B', 'Compliance чеклист'],
};

export interface DemoClient {
  id: string;
  name: string;
  niche: string;
  countries: string[];
  lead: string;
  phase: string;
  /** Изключения от статуса, който се извежда от фазата. */
  overrides: Record<string, { status: TaskStatus; note?: string }>;
  gateDone: Record<string, boolean[]>;
  metrics?: { label: string; value: string }[];
}

export const DEMO_CLIENTS: DemoClient[] = [
  {
    id: 'logistics',
    name: 'Демо · Логистика',
    niche: '3PL и складова логистика',
    countries: ['BG', 'RO'],
    lead: 'Вес',
    phase: 'phase1',
    overrides: {
      'lead-data-hygiene': { status: 'blocked', note: 'Няма избран email verifier' },
      'prospect-source-finder': { status: 'waiting', note: 'Одобри покупка на инструмент' },
      'account-intelligence': { status: 'waiting', note: '12 Entry Plan за A акаунти' },
      'cold-offer-writing': { status: 'waiting', note: 'Клиентът избира оферти' },
      'google-search-discovery': { status: 'done' },
      'directory-browser-extractor': { status: 'done' },
    },
    gateDone: { gate1: [true, true], gate2: [false, false, false] },
    metrics: [
      { label: 'фирми в TAM', value: '1 240' },
      { label: 'ICP потвърдени', value: '388' },
      { label: 'A акаунти', value: '41' },
    ],
  },
  {
    id: 'industrial',
    name: 'Демо · Индустриално оборудване',
    niche: 'Резервни части за машини',
    countries: ['BG', 'GR'],
    lead: 'Мария',
    phase: 'gate1',
    overrides: {
      'outreach-icp-onboarding': { status: 'waiting', note: 'Чака A1, A2 и одобрение на ICP' },
      'outreach-deliverability': { status: 'waiting', note: 'Купи домейни' },
    },
    gateDone: { gate1: [false, false], gate2: [false, false, false] },
  },
  {
    id: 'saas',
    name: 'Демо · B2B SaaS',
    niche: 'Софтуер за сервизни екипи',
    countries: ['BG', 'HU', 'SK'],
    lead: 'Вес',
    phase: 'replies',
    overrides: {
      'outreach-sequence-copywriting': { status: 'done' },
    },
    gateDone: { gate1: [true, true], gate2: [true, true, true] },
    metrics: [
      { label: 'изпратени', value: '1 860' },
      { label: 'отговори', value: '64' },
      { label: 'срещи', value: '9' },
    ],
  },
  {
    id: 'distribution',
    name: 'Демо · Дистрибуция',
    niche: 'Строителни материали',
    countries: ['RO', 'HR'],
    lead: 'Иван',
    phase: 'loop',
    overrides: {},
    gateDone: { gate1: [true, true], gate2: [true, true, true] },
    metrics: [
      { label: 'положителни отговори', value: '3,1%' },
      { label: 'срещи', value: '17' },
      { label: 'bounce', value: '1,4%' },
    ],
  },
];

export type ReplyClass = 'interested' | 'later' | 'referral' | 'no';

export const REPLY_CLASSES: Record<ReplyClass, { label: string; className: string }> = {
  interested: { label: 'Интерес', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  later: { label: 'Не сега', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  referral: { label: 'Друг човек', className: 'bg-sky-50 text-sky-800 border-sky-200' },
  no: { label: 'Отказ', className: 'bg-rose-50 text-rose-800 border-rose-200' },
};

export interface DemoReply {
  id: string;
  client: string;
  person: string;
  role: string;
  company: string;
  channel: 'Имейл' | 'LinkedIn';
  received: string;
  message: string;
  cls: ReplyClass;
  draft: string;
  next: string;
}

export const DEMO_REPLIES: DemoReply[] = [
  {
    id: 'r1',
    client: 'saas',
    person: 'Петър Д.',
    role: 'Ръководител сервиз',
    company: 'Примерна фирма 1',
    channel: 'Имейл',
    received: 'преди 12 мин',
    message: 'Здравейте, звучи интересно. Имаме 14 техници на терен и графикът е на Excel. Може ли да видим как работи?',
    cls: 'interested',
    draft:
      'Здравейте, Петър! Благодаря за бързия отговор. За екип от 14 техници най-полезно е да ви покажа как изглежда един ден в графика. Удобни ли са ви 20 минути във вторник или сряда сутрин?',
    next: 'След отговор: WhatsApp/Viber е позволен',
  },
  {
    id: 'r2',
    client: 'saas',
    person: 'Анна К.',
    role: 'Оперативен директор',
    company: 'Примерна фирма 2',
    channel: 'LinkedIn',
    received: 'преди 1 ч',
    message: 'В момента сме в средата на внедряване на ERP. Пишете ми след Нова година.',
    cls: 'later',
    draft: 'Разбирам, Анна, успех с внедряването. Ще ви пиша в средата на януари с кратък пример от подобна фирма.',
    next: 'Re-engagement след 60 дни',
  },
  {
    id: 'r3',
    client: 'saas',
    person: 'Георги М.',
    role: 'Управител',
    company: 'Примерна фирма 3',
    channel: 'Имейл',
    received: 'преди 3 ч',
    message: 'Не аз отговарям за това. Пишете на колегата ни, който води сервиза.',
    cls: 'referral',
    draft: 'Благодаря, Георги! Ще пиша на колегата ви и ще спомена, че вие ме насочихте. Как е най-добре да се свържа с него?',
    next: 'Нов контакт в същия акаунт',
  },
  {
    id: 'r4',
    client: 'distribution',
    person: 'Елена В.',
    role: 'Мениджър покупки',
    company: 'Примерна фирма 4',
    channel: 'Имейл',
    received: 'вчера',
    message: 'Не се интересуваме, моля махнете ме от списъка.',
    cls: 'no',
    draft: 'Разбира се, Елена. Премахнах ви и няма да получавате повече съобщения. Хубав ден!',
    next: 'Do Not Contact',
  },
];
