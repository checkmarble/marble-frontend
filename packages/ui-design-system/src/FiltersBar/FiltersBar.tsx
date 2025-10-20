import { useEffect, useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { ButtonV2 } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { useI18n } from '../contexts/I18nContext';
import { Modal } from '../Modal/Modal';
import { cn } from '../utils';
import { BooleanValueFilter } from './internals/BooleanValueFilter';
import { DateRangeFilterPopover } from './internals/DateRangeFilterPopover';
import { FiltersBarContext, type FiltersBarContextValue } from './internals/FiltersBarContext';
import { NumberValueFilter } from './internals/NumberValueFilter';
import { SelectOptionFilter } from './internals/SelectOptionFilter';
import { TextMatchFilter } from './internals/TextMatchFilter';
import {
  type DateRangePopoverFilter,
  type Filter,
  type FilterBarLevel,
  type FilterDescriptor,
  type FiltersBarProps,
  type FilterValue,
  type MultiSelectFilterDescriptor,
  type NumberFilter,
  type NumberFilterDescriptor,
  type NumberOperator,
  type RadioFilterDescriptor,
  type SelectFilterDescriptor,
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

// Context is now provided by ./context with a dev-safe fallback

export function FiltersBar({
  descriptors = [],
  dynamicDescriptors = [],
  value,
  onChange,
  onUpdate,
}: FiltersBarProps) {
  const { t } = useI18n();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  // Track locally selected additional filters (do not emit toggleActive)
  const [selectedAdditional, setSelectedAdditional] = useState<string[]>([]);

  const [draftValue, setDraftValue] = useState<Record<string, FilterValue>>(value);
  useEffect(() => {
    setDraftValue(value);
  }, [value]);

  const contextValue = useMemo<FiltersBarContextValue>(() => {
    const emitSet = (name: string, newValue: FilterValue) => {
      setDraftValue((prev) => ({ ...prev, [name]: newValue }));
    };
    const emitRemove = (name: string) => {
      setDraftValue((prev) => {
        const next = { ...prev } as Record<string, FilterValue>;
        delete next[name];
        return next;
      });
      // Ensure removed filters also disappear from the locally selected list
      setSelectedAdditional((prev) => prev.filter((n) => n !== name));
    };
    const emitUpdate = () => {
      if (onUpdate) return onUpdate({ value: draftValue });
      // Fallback for backward compatibility
      onChange?.({ type: 'set', name: '__apply__', value: null } as any, { value: draftValue });
    };
    const getValue = (name: string) => draftValue[name];
    return { emitSet, emitRemove, emitUpdate, getValue };
  }, [draftValue, onUpdate, onChange]);

  const getFilter = (
    d: FilterDescriptor,
    value: FilterValue,
    opts: Partial<Pick<Filter, 'removable' | 'isActive'>>,
  ): Filter => {
    console.log('getFilter', d, value, opts);
    // Normalize selectedValue shape based on descriptor type and possible trigger-shaped values
    const selectedValue = (() => {
      if (d.type === 'number') {
        if (value && typeof value === 'object' && 'op' in (value as any)) {
          const raw = (value as any).value as unknown;
          const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
          return {
            operator: (d as NumberFilterDescriptor).operator,
            value: Number.isNaN(num) ? 0 : num,
          } as NumberFilter['selectedValue'];
        }
        return (value as NumberFilter['selectedValue']) ?? null;
      }
      if (d.type === 'text') {
        if (value && typeof value === 'object' && 'op' in (value as any)) {
          const raw = (value as any).value as unknown;
          const arr = Array.isArray(raw) ? (raw as string[]) : [raw as string];
          return [
            { operator: (d as TextFilterDescriptor).operator, value: arr },
          ] as TextFilter['selectedValue'];
        }
        return (value as TextFilter['selectedValue']) ?? null;
      }
      if (d.type === 'date-range-popover') {
        return (value as DateRangePopoverFilter['selectedValue']) ?? null;
      }
      return ((value as { value?: unknown })?.value ?? value ?? null) as unknown;
    })();
    const commonProps = {
      name: d.name,
      placeholder: d.placeholder,
      removable: opts.removable ?? false,
      isActive: opts.isActive ?? selectedValue ?? false,
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

  console.log(mainFilters);

  const additionalFilters: Filter[] = useMemo(
    () =>
      dynamicDescriptors
        .filter((d) => selectedAdditional.includes(d.name) || draftValue[d.name] != null)
        .map((d) => getFilter(d, draftValue[d.name], { removable: true })),
    [dynamicDescriptors, draftValue, selectedAdditional],
  );

  const filtersMap = useMemo(() => {
    const hasDynamic = dynamicDescriptors.length > 0;
    return new Map<FilterBarLevel, Filter[]>([
      ['main', mainFilters],
      ...(hasDynamic ? [['additional', additionalFilters] as const] : []),
    ]);
  }, [mainFilters, additionalFilters, dynamicDescriptors]);

  return (
    <FiltersBarContext.Provider value={contextValue}>
      <div className="flex flex-col gap-2">
        {Array.from(filtersMap.entries()).map(([level, renderedFilters]) => (
          <div key={level} className="flex flex-row items-center gap-2">
            {renderedFilters
              .filter(
                (filter) =>
                  level === 'main' ||
                  selectedAdditional.includes(filter.name) ||
                  draftValue[filter.name] != null,
              )
              .map((filter) =>
                match(filter)
                  .with({ type: 'text' }, (textFilter) => {
                    return <TextMatchFilter filter={textFilter} key={filter.name} />;
                  })
                  .with({ type: 'checkbox' }, () => <Checkbox key={filter.name} />)
                  .with({ type: 'number' }, (numberFilter) => (
                    <NumberValueFilter filter={numberFilter} key={filter.name} />
                  ))
                  .with({ type: 'boolean' }, (booleanFilter) => (
                    <BooleanValueFilter filter={booleanFilter} level={level} key={filter.name} />
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

            {level === 'additional' && (
              <>
                <ButtonV2 variant="secondary" onClick={() => setAddModalOpen(true)}>
                  {t('filters:ds.addNewFilter.label')}
                </ButtonV2>
                <Modal.Root open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                  <Modal.Content size="small">
                    <Modal.Title>{t('filters:ds.chooseFilter.label')}</Modal.Title>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      {dynamicDescriptors
                        .filter(
                          (d) => !selectedAdditional.includes(d.name) && draftValue[d.name] == null,
                        )
                        .map((d) => (
                          <button
                            key={d.name}
                            className={cn(
                              'text-left border border-grey-90 rounded-sm px-3 py-2 hover:bg-purple-98 outline-hidden',
                            )}
                            onClick={() => {
                              setSelectedAdditional((prev) =>
                                Array.from(new Set([...prev, d.name])),
                              );
                              setAddModalOpen(false);
                            }}
                          >
                            {d.name}
                          </button>
                        ))}
                    </div>
                  </Modal.Content>
                </Modal.Root>
              </>
            )}
          </div>
        ))}
        <div className="flex flex-row items-center justify-end">
          <ButtonV2 variant="primary" onClick={() => contextValue.emitUpdate()}>
            {t('filters:ds.apply.label', { defaultValue: 'Apply' })}
          </ButtonV2>
        </div>
      </div>
    </FiltersBarContext.Provider>
  );
}
