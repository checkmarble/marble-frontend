import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const continuousScreeningLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function continuousScreeningLayout({ context }) {
    const { user, entitlements } = context.authInfo;

    if (isAnalyst(user)) {
      throw redirect({ to: '/cases' });
    }

    if (!isContinuousScreeningAvailable(entitlements)) {
      throw redirect({ to: '/' });
    }

    return null;
  });

export const Route = createFileRoute('/_app/_builder/continuous-screening')({
  loader: () => continuousScreeningLayoutLoader(),
  component: () => <Outlet />,
});
