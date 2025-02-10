import clsx from 'clsx';
import { diff, toggle } from 'radash';
import {
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Checkbox, CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type SanctionCategory = {
  id: string;
  name: string;
  lists: {
    id: string;
    name: string;
  }[];
};

const FieldCategory = ({
  category,
  selectedIds,
  updateSelectedIds,
}: {
  category: SanctionCategory;
  selectedIds: string[];
  updateSelectedIds: Dispatch<SetStateAction<string[]>>;
}) => {
  const [open, setOpen] = useState(false);

  const defaultListIds = useMemo(
    () => category.lists.map((list) => list.id),
    [category.lists],
  );

  const isAllSelected = useMemo(
    () => diff(defaultListIds, selectedIds).length === 0,
    [selectedIds, defaultListIds],
  );

  return (
    <CollapsibleV2.Provider defaultOpen={open}>
      <div key={category.id} className="w-full overflow-hidden rounded-lg">
        <div className="bg-grey-98 flex w-full items-center justify-between p-4">
          <CollapsibleV2.Title
            onClick={() => setOpen(!open)}
            className="flex flex-row items-center gap-2"
          >
            <Icon
              icon="arrow-right"
              className={clsx('size-5', {
                'rotate-90': open,
              })}
            />
            <span className="text-s font-semibold">{category.name}</span>
          </CollapsibleV2.Title>
          <div className="flex items-center gap-4">
            <span className="text-grey-50 text-xs">Select all</span>
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={(state) => {
                console.log('All Selected changed', state);
                updateSelectedIds((prev) => {
                  let result: string[] = [...prev];
                  const idsToToggle = state
                    ? diff(defaultListIds, result)
                    : defaultListIds.filter((id) => result.includes(id));
                  console.log('Ids to toggle', idsToToggle);
                  for (const id of idsToToggle) {
                    result = toggle(result, id);
                  }
                  return result;
                });
              }}
            />
          </div>
        </div>
        <CollapsibleV2.Content className="bg-grey-98 w-full p-4">
          <div className="border-grey-90 bg-grey-100 rounded-lg border">
            {category.lists.map((list) => (
              <div key={list.id} className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={selectedIds.includes(list.id)}
                  onCheckedChange={() => {
                    updateSelectedIds((prev) => toggle(prev, list.id));
                  }}
                />
                <span className="text-s">{list.name}</span>
              </div>
            ))}
          </div>
        </CollapsibleV2.Content>
      </div>
    </CollapsibleV2.Provider>
  );
};

export const FieldSanction = ({
  name,
  onChange,
  onBlur,
  categories,
  defaultValue,
}: {
  defaultValue?: string[];
  categories: SanctionCategory[];
  name?: string;
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);

  const [selectedIds, updateSelectedIds] = useState<string[]>(
    defaultValue ?? [],
  );

  // Thx React... https://github.com/facebook/react/issues/27283
  useEffect(() => {
    if (ref.current) {
      ref.current.onchange = (e) => {
        onChange?.(
          JSON.parse(
            (e as unknown as ChangeEvent<HTMLInputElement>).currentTarget
              ?.value,
          ),
        );
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.value = JSON.stringify(selectedIds);
      ref.current?.dispatchEvent(new Event('change'));
    }
  }, [selectedIds]);

  return (
    <div className="flex flex-col gap-4">
      <input
        name={name}
        ref={ref}
        defaultValue={defaultValue}
        className="sr-only"
        tabIndex={-1}
        onBlur={onBlur}
      />
      {categories.map((category) => (
        <FieldCategory
          key={category.id}
          category={category}
          selectedIds={selectedIds}
          updateSelectedIds={updateSelectedIds}
        />
      ))}
    </div>
  );
};
