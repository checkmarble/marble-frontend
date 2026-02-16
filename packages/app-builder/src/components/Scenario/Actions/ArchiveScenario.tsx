import { useArchiveScenarioMutation } from '@app-builder/queries/scenarios/archive-scenario';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

export function ArchiveScenario({
  children,
  scenarioId,
  scenarioName,
}: {
  children: React.ReactElement;
  scenarioId: string;
  scenarioName: string;
}) {
  return (
    <Modal.Root>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <ArchiveScenarioContent scenarioId={scenarioId} scenarioName={scenarioName} />
      </Modal.Content>
    </Modal.Root>
  );
}

function ArchiveScenarioContent({ scenarioId, scenarioName }: { scenarioId: string; scenarioName: string }) {
  const { t } = useTranslation(['scenarios', 'common']);
  const archiveScenarioMutation = useArchiveScenarioMutation();

  const handleArchive = () => {
    archiveScenarioMutation.mutateAsync({ scenarioId });
  };

  return (
    <>
      <Modal.Title>{t('scenarios:archive_scenario.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <p className="text-s text-grey-secondary">
          {t('scenarios:archive_scenario.description', { name: scenarioName })}
        </p>
      </div>
      <Modal.Footer>
        <Modal.Close asChild>
          <Button className="flex-1" variant="secondary" appearance="stroked">
            {t('common:cancel')}
          </Button>
        </Modal.Close>
        <Button className="flex-1" variant="destructive" onClick={handleArchive}>
          {t('scenarios:archive_scenario.button')}
        </Button>
      </Modal.Footer>
    </>
  );
}
