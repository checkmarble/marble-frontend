import { CaseStatusBadge } from '@app-builder/components/Cases';
import { EditCaseAssignee } from '@app-builder/components/Cases/EditAssignee';
import { EditCaseInbox } from '@app-builder/components/Cases/EditCaseInbox';
import { EditCaseTags } from '@app-builder/components/Cases/EditTags';
import { type CaseDetail } from '@app-builder/models/cases';
import { Inbox } from '@app-builder/models/inbox';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useFormatDateTime } from '@app-builder/utils/format';
import { ButtonV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

type CaseDetailInfoProps = {
  caseDetail: CaseDetail;
  caseInbox: Inbox;
};

export const CaseDetailInfo = ({ caseDetail, caseInbox }: CaseDetailInfoProps) => {
  const formatDateTime = useFormatDateTime();
  const { currentUser } = useOrganizationDetails();

  return (
    <div className="flex flex-col gap-v2-md">
      <div className="grid grid-cols-[1fr_auto] gap-v2-lg items-start">
        <div className="flex flex-col">
          <div className="flex gap-v2-xs items-center">
            <CaseStatusBadge status="investigating" />
            <h1 className="text-h1 font-semibold">{caseDetail.name}</h1>
          </div>
          <h2 className="text-h2 text-grey-50">Filtrage pour nouvelle entité sous sanction / PEP / adverse media</h2>
        </div>
        <div className="flex gap-v2-sm">
          <ButtonV2 variant="secondary">
            <Icon icon="arrow-up" className="size-4" />
            <span>Escalate</span>
          </ButtonV2>
          <ButtonV2 variant="primary" appearance="stroked">
            <Icon icon="save" className="size-4" />
            <span>Save</span>
          </ButtonV2>
        </div>
      </div>
      <div className="text-small grid grid-cols-[repeat(2,_minmax(auto,_calc(var(--spacing)_*_35))_1fr)] gap-v2-sm p-v2-md rounded-lg border border-grey-border bg-white">
        <div className="grid grid-cols-subgrid col-span-full h-8 items-center">
          <div className="text-grey-50">Creation date</div>
          <div>{formatDateTime(caseDetail.createdAt, { dateStyle: 'short' })}</div>
          <div className="text-grey-50">Tags</div>
          <div className="flex gap-v2-xs">
            <EditCaseTags id={caseDetail.id} tagIds={caseDetail.tags.map(({ tagId }) => tagId)} />
          </div>
        </div>
        <div className="grid grid-cols-subgrid col-span-full h-8 items-center">
          <div className="text-grey-50">Inbox</div>
          <div>
            <EditCaseInbox id={caseDetail.id} inboxId={caseDetail.inboxId} />
          </div>
          <div className="text-grey-50">Assigned to</div>
          <div className="flex gap-v2-xs">
            <EditCaseAssignee
              currentUser={currentUser}
              assigneeId={caseDetail.assignedTo}
              id={caseDetail.id}
              disabled={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
