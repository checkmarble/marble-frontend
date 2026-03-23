import { ScoringSectionLayout } from '@app-builder/components/UserScoring/ScoringSectionLayout';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { isUserScoringEnabled } from '@app-builder/utils/environment';
import { getRoute } from '@app-builder/utils/routes';
import { useLoaderData } from '@remix-run/react';
import { redirect } from '@remix-run/server-runtime';
import { type Namespace } from 'i18next';

export const handle = {
  i18n: ['common', 'user-scoring'] satisfies Namespace,
};

export const loader = createServerFn([authMiddleware], async function userScoringIndexLoader({ context }) {
  const { user, userScoring } = context.authInfo;

  if (!isUserScoringEnabled(user.organizationId)) {
    throw redirect(getRoute('/'));
  }

  const settings = await userScoring.getSettings();

  return {
    settings,
  };
});

export default function UserScoringSectionLayout() {
  const { settings } = useLoaderData<typeof loader>();
  return <ScoringSectionLayout maxRiskLevel={settings?.maxRiskLevel} />;
}
