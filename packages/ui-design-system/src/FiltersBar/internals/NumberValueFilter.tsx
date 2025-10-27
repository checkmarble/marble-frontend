import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { NUMBER_OPERATORS } from '../FiltersBar';
import { ComparisonFilter, type NumberFilter, NumberOperator } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function NumberValueFilter({
  filter,
  buttonState,
}: {
  filter: NumberFilter;
  buttonState: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const { t } = useI18n();

  const [opSelectIsOpen, setOpSelectIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<ComparisonFilter<number>>(
    (() => {
      const sv = filter.selectedValue ?? { operator: 'eq', value: 0 };
      const raw = (sv as any).value as unknown;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      return { operator: (sv as any).operator ?? 'eq', value: Number.isNaN(num) ? 0 : num };
    })(),
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) {
      const sv = filter.selectedValue ?? { operator: 'eq', value: 0 };
      const raw = (sv as any).value as unknown;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      setLocalValue({
        operator: (sv as any).operator ?? 'eq',
        value: Number.isNaN(num) ? 0 : num,
      });
    }
  }, [isOpen, filter.selectedValue]);

  const operatorDisplay: Map<NumberOperator, string> = new Map([
    ['eq', '='],
    ['ne', '≠'],
    ['gt', '>'],
    ['gte', '≥'],
    ['lt', '<'],
    ['lte', '≤'],
  ]);
  const onOperatorChange = (operator: string) => {
    // Check if operator is a valid NumberOperator value
    if (!NUMBER_OPERATORS.has(operator as NumberOperator))
      throw new Error(`Invalid operator: ${operator}`);

    setLocalValue({ operator: operator as NumberOperator, value: localValue.value });
    setOpSelectIsOpen(false);
  };
  return (
    <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterItem.Root>
        <FilterItem.Trigger>
          <span className={buttonState}>{filter.name}</span> {(() => {
            if (!filter.selectedValue) return null;
            const op = (filter.selectedValue?.operator ?? localValue.operator) as NumberOperator;
            const val = (() => {
              const raw = (filter.selectedValue as any)?.value ?? localValue.value;
              return Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
            })();
            return (
              <>
                {operatorDisplay.get(op)} {val}
              </>
            );
          })()}
        </FilterItem.Trigger>
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
        {filter.selectedValue ? (
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
                    const op = (filter.selectedValue?.operator ??
                      localValue.operator) as NumberOperator;
                    switch (op) {
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
                  <MenuCommand.Item
                    value="eq"
                    selected={localValue.operator === 'eq'}
                    onSelect={(v) => onOperatorChange(v)}
                  >
                    =
                  </MenuCommand.Item>
                  <MenuCommand.Item
                    value="ne"
                    selected={localValue.operator === 'ne'}
                    onSelect={() => onOperatorChange('ne')}
                  >
                    ≠
                  </MenuCommand.Item>
                  <MenuCommand.Item
                    value="gt"
                    selected={localValue.operator === 'gt'}
                    onSelect={() => onOperatorChange('gt')}
                  >
                    {'>'}
                  </MenuCommand.Item>
                  <MenuCommand.Item
                    value="gte"
                    selected={localValue.operator === 'gte'}
                    onSelect={() => onOperatorChange('gte')}
                  >
                    ≥
                  </MenuCommand.Item>
                  <MenuCommand.Item
                    value="lt"
                    selected={localValue.operator === 'lt'}
                    onSelect={() => onOperatorChange('lt')}
                  >
                    {'<'}
                  </MenuCommand.Item>
                  <MenuCommand.Item
                    value="lte"
                    selected={localValue.operator === 'lte'}
                    onSelect={() => onOperatorChange('lte')}
                  >
                    ≤
                  </MenuCommand.Item>
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
            <Input
              type="number"
              placeholder={filter.placeholder}
              value={Number(localValue.value) || 0}
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
              className={cn('text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden')}
              onClick={() => {
                const trimmed = String(localValue.value ?? '')
                  .toString()
                  .trim();
                const n = Number(trimmed);
                const payload = Number.isNaN(n)
                  ? null
                  : { operator: localValue.operator, value: n };
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
