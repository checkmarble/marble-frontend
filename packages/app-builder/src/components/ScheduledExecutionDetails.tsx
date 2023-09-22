import { useDownloadDecisions } from '@app-builder/services/DownloadDecisionsService';
import { Button } from '@ui-design-system';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils';

export function ScheduledExecutionDetails({
  scheduleExecutionId,
}: {
  scheduleExecutionId: string;
}) {
  return (
    <ClientOnly>
      {() => (
        <ScheduledExecutionDetailsInternal
          scheduleExecutionId={scheduleExecutionId}
        />
      )}
    </ClientOnly>
  );
}

function ScheduledExecutionDetailsInternal({
  scheduleExecutionId,
}: {
  scheduleExecutionId: string;
}) {
  const {
    downloadDecisions,
    downloadLinkRef,
    downloadDecisionsLink,
    downloadingDecisions,
    decisionsFilename,
  } = useDownloadDecisions(scheduleExecutionId);

  const { t } = useTranslation(['scheduledExecution']);

  const handleClick = () => {
    void downloadDecisions();
  };

  return (
    <>
      <a
        style={{ display: 'none' }}
        ref={downloadLinkRef}
        href={downloadDecisionsLink}
        download={decisionsFilename}
      >
        {downloadDecisionsLink}
      </a>
      <Button
        variant="secondary"
        onClick={handleClick}
        name="download"
        disabled={downloadingDecisions}
      >
        {downloadingDecisions
          ? t('scheduledExecution:downloading_decisions')
          : t('scheduledExecution:download_decisions')}
      </Button>
    </>
  );
}
