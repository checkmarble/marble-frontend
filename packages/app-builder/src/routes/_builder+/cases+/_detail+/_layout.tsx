import { BreadCrumbLink, type BreadCrumbProps } from '@app-builder/components/Breadcrumbs';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type SerializeFrom } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const loader = createServerFn(
  [authMiddleware, caseDetailMiddleware],
  async function caseDetailLayoutLoader({ request, context }) {
    return data({ caseDetail: context.case.detail, caseInbox: context.case.inbox });
  },
);

export const handle = {
  i18n: ['common', 'cases', 'decisions'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const caseInbox = data.caseInbox;

      return (
        <BreadCrumbLink
          to={getRoute('/cases/inboxes/:inboxId', {
            inboxId: fromUUIDtoSUUID(caseInbox.id),
          })}
          isLast={isLast}
        >
          {caseInbox.name}
        </BreadCrumbLink>
      );
    },
    ({ isLast, data }: BreadCrumbProps<SerializeFrom<typeof loader>>) => {
      const caseDetail = data.caseDetail; // Safely access caseDetail from the loader data

      return (
        <BreadCrumbLink to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseDetail.id) })} isLast={isLast}>
          <span className="line-clamp-2 text-start">{caseDetail.name}</span>
        </BreadCrumbLink>
      );
    },
  ],
};

export default function CaseDetailLayout() {
  return <Outlet />;
}
