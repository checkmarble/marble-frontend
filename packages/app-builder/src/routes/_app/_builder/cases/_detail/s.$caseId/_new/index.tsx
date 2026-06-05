import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { getServerEnv } from '@app-builder/utils/environment';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const beforeLoadFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => {
    const caseManagerV2Enabled = getServerEnv('CASE_MANAGER_V2_ENABLED') ?? '';

    return {
      hasAccessToNewVersion:
        caseManagerV2Enabled === 'all' ||
        caseManagerV2Enabled.split(',').includes(context.authInfo.user.organizationId),
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/_detail/s/$caseId/_new/')({
  beforeLoad: async () => {
    const { hasAccessToNewVersion } = await beforeLoadFn();

    if (hasAccessToNewVersion) {
      throw redirect({ from: '/cases/s/$caseId', to: './principal' });
    }

    throw redirect({ from: '/cases/s/$caseId', to: './old' });
  },
});
