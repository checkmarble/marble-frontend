import { type CaseEventType, caseEventTypes } from '@app-builder/models/cases';
import { toggle } from 'radash';
import { type Dispatch, type SetStateAction } from 'react';
import { Button, Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const caseEventsFilterSchema = z.object({
  type: z.array(
    z.union(
      caseEventTypes.map((t) => z.literal(t)) as [
        z.ZodLiteral<CaseEventType>,
        z.ZodLiteral<CaseEventType>,
        ...z.ZodLiteral<CaseEventType>[],
      ],
    ),
  ),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type CaseEventFiltersForm = z.infer<typeof caseEventsFilterSchema>;

export const CaseEventFilters = ({
  filters,
  setFilters,
}: {
  filters: CaseEventFiltersForm;
  setFilters: Dispatch<SetStateAction<CaseEventFiltersForm>>;
}) => {
  return (
    <div className="flex items-center gap-2">
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="small">
            <Icon icon="status" className="size-3.5" />
            <span className="text-xs">Type</span>
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2 max-h-[200px]">
          <MenuCommand.Combobox />
          <MenuCommand.List className="p-1">
            {caseEventTypes.map((t) => (
              <MenuCommand.Item
                onSelect={() => setFilters((prev) => ({ ...prev, type: toggle(prev.type, t) }))}
                className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
                key={t}
                value={t}
              >
                <Checkbox size="small" checked={filters?.type.includes(t)} />
                <span>{t}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="small">
            <Icon icon="calendar-month" className="size-3.5" />
            <span className="text-xs">Date</span>
          </Button>
        </MenuCommand.Trigger>
      </MenuCommand.Menu>
    </div>
  );
};
