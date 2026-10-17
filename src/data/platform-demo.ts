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
  /** managed: P4G води всичко и записва одобренията; self: клиентът попълва портала сам. */
  mode?: 'managed' | 'self';
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
    mode: 'self',
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

/** Клиентският портал: етапите, които клиентът вижда, са групи от вътрешните фази. */
export const CLIENT_STAGES = [
  { id: 'know', name: 'Опознаване', phases: ['day0', 'gate1'], text: 'Проучваме бизнеса ви и заедно одобряваме към кого пишем.' },
  { id: 'prepare', name: 'Подготовка', phases: ['phase1', 'gate2'], text: 'Списъци с фирми и хора, оферти и техническа подготовка.' },
  { id: 'personal', name: 'Персонализация', phases: ['phase2'], text: 'Проучване на всяка фирма и съобщения по канали.' },
  { id: 'live', name: 'Кампания на живо', phases: ['launch', 'replies'], text: 'LinkedIn и телефон първи, имейл след загряване. Отговорите водят до срещи.' },
  { id: 'grow', name: 'Растеж', phases: ['loop'], text: 'Седмичен отчет, тестове и подобрения.' },
];

export interface PortalAction {
  id: string;
  title: string;
  why: string;
  kind: 'upload' | 'approve' | 'choose';
  options?: string[];
}

export interface PortalData {
  period: string;
  summary: string;
  actions: PortalAction[];
  results?: { label: string; value: string; note: string }[];
  noResultsReason?: string;
  meetings?: { company: string; role: string; when: string }[];
  next: string[];
}

export const PORTAL: Record<string, PortalData> = {
  industrial: {
    period: '12–17 октомври',
    summary: 'Брифът за нишата е готов. За да започнем списъците, ни трябват вашите клиенти, отказите и одобрение на профила на идеалния клиент.',
    actions: [
      {
        id: 'a1a2',
        title: 'Изпратете 10–20 настоящи клиенти и няколко отказа',
        why: 'По тях калибрираме кои фирми са подходящи и кои да изключим.',
        kind: 'upload',
      },
      {
        id: 'icp',
        title: 'Одобрете профила на идеалния клиент',
        why: 'Всеки списък и всяко съобщение се строят върху него.',
        kind: 'approve',
      },
    ],
    noResultsReason: 'Кампанията още не е стартирала, затова няма изпратени съобщения. Първите резултати идват 2–3 седмици след старта, след загряване на имейлите.',
    next: ['Калибриране по вашите клиенти', 'Списъци от асоциации, изложения и Google Maps', 'Предложение за 5–6 оферти'],
  },
  logistics: {
    period: '12–17 октомври',
    summary: 'Намерихме 1 240 фирми в целевия пазар, 388 от тях отговарят на профила. Подготвихме оферти за тест и чакаме вашия избор.',
    actions: [
      {
        id: 'offers',
        title: 'Изберете кои оферти да тестваме',
        why: 'Тестваме 2–3 оферти паралелно и запазваме тази, която носи срещи.',
        kind: 'choose',
        options: ['Безплатен одит на складовите разходи', 'Пилот за един маршрут', 'Сравнение с пазарни цени за 3PL', 'Покана за среща на изложение'],
      },
      {
        id: 'set',
        title: 'Одобрете примерните 20 фирми и персони',
        why: 'Проверяваме, че разбираме едно и също под „подходящ клиент“, преди да пишем на стотици.',
        kind: 'approve',
      },
    ],
    noResultsReason: 'Още не пишем на никого. Стартът е след като одобрите офертите и примерните фирми.',
    next: ['Проучване на A акаунтите', 'Секвенции за LinkedIn, телефон и имейл', 'Старт на кампанията'],
  },
  saas: {
    period: '12–17 октомври',
    summary: 'Седмица с 9 уговорени срещи. LinkedIn носи най-много отговори; имейлът е в норма след загряването.',
    actions: [
      {
        id: 'slots',
        title: 'Потвърдете свободни часове за срещи следващата седмица',
        why: 'Двама проспекти чакат покана, а срещите се записват директно в календара ви.',
        kind: 'approve',
      },
    ],
    results: [
      { label: 'Изпратени съобщения', value: '1 860', note: 'имейл и LinkedIn' },
      { label: 'Отговори', value: '64', note: '3,4% от изпратените' },
      { label: 'Срещи', value: '9', note: '4 от LinkedIn, 3 от имейл, 2 от телефон' },
    ],
    meetings: [
      { company: 'Примерна фирма 1', role: 'Ръководител сервиз', when: 'вт, 10:00' },
      { company: 'Примерна фирма 5', role: 'Оперативен директор', when: 'ср, 14:30' },
      { company: 'Примерна фирма 6', role: 'Управител', when: 'чт, 11:00' },
    ],
    next: ['Нов тест на офертата в Унгария', 'Повторен контакт с „не сега“ отговорите след 30 дни'],
  },
  distribution: {
    period: '12–17 октомври',
    summary: 'Стабилна седмица. Офертата „мостра на място“ води; спираме по-слабата и пускаме нов тест в Хърватия.',
    actions: [],
    results: [
      { label: 'Положителни отговори', value: '3,1%', note: 'от доставените' },
      { label: 'Срещи', value: '17', note: 'от старта' },
      { label: 'Отпаднали имейли', value: '1,4%', note: 'под прага от 2%' },
    ],
    next: ['Тест на нова оферта в Хърватия', 'Повторен контакт след 60 дни'],
  },
};

