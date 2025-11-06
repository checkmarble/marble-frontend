import { useCallbackRef } from '@marble/shared';
import { MouseEvent, ReactElement, useEffect } from 'react';
import { createSharpFactory } from 'sharpstate';

type MultiSelectSharpValue = {
  selectedIds: string[];
  items: { index: number; id: string; item: unknown }[];
  lastAction: null | [string, 'select' | 'unselect'];
};

const MultiSelectSharpFactory = createSharpFactory({
  name: 'MultiSelect',
  initializer: (): MultiSelectSharpValue => ({
    selectedIds: [],
    items: [],
    lastAction: null,
  }),
})
  .withActions({
    register(api, index: number, itemId: string, item: unknown) {
      if (api.value.items.find((item) => item.id === itemId)) {
        console.warn(`[MultiSelect] Item ${itemId} already registered`);
        return;
      }

      api.value.items.push({ index, id: itemId, item });
      return () => {
        api.value.items = api.value.items.filter((i) => i.id !== itemId);
      };
    },
    selectAll(api) {
      api.value.selectedIds = [...api.value.items.map((item) => item.id)];
    },
    unselectAll(api) {
      api.value.selectedIds = [];
    },
  })
  .withComputed({
    orderedItems(state) {
      return state.items.sort((a, b) => a.index - b.index);
    },
  });

const MultiSelectRoot = ({ children, id }: { children: React.ReactNode; id: unknown }) => {
  const multiSelectSharp = MultiSelectSharpFactory.createSharp();

  useEffect(() => {
    multiSelectSharp.actions.unselectAll();
  }, [id, multiSelectSharp]);

  return <MultiSelectSharpFactory.Provider value={multiSelectSharp}>{children}</MultiSelectSharpFactory.Provider>;
};

type MultiSelectItemProps = {
  children: (isSelected: boolean, onSelect: (event: MouseEvent) => void) => ReactElement;
  index: number;
  id: string;
  item?: unknown;
};

const MultiSelectItem = ({ children, index, id, item }: MultiSelectItemProps) => {
  const sharp = MultiSelectSharpFactory.useSharp();
  const isSelected = MultiSelectSharpFactory.select((state) => state.selectedIds.includes(id));
  const selectedIds = MultiSelectSharpFactory.select((state) => state.$selectedIds);
  const orderedItems = sharp.computed.orderedItems;

  const handleTrigger = useCallbackRef((e: MouseEvent) => {
    e.stopPropagation();

    const lastAction = sharp.value.lastAction;
    const isIntendingMultiSelection = e.shiftKey;
    const isMultiSelectionPossible = lastAction !== null && lastAction[1] === 'select' && !isSelected;

    if (isIntendingMultiSelection && isMultiSelectionPossible) {
      const lastClickedIdIndex = orderedItems.value.findIndex((item) => item.id === lastAction[0]!);
      const currentIndex = orderedItems.value.findIndex((item) => item.id === id);

      const [start, end] =
        currentIndex > lastClickedIdIndex ? [lastClickedIdIndex, currentIndex] : [currentIndex, lastClickedIdIndex];

      for (let i = start; i <= end; i++) {
        const item = orderedItems.value[i];
        if (item && !selectedIds.value.find((selectedId) => selectedId === item.id)) {
          selectedIds.value.push(item.id);
        }
      }

      sharp.value.lastAction = [id, 'select'];
    } else {
      if (isSelected) {
        const idx = selectedIds.value.indexOf(id) ?? -1;
        if (idx !== -1) {
          selectedIds.value.splice(idx, 1);
        }
      } else {
        selectedIds.value.push(id);
      }
      sharp.value.lastAction = [id, isSelected ? 'unselect' : 'select'];
    }
  });

  useEffect(() => {
    return sharp.actions.register(index, id, item);
  }, [sharp, id, item]);

  return children(isSelected, handleTrigger);
};

type MultiSelectGlobalProps = {
  children: (state: boolean | 'indeterminate', onSelect: (event: MouseEvent) => void) => ReactElement;
};

const MultiSelectGlobal = ({ children }: MultiSelectGlobalProps) => {
  const multiSelectSharp = MultiSelectSharpFactory.useSharp();
  const selectState = MultiSelectSharpFactory.select((state) => {
    const selectedIds = state.selectedIds.filter((id) => state.items.find((item) => item.id === id));

    if (selectedIds.length !== 0 && selectedIds.length !== state.items.length) {
      return 'indeterminate';
    }
    return selectedIds.length !== 0;
  });

  const handleTrigger = useCallbackRef((e: MouseEvent) => {
    e.stopPropagation();
    if (selectState === false) {
      multiSelectSharp.actions.selectAll();
    } else {
      multiSelectSharp.actions.unselectAll();
    }
  });

  return children(selectState, handleTrigger);
};

type MultiSelectSubscribeProps<T> = {
  children: (count: number, items: T[]) => ReactElement | null;
};

function MultiSelectSubscribe<T>({ children }: MultiSelectSubscribeProps<T>) {
  const selectedItems = MultiSelectSharpFactory.select((state) => {
    return state.selectedIds
      .map((id) => {
        const item = state.items.find((item) => item.id === id);
        return item?.item;
      })
      .filter(Boolean) as T[];
  });

  return children(selectedItems.length, selectedItems);
}

export const MultiSelect = {
  Root: MultiSelectRoot,
  Item: MultiSelectItem,
  Global: MultiSelectGlobal,
  Subscribe: MultiSelectSubscribe,
};
