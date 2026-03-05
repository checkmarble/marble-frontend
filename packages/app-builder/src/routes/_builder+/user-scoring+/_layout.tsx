import { ScoringSectionLayout } from '@app-builder/components/UserScoring/ScoringSectionLayout';
import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { useLoaderData } from '@remix-run/react';

export const loader = createServerFn([authMiddleware], async function userScoringIndexLoader({ context }) {
  const settings = await context.authInfo.userScoring.getSettings();

  return {
    settings,
  };
});

export default function UserScoringSectionLayout() {
  const { settings } = useLoaderData<typeof loader>();
  return <ScoringSectionLayout maxRiskLevel={settings?.maxRiskLevel} />;
}
