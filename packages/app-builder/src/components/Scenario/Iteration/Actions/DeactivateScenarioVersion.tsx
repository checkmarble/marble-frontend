import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useDeactivateIterationMutation } from '@app-builder/queries/scenarios/deactivate-iteration';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function DeactivateScenarioVersion({ scenarioId, iterationId }: { scenarioId: string; iterationId: string }) {
  const { t } = useTranslation(['scenarios']);
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button className="flex-1" variant="destructive" size="medium">
          <Icon icon="stop" className="size-5" />
          {t('scenarios:deployment_modal.deactivate.button')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <DeactivateScenarioVersionContent scenarioId={scenarioId} iterationId={iterationId} />
      </Modal.Content>
    </Modal.Root>
  );
}

function DeactivateScenarioVersionContent({ scenarioId, iterationId }: { scenarioId: string; iterationId: string }) {
  const { t } = useTranslation(['common', 'scenarios']);
  const deactivateIterationMutation = useDeactivateIterationMutation(scenarioId, iterationId);
  const revalidate = useLoaderRevalidator();

  function handleDeactivate() {
    deactivateIterationMutation
      .mutateAsync({ stopOperating: true, changeIsImmediate: true })
      .then(() => {
        toast.success(t('scenarios:deployment_modal.deactivate.success'));
        revalidate();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
  }

  return (
    <>
      <Modal.Title>{t('scenarios:deployment_modal.deactivate.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex flex-col gap-4 font-medium">
          <p className="font-semibold">{t('scenarios:deployment_modal.deactivate.confirm')}</p>
          <ul className="flex list-disc flex-col gap-4 ps-5">
            <li>{t('scenarios:deployment_modal.deactivate.stop_operating')}</li>
            <li>{t('scenarios:deployment_modal.deactivate.change_is_immediate')}</li>
          </ul>
          <p className="text-grey-disabled text-xs font-medium">{t('scenarios:deployment_modal.deactivate.helper')}</p>
        </div>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button variant="secondary" appearance="stroked" name="cancel" size="large">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button variant="destructive" onClick={handleDeactivate} size="large">
          <Icon icon="stop" className="size-5" />
          {t('scenarios:deployment_modal.deactivate.button')}
        </Button>
      </Modal.Footer>
    </>
  );
}
