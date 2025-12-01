import { OverviewPage } from '@app-builder/components/Cases/Overview/OverviewPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAdmin } from '@app-builder/models';
import { isAccessible, isAutoAssignmentAvailable, isWorkflowsAvailable } from '@app-builder/services/feature-access';
import { useLoaderData } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async function casesOverviewLoader({ context }) {
  const { user, entitlements } = context.authInfo;

  return {
    currentUserId: user.actorIdentity.userId,
    isGlobalAdmin: isAdmin(user),
    hasAutoAssignmentEntitlement: isAutoAssignmentAvailable(entitlements),
    hasAIEntitlement: isAccessible(entitlements.AiAssist),
    hasWorkflowEntitlement: isWorkflowsAvailable(entitlements),
  };
});

export default function CasesOverview() {
  const loaderData = useLoaderData<typeof loader>();
  return <OverviewPage {...loaderData} />;
}
