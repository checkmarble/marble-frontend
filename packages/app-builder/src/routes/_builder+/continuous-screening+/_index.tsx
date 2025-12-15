import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getRoute } from '@app-builder/utils/routes';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async () => {
  throw redirect(getRoute('/continuous-screening/configurations'));
});
