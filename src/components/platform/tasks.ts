import { DemoClient, TASK_LABELS, TaskStatus } from '@/data/platform-demo';
import { Skill, map, phaseIndex, placementsFor } from '@/components/system/model';

export interface ClientTask {
  skill: Skill;
  label: string;
  status: TaskStatus;
  note?: string;
}

export const STATUS_META: Record<TaskStatus, { label: string; dot: string; badge: string }> = {
  done: { label: 'Готово', dot: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-800' },
  running: { label: 'Работи', dot: 'bg-sky-500 animate-pulse', badge: 'bg-sky-50 text-sky-800' },
  waiting: { label: 'Чака човек', dot: 'bg-primary', badge: 'bg-primary/10 text-primary' },
  blocked: { label: 'Блокирано', dot: 'bg-amber-500', badge: 'bg-amber-50 text-amber-800' },
  todo: { label: 'Предстои', dot: 'bg-foreground/20', badge: 'bg-secondary text-muted-foreground' },
};

/** A task's status follows from where the client is on the phase axis, unless the client overrides it. */
export const taskFor = (client: DemoClient, skill: Skill): ClientTask => {
  const label = TASK_LABELS[skill.id] ?? skill.id;
  const o = client.overrides[skill.id];
  if (o) return { skill, label, ...o };
  const at = phaseIndex.get(client.phase) ?? 0;
  const pls = placementsFor(skill.phase);
  let status: TaskStatus;
  if (skill.phase === 'all') status = 'running';
  else if (pls.some((p) => at >= p.start && at <= p.end)) status = 'running';
  else if (pls[pls.length - 1].end < at) status = 'done';
  else status = 'todo';
  return { skill, label, status };
};

export const tasksFor = (client: DemoClient) => map.skills.map((s) => taskFor(client, s));

export const tasksInPhase = (client: DemoClient, phaseId: string) => {
  const i = phaseIndex.get(phaseId) ?? 0;
  return tasksFor(client).filter(
    (t) => t.skill.phase !== 'all' && placementsFor(t.skill.phase).some((p) => i >= p.start && i <= p.end)
  );
};

export const waitingFor = (client: DemoClient) => tasksFor(client).filter((t) => t.status === 'waiting');
export const blockedFor = (client: DemoClient) => tasksFor(client).filter((t) => t.status === 'blocked');
export const runningFor = (client: DemoClient) =>
  tasksFor(client).filter((t) => t.status === 'running' && t.skill.phase !== 'all');
