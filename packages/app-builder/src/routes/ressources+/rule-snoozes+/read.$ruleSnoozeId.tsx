import { adaptRuleSnoozeDetail } from '@app-builder/models/rule-snooze';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { ruleSnoozeRepository, decision } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );
  const ruleSnoozeId = fromParams(params, 'ruleSnoozeId');

  try {
    const ruleSnooze = await ruleSnoozeRepository.getRuleSnooze(ruleSnoozeId);
    const decisionDetail = ruleSnooze.createdFromDecisionId
      ? await decision.getDecisionById(ruleSnooze.createdFromDecisionId)
      : null;

    return json({
      success: true as const,
      ruleSnoozeDetail: adaptRuleSnoozeDetail(ruleSnooze, decisionDetail),
    });
  } catch (error) {
    return json({ success: false as const });
  }
}

export function useGetRuleSnoozeFetcher({
  ruleSnoozeId,
}: {
  ruleSnoozeId: string;
}) {
  const loadFetcher = useFetcher<typeof loader>();
  React.useEffect(() => {
    if (loadFetcher.state === 'idle' && !loadFetcher.data) {
      loadFetcher.load(
        getRoute('/ressources/rule-snoozes/read/:ruleSnoozeId', {
          ruleSnoozeId: fromUUID(ruleSnoozeId),
        }),
      );
    }
  }, [loadFetcher, ruleSnoozeId]);

  return loadFetcher;
}
