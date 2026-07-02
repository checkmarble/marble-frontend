import { OverviewPage } from '@app-builder/components/Cases/Overview/OverviewPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isInboxAdmin } from '@app-builder/services/feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const casesOverviewLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function casesOverviewLoader({ context }) {
    const { user, entitlements, inbox: inboxRepository } = context.authInfo;

    const [inboxes, allInboxesMetadata] = await Promise.all([
      inboxRepository.listInboxes(),
      inboxRepository.listInboxesMetadata(),
    ]);
    const canViewAdminSections = user.permissions.canEditInboxes || inboxes.some((inbox) => isInboxAdmin(user, inbox));

    return {
      currentUserId: user.actorIdentity.userId,
      isGlobalAdmin: user.permissions.canEditInboxes,
      canViewAdminSections,
      allInboxesMetadata,
      entitlements: {
        autoAssignment: entitlements.autoAssignment,
        aiAssist: entitlements.caseAiAssist,
      },
    };
  });

export const Route = createFileRoute('/_app/_builder/cases/overview')({
  loader: () => casesOverviewLoader(),
  component: CasesOverview,
});

function CasesOverview() {
  const loaderData = Route.useLoaderData();
  return <OverviewPage {...loaderData} />;
}
