import { Input } from 'ui-design-system';

import { useNameFilter } from '../CasesFiltersContext';

export function NameFilter() {
  const { name, setName } = useNameFilter();

  return (
    <div className="flex flex-col gap-2 p-2">
      <Input
        value={name}
        onChange={(event) => {
          setName(event.target.value);
        }}
        autoFocus
      />
    </div>
  );
}
