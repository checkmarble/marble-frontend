import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models/http-errors';
import { addRuleSnoozePayloadSchema } from '@app-builder/queries/cases/add-rule-snooze';
import { initServerServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Temporal } from 'temporal-polyfill';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { decision }] = await Promise.all([
    getFixedT(request, ['common', 'cases']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = addRuleSnoozePayloadSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  const { decisionId, ruleId, comment, durationUnit, durationValue } = data;

  const duration = Temporal.Duration.from({
    [durationUnit]: durationValue,
  });

  if (
    Temporal.Duration.compare(duration, Temporal.Duration.from({ days: 180 }), {
      relativeTo: Temporal.Now.plainDateTime('gregory'),
    }) >= 0
  ) {
    return json(
      {
        status: 'error',
        errors: [
          {
            durationValue: [t('cases:case_detail.add_rule_snooze.errors.max_duration')],
          },
        ],
      },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await decision.createSnoozeForDecision(decisionId, {
      ruleId,
      duration,
      comment,
    });

    return { status: 'success', errors: [] };
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: isStatusConflictHttpError(error)
        ? t('cases:case_detail.add_rule_snooze.errors.duplicate_rule_snooze')
        : t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}
