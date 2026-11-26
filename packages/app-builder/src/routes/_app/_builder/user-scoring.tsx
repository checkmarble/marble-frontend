import { ScoringSectionLayout } from '@app-builder/components/UserScoring/ScoringSectionLayout';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isAnalyst } from '@app-builder/models';
import { isUserScoringAvailable } from '@app-builder/services/feature-access';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';

const userScoringLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function userScoringLayout({ context }) {
    const { user, entitlements, userScoring } = context.authInfo;

    if (isAnalyst(user) || !isUserScoringAvailable(entitlements)) {
      throw redirect({ to: '/app-router' });
    }

    const settings = await userScoring.getSettings();

    return {
      settings,
      canUpdateScoringSettings: user.permissions.canUpdateScoringSettings,
      canUpdateScoringRulesets: user.permissions.canUpdateScoringRulesets,
    };
  });

export const Route = createFileRoute('/_app/_builder/user-scoring')({
  loader: () => userScoringLayoutLoader(),
  component: UserScoringSectionLayout,
});

function UserScoringSectionLayout() {
  const { settings, canUpdateScoringRulesets } = Route.useLoaderData();
  return (
    <ScoringSectionLayout maxRiskLevel={settings?.maxRiskLevel} canUpdateScoringRulesets={canUpdateScoringRulesets} />
  );
}
