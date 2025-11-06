import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { Checkbox } from '../../Checkbox/Checkbox';
import { useI18n } from '../../contexts/I18nContext';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { type BooleanFilter, type FilterBarLevel } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterItem.Root>
        <FilterItem.Trigger className={buttonState}>
          <span className={buttonState}>{label}</span>
        </FilterItem.Trigger>
        {filter.unavailable ? (
          <Tooltip.Default content={t('filters:unavailable_filter_tooltip')}>
            <Icon icon="error" className="text-red-base size-4" />
          </Tooltip.Default>
        ) : null}
        {filter.removable && filter.selectedValue ? (
          <FilterItem.Clear
            onClick={() => {
              setLocalChecked('indeterminate');
              emitRemove(filter.name);
              setOpen(false);
            }}
          />
        ) : null}
      </FilterItem.Root>
      <FilterPopover.Content>
        <div className="p-4 flex flex-col gap-3 w-64">
          <div className="flex items-center gap-2">
            <Checkbox checked={localChecked} onCheckedChange={(checked) => setLocalChecked(checked as any)} />
            <span>Checked</span>
          </div>
          <div className="flex justify-end">
            <button
              className={cn('text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden')}
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
      </FilterPopover.Content>
    </FilterPopover.Root>
  );
}
