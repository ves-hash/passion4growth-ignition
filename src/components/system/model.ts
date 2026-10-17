import systemMap from '@/data/system-map.json';
import descriptions from '@/data/skill-descriptions.json';

export type Owner = 'claude' | 'hermes' | 'claude+hermes' | 'hermes+claude';

export interface Phase {
  id: string;
  name: string;
  gate?: boolean;
  criteria?: string;
  note?: string;
  parallel_lanes?: string[];
}

export interface Skill {
  id: string;
  file: string;
  status: 'saved' | 'proposed';
  owner: Owner;
  phase: string;
  lane: string;
  inputs: string[];
  outputs: string[];
  depends_on: string[];
  parallel_with: string[];
  tools: string[];
  human_step: string | null;
  parallel_note?: string;
  rules?: string[];
}

export interface MissingSkill {
  id: string;
  owner: Owner;
  phase: string;
  priority: 'high' | 'medium' | 'low';
  why: string;
}

export interface Integration {
  name: string;
  purpose: string;
  status: string;
}

export const map = systemMap as {
  version: string;
  system: string;
  owners: Record<string, string>;
  phases: Phase[];
  skills: Skill[];
  missing_skills: MissingSkill[];
  existing_user_skills: string[];
  integrations: Integration[];
  policies: string[];
};

export const skillDescriptions = descriptions as Record<string, string>;

export const skillById = new Map(map.skills.map((s) => [s.id, s]));

export const phaseIndex = new Map(map.phases.map((p, i) => [p.id, i]));

/** Skills that list `id` in their depends_on. */
export const dependents = (id: string) => map.skills.filter((s) => s.depends_on.includes(id)).map((s) => s.id);

export const LANES = [
  'orchestration',
  'guardrail',
  'brief',
  'infrastructure',
  'approval',
  'lists',
  'data',
  'offers',
  'copy',
  'evaluation',
  'reports',
] as const;

export const LANE_LABELS: Record<string, string> = {
  orchestration: 'Оркестрация',
  guardrail: 'Защитни правила',
  brief: 'Бриф',
  infrastructure: 'Инфраструктура',
  approval: 'Одобрение',
  lists: 'Списъци',
  data: 'Данни',
  offers: 'Оферти',
  copy: 'Копи',
  evaluation: 'Оценка',
  reports: 'Отчети',
};

export const OWNER_STYLES: Record<Owner, { label: string; color: string }> = {
  claude: { label: 'Claude', color: '#D97757' },
  hermes: { label: 'Hermes', color: '#4F5BD5' },
  'claude+hermes': { label: 'Claude + Hermes', color: '#9B4DCA' },
  'hermes+claude': { label: 'Hermes + Claude', color: '#0E9384' },
};

export const STATUS_LABELS: Record<string, string> = {
  saved: 'запазен',
  proposed: 'предложен (не е запазен)',
};

export const PRIORITY_LABELS: Record<string, string> = {
  high: 'висок приоритет',
  medium: 'среден приоритет',
  low: 'нисък приоритет',
};

export const INTEGRATION_STATUS: Record<string, { label: string; className: string }> = {
  confirmed: { label: 'потвърдена', className: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  in_hermes: { label: 'в Hermes', className: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  recommended: { label: 'препоръчана', className: 'bg-sky-50 text-sky-800 border-sky-200' },
  proposed: { label: 'предложена', className: 'bg-amber-50 text-amber-800 border-amber-200' },
  undecided: { label: 'нерешена', className: 'bg-rose-50 text-rose-800 border-rose-300 border-dashed' },
};

/**
 * Where a skill sits on the phase axis. Each placement is an inclusive
 * column range; `echo` marks the second half of a non-contiguous phase
 * value ("gate2_and_loop"), drawn as a reference chip, not a second node.
 */
export interface Placement {
  start: number;
  end: number;
  echo?: boolean;
}

export const placementsFor = (phase: string): Placement[] => {
  const last = map.phases.length - 1;
  const at = (id: string) => phaseIndex.get(id) ?? 0;
  switch (phase) {
    case 'all':
      return [{ start: 0, end: last }];
    case 'phase1to2':
      return [{ start: at('phase1'), end: at('phase2') }];
    case 'gate2_and_loop':
      return [{ start: at('gate2'), end: at('gate2') }, { start: at('loop'), end: at('loop'), echo: true }];
    case 'phase2_and_replies':
      return [{ start: at('phase2'), end: at('phase2') }, { start: at('replies'), end: at('replies'), echo: true }];
    default:
      return [{ start: at(phase), end: at(phase) }];
  }
};

export const phaseLabel = (phase: string) => {
  const p = map.phases.find((x) => x.id === phase);
  if (p) return p.name;
  return placementsFor(phase)
    .map((pl) => (pl.start === pl.end ? map.phases[pl.start].name : `${map.phases[pl.start].name} → ${map.phases[pl.end].name}`))
    .join(' + ')
    .replace(/^Ден 0 → Цикъл$/, 'Всички фази');
};

/** Groups of skills that run at the same time (connected components of parallel_with). */
export const parallelGroups = (() => {
  const seen = new Set<string>();
  const groups: string[][] = [];
  for (const s of map.skills) {
    if (seen.has(s.id) || s.parallel_with.length === 0) continue;
    const group: string[] = [];
    const stack = [s.id];
    while (stack.length) {
      const id = stack.pop()!;
      if (seen.has(id)) continue;
      seen.add(id);
      group.push(id);
      const node = skillById.get(id);
      const partners = [
        ...(node?.parallel_with ?? []),
        ...map.skills.filter((o) => o.parallel_with.includes(id)).map((o) => o.id),
      ];
      partners.forEach((p) => !seen.has(p) && stack.push(p));
    }
    groups.push(group.sort((a, b) => map.skills.findIndex((x) => x.id === a) - map.skills.findIndex((x) => x.id === b)));
  }
  return groups;
})();

export const parallelPartners = (id: string) => {
  const s = skillById.get(id);
  const back = map.skills.filter((o) => o.parallel_with.includes(id)).map((o) => o.id);
  return Array.from(new Set([...(s?.parallel_with ?? []), ...back]));
};
