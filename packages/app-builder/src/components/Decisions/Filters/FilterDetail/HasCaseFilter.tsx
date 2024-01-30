import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Switch } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useHasCaseFilter } from '../DecisionFiltersContext';

/**
 * The HasCase filter can be null (not selected) or a boolean (selected).
 * To simplify, since the UI should be displayed when the user want to filter on it, we use a switch (only two states).
 * Thus, we need to have a default value for the HasCase filter in case no value is selected.
 * We assume users want to see decisions without cases by default.
 */
const defaultHasCase = false;
function useDefaultHasCase() {
  const { selectedHasCase, setSelectedHasCase } = useHasCaseFilter();
  useEffect(() => {
    if (selectedHasCase === null) {
      setSelectedHasCase(defaultHasCase);
    }
  }, [selectedHasCase, setSelectedHasCase]);

  return {
    selectedHasCase: selectedHasCase ?? defaultHasCase,
    setSelectedHasCase,
  };
}

export function HasCaseFilter() {
  const { t } = useTranslation(decisionsI18n);
  const { selectedHasCase, setSelectedHasCase } = useDefaultHasCase();

  return (
    <div className="flex flex-row justify-between gap-2 p-2">
      <label htmlFor="hasCase" className="">
        {t('decisions:filters.has_case')}
      </label>
      <Switch
        id="hasCase"
        checked={selectedHasCase}
        onCheckedChange={setSelectedHasCase}
      />
    </div>
  );
}
