import { Callout } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Scenario } from '@app-builder/models/scenario';
import { useCancelTestRunMutation } from '@app-builder/queries/scenarios/cancel-testrun';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, ModalV2 } from 'ui-design-system';

export function CancelTestRun({
  children,
  currentScenario,
  testRunId,
}: {
  children: React.ReactElement;
  currentScenario: Scenario;
  testRunId: string;
}) {
  const [open, setOpen] = useState(false);
  const cancelTestRunMutation = useCancelTestRunMutation(currentScenario.id, testRunId);
  const { t } = useTranslation(['scenarios', 'common']);
  const revalidate = useLoaderRevalidator();

  const handleCancelScenario = () => {
    cancelTestRunMutation.mutateAsync().then(() => {
      revalidate();
    });
  };

  return (
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger render={children} />
      <ModalV2.Content className="overflow-visible">
        <ModalV2.Title>{t('scenarios:testrun.cancel')}</ModalV2.Title>
        <ModalV2.Description render={<Callout variant="outlined" />}>
          <p className="whitespace-pre-wrap">{t('scenarios:testrun.cancel.callout')}</p>
        </ModalV2.Description>
        <ModalV2.Footer>
          <ModalV2.Close render={<ButtonV2 className="flex-1" variant="secondary" appearance="stroked" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <ButtonV2
            className="flex-1"
            variant="primary"
            onClick={handleCancelScenario}
            disabled={cancelTestRunMutation.isPending}
          >
            {t('scenarios:testrun.cancel')}
          </ButtonV2>
        </ModalV2.Footer>
      </ModalV2.Content>
    </ModalV2.Root>
  );
}
