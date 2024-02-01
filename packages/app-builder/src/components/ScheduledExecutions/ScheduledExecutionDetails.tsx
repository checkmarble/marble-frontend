import {
  AlreadyDownloadingError,
  useDownloadDecisions,
} from '@app-builder/services/DownloadDecisionsService';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button } from 'ui-design-system';

import { scheduledExecutionI18n } from './scheduledExecution-i18n';

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
    },
  );
  const { t } = useTranslation(scheduledExecutionI18n);

  return (
    <Button
      variant="secondary"
      onClick={() => {
        void downloadDecisions();
      }}
      name="download"
      disabled={downloadingDecisions}
    >
      <span className="line-clamp-1 shrink-0">
        {downloadingDecisions
          ? t('scheduledExecution:downloading_decisions')
          : t('scheduledExecution:download_decisions')}
      </span>
    </Button>
  );
}
