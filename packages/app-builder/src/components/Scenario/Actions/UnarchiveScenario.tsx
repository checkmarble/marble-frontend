import { useUnarchiveScenarioMutation } from '@app-builder/queries/scenarios/unarchive-scenario';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function UnarchiveScenarioButton({
  scenarioId,
  disabled,
  iconOnly = false,
}: {
  scenarioId: string;
  disabled?: boolean;
  iconOnly?: boolean;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const unarchiveScenarioMutation = useUnarchiveScenarioMutation();

  return (
    <Button
      variant="secondary"
      mode={iconOnly ? 'icon' : 'normal'}
      disabled={disabled || unarchiveScenarioMutation.isPending}
      aria-label={iconOnly ? t('scenarios:unarchive_scenario.button') : undefined}
      title={iconOnly ? t('scenarios:unarchive_scenario.button') : undefined}
      onClick={() => {
        unarchiveScenarioMutation.mutate(
          { scenarioId },
          {
            onSuccess: () => toast.success(t('common:success.save')),
            onError: () => toast.error(t('common:errors.unknown')),
          },
        );
      }}
    >
      <Icon icon="restart-alt" className="size-6" />
      {!iconOnly ? <p>{t('scenarios:unarchive_scenario.button')}</p> : null}
    </Button>
  );
}
