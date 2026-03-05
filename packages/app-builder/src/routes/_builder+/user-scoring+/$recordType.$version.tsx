import { ScoringRulesetPage } from '@app-builder/components/UserScoring/ScoringRulesetPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { RouteID } from '@app-builder/utils/routes';
import { useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime/dist/single-fetch';
import type { loader as layoutLoader } from './_layout';

export const loader = createServerFn([authMiddleware], async function scoringRulesetLoader({ context, params }) {
  const recordType = params['recordType']!;
  const version = params['version']!;

  const ruleset = await context.authInfo.userScoring.getRulesetWithRules(recordType, version);

  return { ruleset };
});

export default function UserScoringRulesetRoute() {
  const { ruleset } = useLoaderData<typeof loader>();
  const { settings } = useRouteLoaderData('routes/_builder+/user-scoring+/_layout' satisfies RouteID) as SerializeFrom<
    typeof layoutLoader
  >;

  return <ScoringRulesetPage ruleset={ruleset} settings={settings} />;
}
