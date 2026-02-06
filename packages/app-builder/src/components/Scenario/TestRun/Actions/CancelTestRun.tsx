import { Callout } from '@app-builder/components';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { Scenario } from '@app-builder/models/scenario';
import { useCancelTestRunMutation } from '@app-builder/queries/scenarios/cancel-testrun';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

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
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content className="overflow-visible">
        <Modal.Title>{t('scenarios:testrun.cancel')}</Modal.Title>
        <Modal.Description asChild>
          <Callout variant="outlined">
            <p className="whitespace-pre-wrap">{t('scenarios:testrun.cancel.callout')}</p>
          </Callout>
        </Modal.Description>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" appearance="stroked">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            onClick={handleCancelScenario}
            disabled={cancelTestRunMutation.isPending}
          >
            {t('scenarios:testrun.cancel')}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
