import { useEffect, useState } from 'react';
import { Icon } from 'ui-icons';
import { useI18n } from '../../contexts/I18nContext';
import { Input } from '../../Input/Input';
import { Tooltip } from '../../Tooltip/Tooltip';
import { cn } from '../../utils';
import { type TextFilter } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function TextMatchFilter({
  filter,
  buttonState,
}: {
  filter: TextFilter;
  buttonState: string;
}) {
  const [isOpen, setOpen] = useState(false);
  const toTextArray = (selected: unknown): string[] => {
    const arr = selected as any[];
    if (!Array.isArray(arr)) return [];
    return arr.flatMap((item) => {
      if (typeof item === 'string') return item;
      const val = (item as any)?.value;
      return Array.isArray(val) ? val : val != null ? [val] : [];
    });
  };
  const [localText, setLocalText] = useState<string[]>(toTextArray(filter.selectedValue));
  const { emitSet, emitRemove } = useFiltersBarContext();
  const { t } = useI18n();

  useEffect(() => {
    if (isOpen) setLocalText(toTextArray(filter.selectedValue));
  }, [isOpen, filter.selectedValue]);
  return (
    <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
      <FilterItem.Root>
        <FilterItem.Trigger id={filter.name}>
          <span className={buttonState}>{filter.name}</span>
          {filter.selectedValue ? (
            <span className="font-medium">in {localText.join(',')}</span>
          ) : null}
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
              setOpen(false);
            }}
          />
        ) : null}
      </FilterItem.Root>
      <FilterPopover.Content>
        <div className="p-4 flex flex-col gap-2 w-80">
          <Input
            placeholder={filter.placeholder}
            value={localText.join(',')}
            onChange={(e) => setLocalText(e.currentTarget.value.split(','))}
          />
          <div className="flex justify-end">
            <button
              className={cn('text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden')}
              onClick={() => {
                const value = localText.map((v) => v.trim()).filter((v) => v.length > 0);
                if (value.length === 0) {
                  emitRemove(filter.name);
                  setOpen(false);
                  return;
                }
                emitSet(filter.name, [
                  {
                    operator: filter.operator,
                    value: value.map((v) => v.trim()),
                  },
                ]);
                // const committed = localText
                //   .map((v) => v.trim())
                //   .filter((v) => v.length > 0)
                //   .map((v) => ({ operator: 'in' as const, value: v }));
                // const payload = committed.length ? committed : null;
                // emitSet(filter.name, payload);
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
