import {
  AlreadyDownloadingError,
  useDownloadDecisions,
} from '@app-builder/services/DownloadDecisionsService';
import { Button } from '@ui-design-system';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils';

import { decisionsI18n } from './decisions-i18n';

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

  const { t } = useTranslation(decisionsI18n);

  const handleClick = async () => {
    try {
      await downloadDecisions();
    } catch (e) {
      if (e instanceof AlreadyDownloadingError) {
        // Already downloading, do nothing
        return;
      }
      toast.error(t('scheduledExecution:errors.downloading_decisions_link'));
    }
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
        onClick={() => {
          void handleClick();
        }}
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
