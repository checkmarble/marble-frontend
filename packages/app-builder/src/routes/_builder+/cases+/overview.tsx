import { OverviewPage } from '@app-builder/components/Cases/Overview/OverviewPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['cases', 'common'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function casesOverviewLoader({ context }) {
  const { user, entitlements, inbox: inboxRepository } = context.authInfo;

  const inboxes = await inboxRepository.listInboxes();
  const canViewAdminSections = isAdmin(user) || inboxes.some((inbox) => isInboxAdmin(user, inbox));

  return {
    currentUserId: user.actorIdentity.userId,
    isGlobalAdmin: isAdmin(user),
    canViewAdminSections,
    entitlements: {
      autoAssignment: entitlements.autoAssignment,
      aiAssist: entitlements.AiAssist,
      workflows: entitlements.workflows,
    },
  };
});

export default function CasesOverview() {
  const loaderData = useLoaderData<typeof loader>();
  return <OverviewPage {...loaderData} />;
}
