import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn([authMiddleware], async function exportOrgLoader({ context }) {
  const { organization } = context.authInfo;

  const exportData = await organization.exportOrganization();

  return new Response(JSON.stringify(exportData), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="org-export.json"',
    },
  });
});
