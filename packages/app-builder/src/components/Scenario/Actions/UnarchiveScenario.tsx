import { useUnarchiveScenarioMutation } from '@app-builder/queries/scenarios/unarchive-scenario';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

export function UnarchiveScenario({ children, scenarioId }: { children: React.ReactElement; scenarioId: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <UnarchiveScenarioContent scenarioId={scenarioId} onSuccess={() => setOpen(false)} />
      </Modal.Content>
    </Modal.Root>
  );
}

function UnarchiveScenarioContent({ scenarioId, onSuccess }: { scenarioId: string; onSuccess: () => void }) {
  const { t } = useTranslation(['scenarios', 'common']);
  const unarchiveScenarioMutation = useUnarchiveScenarioMutation();

  const handleUnarchive = () => {
    unarchiveScenarioMutation.mutateAsync({ scenarioId }).then(() => {
      onSuccess();
    });
  };

  return (
    <>
      <Modal.Title>{t('scenarios:unarchive_scenario.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <p className="text-s text-grey-secondary">{t('scenarios:unarchive_scenario.description')}</p>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button className="flex-1" variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button className="flex-1" variant="primary" onClick={handleUnarchive}>
          {t('scenarios:unarchive_scenario.button')}
        </Button>
      </Modal.Footer>
    </>
  );
}
