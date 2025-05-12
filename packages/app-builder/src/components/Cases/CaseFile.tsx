import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadFile,
} from '@app-builder/services/DownloadFilesService';
import { getCaseFileDownloadEndpoint } from '@app-builder/utils/files';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, type ButtonProps, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { casesI18n } from './cases-i18n';

type CaseFileProps = {
  file: { id: string; fileName: string };
} & ButtonProps;

export const CaseFile = ({ file, className, size }: CaseFileProps) => {
  const { t } = useTranslation(casesI18n);
  const { downloadCaseFile, downloadingCaseFile } = useDownloadFile(
    getCaseFileDownloadEndpoint()(file.id),
    {
      onError: (e) => {
        if (e instanceof AlreadyDownloadingError) {
          // Already downloading, do nothing
          return;
        }
        if (e instanceof AuthRequestError) {
          toast.error(t('cases:case.file.errors.downloading_link.auth_error'));
        } else {
          toast.error(t('cases:case.file.errors.downloading_link.unknown'));
        }
      },
    },
  );

  return (
    <Button
      variant="secondary"
      size={size}
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
