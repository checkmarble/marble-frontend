import { AnalyticsPage } from '@app-builder/components/Cases/Analytics/AnalyticsPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isAccessible, isInboxAdmin } from '@app-builder/services/feature-access';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['cases', 'common', 'navigation'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function casesAnalyticsLoader({ context }) {
  const { user, entitlements, inbox: inboxRepository, organization } = context.authInfo;
  const [inboxes, users] = await Promise.all([inboxRepository.listInboxes(), organization.listUsers()]);

  const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));
  if (!canViewAdminSections || !isAccessible(entitlements.analytics)) {
    throw new Response(null, { status: 403 });
  }

  return { inboxes, users };
});

export default function CasesAnalytics() {
  const { inboxes, users } = useLoaderData<typeof loader>();
  return <AnalyticsPage inboxes={inboxes} users={users} />;
}
