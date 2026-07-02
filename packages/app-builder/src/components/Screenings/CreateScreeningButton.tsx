import { useCreateScreeningRuleMutation } from '@app-builder/queries/scenarios/create-screening-rule';
import { isAccessible } from '@app-builder/services/feature-access';
import { FeatureAccessLevelDto } from 'marble-api/generated/feature-access-api';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { Nudge } from '../Nudge';

export function CreateScreeningButton({
  scenarioId,
  iterationId,
  isSanctionAvailable,
  onSuccess,
}: {
  scenarioId: string;
  iterationId: string;
  isSanctionAvailable: FeatureAccessLevelDto;
  onSuccess: (ruleId: string) => void;
}) {
  const { t } = useTranslation(['scenarios']);
  const createScreeningRuleMutation = useCreateScreeningRuleMutation(scenarioId, iterationId);
  const disabled = useMemo(() => !isAccessible(isSanctionAvailable), [isSanctionAvailable]);

  const handleCreateScreeningRule = () => {
    createScreeningRuleMutation.mutateAsync().then((screeningConfig) => {
      onSuccess(screeningConfig.id);
    });
  };

  return (
    <Button
      type="submit"
      variant="secondary"
      appearance={'link'}
      disabled={disabled}
      className="w-full gap-sm"
      onClick={handleCreateScreeningRule}
    >
      <div className="flex items-center gap-md">
        <Icon icon="plus" className="size-5" />
        <span className="font-normal">{t('scenarios:create_sanction.title')}</span>
      </div>
      {isSanctionAvailable !== 'allowed' ? (
        <Nudge kind={isSanctionAvailable} content={t('scenarios:sanction.nudge')} className="p-xs" />
      ) : null}
    </Button>
  );
}
