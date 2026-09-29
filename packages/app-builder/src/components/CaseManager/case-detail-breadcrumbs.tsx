import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { CaseDueDateUrgencyTag } from '@app-builder/components/Cases/CaseDueDateUrgencyTag';
import { type CaseStatus } from '@app-builder/models/cases';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect } from '@tanstack/react-router';
import type { FunctionComponent } from 'react';

export type CaseDetailBreadcrumbData = {
  detail: {
    id: string;
    name: string;
    dueAt?: string;
    status: CaseStatus;
  };
  inbox: {
    id: string;
    name: string;
  };
};

type CaseBreadcrumbSource = CaseDetailBreadcrumbData['detail'] & { inboxId: string };

type InboxBreadcrumbSource = CaseDetailBreadcrumbData['inbox'];

// Built from the case route's beforeLoad data. That route's path includes the case id,
// so this runs for each case instead of reusing the pathless case-detail layout cache.
export function caseDetailBreadcrumbData(
  caseDetail: CaseBreadcrumbSource,
  inboxes: InboxBreadcrumbSource[],
): CaseDetailBreadcrumbData {
  const inbox = inboxes.find((item) => item.id === caseDetail.inboxId);
  if (!inbox) {
    throw redirect({ to: '/cases/inboxes' });
  }

  return {
    detail: {
      id: caseDetail.id,
      name: caseDetail.name,
      dueAt: caseDetail.dueAt,
      status: caseDetail.status,
    },
    inbox: { id: inbox.id, name: inbox.name },
  };
}

export const caseDetailBreadcrumbs: FunctionComponent<BreadCrumbProps<CaseDetailBreadcrumbData>>[] = [
  ({ isLast, data }) => {
    return (
      <BreadCrumbLink to="/cases/inboxes/$inboxId" params={{ inboxId: fromUUIDtoSUUID(data.inbox.id) }} isLast={isLast}>
        {data.inbox.name}
      </BreadCrumbLink>
    );
  },
  ({ isLast, data }) => {
    return (
      <>
        <BreadCrumbLink to="/cases/$caseId" params={{ caseId: fromUUIDtoSUUID(data.detail.id) }} isLast={isLast}>
          <span className="line-clamp-2 text-start">{data.detail.name}</span>
        </BreadCrumbLink>
        <CaseDueDateUrgencyTag dueAt={data.detail.dueAt} status={data.detail.status} />
      </>
    );
  },
];
