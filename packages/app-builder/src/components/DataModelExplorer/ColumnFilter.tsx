import { EnumTag } from '@app-builder/components/Data/EnumTag';
import { EnumValueMenu } from '@app-builder/components/Data/EnumValueMenu';
import { ClearAllFiltersButton } from '@app-builder/components/Filters/ClearAllFilters';
import { DateRangeFilter } from '@app-builder/components/Filters/DateRangeFilter';
import { FilterItem, FilterPopover, filterItemTriggerClassName } from '@app-builder/components/Filters/FilterPopover';
import { type DataModelField, type TableModel } from '@app-builder/models/data-model';
import { formatDuration, formatNumber, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { sub } from 'date-fns/sub';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, Input, RadioGroup, RadioGroupItem, Separator } from 'ui-design-system';
import {
  type ColumnFilters,
  type ColumnFilterValue,
  getColumnFilterKind,
  getEnumFilterField,
  getFilterCatalog,
  getMaxEnumPicks,
  getNumberFilterScale,
  isColumnFilterActive,
  setColumnFilter,
  toEnumFilter,
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
        commit({ ...numberValue, [bound]: raw === '' ? undefined : Number(raw), scale: getNumberFilterScale(field) });
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
          .with('enum', () => {
            const selectedValues = value?.type === 'enum' ? value.values : [];
            const maxPicks = getMaxEnumPicks(field);
            return (
              <div className="flex w-72 flex-col gap-sm p-md">
                <EnumValueMenu
                  field={getEnumFilterField(field)}
                  multiple
                  // A country or currency column may store values outside the catalog (e.g. "UK"): they stay searchable.
                  // Other closed lists (colour-keyed enums) hold exactly their values.
                  allowCustomValues={getFilterCatalog(field) !== undefined}
                  maxSelected={maxPicks}
                  selectedValues={selectedValues}
                  onChange={(values) => commit(toEnumFilter(field, values))}
                />
                {selectedValues.length >= maxPicks ? (
                  <span className="text-small text-grey-secondary">
                    {t('cases:data_explorer.filters.max_values', { count: maxPicks })}
                  </span>
                ) : null}
              </div>
            );
          })
          .with('number', () => (
            <div className="flex w-72 gap-sm p-md">
              {numberBound('min', t('cases:data_explorer.filters.min'))}
              {numberBound('max', t('cases:data_explorer.filters.max'))}
            </div>
          ))
          .with('boolean', () => {
            const picked = value?.type === 'boolean' ? String(value.value) : '';
            return (
              <div className="p-md">
                <RadioGroup
                  aria-label={label}
                  value={picked}
                  onValueChange={(next) => onChange({ type: 'boolean', value: next === 'true' })}
                >
                  {['true', 'false'].map((option) => (
                    <RadioGroupItem
                      key={option}
                      value={option}
                      onClick={() => {
                        // Radix does not report a click on the checked radio: picking it again removes the filter.
                        if (option === picked) onChange(undefined);
                      }}
                    >
                      <BooleanLabel field={field} value={option === 'true'} />
                    </RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            );
          })
          .with('date', () => (
            <DateRangeFilter.Root
              dateRangeFilter={value?.type === 'date' ? value.range : undefined}
              setDateRangeFilter={(range) => (range ? commit({ type: 'date', range }) : onChange(undefined))}
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

  return (
    <div className="flex flex-row flex-wrap items-center gap-sm">
      {fields.map((field) => {
        const label = field.alias || field.name;
        return (
          <FilterItem.Root key={field.name}>
            <ColumnFilterPopover
              field={field}
              value={filters[field.name]}
              onChange={(value) => onChange(setColumnFilter(filters, field.name, value))}
              onOpenChange={(open) => setOpenField(open ? field.name : null)}
            >
              {/* FilterItem.Trigger is itself a Popover.Trigger and cannot be nested in one. */}
              <button type="button" className={cn(filterItemTriggerClassName, 'text-s')}>
                <span className="font-semibold">{label}:</span>
                <span className="text-grey-primary flex min-w-0 items-center gap-xs">
                  <ColumnFilterSummary field={field} value={filters[field.name]} />
                </span>
              </button>
            </ColumnFilterPopover>
            <FilterItem.Clear
              type="button"
              aria-label={`${t('filters:clear_filters')}: ${label}`}
              onClick={() => onChange(setColumnFilter(filters, field.name, undefined))}
            />
          </FilterItem.Root>
        );
      })}
      <ClearAllFiltersButton onClick={() => onChange({})} />
    </div>
  );
}

function ColumnFilterSummary({ field, value }: { field: DataModelField; value: ColumnFilterValue | undefined }) {
  const { t } = useTranslation(['filters']);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const formatBounds = (min: string | undefined, max: string | undefined) => {
    if (min && max) return min === max ? min : t('filters:between', { min, max });
    if (min) return t('filters:at_least', { value: min });
    return max ? t('filters:at_most', { value: max }) : null;
  };

  switch (value?.type) {
    case 'text':
      return <span className="max-w-40 truncate">{value.value}</span>;
    case 'enum': {
      const enumField = getEnumFilterField(field);
      return (
        <>
          {value.values.slice(0, 2).map((enumValue) => (
            <EnumTag key={enumValue} field={enumField} value={enumValue} />
          ))}
          {value.values.length > 2 ? <span>+{value.values.length - 2}</span> : null}
        </>
      );
    }
    case 'boolean':
      return <BooleanLabel field={field} value={value.value} />;
    case 'number':
      return formatBounds(
        value.min === undefined ? undefined : formatNumber(value.min, { language }),
        value.max === undefined ? undefined : formatNumber(value.max, { language }),
      );
    case 'date': {
      const { range } = value;
      if (range.type === 'dynamic') return t('filters:up_to', { duration: formatDuration(range.fromNow, language) });
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

/** Worded like the cells of the column (see DataField). */
function BooleanLabel({ field, value }: { field: DataModelField; value: boolean }) {
  const { t } = useTranslation(['common', 'data']);
  if (field.booleanDisplay === 'yes_no') return t(value ? 'data:yes' : 'data:no');
  return t(value ? 'common:true' : 'common:false');
}
