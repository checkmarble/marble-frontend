import { EnumTag } from '@app-builder/components/Data/EnumTag';
import { EnumValueMenu } from '@app-builder/components/Data/EnumValueMenu';
import { ClearAllFiltersButton } from '@app-builder/components/Filters/ClearAllFilters';
import { DateRangeFilter } from '@app-builder/components/Filters/DateRangeFilter';
import { FilterItem, FilterPopover } from '@app-builder/components/Filters/FilterPopover';
import type { DataModelField, TableModel } from '@app-builder/models/data-model';
import { formatDuration, formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { sub } from 'date-fns/sub';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Input, Separator } from 'ui-design-system';
import {
  type ColumnFilters,
  type ColumnFilterValue,
  getColumnFilterKind,
  isColumnFilterActive,
} from './column-filters';

export function ColumnFilterPopover({
  field,
  value,
  onChange,
  onOpenChange,
  children,
}: {
  field: DataModelField;
  value: ColumnFilterValue | undefined;
  onChange: (value: ColumnFilterValue | undefined) => void;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation(['cases', 'filters']);
  const kind = getColumnFilterKind(field);
  if (!kind) return null;

  const label = field.alias || field.name;
  const commit = (next: ColumnFilterValue) => onChange(isColumnFilterActive(next) ? next : undefined);
  const numberValue = value?.type === 'number' ? value : { type: 'number' as const };
  const numberBound = (bound: 'min' | 'max', boundLabel: string) => (
    <Input
      type="number"
      step="any"
      className="flex-1"
      aria-label={`${label} – ${boundLabel}`}
      placeholder={boundLabel}
      value={numberValue[bound] ?? ''}
      onChange={(e) => {
        // An emptied input clears its bound instead of turning into 0.
        const raw = e.currentTarget.value;
        commit({ ...numberValue, [bound]: raw === '' ? undefined : Number(raw) });
      }}
    />
  );

  return (
    <FilterPopover.Root onOpenChange={onOpenChange}>
      <FilterPopover.Trigger asChild>{children}</FilterPopover.Trigger>
      <FilterPopover.Content>
        {match(kind)
          .with('text', () => (
            <Input
              className="w-72 p-md"
              aria-label={label}
              placeholder={t('cases:data_explorer.filters.text_placeholder')}
              value={value?.type === 'text' ? value.value : ''}
              onChange={(e) => commit({ type: 'text', value: e.currentTarget.value })}
            />
          ))
          .with('enum', () => (
            <div className="w-72 p-md">
              <EnumValueMenu
                field={field}
                multiple
                selectedValues={value?.type === 'enum' ? value.values : []}
                onChange={(values) => commit({ type: 'enum', values })}
              />
            </div>
          ))
          .with('number', () => (
            <div className="flex w-72 gap-sm p-md">
              {numberBound('min', t('cases:data_explorer.filters.min'))}
              {numberBound('max', t('cases:data_explorer.filters.max'))}
            </div>
          ))
          .with('date', () => (
            <DateRangeFilter.Root
              dateRangeFilter={value?.type === 'date' ? value.range : undefined}
              setDateRangeFilter={(range) => commit({ type: 'date', range })}
              className="grid"
            >
              <DateRangeFilter.FromNowPicker title={label} />
              <Separator className="bg-grey-border" decorative orientation="vertical" />
              <DateRangeFilter.Calendar />
              <Separator className="bg-grey-border col-span-3" decorative orientation="horizontal" />
              <DateRangeFilter.Summary className="col-span-3 row-span-1" />
            </DateRangeFilter.Root>
          ))
          .exhaustive()}
        <div className="border-grey-border flex justify-end border-t p-sm">
          <Button
            variant="secondary"
            size="small"
            disabled={!isColumnFilterActive(value)}
            onClick={() => onChange(undefined)}
          >
            {t('filters:clear_filters')}
          </Button>
        </div>
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}

export function ColumnFilterChips({
  table,
  filters,
  onChange,
}: {
  table: TableModel;
  filters: ColumnFilters;
  onChange: (filters: ColumnFilters) => void;
}) {
  const { t } = useTranslation(['filters']);
  // A chip stays mounted while its popover is open, so emptying the input does not close it mid-edit.
  const [openField, setOpenField] = useState<string | null>(null);
  const fields = table.fields.filter((field) => isColumnFilterActive(filters[field.name]) || field.name === openField);
  if (fields.length === 0) return null;

  const setFilter = (name: string, value: ColumnFilterValue | undefined) => {
    const { [name]: _previous, ...rest } = filters;
    onChange(value ? { ...rest, [name]: value } : rest);
  };

  return (
    <div className="flex flex-row flex-wrap items-center gap-sm">
      {fields.map((field) => {
        const label = field.alias || field.name;
        return (
          <FilterItem.Root key={field.name}>
            <ColumnFilterPopover
              field={field}
              value={filters[field.name]}
              onChange={(value) => setFilter(field.name, value)}
              onOpenChange={(open) => setOpenField(open ? field.name : null)}
            >
              {/* Same look as FilterItem.Trigger, which is itself a Popover.Trigger and cannot be nested in one. */}
              <button
                type="button"
                className="text-purple-primary dark:text-grey-primary focus:border-purple-primary dark:focus:border-purple-hover -me-xs flex h-full flex-row items-center gap-xs rounded-sm border border-solid border-transparent px-xs text-s outline-hidden"
              >
                <span className="font-semibold">{label}:</span>
                <span className="text-grey-primary flex min-w-0 items-center gap-xs">
                  <ColumnFilterSummary field={field} value={filters[field.name]} />
                </span>
              </button>
            </ColumnFilterPopover>
            <FilterItem.Clear
              type="button"
              aria-label={`${t('filters:clear_filters')}: ${label}`}
              onClick={() => setFilter(field.name, undefined)}
            />
          </FilterItem.Root>
        );
      })}
      <ClearAllFiltersButton onClick={() => onChange({})} />
    </div>
  );
}

function ColumnFilterSummary({ field, value }: { field: DataModelField; value: ColumnFilterValue | undefined }) {
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();

  switch (value?.type) {
    case 'text':
      return <span className="max-w-40 truncate">{value.value}</span>;
    case 'enum':
      return (
        <>
          {value.values.slice(0, 2).map((enumValue) => (
            <EnumTag key={enumValue} field={field} value={enumValue} />
          ))}
          {value.values.length > 2 ? <span>+{value.values.length - 2}</span> : null}
        </>
      );
    case 'number':
      return formatBounds(
        value.min === undefined ? undefined : formatNumber(value.min, { language }),
        value.max === undefined ? undefined : formatNumber(value.max, { language }),
      );
    case 'date': {
      const { range } = value;
      if (!range) return null;
      if (range.type === 'dynamic') return `≥ ${formatDuration(range.fromNow, language)}`;
      // The stored end is the day after the one picked (see DateRangeFilter).
      return formatBounds(
        range.startDate ? formatDateTime(range.startDate, { dateStyle: 'short' }) : undefined,
        range.endDate ? formatDateTime(sub(new Date(range.endDate), { days: 1 }), { dateStyle: 'short' }) : undefined,
      );
    }
    default:
      return null;
  }
}

function formatBounds(min: string | undefined, max: string | undefined) {
  if (min && max) return min === max ? min : `${min} – ${max}`;
  if (min) return `≥ ${min}`;
  return max ? `≤ ${max}` : null;
}
