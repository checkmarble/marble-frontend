import { OverviewPage } from '@app-builder/components/Cases/Overview/OverviewPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';

export const loader = createServerFn([authMiddleware], async function casesOverviewLoader({ context }) {
  return null;
});

export default function CasesOverview() {
  return <OverviewPage />;
}
