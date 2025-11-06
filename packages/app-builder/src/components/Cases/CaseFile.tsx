import { AlreadyDownloadingError, AuthRequestError, useDownloadFile } from '@app-builder/services/DownloadFilesService';
import { getRoute } from '@app-builder/utils/routes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { type ButtonProps, ButtonV2, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { casesI18n } from './cases-i18n';

type CaseFileProps = {
  file: { id: string; fileName: string };
} & ButtonProps;

export const CaseFile = ({ file, className, size }: CaseFileProps) => {
  const { t } = useTranslation(casesI18n);
  const downloadEndpoint = getRoute('/ressources/cases/download-file/:fileId', { fileId: file.id });

  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(downloadEndpoint, {
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
    <ButtonV2
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
    </ButtonV2>
  );
};
