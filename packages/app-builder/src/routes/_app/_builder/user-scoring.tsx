import { ScoringSectionLayout } from '@app-builder/components/UserScoring/ScoringSectionLayout';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isUserScoringEnabled } from '@app-builder/utils/environment';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { type Namespace } from 'i18next';

const userScoringLayoutLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function userScoringLayout({ context }) {
    const { user, userScoring } = context.authInfo;

    if (!isUserScoringEnabled(user.organizationId)) {
      throw redirect({ to: '/' });
    }

    const settings = await userScoring.getSettings();

    return { settings };
  });

export const Route = createFileRoute('/_app/_builder/user-scoring')({
  staticData: {
    i18n: ['common', 'user-scoring'] satisfies Namespace,
  },
  loader: () => userScoringLayoutLoader(),
  component: UserScoringSectionLayout,
});

function UserScoringSectionLayout() {
  const { settings } = Route.useLoaderData();
  return <ScoringSectionLayout maxRiskLevel={settings?.maxRiskLevel} />;
}
