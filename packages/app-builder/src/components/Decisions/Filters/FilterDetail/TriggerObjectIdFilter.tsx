import { type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';

import { decisionsI18n } from '../../decisions-i18n';
import { useTriggerObjectIdFilter } from '../DecisionFiltersContext';
import { useFiltersMenuContext } from '../DecisionFiltersMenu';

export function TriggerObjectIdFilter() {
  const { t } = useTranslation(decisionsI18n);
  const { selectedTriggerObjectId, setSelectedTriggerObjectId } = useTriggerObjectIdFilter();
  const { closeMenu } = useFiltersMenuContext();

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      closeMenu();
    }
  };

  return (
    <div className="flex gap-2 p-2">
      <Input
        className="flex-1"
        value={selectedTriggerObjectId ?? ''}
        onChange={(event) => {
          setSelectedTriggerObjectId(event.target.value || null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={t('decisions:filters.trigger_object_id.placeholder')}
        autoFocus
      />
      <Button variant="secondary" onClick={closeMenu}>
        {t('common:validate')}
      </Button>
    </div>
  );
}
