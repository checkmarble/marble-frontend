import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';

export const loader = createServerFn([authMiddleware], async () => {
  if (!getServerEnv('CONTINUOUS_SCREENING_ENABLED')) {
    throw redirect(getRoute('/'));
  }

  return null;
});

export default function ContinuousScreeningLayout() {
  return <Outlet />;
}
