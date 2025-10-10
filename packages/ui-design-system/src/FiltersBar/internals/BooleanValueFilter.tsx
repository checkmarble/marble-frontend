import { useEffect, useState } from 'react';
import { Checkbox } from '../../Checkbox/Checkbox';
import { cn } from '../../utils';
import { type BooleanFilter, type FilterBarLevel } from '../types';
import { FilterItem, FilterPopover } from './FilterPopover';
import { useFiltersBarContext } from './FiltersBarContext';

export function BooleanValueFilter({
  filter,
  level,
}: {
  filter: BooleanFilter;
  level: FilterBarLevel;
}) {
  const f = filter as BooleanFilter;
  const committed = (level === 'additional' ? f.selectedValue : f.selectedValue) as
    | boolean
    | null
    | undefined;
  const label = committed ? String(committed) : f.placeholder;
  const [isOpen, setOpen] = useState(false);
  const [localChecked, setLocalChecked] = useState<'indeterminate' | boolean>(
    f.selectedValue === null ? 'indeterminate' : Boolean(f.selectedValue),
  );
  const { emitSet, emitRemove } = useFiltersBarContext();
  useEffect(() => {
    if (isOpen) {
      setLocalChecked(f.selectedValue === null ? 'indeterminate' : Boolean(f.selectedValue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (f.removable) {
    return (
      <FilterPopover.Root open={isOpen} onOpenChange={setOpen}>
        <FilterItem.Root>
          <FilterItem.Trigger>{label}</FilterItem.Trigger>
          {f.removable ? (
            <FilterItem.Clear
              onClick={() => {
                setLocalChecked('indeterminate');
                emitRemove(f.name);
                setOpen(false);
              }}
            />
          ) : null}
        </FilterItem.Root>
        <FilterPopover.Content>
          <div className="p-4 flex flex-col gap-3 w-64">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={localChecked}
                onCheckedChange={(checked) => setLocalChecked(checked as any)}
              />
              <span>Checked</span>
            </div>
            <div className="flex justify-end">
              <button
                className={cn(
                  'text-s bg-purple-65 text-white rounded-sm px-3 py-1.5 outline-hidden',
                )}
                onClick={() => {
                  if (localChecked === 'indeterminate') {
                    emitSet(f.name, null);
                  } else {
                    emitSet(f.name, localChecked);
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
  return <Checkbox />;
}
