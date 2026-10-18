import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OWNER_STYLES } from '@/components/system/model';
import { ClientTask, STATUS_META } from './tasks';

interface TaskCardProps {
  task: ClientTask;
  showSkills: boolean;
  onOpenSkill?: (id: string) => void;
}

const TaskCard = ({ task, showSkills, onOpenSkill }: TaskCardProps) => {
  const st = STATUS_META[task.status];
  const owner = OWNER_STYLES[task.skill.owner];
  return (
    <div
      className={cn(
        'rounded-xl border bg-card p-3 shadow-sm',
        task.status === 'waiting' ? 'border-primary/40' : task.status === 'blocked' ? 'border-amber-300' : 'border-border',
        task.status === 'todo' && 'opacity-60'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold leading-snug">{task.label}</p>
        <span className={cn('inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', st.badge)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', st.dot)} />
          {st.label}
        </span>
      </div>
      {task.note && <p className="mt-1 text-xs text-foreground/75">{task.note}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: owner.color }} />
          {owner.label}
        </span>
        {task.skill.human_step && (
          <span className="inline-flex items-center gap-1">
            <UserRound className="h-3 w-3 text-primary" />
            решава човек
          </span>
        )}
      </div>
      {showSkills && (
        <button
          type="button"
          onClick={() => onOpenSkill?.(task.skill.id)}
          className="mt-2 block w-full truncate rounded-md bg-secondary px-2 py-1 text-left font-mono text-[11px] text-foreground/70 hover:text-foreground"
        >
          ⚙ {task.skill.id}
        </button>
      )}
    </div>
  );
};

export default TaskCard;
