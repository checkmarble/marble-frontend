import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const datasets = await context.authInfo.screening.listDatasets();
  return { datasets };
});
