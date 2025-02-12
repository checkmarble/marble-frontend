import { casesI18n } from '@app-builder/components/Cases';
import { FilesList } from '@app-builder/components/Files/FilesList';
import {
  getCaseFileDownloadEndpoint,
  getCaseFileUploadEndpoint,
} from '@app-builder/utils/files';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { type Namespace } from 'i18next';

import { useCurrentCase } from './$caseId._layout';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export default function CaseFilesPage() {
  const { caseDetail } = useCurrentCase();
  const downloadEnpoint = useCallbackRef(getCaseFileDownloadEndpoint());
  const uploadEnpoint = getCaseFileUploadEndpoint(caseDetail);

  return (
    <FilesList
      files={caseDetail.files}
      downloadEnpoint={downloadEnpoint}
      uploadEnpoint={uploadEnpoint}
    />
  );
}