/** Client Request от client-niche-brief: A = данни, B = въпроси, C1 = одобрение. */
export const CLIENT_REQUEST = {
  provide: [
    { id: 'A1', title: 'Настоящи клиенти', why: 'Никога не им пишем, а търсим фирми като тях.', required: true },
    { id: 'A2', title: 'Фирми и сегменти, които отказвате, загубихте или не искате, с причината', why: 'Така знаем кого да изключим.', required: true },
    { id: 'A3', title: '3–4 най-доволни клиенти и дали можем да ги назоваваме', why: 'Търсим подобни фирми и ги ползваме като доказателство.' },
    { id: 'A4', title: 'Резултати, които можем да цитираме', why: 'Числа, казуси, сертификати, марки, години на пазара.' },
    { id: 'A5', title: 'Търговски условия', why: 'Ценово ниво спрямо конкурентите, минимално количество, държави на доставка, срокове.' },
    { id: 'A6', title: 'Търговски материали', why: 'Каталог, презентация, стари имейли, записи на разговори.' },
    { id: 'A7', title: 'Минали контакти и отворени сделки', why: 'За да не пишем два пъти на един човек.' },
  ],
  answer: [
    { id: 'B1', q: 'Кои сегменти и държави носят най-добър марж и повторни поръчки? Кои са приоритет сега?' },
    { id: 'B2', q: 'Потвърдете или поправете изключените държави.', prefill: 'Пишем само в България и Гърция; всички други държави са изключени.' },
    { id: 'B3', q: 'С кои длъжности реално затваряте сделки?', prefill: 'Технически директор, ръководител поддръжка, собственик.' },
    { id: 'B4', q: 'Типичен размер на поръчка и продължителност на сделката' },
    { id: 'B5', q: 'Колко нови клиенти или срещи на месец можете да поемете?' },
    { id: 'B6', q: 'Кой от ваша страна поема отговорите и срещите и колко бързо?' },
    { id: 'B7', q: 'На кои конкуренти губите и защо?' },
  ],
  later: [
    { id: 'C2', title: '10–20 примерни фирми', format: 'пасва / не пасва' },
    { id: 'C3', title: 'Около 20 примерни персони', format: 'пасва / не пасва' },
    { id: 'C4', title: '5–6 оферти', format: 'избор, редакция, отказ' },
    { id: 'C5', title: 'Речник, тон и фрази', format: 'вярно / грешно' },
    { id: 'C6', title: 'Контролен списък от 50 фирми', format: 'проверка на извадка' },
  ],
};

/** Чернова на ICP за Демо · Индустриално оборудване (примерна, от сайта на клиента). */
export const DEMO_ICP_DRAFT = {
  icp: [
    'Производители с машинен парк (CNC, преси), 20–250 служители',
    'Сервизи за индустриално оборудване',
    'Държави: България и Гърция',
    'Купувач: собственик, технически директор, ръководител поддръжка',
  ],
  anti: [
    'Търговци без собствен машинен парк',
    'Конкуренти: други дистрибутори на резервни части',
    'Фирми под 10 служители',
    'Всички държави извън България и Гърция',
  ],
};

/** Риск по държави за студен имейл, от правилата в system-map.json. */
export const COUNTRY_RISK: Record<string, { name: string; risk: 'Low' | 'Medium' | 'High'; calls: string }> = {
  BG: { name: 'България', risk: 'Low', calls: 'по правилата на държавата' },
  SK: { name: 'Словакия', risk: 'Low', calls: 'по правилата на държавата' },
  SI: { name: 'Словения', risk: 'Low', calls: 'по правилата на държавата' },
  HU: { name: 'Унгария', risk: 'Low', calls: 'по правилата на държавата' },
  RO: { name: 'Румъния', risk: 'Medium', calls: 'по правилата на държавата' },
  HR: { name: 'Хърватия', risk: 'Medium', calls: 'по правилата на държавата' },
  CZ: { name: 'Чехия', risk: 'Medium', calls: 'по правилата на държавата' },
  GR: { name: 'Гърция', risk: 'Medium', calls: 'по правилата на държавата' },
  PL: { name: 'Полша', risk: 'High', calls: 'без студени обаждания' },
  DE: { name: 'Германия', risk: 'High', calls: 'само с документиран интерес' },
  AT: { name: 'Австрия', risk: 'High', calls: 'без студени обаждания' },
};

/** Примерен нов клиент, когото екипът онбордва сам (managed). */
export const MANAGED_DEMO = {
  name: 'Демо · Метални конструкции',
  website: 'https://metal-demo.example',
  niche: 'Метални конструкции за складове',
  countries: ['BG', 'RO'],
  icp: [
    'Логистични и складови фирми, които строят или разширяват складове',
    'Инвеститори в индустриални паркове',
    'Държави: България и Румъния',
    'Купувач: собственик, оперативен директор, ръководител инвестиции',
  ],
  anti: [
    'Частни лица и малки ремонти',
    'Конкуренти: други производители на метални конструкции',
    'Всички държави извън България и Румъния',
  ],
  kickoffAnswers: {
    B1: 'Складове над 2 000 м² в България; Румъния е приоритет за 2027.',
    B2: 'Само България и Румъния.',
    B3: 'Собственик и оперативен директор; при големи обекти и ръководител инвестиции.',
    B4: 'Обект за 150–600 хил. евро, цикъл 3–6 месеца.',
    B5: 'До 8 срещи на месец.',
    B6: 'Търговският директор, до 24 часа.',
    B7: 'Губим от по-евтини вносни конструкции, когато срокът не е важен.',
  } as Record<string, string>,
};
