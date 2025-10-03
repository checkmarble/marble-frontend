import { useMemo, useState } from 'react';
import { match } from 'ts-pattern';
import { ButtonV2 } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
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
  active = [],
  onChange,
}: FiltersBarProps) {
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const contextValue = useMemo<FiltersBarContextValue>(() => {
    const emitSet = (name: string, newValue: unknown) => {
      const nextValue = { ...value, [name]: newValue };
      onChange({ type: 'set', name, value: newValue }, { value: nextValue, active });
    };
    const emitRemove = (name: string) => {
      const nextValue = { ...value } as Record<string, unknown>;
      delete nextValue[name];
      const nextActive = active.filter((n) => n !== name);
      onChange({ type: 'remove', name }, { value: nextValue, active: nextActive });
    };
    const emitToggleActive = (name: string, isActive: boolean) => {
      const nextActive = isActive
        ? Array.from(new Set([...active, name]))
        : active.filter((n) => n !== name);
      onChange({ type: 'toggleActive', name, isActive }, { value, active: nextActive });
    };
    const getValue = (name: string) => value[name];
    const isActive = (name: string) => active.includes(name);
    return { emitSet, emitRemove, emitToggleActive, getValue, isActive };
  }, [value, active, onChange]);

  const getFilter = (
    d: FilterDescriptor,
    value: unknown,
    opts: Partial<Pick<Filter, 'removable' | 'isActive'>>,
  ): Filter => {
    const selectedValue = value ?? null;
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
    () => descriptors.map((d) => getFilter(d, value[d.name], {})),
    [descriptors, value],
  );

  const additionalFilters: Filter[] = useMemo(
    () =>
      dynamicDescriptors
        // .filter((d) => active.includes(d.name))
        .map((d) => getFilter(d, value[d.name], { removable: true })),
    [dynamicDescriptors, value, active],
  );

  const filtersMap = useMemo(() => {
    return new Map<FilterBarLevel, Filter[]>([
      ['main', mainFilters],
      ...(additionalFilters.length > 0 ? [['additional', additionalFilters] as const] : []),
    ]);
  }, [mainFilters, additionalFilters]);

  return (
    <FiltersBarContext.Provider value={contextValue}>
      <div className="flex flex-col gap-2">
        {Array.from(filtersMap.entries()).map(([level, renderedFilters]) => (
          <div key={`${level}-row`} className="flex flex-row items-center gap-2">
            {renderedFilters
              .filter((filter) => level === 'main' || active.includes(filter.name))
              .map((filter) =>
                match(filter)
                  .with({ type: 'text' }, (textFilter) => {
                    return <TextMatchFilter filter={textFilter} />;
                  })
                  .with({ type: 'checkbox' }, () => <Checkbox />)
                  .with({ type: 'number' }, (numberFilter) => (
                    <NumberValueFilter filter={numberFilter} />
                  ))
                  .with({ type: 'boolean' }, (booleanFilter) => (
                    <BooleanValueFilter filter={booleanFilter} level={level} />
                  ))
                  .with({ type: 'select' }, (selectFilter) => (
                    <SelectOptionFilter {...selectFilter} />
                  ))
                  .with({ type: 'date-range-popover' }, (dateRangePopoverFilter) => (
                    <DateRangeFilterPopover filter={dateRangePopoverFilter} />
                  ))
                  .with({ type: 'radio' }, () => <div>Radio filter not implemented yet</div>)
                  .with({ type: 'multi-select' }, () => (
                    <div>Multi-select filter not implemented yet</div>
                  ))
                  .otherwise(() => <div>Filter not implemented yet</div>),
              )}

            {level === 'additional' && (
              <>
                <ButtonV2 variant="secondary" onClick={() => setAddModalOpen(true)}>
                  Add new filter
                </ButtonV2>
                <Modal.Root open={isAddModalOpen} onOpenChange={setAddModalOpen}>
                  <Modal.Content size="small">
                    <Modal.Title>Choose a filter</Modal.Title>
                    <div className="p-4 grid grid-cols-1 gap-2">
                      {dynamicDescriptors
                        .filter((d) => !active.includes(d.name))
                        .map((d) => (
                          <button
                            key={d.name}
                            className={cn(
                              'text-left border border-grey-90 rounded-sm px-3 py-2 hover:bg-purple-98 outline-hidden',
                            )}
                            onClick={() => {
                              contextValue.emitToggleActive(d.name, true);
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
      </div>
    </FiltersBarContext.Provider>
  );
}
