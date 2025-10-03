import { useEffect, useState } from 'react';
import { Input } from '../../Input/Input';
import { cn } from '../../utils';
import { type TextFilter } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function TextMatchFilter({ filter }: { filter: TextFilter }) {
  const [isOpen, setOpen] = useState(true);
  const [localText, setLocalText] = useState<string[]>(
    filter.selectedValue?.map((f) => f.value) ?? [],
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) setLocalText(filter.selectedValue?.map((f) => f.value) ?? []);
  }, [isOpen]);
  if (filter.removable) {
    return (
      <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
        <FilterItem.Root>
          <FilterItem.Trigger id={filter.name}>
            <span className="font-semibold">{filter.name}</span>
            <span className="font-medium">
              in {filter.selectedValue?.map((f) => f.value).join(',')}
            </span>
          </FilterItem.Trigger>
          {filter.removable ? (
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
                className={cn(
                  'text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden',
                )}
                onClick={() => {
                  const committed = localText
                    .map((v) => v.trim())
                    .filter((v) => v.length > 0)
                    .map((v) => ({ operator: 'in' as const, value: v }));
                  const payload = committed.length ? committed : null;
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
  return <Input placeholder={filter.placeholder} />;
}
