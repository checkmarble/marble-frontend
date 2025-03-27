import { type CaseDetail } from '@app-builder/models/cases';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';

export const CaseDetails = ({ detail }: { detail: CaseDetail }) => {
  const language = useFormatLanguage();

  return (
    <main className="px-12 py-8">
      <div className="flex flex-col gap-6">
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex w-full flex-col gap-2">
          <div className="grid w-full grid-cols-[90px,1fr] items-center gap-2">
            <span className="text-grey-50 text-xs font-normal">Current status</span>
            <EditCaseStatus caseId={detail.id} status={detail.status} />
          </div>
          <div className="grid w-full grid-cols-[90px,1fr] items-center gap-2">
            <span className="text-grey-50 text-xs font-normal">Creation date</span>
            <time className="text-xs font-medium" dateTime={detail.createdAt}>
              {formatDateTime(detail.createdAt, {
                language,
                timeStyle: undefined,
              })}
            </time>
          </div>
        </div>
      </div>
    </main>
  );
};
