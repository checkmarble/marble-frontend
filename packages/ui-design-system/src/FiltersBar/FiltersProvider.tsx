import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { Filter, TextFilter } from './FiltersBar';

export interface AvailableFilterType {
  key: 'text';
  label: string;
}

interface FiltersContextValue {
  dynamicFilters: Filter[];
  availableTypes: AvailableFilterType[];
  addFilter: (key: AvailableFilterType['key']) => void;
  removeFilter: (name: string) => void;
  isAddModalOpen: boolean;
  setAddModalOpen: (open: boolean) => void;
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined);

export function useFiltersContext() {
  return useContext(FiltersContext);
}

export function FiltersProvider({
  children,
  availableTypes,
  initialDynamicFilters,
}: {
  children: React.ReactNode;
  availableTypes?: AvailableFilterType[];
  initialDynamicFilters?: Filter[];
}) {
  const [dynamicFilters, setDynamicFilters] = useState<Filter[]>(initialDynamicFilters ?? []);
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const idCounter = useRef(0);

  const available = useMemo<AvailableFilterType[]>(
    () => availableTypes ?? [{ key: 'text', label: 'Dummy filter' }],
    [availableTypes],
  );

  const addFilter = useCallback((key: AvailableFilterType['key']) => {
    if (key === 'text') {
      const name = `dummy-${idCounter.current++}`;
      setDynamicFilters((prev: Filter[]) => {
        const next: TextFilter & {
          removable?: boolean;
          isOpen?: boolean;
          onOpenChange?: (open: boolean) => void;
        } = {
          type: 'text',
          name,
          placeholder: 'Dummy filter',
          selectedValue: '',
          // Mark dynamic filters as removable by default
          removable: true,
          isOpen: true,
          onOpenChange: (open: boolean) => {
            setDynamicFilters((curr) =>
              curr.map((f) => (f.name === name && f.type === 'text' ? { ...f, isOpen: open } : f)),
            );
          },
          onChange: (value: string | null) => {
            setDynamicFilters((curr) =>
              curr.map((f) =>
                f.name === name && f.type === 'text' ? { ...f, selectedValue: value } : f,
              ),
            );
          },
        };
        return [...prev, next];
      });
    }
    setAddModalOpen(false);
  }, []);

  const removeFilter = useCallback((name: string) => {
    setDynamicFilters((prev) => prev.filter((f) => f.name !== name));
  }, []);

  const value = useMemo(
    () => ({
      dynamicFilters,
      availableTypes: available,
      addFilter,
      removeFilter,
      isAddModalOpen,
      setAddModalOpen,
    }),
    [dynamicFilters, available, addFilter, removeFilter, isAddModalOpen],
  );

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>;
}
