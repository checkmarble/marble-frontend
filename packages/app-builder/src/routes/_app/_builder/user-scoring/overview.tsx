import { ScoringOverviewPage } from '@app-builder/components/UserScoring/ScoringOverviewPage';
import { createFileRoute, useLoaderData } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_builder/user-scoring/overview')({
  staticData: {
    showCreateRulesetButton: true,
  },
  component: UserScoringIndex,
});

function UserScoringIndex() {
  const { settings, canUpdateScoringSettings, canUpdateScoringRulesets } = useLoaderData({
    from: '/_app/_builder/user-scoring',
  });

  return (
    <ScoringOverviewPage
      settings={settings}
      canUpdateScoringSettings={canUpdateScoringSettings}
      canUpdateScoringRulesets={canUpdateScoringRulesets}
    />
  );
}
