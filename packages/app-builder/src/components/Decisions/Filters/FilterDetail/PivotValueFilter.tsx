import { Input } from 'ui-design-system';

import { usePivotValueFilter } from '../DecisionFiltersContext';

export function PivotValueFilter() {
  const { selectedPivotValue, setSelectedPivotValue } = usePivotValueFilter();

  return (
    <div className="flex flex-col gap-2 p-2">
      <Input
        value={selectedPivotValue ?? ''}
        onChange={(event) => {
          setSelectedPivotValue(event.target.value || null);
        }}
        autoFocus
      />
    </div>
  );
}
