import { initServerServices } from '@app-builder/services/init.server';
import { proxyTracfinExport } from '@app-builder/services/tracfin/export-proxy.server';
import { getServerEnv } from '@app-builder/utils/environment';
import { createFileRoute } from '@tanstack/react-router';
import { createFetchWithAuthMiddleware } from 'marble-api';

export const Route = createFileRoute('/ressources/cases/tracfin/download/$caseId/$exportId')({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { authService } = initServerServices(request);
        const { tokenService } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        // The artifact is streamed through, so the generated client (which parses the response) is not used.
        return proxyTracfinExport({
          caseId: params['caseId'],
          exportId: params['exportId'],
          backendBaseUrl: getServerEnv('MARBLE_API_URL'),
          fetchBackend: createFetchWithAuthMiddleware({
            request,
            tokenService,
            getAuthorizationHeader: (token) => ({ name: 'Authorization', value: `Bearer ${token}` }),
          }),
        });
      },
    },
  },
});
