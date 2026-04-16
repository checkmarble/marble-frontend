import { AlreadyDownloadingError, AuthRequestError, useDownloadFile } from '@app-builder/services/DownloadFilesService';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonV2Props, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseFileProps = {
  file: { id: string; fileName: string };
} & ButtonV2Props;

export const CaseFileButton = ({ file, className, size }: CaseFileProps) => {
  const { t } = useTranslation(['cases']);
  const router = useRouter();
  const downloadEndpoint = router.buildLocation({
    to: '/ressources/cases/download-file/$fileId',
    params: { fileId: file.id },
  });

  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint.href, {
    onError: (e) => {
      if (e instanceof AlreadyDownloadingError) {
        // Already downloading, do nothing
        return;
      } else if (e instanceof AuthRequestError) {
        toast.error(t('cases:case.file.errors.downloading_link.auth_error'));
      } else {
        toast.error(t('cases:case.file.errors.downloading_link.unknown'));
      }
    },
  });

  return (
    <Button
      variant="secondary"
      onClick={() => {
        void downloadCaseFile();
      }}
      disabled={downloadingCaseFile}
      className={className}
    >
      <Icon
        icon={downloadingCaseFile ? 'spinner' : 'download'}
        className={cn('size-3.5', { 'animate-spin': downloadingCaseFile })}
      />
      {file.fileName}
    </Button>
  );
};
