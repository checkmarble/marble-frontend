import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getNextUnassignedCaseId } from '@app-builder/server/cases';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/cases/next-unassigned/$caseId')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context, params }) => {
        const fallback = `/cases/inboxes/${MY_INBOX_ID}`;
        try {
          const caseId = fromParams(params, 'caseId');
          const nextCaseId = await getNextUnassignedCaseId(context.api, { caseId });
          return new Response(null, {
            status: 302,
            headers: { Location: nextCaseId ? `/cases/${fromUUIDtoSUUID(nextCaseId)}` : fallback },
          });
        } catch {
          return new Response(null, { status: 302, headers: { Location: fallback } });
        }
      },
    },
  },
});
