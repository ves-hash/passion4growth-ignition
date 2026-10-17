import { FocusState } from './SkillNode';
import { dependents, parallelPartners, skillById } from './model';

/** How a node should render while another node (`active`) is hovered or open. */
export const focusFor = (id: string, active: string | null): FocusState => {
  if (!active || !skillById.has(active)) return 'none';
  if (id === active) return 'focus';
  const a = skillById.get(active)!;
  if (a.depends_on.includes(id) || dependents(active).includes(id)) return 'related';
  if (parallelPartners(active).includes(id)) return 'parallel';
  return 'dim';
};
