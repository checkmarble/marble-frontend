import { useTranslation } from 'react-i18next';
import { Typo } from 'ui-design-system';
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
      <Typo variant="subtitle1">{t('common:documents')}</Typo>
      <div className="border-grey-border bg-surface-card flex flex-wrap gap-sm rounded-lg border p-md">
        {files.map((file) => (
          <CaseFileButton key={file.id} file={file} />
        ))}
      </div>
    </div>
  );
}
