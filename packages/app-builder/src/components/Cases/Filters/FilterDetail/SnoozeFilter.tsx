import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { Checkbox } from 'ui-design-system';

import { useSnoozedFilter } from '../CasesFiltersContext';

export function SnoozeFilter() {
  const { snoozed, setSnoozed } = useSnoozedFilter();

  return (
    <div className="flex flex-col gap-2 p-2">
      <Checkbox id="snoozed" defaultChecked={snoozed} onCheckedChange={setSnoozed} autoFocus />
      <FormLabel name="snoozed">{snoozed ? 'Hide Snoozed' : 'Show Snoozed'}</FormLabel>
    </div>
  );
}
