import { ContinuousScreeningPage } from '@app-builder/components/CaseManagerV2/ContinuousScreeningPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromSUUIDtoUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod/v4';

const beforeLoadFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .validator(z.object({ caseId: z.string().transform((shortuuid) => fromSUUIDtoUUID(shortuuid)) }))
  .handler(async ({ context, data }) => {
    const caseDetail = await context.authInfo.cases.getCase({ caseId: data.caseId });
    const screening = caseDetail.continuousScreenings[0];

    if (!screening) {
      throw redirect({ to: '/cases/inboxes/$inboxId', params: { inboxId: caseDetail.inboxId } });
    }

    return { caseDetail, screening };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/m/$caseId/')({
  beforeLoad: async ({ params }) => {
    return beforeLoadFn({ data: { caseId: params.caseId } });
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { caseDetail, inboxes, screening } = Route.useRouteContext();

  return <ContinuousScreeningPage caseDetail={caseDetail} inboxes={inboxes} screening={screening} />;
}
