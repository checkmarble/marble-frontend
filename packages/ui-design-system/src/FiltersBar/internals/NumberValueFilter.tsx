import { useEffect, useState } from 'react';
import { Input } from '../../Input/Input';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { cn } from '../../utils';
import { NUMBER_OPERATORS } from '../FiltersBar';
import { ComparisonFilter, type NumberFilter, NumberOperator } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function NumberValueFilter({ filter }: { filter: NumberFilter }) {
  const [isOpen, setOpen] = useState(true);

  const [opSelectIsOpen, setOpSelectIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<ComparisonFilter<number>>(
    filter.selectedValue ?? { operator: 'eq', value: 0 },
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) setLocalValue(filter.selectedValue ?? { operator: 'eq', value: 0 });
  }, [isOpen]);

  const onOperatorChange = (operator: string) => {
    // Check if operator is a valid NumberOperator value
    if (!NUMBER_OPERATORS.has(operator as NumberOperator))
      throw new Error(`Invalid operator: ${operator}`);

    setLocalValue({ operator: operator as NumberOperator, value: localValue.value });
    setOpSelectIsOpen(false);
  };

  if (filter.removable) {
    return (
      <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
        <FilterItem.Root>
          <FilterItem.Trigger>{filter.placeholder}</FilterItem.Trigger>
          {filter.removable ? (
            <FilterItem.Clear
              onClick={() => {
                emitRemove(filter.name);
                // Keep popover state consistent
                setOpen(false);
              }}
            />
          ) : null}
        </FilterItem.Root>
        <FilterPopover.Content>
          <div className="p-4 flex flex-col gap-3 w-80">
            <div className="flex gap-2">
              <MenuCommand.Menu open={opSelectIsOpen} onOpenChange={setOpSelectIsOpen}>
                <MenuCommand.Trigger>
                  <MenuCommand.SelectButton className="w-v2-s">
                    {(() => {
                      switch (localValue.operator) {
                        case 'eq':
                          return '=';
                        case 'ne':
                          return '≠';
                        case 'gt':
                          return '>';
                        case 'gte':
                          return '≥';
                        case 'lt':
                          return '<';
                        case 'lte':
                          return '≤';
                      }
                    })()}
                  </MenuCommand.SelectButton>
                </MenuCommand.Trigger>
                <MenuCommand.Content sameWidth>
                  <MenuCommand.List>
                    <MenuCommand.Item value="eq" onSelect={(v) => onOperatorChange(v)}>
                      =
                    </MenuCommand.Item>
                    <MenuCommand.Item value="ne" onSelect={() => onOperatorChange('ne')}>
                      ≠
                    </MenuCommand.Item>
                    <MenuCommand.Item value="gt" onSelect={() => onOperatorChange('gt')}>
                      {'>'}
                    </MenuCommand.Item>
                    <MenuCommand.Item value="gte" onSelect={() => onOperatorChange('gte')}>
                      ≥
                    </MenuCommand.Item>
                    <MenuCommand.Item value="lt" onSelect={() => onOperatorChange('lt')}>
                      {'<'}
                    </MenuCommand.Item>
                    <MenuCommand.Item value="lte" onSelect={() => onOperatorChange('lte')}>
                      ≤
                    </MenuCommand.Item>
                  </MenuCommand.List>
                </MenuCommand.Content>
              </MenuCommand.Menu>
              <Input
                type="number"
                placeholder={filter.placeholder}
                value={localValue.value}
                onChange={(e) =>
                  setLocalValue({
                    operator: localValue.operator,
                    value: Number(e.currentTarget.value),
                  })
                }
              />
            </div>
            <div className="flex justify-end">
              <button
                className={cn(
                  'text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden',
                )}
                onClick={() => {
                  const trimmed = localValue.value.toString().trim();
                  const committed =
                    trimmed === ''
                      ? null
                      : { operator: localValue.operator, value: Number(trimmed) };
                  const payload =
                    committed === null || Number.isNaN(committed.value)
                      ? null
                      : { operator: localValue.operator, value: committed.value };
                  emitSet(filter.name, payload);
                  setOpen(false);
                }}
              >
                Done
              </button>
            </div>
          </div>
        </FilterPopover.Content>
      </FilterPopover.Root>
    );
  }
  return <Input placeholder={filter.placeholder} type="number" />;
}
