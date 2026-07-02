import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { Button } from '../../Button/Button';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { MenuCommand } from '../../MenuCommand/MenuCommand';
import { Popover } from '../../Popover/Popover';
import { Tooltip } from '../../Tooltip/Tooltip';
import { NUMBER_OPERATORS } from '../FiltersBar';
import { type NumberComparisonFilter, type NumberFilter, NumberOperator } from '../types';
import { useFiltersBarContext } from './FiltersBarContext';
import { FilterTrigger, filterPopoverContentProps } from './FilterTrigger';

export function NumberValueFilter({ filter, buttonState }: { filter: NumberFilter; buttonState: string }) {
  const [isOpen, setOpen] = useState(false);
  const { t } = useI18n();

  const [opSelectIsOpen, setOpSelectIsOpen] = useState(false);
  const [localValue, setLocalValue] = useState<NumberComparisonFilter>(
    (() => {
      const selectedValue = filter.selectedValue ?? { op: '=', value: 0 };
      const raw = selectedValue.value;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      return { op: selectedValue.op ?? '=', value: Number.isNaN(num) ? 0 : num };
    })(),
  );
  const [inputValue, setInputValue] = useState<string>(localValue.value === 0 ? '' : String(localValue.value));
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) {
      const selectedValue = filter.selectedValue ?? { op: '=', value: 0 };
      const raw = selectedValue.value;
      const num = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
      const newValue = Number.isNaN(num) ? 0 : num;
      setLocalValue({
        op: selectedValue.op ?? '=',
        value: newValue,
      });
      setInputValue(newValue === 0 ? '' : String(newValue));
    }
  }, [isOpen, filter.selectedValue]);

  const onOperatorChange = (operator: string) => {
    // Check if operator is a valid NumberOperator value
    if (!NUMBER_OPERATORS.has(operator as NumberOperator)) throw new Error(`Invalid operator: ${operator}`);

    setLocalValue({ op: operator as NumberOperator, value: localValue.value });
    setOpSelectIsOpen(false);
  };

  const validate = () => {
    const trimmed = inputValue.trim();
    const numberValue = trimmed === '' ? NaN : Number(trimmed);
    const payload = Number.isNaN(numberValue) ? null : { op: localValue.op, value: numberValue };
    emitSet(filter.name, payload);
    setOpen(false);
  };

  const clear = () => {
    emitRemove(filter.name);
    setLocalValue({ op: '=', value: 0 });
    setInputValue('');
    setOpen(false);
  };
  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterTrigger
        id={filter.name}
        className={buttonState}
        onClear={
          filter.removable
            ? () => {
                emitRemove(filter.name);
                setOpen(false);
              }
            : undefined
        }
      >
        <span className={buttonState}>{filter.name}</span> {(() => {
          if (!filter.selectedValue) return null;
          const op = (filter.selectedValue?.op ?? localValue.op) as NumberOperator;
          const raw = (filter.selectedValue as any)?.value ?? localValue.value;
          const val = Array.isArray(raw) ? Number((raw as number[])[0]) : Number(raw as number);
          return (
            <span className={buttonState}>
              {op} {val}
            </span>
          );
        })()}
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
      </FilterTrigger>
      <Popover.Content {...filterPopoverContentProps}>
        <div className="p-md flex flex-col gap-md w-80">
          <div className="flex gap-sm">
            <MenuCommand.Menu open={opSelectIsOpen} onOpenChange={setOpSelectIsOpen}>
              <MenuCommand.Trigger>
                <MenuCommand.SelectButton className="w-s">{localValue.op}</MenuCommand.SelectButton>
              </MenuCommand.Trigger>
              <MenuCommand.Content sameWidth>
                <MenuCommand.List>
                  {Array.from(NUMBER_OPERATORS).map((op) => (
                    <MenuCommand.Item
                      key={op}
                      value={op}
                      selected={localValue.op === op}
                      onSelect={() => onOperatorChange(op)}
                    >
                      {op}
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
                const numValue = Number(stringValue);
                setLocalValue({
                  op: localValue.op,
                  value: stringValue === '' || Number.isNaN(numValue) ? 0 : numValue,
                });
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  validate();
                }
              }}
            />
          </div>
          <div className="flex justify-end gap-xs">
            <Button variant="secondary" size="medium" onClick={clear}>
              {t('filters:ds.clear_button.label')}
            </Button>
            <Button size="medium" onClick={validate}>
              {t('filters:ds.apply_button.label')}
            </Button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
