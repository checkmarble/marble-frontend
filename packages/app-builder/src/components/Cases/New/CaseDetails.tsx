import { type CaseDetail } from '@app-builder/models/cases';
import { EditCaseName } from '@app-builder/routes/ressources+/cases+/edit-name';

export const CaseDetails = ({ detail }: { detail: CaseDetail }) => {
  return (
    <main className="px-12 py-8">
      <div className="flex flex-col gap-6">
        <EditCaseName name={detail.name} id={detail.id} />
        <div className="flex flex-col gap-2">
          {/* <EditCaseStatus status={detail.status} id={detail.id} /> */}
        </div>
      </div>
    </main>
  );
};
