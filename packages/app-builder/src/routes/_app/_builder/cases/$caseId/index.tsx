import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const caseDetailLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function caseDetailLoader({ context }) {
    const { detail: caseDetail } = context.case;

    if (caseDetail.type === 'continuous_screening') {
      throw redirect({ to: '/cases/m/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) } });
    }

    throw redirect({ to: '/cases/s/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) } });
  });

export const Route = createFileRoute('/_app/_builder/cases/$caseId/')({
  loader: ({ params }) => caseDetailLoader({ data: { params } }),
});
