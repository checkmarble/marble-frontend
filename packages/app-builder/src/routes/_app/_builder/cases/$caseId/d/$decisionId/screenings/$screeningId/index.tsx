import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const screeningIndexLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function screeningIndexLoader({ data }) {
    const caseId = data?.params?.['caseId'];
    if (!caseId) {
      throw redirect({ to: '/cases/inboxes' });
    }

    const decisionId = data?.params?.['decisionId'];
    const screeningId = data?.params?.['screeningId'];
    if (!decisionId || !screeningId) {
      throw redirect({ to: '/cases/$caseId', params: { caseId: fromUUIDtoSUUID(caseId) } });
    }

    throw redirect({
      to: '/cases/$caseId/d/$decisionId/screenings/$screeningId/hits',
      params: {
        caseId: fromUUIDtoSUUID(caseId),
        decisionId: fromUUIDtoSUUID(decisionId),
        screeningId: fromUUIDtoSUUID(screeningId),
      },
    });
  });

export const Route = createFileRoute('/_app/_builder/cases/$caseId/d/$decisionId/screenings/$screeningId/')({
  loader: ({ params }) => screeningIndexLoader({ data: { params } }),
});
