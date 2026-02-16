import { useUnarchiveScenarioMutation } from '@app-builder/queries/scenarios/unarchive-scenario';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UnarchiveScenarioButton({ scenarioId, disabled }: { scenarioId: string; disabled?: boolean }) {
  const { t } = useTranslation(['scenarios']);
  const unarchiveScenarioMutation = useUnarchiveScenarioMutation();

  return (
    <Button
      variant="secondary"
      disabled={disabled || unarchiveScenarioMutation.isPending}
      onClick={() => {
        unarchiveScenarioMutation.mutate({ scenarioId });
      }}
    >
      <Icon icon="restart-alt" className="size-3.5" />
      <p>{t('scenarios:unarchive_scenario.title')}</p>
    </Button>
  );
}
