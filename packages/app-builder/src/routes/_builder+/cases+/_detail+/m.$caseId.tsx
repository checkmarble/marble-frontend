import { ScreeningCaseDetailPage } from '@app-builder/components/CaseManager/ScreeningCaseDetail/ScreeningCaseDetailPage';
import { createServerFn, data } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { redirect, useLoaderData } from '@remix-run/react';

export const loader = createServerFn(
  [authMiddleware, caseDetailMiddleware],
  async function screeningCaseDetailLoader({ request, context }) {
    if (context.case.detail.type !== 'continuous_screening') {
      throw redirect(getRoute('/cases/s/:caseId', { caseId: fromUUIDtoSUUID(context.case.detail.id) }));
    }

    const screening = context.case.detail.continuousScreenings[0];
    if (!screening) {
      throw redirect(getRoute('/cases/inboxes/:inboxId', { inboxId: context.case.inbox.id }));
    }

    return data({ caseDetail: context.case.detail, caseInbox: context.case.inbox, screening });
  },
);

export default function ScreeningCaseDetail() {
  const { caseDetail, caseInbox, screening } = useLoaderData<typeof loader>();

  return <ScreeningCaseDetailPage caseDetail={caseDetail} caseInbox={caseInbox} screening={screening} />;
}
