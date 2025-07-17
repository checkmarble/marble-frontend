import { TranslationObject } from '@app-builder/types/i18n';
import type { GroupedAnnotations } from 'marble-api';
import { Icon } from 'ui-icons';

export type ClientDocumentsListProps = {
  documents: GroupedAnnotations['files'][number][];
  translationObject: TranslationObject<['cases']>;
};

export function ClientDocumentsList({ documents, translationObject }: ClientDocumentsListProps) {
  const { tCases } = translationObject;
  const files = documents.flatMap((d) => d.payload.files);
  const filesCount = files.length;
  const filesRest = Math.max(filesCount - 2, 0);
  const displayedFiles = files.slice(0, 2);

  return (
    <div className="flex items-center gap-1 text-xs">
      {displayedFiles.map((doc) => (
        <div
          key={doc.id}
          className="border-grey-90 flex h-6 max-w-24 items-center gap-0.5 rounded border px-1.5 font-medium"
        >
          <Icon icon="attachment" className="size-4 shrink-0" />
          <span className="truncate">{doc.filename}</span>
        </div>
      ))}
      {filesRest > 0 ? (
        <div className="border-grey-90 flex h-6 items-center gap-0.5 rounded border px-1.5 font-medium">
          {tCases('annotations.documents.plus', { count: filesRest })}
        </div>
      ) : null}
    </div>
  );
}
