import { AlreadyDownloadingError, AuthRequestError, useDownloadFile } from '@app-builder/services/DownloadFilesService';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ActionButton, Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type SarReportDownloadProps = {
  caseId: string;
  reportId: string;
  variant?: 'button' | 'action';
};

export function SarReportDownload({ caseId, reportId, variant = 'button' }: SarReportDownloadProps) {
  const { t } = useTranslation(['cases']);
  const router = useRouter();
  const downloadEndpoint = router.buildLocation({
    to: '/ressources/cases/sar/download/$caseId/$reportId',
    params: { caseId, reportId },
  });

  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint.href, {
    onError: (e) => {
      if (e instanceof AlreadyDownloadingError) {
        return;
      } else if (e instanceof AuthRequestError) {
        toast.error(t('cases:case.file.errors.downloading_link.auth_error'));
      } else {
        toast.error(t('cases:case.file.errors.downloading_link.unknown'));
      }
    },
  });

  if (variant === 'action') {
    return (
      <ActionButton
        icon={downloadingCaseFile ? 'spinner' : 'download'}
        text={t('cases:sar.action.download')}
        disabled={downloadingCaseFile}
        onClick={() => {
          void downloadCaseFile();
        }}
      />
    );
  }

  return (
    <Button
      variant="secondary"
      size="small"
      onClick={() => {
        void downloadCaseFile();
      }}
      disabled={downloadingCaseFile}
    >
      <Icon
        icon={downloadingCaseFile ? 'spinner' : 'download'}
        className={cn('size-3.5', { 'animate-spin': downloadingCaseFile })}
      />
      {t('cases:sar.action.download')}
    </Button>
  );
}
