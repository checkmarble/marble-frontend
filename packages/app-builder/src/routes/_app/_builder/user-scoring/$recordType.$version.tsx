import { ScoringRulesetPage } from '@app-builder/components/UserScoring/ScoringRulesetPage';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isNotFoundHttpError } from '@app-builder/models';
import { type ScenarioPublicationStatus } from '@app-builder/models/scenario/publication';
import { type ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { createFileRoute, Navigate, redirect, useLoaderData } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const scoringRulesetLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function scoringRulesetLoader({ data, context }) {
    const { userScoring, customListsRepository } = context.authInfo;

    const recordType = data?.params?.['recordType'] ?? '';
    const version = data?.params?.['version'] ?? '';

    let ruleset: ScoringRulesetWithRules | null = null;
    try {
      ruleset = await userScoring.getRulesetWithRules(recordType, version);
    } catch (err) {
      if (isNotFoundHttpError(err)) {
        throw redirect({ to: '/user-scoring/overview' });
      }
      throw err;
    }

    const customLists = await customListsRepository.listCustomLists();

    let preparationStatus: ScenarioPublicationStatus | null = null;
    if (ruleset.status === 'draft') {
      preparationStatus = await userScoring.getRulesetPreparationStatus(recordType);
    }

    return { ruleset, customLists, preparationStatus };
  });

export const Route = createFileRoute('/_app/_builder/user-scoring/$recordType/$version')({
  loader: ({ params }) => scoringRulesetLoader({ data: { params } }),
  component: UserScoringRulesetRoute,
});

function UserScoringRulesetRoute() {
  const { ruleset, customLists, preparationStatus } = Route.useLoaderData();
  const { settings } = useLoaderData({ from: '/_app/_builder/user-scoring' });

  if (!settings) return <Navigate to="/user-scoring/overview" replace />;

  return (
    <ScoringRulesetPage
      ruleset={ruleset}
      settings={settings}
      customLists={customLists}
      preparationStatus={preparationStatus}
    />
  );
}
