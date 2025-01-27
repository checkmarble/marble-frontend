import { casesI18n } from '@app-builder/components/Cases';
import { FilesList } from '@app-builder/components/Cases/CaseFiles';
import { type CaseDetail } from '@app-builder/models/cases';
import { UploadFile } from '@app-builder/routes/ressources+/cases+/upload-file';
import { type Namespace } from 'i18next';
import { Trans, useTranslation } from 'react-i18next';

import { useCurrentCase } from './$caseId._layout';

export const handle = {
  i18n: ['common', 'navigation', ...casesI18n] satisfies Namespace,
};

export default function CaseFilesPage() {
  const { t } = useTranslation(handle.i18n);
  const { caseDetail } = useCurrentCase();

  if (caseDetail.files.length === 0) {
    return (
      <div className="bg-grey-100 border-grey-90 rounded-lg border p-4">
        <span className="text-grey-50 text-s whitespace-pre">
          <Trans
            t={t}
            i18nKey="cases:case_detail.no_files"
            components={{
              Button: <AddYourFirstFile caseDetail={caseDetail} />,
            }}
          />
        </span>
      </div>
    );
  }

  return <FilesList files={caseDetail.files} />;
}

function AddYourFirstFile({
  children,
  caseDetail,
}: {
  children?: React.ReactNode;
  caseDetail: CaseDetail;
}) {
  return (
    <UploadFile caseDetail={caseDetail}>
      <button className="hover:text-purple-65 text-purple-82 hover:underline">
        {children}
      </button>
    </UploadFile>
  );
}
