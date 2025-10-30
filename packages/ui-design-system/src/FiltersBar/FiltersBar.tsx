import { cva } from 'class-variance-authority';
import { useEffect, useMemo, useState } from 'react';
import { isDeepEqual } from 'remeda';
import { match } from 'ts-pattern';
import { ButtonV2 } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { useI18n } from '../contexts/I18nContext';
import { BooleanValueFilter } from './internals/BooleanValueFilter';
import { DateRangeFilterPopover } from './internals/DateRangeFilterPopover';
import { FiltersBarContext, type FiltersBarContextValue } from './internals/FiltersBarContext';
import { NumberValueFilter } from './internals/NumberValueFilter';
import { SelectOptionFilter } from './internals/SelectOptionFilter';
import { TextMatchFilter } from './internals/TextMatchFilter';
import {
  type DateRangePopoverFilter,
  type Filter,
  type FilterDescriptor,
  type FiltersBarProps,
  type FilterValue,
  type MultiSelectFilterDescriptor,
  type NumberComparisonFilter,
  type NumberFilter,
  type NumberFilterDescriptor,
  type NumberOperator,
  type RadioFilterDescriptor,
  type SelectFilterDescriptor,
  type TextComparisonFilter,
  type TextFilter,
  type TextFilterDescriptor,
  type TextOperator,
} from './types';

export const NUMBER_OPERATORS: Set<NumberOperator> = new Set([
  'eq',
  'ne',
  'lt',
  'lte',
  'gt',
  'gte',
]);
export const TEXT_OPERATORS: Set<TextOperator> = new Set(['in']);

