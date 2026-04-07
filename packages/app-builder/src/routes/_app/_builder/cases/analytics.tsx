import { AnalyticsPage } from '@app-builder/components/Cases/Analytics/AnalyticsPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isAccessible, isInboxAdmin } from '@app-builder/services/feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const casesAnalyticsLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function casesAnalyticsLoader({ context }) {
    const { user, entitlements, inbox: inboxRepository, organization } = context.authInfo;
    const [inboxes, users] = await Promise.all([inboxRepository.listInboxes(), organization.listUsers()]);

    const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
    if (!canViewAdminSections) {
      throw new Response(null, { status: 403 });
    }

    return {
      inboxes,
      users,
      isAnalyticsAvailable: isAccessible(entitlements.analytics),
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/analytics')({
  loader: () => casesAnalyticsLoader(),
  component: CasesAnalytics,
});

function CasesAnalytics() {
  const { inboxes, users, isAnalyticsAvailable } = Route.useLoaderData();
  return <AnalyticsPage inboxes={inboxes} users={users} isAnalyticsAvailable={isAnalyticsAvailable} />;
}
