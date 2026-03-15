import { createServerFn } from '@app-builder/core/requests';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { handleRedirectMiddleware } from '@app-builder/middlewares/handle-redirect-middleware';

export const loader = createServerFn(
  [handleRedirectMiddleware, authMiddleware],
  async function listScoringRulesetVersionsLoader({ request, context }) {
    const url = new URL(request.url);
    const recordType = url.searchParams.get('recordType')!;
    const versions = await context.authInfo.userScoring.listRulesetVersions(recordType);
    return { versions };
  },
);
