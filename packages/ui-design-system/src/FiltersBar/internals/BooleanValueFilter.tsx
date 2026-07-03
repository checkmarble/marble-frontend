import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { Checkbox } from '../../Checkbox/Checkbox';
import { useI18n } from '../../contexts/I18nContext';
import { Popover } from '../../Popover/Popover';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { type BooleanFilter, type FilterBarLevel } from '../types';
import { useFiltersBarContext } from './FiltersBarContext';
import { FilterTrigger, filterPopoverContentProps } from './FilterTrigger';

export function BooleanValueFilter({
  filter,
  level,
  buttonState,
}: {
  filter: BooleanFilter;
  level: FilterBarLevel;
  buttonState: string;
}) {
  const committed = (level === 'additional' ? filter.selectedValue : filter.selectedValue) as
    | boolean
    | null
    | undefined;
  const label = committed ? String(committed) : filter.placeholder;
  const [isOpen, setOpen] = useState(false);
  const [localChecked, setLocalChecked] = useState<'indeterminate' | boolean>(
    filter.selectedValue === null ? 'indeterminate' : Boolean(filter.selectedValue),
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t } = useI18n();
  useEffect(() => {
    if (isOpen) {
      setLocalChecked(filter.selectedValue === null ? 'indeterminate' : Boolean(filter.selectedValue));
    }
  }, [isOpen]);

  return (
    <Popover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterTrigger
        className={buttonState}
        onClear={
          filter.removable
            ? () => {
                setLocalChecked('indeterminate');
                emitRemove(filter.name);
                setOpen(false);
              }
            : undefined
        }
      >
        <span className={buttonState}>{label}</span>
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
      </FilterTrigger>
      <Popover.Content {...filterPopoverContentProps}>
        <div className="p-md flex flex-col gap-md w-64">
          <div className="flex items-center gap-sm">
            <Checkbox checked={localChecked} onCheckedChange={(checked) => setLocalChecked(checked as any)} />
            <span>Checked</span>
          </div>
          <div className="flex justify-end">
            <button
              className={cn('text-s bg-purple-primary text-white rounded-sm px-md py-xs outline-hidden')}
              onClick={() => {
                if (localChecked === 'indeterminate') {
                  emitSet(filter.name, null);
                } else {
                  emitSet(filter.name, localChecked);
                }
                setOpen(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
}
