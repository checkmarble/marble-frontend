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
  const { downloadDecisions, downloadingDecisions } = useDownloadDecisions(
    scheduleExecutionId,
    {
      onError: (e) => {
        if (e instanceof AlreadyDownloadingError) {
          // Already downloading, do nothing
          return;
        }
        toast.error(t('scheduledExecution:errors.downloading_decisions_link'));
      },
    }
  );

  const { t } = useTranslation(decisionsI18n);

  return (
    <Button
      variant="secondary"
      onClick={() => {
        void downloadDecisions();
      }}
      name="download"
      disabled={downloadingDecisions}
    >
      {downloadingDecisions
        ? t('scheduledExecution:downloading_decisions')
        : t('scheduledExecution:download_decisions')}
    </Button>
  );
}
