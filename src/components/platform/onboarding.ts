export const PRACTICE = [
  { id: 'blocked', title: 'Намери блокажа при Демо · Логистика', hint: 'Клиенти → Демо · Логистика', to: { tab: 'clients', client: 'logistics' } },
  { id: 'reply', title: 'Одобри отговор с интерес', hint: 'Отговори → Петър Д.', to: { tab: 'replies' } },
  { id: 'portal', title: 'Виж същия клиент през очите на клиента', hint: 'Портал за клиента', to: { path: '/portal?client=logistics' } },
  { id: 'system', title: 'Намери кой скил прави досиетата', hint: 'Под капака → account-intelligence', to: { path: '/system?skill=account-intelligence' } },
] as const;

/** Survives page switches inside the app, so a trip to /portal or /system keeps progress. */
export const onboardingMemory = { step: 0, practiced: new Set<string>() };

export const PRACTICE_COUNT = PRACTICE.length;

export type PracticeTarget = (typeof PRACTICE)[number]['to'];
