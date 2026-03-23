import { ScoringRulesetPage } from '@app-builder/components/UserScoring/ScoringRulesetPage';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { getRoute, RouteID } from '@app-builder/utils/routes';
import { Navigate, redirect, useLoaderData, useRouteLoaderData } from '@remix-run/react';
import { SerializeFrom } from '@remix-run/server-runtime/dist/single-fetch';
import type { loader as layoutLoader } from './_layout';

export const loader = createServerFn([authMiddleware], async function scoringRulesetLoader({ context, params }) {
  const recordType = params['recordType']!;
  const version = params['version']!;

  let ruleset: ScoringRulesetWithRules | null = null;
  try {
    ruleset = await context.authInfo.userScoring.getRulesetWithRules(recordType, version);
  } catch (err) {
    if (isNotFoundHttpError(err)) {
      throw redirect(getRoute('/user-scoring/overview'));
    }
    throw err;
  }

  const customLists = await context.authInfo.customListsRepository.listCustomLists();

  let preparationStatus: ScenarioPublicationStatus | null = null;
  if (ruleset.status === 'draft') {
    preparationStatus = await context.authInfo.userScoring.getRulesetPreparationStatus(recordType);
  }
  return { ruleset, customLists, preparationStatus };
});

export default function UserScoringRulesetRoute() {
  const { ruleset, customLists, preparationStatus } = useLoaderData<typeof loader>();
  const { settings } = useRouteLoaderData('routes/_builder+/user-scoring+/_layout' satisfies RouteID) as SerializeFrom<
    typeof layoutLoader
  >;

  if (!settings) return <Navigate to={getRoute('/user-scoring/overview')} replace />;

  return (
    <ScoringRulesetPage
      ruleset={ruleset}
      settings={settings}
      customLists={customLists}
      preparationStatus={preparationStatus}
    />
  );
}
