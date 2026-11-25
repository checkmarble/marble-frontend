import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const continuousScreeningLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningLayout({ context }) {
    const { user, entitlements } = context.authInfo;

    if (!isContinuousScreeningAvailable(entitlements)) {
      throw redirect({ to: '/app-router' });
    }

    return null;
  });

export const Route = createFileRoute('/_app/_builder/continuous-screening')({
  loader: () => continuousScreeningLayoutLoader(),
  component: () => <Outlet />,
});