export function FiltersBar({
  descriptors = [],
  dynamicDescriptors = [],
  value,
  onChange,
  onUpdate,
  options = null,
}: FiltersBarProps) {
  const { t } = useI18n();

  const [draftValue, setDraftValue] = useState<Record<string, FilterValue>>(value);
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const getFilter = (
    d: FilterDescriptor,
    value: FilterValue,
    opts: Partial<Pick<Filter, 'removable' | 'isActive'>>,
  ): Filter => {
    // Normalize selectedValue shape based on descriptor type and possible trigger-shaped values
    const selectedValue = (() => {
      if (d.type === 'number') {
        if (value && typeof value === 'object' && 'op' in (value as any)) {
          const raw = (value as any).value as unknown;
          if (Array.isArray(raw)) {
            if (raw.length === 0) return null;
            const num = Number((raw as number[])[0]);
            if (Number.isNaN(num)) return null;
            return {
              operator: (d as NumberFilterDescriptor).operator,
              value: num,
            } as NumberComparisonFilter;
          }
          const num = Number(raw as number);
          if (Number.isNaN(num)) return null;
          return {
            operator: (d as NumberFilterDescriptor).operator,
            value: num,
          } as NumberComparisonFilter;
        }
        const sv = (value as NumberComparisonFilter | null) ?? null;
        if (sv && typeof sv === 'object' && 'operator' in sv && 'value' in sv) {
          const raw = sv.value as unknown;
          if (Array.isArray(raw)) {
            if (raw.length === 0) return null;
            const num = Number((raw as number[])[0]);
            if (Number.isNaN(num)) return null;
            return {
              operator: (sv.operator ?? (d as NumberFilterDescriptor).operator) as NumberOperator,
              value: num,
            } as NumberComparisonFilter;
          }
          const num = Number(raw as number);
          if (Number.isNaN(num)) return null;
          return {
            operator: (sv.operator ?? (d as NumberFilterDescriptor).operator) as NumberOperator,
            value: num,
          } as NumberComparisonFilter;
        }
        return sv;
      }
      if (d.type === 'text') {
        if (value && typeof value === 'object' && 'op' in (value as any)) {
          const raw = (value as any).value as unknown;
          const arr = Array.isArray(raw) ? (raw as string[]) : [raw as string];
          return arr.map((v) => ({
            operator: (d as TextFilterDescriptor).operator,
            value: v,
          })) as TextComparisonFilter[];
        }
        const sv = (value as TextComparisonFilter[] | null) ?? null;
        if (!sv || !Array.isArray(sv)) return null;
        const flattened = sv.flatMap((item) => {
          if (!item || typeof item !== 'object') return [];
          const op = (item.operator ?? (d as TextFilterDescriptor).operator) as TextOperator;
          const v = item.value as unknown;
          if (Array.isArray(v)) {
            return (v as string[]).map(
              (one) => ({ operator: op, value: one }) as TextComparisonFilter,
            );
          }
          return [{ operator: op, value: v as string } as TextComparisonFilter];
        });
        return flattened;
      }
      if (d.type === 'date-range-popover') {
        return (value as DateRangePopoverFilter['selectedValue']) ?? null;
      }
      return ((value as { value?: unknown })?.value ?? value ?? null) as unknown;
    })();
    const commonProps = {
      name: d.name,
      placeholder: d.placeholder,
      removable: opts.removable ?? d.removable ?? false,
      isActive: opts.isActive ?? selectedValue ?? false,
      unavailable: (d as any).unavailable ?? false,
    };
    switch (d.type) {
      case 'text':
        return {
          ...commonProps,
          type: 'text' as const,
          selectedValue: (selectedValue as TextFilter['selectedValue']) ?? null,
          operator: (d as TextFilterDescriptor).operator,
        } as Filter;
      case 'number':
        return {
          ...commonProps,
          type: 'number' as const,
          selectedValue: (selectedValue as NumberFilter['selectedValue']) ?? null,
          operator: (d as NumberFilterDescriptor).operator,
        } as Filter;
      case 'boolean':
        return {
          ...commonProps,
          type: 'boolean' as const,
          selectedValue: (selectedValue as boolean | null) ?? null,
        } as Filter;
      case 'checkbox':
        return {
          ...commonProps,
          type: 'checkbox' as const,
          selectedValue: (selectedValue as boolean | null) ?? null,
        } as Filter;
      case 'select':
        return {
          ...commonProps,
          type: 'select' as const,
          selectedValue: (selectedValue as string | null) ?? null,
          options: (d as SelectFilterDescriptor).options,
        } as Filter;
      case 'multi-select':
        return {
          ...commonProps,
          type: 'multi-select' as const,
          selectedValue: (selectedValue as string[] | null) ?? null,
          options: (d as MultiSelectFilterDescriptor).options,
        } as Filter;
      case 'date-range-popover':
        return {
          ...commonProps,
          type: 'date-range-popover' as const,
          selectedValue: (selectedValue as DateRangePopoverFilter['selectedValue']) ?? null,
        } as Filter;
      case 'radio':
        return {
          ...commonProps,
          type: 'radio' as const,
          selectedValue: (selectedValue as string | null) ?? null,
          options: (d as RadioFilterDescriptor).options,
        } as Filter;
      default:
        return undefined as never;
    }
  };

  const mainFilters: Filter[] = useMemo(
    () => descriptors.map((d) => getFilter(d, draftValue[d.name], {})),
    [descriptors, draftValue],
  );

  const additionalFilters: Filter[] = useMemo(
    () => dynamicDescriptors.map((d) => getFilter(d, draftValue[d.name], { removable: true })),
    [dynamicDescriptors, draftValue],
  );

  // const filtersMap = useMemo(() => {
  //   const hasDynamic = dynamicDescriptors.length > 0;
  //   return new Map<FilterBarLevel, Filter[]>([
  //     ['main', mainFilters],
  //     ...(hasDynamic ? [['additional', additionalFilters] as const] : []),
  //   ]);
  // }, [mainFilters, additionalFilters, dynamicDescriptors]);

  type FilterWithPriority = Filter & {
    priority: 'main' | 'additional';
  };

  const filtersByPriority = useMemo(
    (): FilterWithPriority[][] => [
      mainFilters.map((filter) => ({ ...filter, priority: 'main' as const })),
      ...(additionalFilters.length > 0
        ? [additionalFilters.map((filter) => ({ ...filter, priority: 'additional' as const }))]
        : []),
    ],
    [mainFilters, additionalFilters],
  );

  const allDescriptors = useMemo(
    () => [...descriptors, ...dynamicDescriptors],
    [descriptors, dynamicDescriptors],
  );

  const contextValue = useMemo<FiltersBarContextValue>(() => {
    const emitSet = (name: string, newValue: FilterValue) => {
      setDraftValue((prev) => ({ ...prev, [name]: newValue }));

      if (allDescriptors.find((d) => d.name === name)?.instantUpdate && onChange) {
        const nextValue = { ...draftValue, [name]: newValue };
        onChange({ type: 'set', name, value: newValue }, { value: nextValue });
      }
    };
    const emitRemove = (name: string) => {
      setDraftValue((prev) => {
        const next = { ...prev } as Record<string, FilterValue>;
        delete next[name];
        return next;
      });

      if (allDescriptors.find((d) => d.name === name)?.instantUpdate && onChange) {
        const nextValue = { ...draftValue };
        delete nextValue[name];
        onChange({ type: 'remove', name }, { value: nextValue });
      }
    };
    // const emitSingleChange = () => {
    //   if (onSingleChange)
    //     return onSingleChange({ type: 'set', name: '__apply__', value: null } as any, {
    //       value: draftValue,
    //     });
    // };
    const emitUpdate = () => {
      if (onUpdate) return onUpdate({ value: draftValue });
      // Fallback for backward compatibility
      // onChange?.({ type: 'set', name: '__apply__', value: null } as any, { value: draftValue });
    };
    const getValue = (name: string) => draftValue[name];
    return { emitSet, emitRemove, emitUpdate, getValue };
  }, [draftValue, onUpdate, onChange, descriptors, dynamicDescriptors]);

  const buttonState = cva('font-semibold', {
    variants: {
      state: {
        enabled: ' text-purple-65',
        disabled: 'text-grey-50',
      },
    },
    defaultVariants: {
      state: 'disabled',
    },
  });

  const hasChanges = useMemo(() => !isDeepEqual(value, draftValue), [value, draftValue]);

  const hasAnyDynamicSelected = useMemo(() => {
    const isSelected = (f: Filter): boolean => {
      switch (f.type) {
        case 'text': {
          const arr = f.selectedValue as unknown[] | null;
          if (!Array.isArray(arr)) return false;
          return arr.some((item) => {
            const v = (item as any)?.value;
            return Array.isArray(v) ? v.length > 0 : v != null && String(v).length > 0;
          });
        }
        case 'number':
          return f.selectedValue != null;
        case 'boolean':
        case 'checkbox':
          return f.selectedValue !== null && f.selectedValue !== undefined;
        case 'select':
        case 'radio':
          return f.selectedValue != null && String(f.selectedValue).length > 0;
        case 'multi-select':
          return Array.isArray(f.selectedValue) && f.selectedValue.length > 0;
        case 'date-range-popover':
          return f.selectedValue != null;
        default:
          return false;
      }
    };
    return additionalFilters.some(isSelected);
  }, [additionalFilters]);

  const clearDynamicFilters = () => {
    setDraftValue((prev) => {
      const next = { ...prev } as Record<string, FilterValue>;
      for (const d of dynamicDescriptors) delete next[d.name];
      return next;
    });
  };
  return (
    <FiltersBarContext.Provider value={contextValue}>
      <div className="flex flex-row gap-v2-md">
        <div className="flex flex-col gap-v2-md">
          {filtersByPriority.map((filters, priorityIndex) => (
            <div key={priorityIndex} className="flex flex-row items-center gap-v2-md w-full">
              <div className="flex flex-row items-center gap-v2-md">
                {filters.map((filter) =>
                  match(filter)
                    .with({ type: 'text' }, (textFilter) => (
                      <TextMatchFilter
                        filter={textFilter}
                        key={filter.name}
                        buttonState={buttonState({
                          state: textFilter.selectedValue ? 'enabled' : 'disabled',
                        })}
                      />
                    ))
                    .with({ type: 'checkbox' }, () => <Checkbox key={filter.name} />)
                    .with({ type: 'number' }, (numberFilter) => (
                      <NumberValueFilter
                        filter={numberFilter}
                        key={filter.name}
                        buttonState={buttonState({
                          state: numberFilter.selectedValue ? 'enabled' : 'disabled',
                        })}
                      />
                    ))
                    .with({ type: 'boolean' }, (booleanFilter) => (
                      <BooleanValueFilter
                        filter={booleanFilter}
                        level={filter.priority}
                        key={filter.name}
                        buttonState={buttonState({
                          state: booleanFilter.selectedValue ? 'enabled' : 'disabled',
                        })}
                      />
                    ))
                    .with({ type: 'select' }, (selectFilter) => (
                      <SelectOptionFilter {...selectFilter} key={filter.name} />
                    ))
                    .with({ type: 'date-range-popover' }, (dateRangePopoverFilter) => (
                      <DateRangeFilterPopover filter={dateRangePopoverFilter} key={filter.name} />
                    ))
                    .with({ type: 'radio' }, () => (
                      <div key={filter.name}>Radio filter not implemented yet</div>
                    ))
                    .with({ type: 'multi-select' }, () => (
                      <div key={filter.name}>Multi-select filter not implemented yet</div>
                    ))
                    .otherwise(() => <div key={filter.name}>Filter not implemented yet</div>),
                )}
              </div>

              {priorityIndex === 0 && (
                <div className="flex flex-row items-start gap-v2-md ml-v2-lg">
                  {dynamicDescriptors.length || options?.dynamicSkeletons?.enabled ? (
                    <ButtonV2
                      variant="secondary"
                      onClick={clearDynamicFilters}
                      disabled={!hasAnyDynamicSelected}
                    >
                      {t('filters:ds.clear_dynamic_button.label', { defaultValue: 'Clear' })}
                    </ButtonV2>
                  ) : null}
                  <ButtonV2
                    variant="primary"
                    onClick={() => contextValue.emitUpdate()}
                    disabled={!hasChanges}
                  >
                    {t('filters:ds.apply_button.label', { defaultValue: 'Apply' })}
                  </ButtonV2>
                </div>
              )}
            </div>
          ))}

          {options?.dynamicSkeletons?.enabled && options?.dynamicSkeletons?.state === 'loading' && (
            <div className="flex flex-row items-center gap-v2-md">
              <div className="flex flex-row items-center gap-v2-md">
                <div className="w-[84px] h-v2-xxl animate-pulse bg-grey-90 rounded-v2-s" />
                <div className="w-[96px] h-v2-xxl animate-pulse bg-grey-90 rounded-v2-s" />
                <div className="w-[82px] h-v2-xxl animate-pulse bg-grey-90 rounded-v2-s" />
                <div className="w-[80px] h-v2-xxl animate-pulse bg-grey-90 rounded-v2-s" />
              </div>
            </div>
          )}
        </div>
      </div>
    </FiltersBarContext.Provider>
  );
}
