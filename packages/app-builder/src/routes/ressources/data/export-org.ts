import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/ressources/data/export-org')({
  server: {
    middleware: [authMiddleware],
    handlers: {
      GET: async ({ context }) => {
        const exportData = await context.api.exportOrganization();

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
