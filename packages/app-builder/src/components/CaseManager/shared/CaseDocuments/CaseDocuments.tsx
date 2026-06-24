import { useTranslation } from 'react-i18next';
import { CaseFileButton } from './CaseFileButton';

type CaseDocumentsProps = {
  files: { id: string; fileName: string }[];
};

export const CaseDocuments = ({ files }: CaseDocumentsProps) => {
  const { t } = useTranslation(['common']);

  return (
    <div className="flex flex-col justify-start gap-xs">
      <div className="flex items-center justify-between px-2xs">
        <span className="text-grey-00 text-h2 font-medium">{t('common:documents')}</span>
      </div>

      <div className="border-grey-90 bg-grey-100 flex flex-wrap gap-sm rounded-lg border p-md">
        {files.map((file) => (
          <CaseFileButton key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
};
