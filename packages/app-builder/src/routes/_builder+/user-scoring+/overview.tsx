import { ScoringOverviewPage } from '@app-builder/components/UserScoring/ScoringOverviewPage';
import { RouteID } from '@app-builder/utils/routes';
import { useRouteLoaderData } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime/dist/single-fetch';
import type { loader } from './_layout';

export const handle = {
  showCreateRulesetButton: true,
};

export default function UserScoringIndex() {
  const { settings } = useRouteLoaderData('routes/_builder+/user-scoring+/_layout' satisfies RouteID) as SerializeFrom<
    typeof loader
  >;

  return <ScoringOverviewPage settings={settings} />;
}
