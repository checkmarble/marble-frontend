import { initServerServices } from '@app-builder/services/init.server';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/data/export-org')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { authService } = initServerServices(request);
        const { organization } = await authService.isAuthenticated(request, {
          failureRedirect: '/sign-in',
        });

        const exportData = await organization.exportOrganization();

        return new Response(JSON.stringify(exportData), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="org-export.json"',
          },
        });
      },
    },
  },
});
