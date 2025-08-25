import {
  CASE_EVENT_CATEGORIES,
  DEFAULT_CASE_EVENT_CATEGORIES_FILTER,
} from '@app-builder/constants/cases';
import { getDateFnsLocale } from '@app-builder/services/i18n/i18n-config';
import { formatDateTimeWithoutPresets, useFormatLanguage } from '@app-builder/utils/format';
import { endOfDay, startOfDay } from 'date-fns';
import { diff, toggle } from 'radash';
import { type ComponentProps, type Dispatch, type SetStateAction, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Calendar, Checkbox, type CheckedState, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { casesI18n } from '../../cases-i18n';

export const caseEventsFilterSchema = z.object({
  types: z.array(z.enum(CASE_EVENT_CATEGORIES)),
  startDate: z.iso.datetime().optional(),
  endDate: z.iso.datetime().optional(),
});

export type CaseEventFiltersForm = z.infer<typeof caseEventsFilterSchema>;

const Badge = ({ children }: ComponentProps<'span'>) => (
  <span className="bg-purple-65 text-grey-100 text-small rounded-sm px-1 py-0.5">{children}</span>
);

export type CaseEventFiltersProps = {
  filters: CaseEventFiltersForm;
  setFilters: Dispatch<SetStateAction<CaseEventFiltersForm>>;
};

export const CaseEventFilters = ({ filters, setFilters }: CaseEventFiltersProps) => {
  const { t } = useTranslation(casesI18n);
  const language = useFormatLanguage();
  const isDirty = useMemo(
    () =>
      diff(filters.types, DEFAULT_CASE_EVENT_CATEGORIES_FILTER).length !== 0 ||
      filters.types.length === 0 ||
      filters.startDate ||
      filters.endDate,
    [filters],
  );
  const checked: CheckedState = match(filters.types.length)
    .with(CASE_EVENT_CATEGORIES.length, () => true)
    .with(0, () => false)
    .otherwise(() => 'indeterminate');

  return (
    <div className="flex items-center gap-2">
      {isDirty ? (
        <ButtonV2
          variant="secondary"
          onClick={() => setFilters({ types: DEFAULT_CASE_EVENT_CATEGORIES_FILTER })}
        >
          <Icon icon="cross" className="size-4" />
          {t('cases:case_detail.history.filter_reset')}
        </ButtonV2>
      ) : null}
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <ButtonV2 variant="secondary">
            <Icon icon="add-circle" className="size-3.5" />
            <span>Type</span>
            {filters.types.length > 0 ? <div className="bg-grey-80 mx-1 h-3 w-px" /> : null}
            {filters.types.length >= 3 ? (
              <Badge>
                {t('cases:case_detail.history.nb_selected', { count: filters.types.length })}
              </Badge>
            ) : (
              filters.types.map((type) => (
                <Badge key={type}>
                  {t(`cases:case_detail.history.event_type_category.${type}`)}
                </Badge>
              ))
            )}
          </ButtonV2>
        </MenuCommand.Trigger>
        <MenuCommand.Content sideOffset={4} className="max-h-[400px] max-w-[210px]" align="end">
          <MenuCommand.Combobox className="m-1 mb-0 h-8 p-0" iconClasses="size-4" />
          <MenuCommand.List className="p-1">
            <MenuCommand.Item
              className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
              onSelect={() => {
                setFilters({ types: checked === true ? [] : [...CASE_EVENT_CATEGORIES] });
              }}
            >
              <Checkbox size="small" checked={checked} />
              <span className="text-s">
                {t(`common:${checked === true ? 'select_none' : 'select_all'}`)}
              </span>
            </MenuCommand.Item>
            <MenuCommand.Separator className="-mx-1" />
            {CASE_EVENT_CATEGORIES.map((type) => (
              <MenuCommand.Item
                onSelect={() =>
                  setFilters((prev) => ({ ...prev, types: toggle(prev.types, type) }))
                }
                className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
                key={type}
              >
                <Checkbox size="small" checked={filters?.types.includes(type)} />
                <span className="text-s">
                  {t(`cases:case_detail.history.event_type_category.${type}`)}
                </span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      <MenuCommand.Menu>
        <MenuCommand.Trigger>
          <ButtonV2 variant="secondary">
            <Icon icon="add-circle" className="size-3.5" />
            <span>Date</span>
            {filters.startDate || filters.endDate ? (
              <div className="bg-grey-80 mx-1 h-3 w-px" />
            ) : null}
            {filters.startDate ? (
              <Badge>
                {t('common:from', {
                  input: formatDateTimeWithoutPresets(filters.startDate, {
                    language,
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }),
                })}
              </Badge>
            ) : null}
            {filters.endDate ? (
              <Badge>
                {t('common:to', {
                  input: formatDateTimeWithoutPresets(filters.endDate, {
                    language,
                    dateStyle: 'short',
                    timeStyle: 'short',
                  }),
                })}
              </Badge>
            ) : null}
          </ButtonV2>
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
