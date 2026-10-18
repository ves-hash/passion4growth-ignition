import { cn } from '@/lib/utils';
import { map, phaseIndex } from '@/components/system/model';

interface PhaseStepperProps {
  phase: string;
  large?: boolean;
  onPick?: (phaseId: string) => void;
  picked?: string;
}

/** The eight phases as a progress line; gates are diamonds. */
const PhaseStepper = ({ phase, large, onPick, picked }: PhaseStepperProps) => {
  const at = phaseIndex.get(phase) ?? 0;
  return (
    <ol className={cn('flex items-center', large ? 'min-w-[640px] gap-0' : 'gap-0')}>
      {map.phases.map((p, i) => {
        const done = i < at;
        const current = i === at;
        const mark = (
          <span
            className={cn(
              'flex shrink-0 items-center justify-center transition-all',
              p.gate ? 'rotate-45 rounded-[3px]' : 'rounded-full',
              large ? (p.gate ? 'h-4 w-4' : 'h-5 w-5') : p.gate ? 'h-2.5 w-2.5' : 'h-3 w-3',
              done && 'bg-foreground',
              current && 'bg-primary ring-4 ring-primary/20',
              !done && !current && 'border-2 border-foreground/20 bg-background',
              picked === p.id && 'ring-4 ring-accent/40'
            )}
          />
        );
        return (
          <li key={p.id} className={cn('flex items-center', i < map.phases.length - 1 && 'flex-1')}>
            {large ? (
              <button
                type="button"
                onClick={() => onPick?.(p.id)}
                className="group flex flex-col items-center gap-2 px-1"
                title={p.name}
              >
                {mark}
                <span
                  className={cn(
                    'max-w-[86px] text-center text-[11px] leading-tight',
                    current ? 'font-semibold text-primary' : 'text-muted-foreground group-hover:text-foreground',
                    picked === p.id && 'text-foreground'
                  )}
                >
                  {p.name.split(':')[0]}
                </span>
              </button>
            ) : (
              <span title={p.name}>{mark}</span>
            )}
            {i < map.phases.length - 1 && (
              <span className={cn('h-0.5 flex-1', large ? 'mx-1 -mt-6' : 'mx-0.5', i < at ? 'bg-foreground' : 'bg-foreground/15')} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default PhaseStepper;
