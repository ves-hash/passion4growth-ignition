import { CircleDashed, Columns2, FileText, UserRound } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { PriorityBadge } from './SkillNode';
import {
  LANE_LABELS,
  OWNER_STYLES,
  STATUS_LABELS,
  dependents,
  map,
  parallelPartners,
  phaseLabel,
  skillById,
  skillDescriptions,
} from './model';

interface DetailSheetProps {
  id: string | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-sm">{children}</dd>
  </div>
);

const Tags = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t) => (
        <li key={t} className="rounded-md bg-secondary px-2 py-0.5 text-xs">
          {t}
        </li>
      ))}
    </ul>
  ) : (
    <span className="text-xs text-muted-foreground">няма</span>
  );

const Links = ({ ids, onSelect }: { ids: string[]; onSelect: (id: string) => void }) =>
  ids.length ? (
    <ul className="flex flex-wrap gap-1.5">
      {ids.map((id) => (
        <li key={id}>
          <button
            type="button"
            onClick={() => onSelect(id)}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-0.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
          >
            <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: OWNER_STYLES[skillById.get(id)!.owner].color }} />
            {id}
          </button>
        </li>
      ))}
    </ul>
  ) : (
    <span className="text-xs text-muted-foreground">няма</span>
  );

const DetailSheet = ({ id, onSelect, onClose }: DetailSheetProps) => {
  const skill = id ? skillById.get(id) : undefined;
  const missing = id ? map.missing_skills.find((m) => m.id === id) : undefined;
  const owner = skill ? OWNER_STYLES[skill.owner] : missing ? OWNER_STYLES[missing.owner] : null;
  const ownerKey = skill?.owner ?? missing?.owner;

  return (
    <Sheet open={!!id} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {skill && owner && (
          <>
            <SheetHeader className="pr-6 text-left">
              <div className="flex items-center gap-2 text-xs font-medium" style={{ color: owner.color }}>
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: owner.color }} />
                {owner.label}
                {ownerKey && map.owners[ownerKey] && <span className="text-muted-foreground">· {map.owners[ownerKey]}</span>}
              </div>
              <SheetTitle className="break-words text-xl">{skill.id}</SheetTitle>
              <SheetDescription lang="en">{skillDescriptions[skill.id]}</SheetDescription>
            </SheetHeader>

            <div className="mt-4 flex flex-wrap gap-1.5 text-xs">
              <span className={skill.status === 'proposed' ? 'rounded border border-dashed border-foreground/50 px-2 py-0.5' : 'rounded bg-emerald-50 px-2 py-0.5 text-emerald-800'}>
                {STATUS_LABELS[skill.status]}
              </span>
              <span className="rounded bg-secondary px-2 py-0.5">{phaseLabel(skill.phase)}</span>
              <span className="rounded bg-secondary px-2 py-0.5">{LANE_LABELS[skill.lane]}</span>
            </div>

            {skill.human_step && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">Човешка стъпка</p>
                  <p>{skill.human_step}</p>
                </div>
              </div>
            )}

            <dl className="mt-5 space-y-4">
              <Field label="Входове">
                <Tags items={skill.inputs} />
              </Field>
              <Field label="Изходи">
                <Tags items={skill.outputs} />
              </Field>
              <Field label="Инструменти">
                <Tags items={skill.tools} />
              </Field>
              <Field label="Зависи от">
                <Links ids={skill.depends_on} onSelect={onSelect} />
              </Field>
              <Field label="Захранва">
                <Links ids={dependents(skill.id)} onSelect={onSelect} />
              </Field>
              <Field label="Паралелно с">
                <Links ids={parallelPartners(skill.id)} onSelect={onSelect} />
                {skill.parallel_note && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                    <Columns2 className="mt-px h-3.5 w-3.5 shrink-0" />
                    {skill.parallel_note}
                  </p>
                )}
              </Field>
              {skill.rules && (
                <Field label="Правила">
                  <ul className="list-disc space-y-1 pl-4 text-sm">
                    {skill.rules.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </Field>
              )}
              <Field label="Файл">
                <code className="flex items-center gap-1.5 break-all rounded-md bg-secondary px-2 py-1.5 font-mono text-xs">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  {skill.file}
                </code>
              </Field>
            </dl>
          </>
        )}

        {missing && owner && (
          <>
            <SheetHeader className="pr-6 text-left">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <CircleDashed className="h-3.5 w-3.5" />
                Липсващ скил
              </div>
              <SheetTitle className="break-words text-xl">{missing.id}</SheetTitle>
              <SheetDescription>{missing.why}</SheetDescription>
            </SheetHeader>
            <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
              <PriorityBadge priority={missing.priority} />
              <span className="rounded bg-secondary px-2 py-0.5">{phaseLabel(missing.phase)}</span>
              <span className="rounded px-2 py-0.5 font-medium" style={{ color: owner.color }}>
                {owner.label}
              </span>
            </div>
            <p className="mt-5 rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
              Няма SKILL.md. Скилът трябва да бъде написан.
            </p>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default DetailSheet;
