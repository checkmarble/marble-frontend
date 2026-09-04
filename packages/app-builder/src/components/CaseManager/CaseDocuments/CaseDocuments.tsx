import { useTranslation } from 'react-i18next';
import { CaseFileButton } from './CaseFileButton';

type CaseDocumentsProps = {
  files: { id: string; fileName: string }[];
};

export function CaseDocuments({ files }: CaseDocumentsProps) {
  const { t } = useTranslation(['common']);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col justify-start gap-sm">
      <span className="text-default text-grey-primary px-2xs font-medium">{t('common:documents')}</span>
      <div className="border-grey-border bg-surface-card flex flex-wrap gap-sm rounded-lg border p-md">
        {files.map((file) => (
          <CaseFileButton key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
