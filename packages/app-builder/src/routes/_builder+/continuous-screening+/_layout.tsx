import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { getRoute } from '@app-builder/utils/routes';
import { Outlet, redirect } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async ({ context }) => {
  const { user, entitlements } = context.authInfo;

  if (isAnalyst(user)) {
    return redirect(getRoute('/cases'));
  }

  if (!isContinuousScreeningAvailable(entitlements)) {
    return redirect(getRoute('/'));
  }

  return null;
});

export default function ContinuousScreeningLayout() {
  return <Outlet />;
}
