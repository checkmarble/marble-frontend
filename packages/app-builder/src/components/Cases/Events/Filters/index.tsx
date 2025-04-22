import { type CaseEventType, caseEventTypes } from '@app-builder/models/cases';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { endOfDay, startOfDay } from 'date-fns';
import { diff, toggle } from 'radash';
import { type ComponentProps, type Dispatch, type SetStateAction, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Calendar, Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { casesI18n } from '../../cases-i18n';

export const caseEventsFilterSchema = z.object({
  types: z.array(
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

const Badge = ({ children }: ComponentProps<'span'>) => (
  <span className="bg-purple-65 text-grey-100 text-2xs rounded px-1 py-0.5">{children}</span>
);

export const CaseEventFilters = ({
  filters,
  setFilters,
}: {
  filters: CaseEventFiltersForm;
  setFilters: Dispatch<SetStateAction<CaseEventFiltersForm>>;
}) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const isDirty = useMemo(
    () =>
      diff(filters.types, ['comment_added']).length !== 0 ||
      filters.types.length === 0 ||
      filters.startDate ||
      filters.endDate,
    [filters],
  );

  return (
    <div className="flex items-center gap-2">
      {isDirty ? (
        <Button
          variant="secondary"
          size="small-md"
          onClick={() => setFilters({ types: ['comment_added'] })}
        >
          <Icon icon="cross" className="size-4" />
          <span className="text-xs">Reset</span>
        </Button>
      ) : null}
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="small-md">
            <Icon icon="add-circle" className="size-3.5" />
            <span className="text-xs">Type</span>
            {filters.types.length > 0 ? <div className="bg-grey-80 mx-1 h-3 w-px" /> : null}
            {filters.types.length >= 3 ? (
              <Badge>{filters.types.length} selected</Badge>
            ) : (
              filters.types.map((type) => (
                <Badge key={type}>{t(`cases:case_detail.history.event_type.${type}`)}</Badge>
              ))
            )}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2 max-h-[400px] max-w-[210px]" align="end">
          <MenuCommand.Combobox className="m-1 mb-0 h-8 p-0" iconClasses="size-4" />
          <MenuCommand.List className="p-1">
            {caseEventTypes.map((type) => (
              <MenuCommand.Item
                onSelect={() =>
                  setFilters((prev) => ({ ...prev, types: toggle(prev.types, type) }))
                }
                className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
                key={type}
                value={type}
              >
                <Checkbox size="small" checked={filters?.types.includes(type)} />
                <span className="text-s">{t(`cases:case_detail.history.event_type.${type}`)}</span>
              </MenuCommand.Item>
            ))}
            {filters.types.length > 0 ? (
              <MenuCommand.Item
                onSelect={() => setFilters((prev) => ({ ...prev, types: ['comment_added'] }))}
              >
                Clear Filter
              </MenuCommand.Item>
            ) : null}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <Button variant="secondary" size="small">
            <Icon icon="add-circle" className="size-3.5" />
            <span className="text-xs">Date</span>
            {filters.startDate || filters.endDate ? (
              <div className="bg-grey-80 mx-1 h-3 w-px" />
            ) : null}
            {filters.startDate ? (
              <Badge>From {formatDateTime(filters.startDate, { language })}</Badge>
            ) : null}
            {filters.endDate ? (
              <Badge>To {formatDateTime(filters.endDate, { language })}</Badge>
            ) : null}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2">
          <MenuCommand.List className="p-2">
            <Calendar
              mode="range"
              selected={{
                from: filters.startDate ? new Date(filters.startDate) : undefined,
                to: filters.endDate ? new Date(filters.endDate) : undefined,
              }}
              onSelect={(range) => {
                setFilters((prev) => ({
                  ...prev,
                  startDate: range?.from ? startOfDay(range.from).toString() : undefined,
                  endDate: range?.to ? endOfDay(range.to).toString() : undefined,
                }));
              }}
              defaultMonth={filters.startDate ? new Date(filters.startDate) : undefined}
              locale={getDateFnsLocale(language)}
            />
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
