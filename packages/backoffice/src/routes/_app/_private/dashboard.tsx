import { DashboardPage } from '@bo/components/pages/dashboard';
import { dashboardQueryOptions } from '@bo/data/dashboard';
import { getDashboardPreferences } from '@bo/utils/dashboard-preferences';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_private/dashboard')({
  component: DashboardPage,
  loader: ({ context }) => {
    const { months } = getDashboardPreferences(
      context.userPreferences.dashboard,
      context.currentUser.actor_identity.user_id,
    );
    context.queryClient.prefetchQuery(dashboardQueryOptions(months));
  },
});
