import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { initServerServices } from '@app-builder/services/init.server';
import { fromParams, fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/cases/next-unassigned/$caseId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { cases } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const fallback = `/cases/inboxes/${MY_INBOX_ID}`;
        try {
          const caseId = fromParams(params, 'caseId');
          const nextCaseId = await cases.getNextUnassignedCaseId({ caseId });
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
