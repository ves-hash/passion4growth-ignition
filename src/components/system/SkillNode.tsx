import { CircleDashed, Columns2, CornerDownRight, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LANE_LABELS,
  MissingSkill,
  OWNER_STYLES,
  PRIORITY_LABELS,
  Skill,
  parallelPartners,
} from './model';

export type FocusState = 'none' | 'focus' | 'related' | 'parallel' | 'dim';

interface SkillNodeProps {
  skill: Skill;
  focus?: FocusState;
  showLane?: boolean;
  showDeps?: boolean;
  className?: string;
  onSelect: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const SkillNode = ({ skill, focus = 'none', showLane, showDeps, className, onSelect, onHover }: SkillNodeProps) => {
  const owner = OWNER_STYLES[skill.owner];
  const proposed = skill.status === 'proposed';
  const partners = parallelPartners(skill.id);

  return (
    <button
      type="button"
      data-node={skill.id}
      onClick={() => onSelect(skill.id)}
      onMouseEnter={() => onHover?.(skill.id)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(skill.id)}
      onBlur={() => onHover?.(null)}
      className={cn(
        'group relative w-full overflow-hidden rounded-lg bg-card py-2 pl-4 pr-3 text-left transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        proposed ? 'border-[1.5px] border-dashed border-foreground/35' : 'border border-border shadow-sm',
        'hover:-translate-y-0.5 hover:shadow-soft',
        focus === 'focus' && 'ring-2 ring-primary ring-offset-2',
        focus === 'related' && 'ring-1 ring-foreground/40',
        focus === 'parallel' && 'outline-dashed outline-2 outline-offset-2 outline-accent bg-accent/5',
        focus === 'dim' && 'opacity-35',
        className
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: owner.color }} />
      <span className="block text-[13px] font-semibold leading-snug text-foreground">{skill.id}</span>
      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <span className="font-medium" style={{ color: owner.color }}>
          {owner.label}
        </span>
        {showLane && <span>· {LANE_LABELS[skill.lane]}</span>}
        {proposed && (
          <span className="rounded border border-dashed border-foreground/40 px-1 leading-4 text-foreground/70">предложен</span>
        )}
        {partners.length > 0 && (
          <span className="inline-flex items-center gap-0.5" title={`Паралелно с: ${partners.join(', ')}`}>
            <Columns2 className="h-3 w-3" />
            {partners.length}
          </span>
        )}
      </span>
      {skill.human_step && (
        <span className="mt-1.5 flex w-fit max-w-full items-start gap-1 rounded bg-primary/5 px-1.5 py-1 text-[11px] leading-tight text-foreground/80">
          <UserRound className="mt-px h-3 w-3 shrink-0 text-primary" aria-label="Човешка стъпка" />
          <span>{skill.human_step}</span>
        </span>
      )}
      {showDeps && skill.depends_on.length > 0 && (
        <span className="mt-1.5 flex items-start gap-1 text-[11px] leading-tight text-muted-foreground">
          <CornerDownRight className="mt-px h-3 w-3 shrink-0" />
          <span>след {skill.depends_on.join(', ')}</span>
        </span>
      )}
    </button>
  );
};

interface GhostNodeProps {
  missing: MissingSkill;
  showPhase?: string;
  className?: string;
  onSelect: (id: string) => void;
}

export const GhostNode = ({ missing, showPhase, className, onSelect }: GhostNodeProps) => {
  const owner = OWNER_STYLES[missing.owner];
  return (
    <button
      type="button"
      data-ghost={missing.id}
      onClick={() => onSelect(missing.id)}
      className={cn(
        'relative w-full rounded-lg border-[1.5px] border-dashed border-foreground/25 bg-background/60 px-3 py-2 text-left',
        'transition-colors hover:border-primary/60 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground/60">
        <CircleDashed className="h-3.5 w-3.5 shrink-0" />
        {missing.id}
      </span>
      <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px]">
        <PriorityBadge priority={missing.priority} />
        <span style={{ color: owner.color }} className="font-medium">
          {owner.label}
        </span>
        {showPhase && <span className="text-muted-foreground">· {showPhase}</span>}
      </span>
      <span className="mt-1 block text-[11px] leading-tight text-muted-foreground">{missing.why}</span>
    </button>
  );
};

export const PriorityBadge = ({ priority }: { priority: string }) => (
  <span
    className={cn(
      'rounded px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide',
      priority === 'high' ? 'bg-primary text-primary-foreground' : 'bg-accent/15 text-accent'
    )}
  >
    {PRIORITY_LABELS[priority] ?? priority}
  </span>
);

export const EchoChip = ({ skill, onSelect }: { skill: Skill; onSelect: (id: string) => void }) => (
  <button
    type="button"
    onClick={() => onSelect(skill.id)}
    className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-foreground/25 bg-background px-2 py-1 text-left text-[11px] text-muted-foreground transition-colors hover:border-foreground/50 hover:text-foreground"
    title="Същият скил работи и в тази фаза"
  >
    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: OWNER_STYLES[skill.owner].color }} />
    <span className="truncate">↺ {skill.id}</span>
  </button>
);
