import { ScreeningCaseDetailPage } from '@app-builder/components/CaseManager/ScreeningCaseDetail/ScreeningCaseDetailPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { isAdmin } from '@app-builder/models';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const screeningCaseDetailLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function screeningCaseDetailLoader({ context }) {
    if (context.case.detail.type !== 'continuous_screening') {
      throw redirect({ to: '/cases/s/$caseId', params: { caseId: fromUUIDtoSUUID(context.case.detail.id) } });
    }

    const screening = context.case.detail.continuousScreenings[0];
    if (!screening) {
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: context.case.inbox.id } });
    }

    const isUserAdmin = isAdmin(context.authInfo.user);

    return { caseDetail: context.case.detail, caseInbox: context.case.inbox, screening, isUserAdmin };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/m/$caseId')({
  loader: ({ params }) => screeningCaseDetailLoader({ data: { params } }),
  component: ScreeningCaseDetail,
});

function ScreeningCaseDetail() {
  const { caseDetail, caseInbox, screening, isUserAdmin } = Route.useLoaderData();

  return (
    <ScreeningCaseDetailPage
      caseDetail={caseDetail}
      caseInbox={caseInbox}
      screening={screening}
      isUserAdmin={isUserAdmin}
    />
  );
}
