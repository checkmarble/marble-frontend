import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useArchiveScenarioMutation } from '@app-builder/queries/scenarios/archive-scenario';
import { useHydrated } from '@tanstack/react-router';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function ArchiveScenario({
  children,
  scenarioId,
  scenarioName,
}: {
  children: React.ReactElement;
  scenarioId: string;
  scenarioName: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        {open ? (
          <ArchiveScenarioContent scenarioId={scenarioId} scenarioName={scenarioName} onClose={() => setOpen(false)} />
        ) : null}
      </Modal.Content>
    </Modal.Root>
  );
}

function ArchiveScenarioContent({
  scenarioId,
  scenarioName,
  onClose,
}: {
  scenarioId: string;
  scenarioName: string;
  onClose: () => void;
}) {
  const { t } = useTranslation(['scenarios', 'common']);
  const archiveScenarioMutation = useArchiveScenarioMutation();
  const revalidate = useLoaderRevalidator();

  const handleArchiveScenario = () => {
    archiveScenarioMutation
      .mutateAsync({ scenarioId })
      .then(() => {
        revalidate();
        onClose();
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
      });
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
        <Button
          className="flex-1"
          variant="destructive"
          disabled={archiveScenarioMutation.isPending}
          onClick={handleArchiveScenario}
        >
          {t('scenarios:archive_scenario.button')}
        </Button>
      </Modal.Footer>
    </>
  );
}

export function ArchiveScenarioButton({
  scenarioId,
  scenarioName,
  disabled,
}: {
  scenarioId: string;
  scenarioName: string;
  disabled: boolean;
}) {
  const { t } = useTranslation(['scenarios']);
  const hydrated = useHydrated();
  const title = disabled ? t('scenarios:archive_scenario.cannot_archive') : t('scenarios:archive_scenario.title');
  return (
    <ArchiveScenario scenarioId={scenarioId} scenarioName={scenarioName}>
      <Button variant="secondary" mode="icon" disabled={!hydrated || disabled} aria-label={title} title={title}>
        <Icon icon="inbox" className="size-6" />
      </Button>
    </ArchiveScenario>
  );
}
