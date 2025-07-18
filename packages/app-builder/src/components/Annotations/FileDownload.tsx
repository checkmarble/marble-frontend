import {
  AlreadyDownloadingError,
  AuthRequestError,
  useDownloadFile,
} from '@app-builder/services/DownloadFilesService';
import { getRoute } from '@app-builder/utils/routes';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AnnotationFileDownloadProps = {
  annotationId: string;
  fileId: string;
};

export function AnnotationFileDownload({ annotationId, fileId }: AnnotationFileDownloadProps) {
  const { t } = useTranslation(['cases', 'common']);
  const downloadEndpoint = getRoute('/ressources/annotations/download-file/:annotationId/:fileId', {
    annotationId,
    fileId,
  });

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
    <button className="size-5" onClick={() => downloadCaseFile()}>
      <Icon
        icon={downloadingCaseFile ? 'spinner' : 'download'}
        className={cn('size-5', { 'animate-spin': downloadingCaseFile })}
      />
    </button>
  );
}
