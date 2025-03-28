import { type CaseDetail } from '@app-builder/models/cases';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';
import { EditCaseStatus } from '@app-builder/routes/ressources+/cases+/edit-status';
import { EditCaseTags } from '@app-builder/routes/ressources+/cases+/edit-tags';
import { formatDateTime, useFormatLanguage } from '@app-builder/utils/format';

const Separator = () => <div className="h-4 w-0.5 bg-[#D9D9D9B2]" />;

export const CaseDetails = ({ detail }: { detail: CaseDetail }) => {
  const language = useFormatLanguage();

  return (
    <main className="px-12 py-8">
      <div className="flex flex-col gap-6">
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-[90px,1fr] items-center">
            <span className="text-grey-50 text-xs font-normal">Current status</span>
            <EditCaseStatus caseId={detail.id} status={detail.status} />
          </div>
          <div className="flex items-center gap-2.5">
            <div className="grid grid-cols-[90px,1fr] items-center gap-2">
              <span className="text-grey-50 text-xs font-normal">Creation date</span>
              <time className="text-xs font-medium" dateTime={detail.createdAt}>
                {formatDateTime(detail.createdAt, {
                  language,
                  timeStyle: undefined,
                })}
              </time>
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-grey-50 text-xs font-normal">Tags</span>
              <EditCaseTags caseId={detail.id} tagIds={detail.tags.map(({ tagId }) => tagId)} />
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <span className="text-grey-50 text-xs font-normal">Assigned to</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
