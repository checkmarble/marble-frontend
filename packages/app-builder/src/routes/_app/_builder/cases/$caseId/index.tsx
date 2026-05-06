import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { caseDetailMiddleware } from '@app-builder/middlewares/case-detail-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import z from 'zod';

const caseDetailLoader = createServerFn()
  .middleware([authMiddleware, caseDetailMiddleware])
  .inputValidator(
    z.object({
      params: z.record(z.string(), z.string()).optional(),
      search: z.object({ fromInbox: z.string().optional() }).optional(),
    }),
  )
  .handler(async function caseDetailLoader({ context, data }) {
    const { detail: caseDetail } = context.case;
    const fromInbox = data.search?.fromInbox;
    const search = fromInbox ? { fromInbox } : undefined;

    if (caseDetail.type === 'continuous_screening') {
      throw redirect({ to: '/cases/m/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) }, search });
    }

    throw redirect({ to: '/cases/s/$caseId', params: { caseId: fromUUIDtoSUUID(caseDetail.id) }, search });
  });

export const Route = createFileRoute('/_app/_builder/cases/$caseId/')({
  validateSearch: z.object({ fromInbox: z.string().optional() }),
  loaderDeps: ({ search: { fromInbox } }) => ({ fromInbox }),
  loader: ({ params, deps }) => caseDetailLoader({ data: { params, search: deps } }),
});
