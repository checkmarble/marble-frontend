import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { NUMBER_OPERATORS } from '../FiltersBar';
import { type NumberComparisonFilter, type NumberFilter, NumberOperator } from '../types';
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
  const [localValue, setLocalValue] = useState<NumberComparisonFilter>(
    (() => {
      const sv = filter.selectedValue ?? { operator: 'eq', value: 0 };
      const raw = (sv as any).value as unknown;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      return { operator: (sv as any).operator ?? 'eq', value: Number.isNaN(num) ? 0 : num };
    })(),
  );
  const [inputValue, setInputValue] = useState<string>(
    localValue.value === 0 ? '' : String(localValue.value),
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) {
      const sv = filter.selectedValue ?? { operator: 'eq', value: 0 };
      const raw = (sv as any).value as unknown;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      const newValue = Number.isNaN(num) ? 0 : num;
      setLocalValue({
        operator: (sv as any).operator ?? 'eq',
        value: newValue,
      });
      setInputValue(newValue === 0 ? '' : String(newValue));
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
            const raw = (filter.selectedValue as any)?.value ?? localValue.value;
            const val = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
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
                    return operatorDisplay.get(op) ?? '...';
                  })()}
                </MenuCommand.SelectButton>
              </MenuCommand.Trigger>
              <MenuCommand.Content sameWidth>
                <MenuCommand.List>
                  {Array.from(operatorDisplay.entries()).map(([op, display]) => (
                    <MenuCommand.Item
                      key={op}
                      value={op}
                      selected={localValue.operator === op}
                      onSelect={(v) => onOperatorChange(op === 'eq' ? v : op)}
                    >
                      {display}
                    </MenuCommand.Item>
                  ))}
                </MenuCommand.List>
              </MenuCommand.Content>
            </MenuCommand.Menu>
            <Input
              type="number"
              placeholder={filter.placeholder}
              value={inputValue}
              onChange={(e) => {
                const stringValue = e.currentTarget.value;
                setInputValue(stringValue);
                const numValue = stringValue === '' ? 0 : Number(stringValue);
                setLocalValue({
                  operator: localValue.operator,
                  value: Number.isNaN(numValue) ? 0 : numValue,
                });
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              className={cn('text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden')}
              onClick={() => {
                const trimmed = inputValue.trim();
                const n = trimmed === '' ? NaN : Number(trimmed);
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
