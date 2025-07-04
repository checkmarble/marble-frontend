import { Callout, decisionsI18n, OutcomeBadge, scenarioI18n } from '@app-builder/components';
import { ScoreOutcomeThresholds } from '@app-builder/components/Decisions/ScoreOutcomeThresholds';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { scenarioDecisionDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { type Namespace, type TFunction } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible } from 'ui-design-system';
import * as z from 'zod';

import { useCurrentScenarioIteration, useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: [...decisionsI18n, ...scenarioI18n, 'common'] satisfies Namespace,
};

const MAX_THRESHOLD = 10000;

/**
 * This is a list of validation errors comming from the backend that are handled by the form schema.
 * The form schema is responsible for displaying the error message.
 */
const conflictingWithSchemaValidationErrors: string[] = [
  'SCORE_THRESHOLDS_MISMATCH',
  'SCORE_THRESHOLD_MISSING',
] satisfies ScenarioValidationErrorCodeDto[];
function getFormSchema(t: TFunction<typeof handle.i18n>) {
  return z
    .object({
      scoreReviewThreshold: z.coerce
        .number({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
      scoreBlockAndReviewThreshold: z.coerce
        .number({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
      scoreDeclineThreshold: z.coerce
        .number({
          message: t('scenarios:validation.decision.score_threshold_missing'),
        })
        .max(MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_max', {
            replace: { max: MAX_THRESHOLD },
          }),
        })
        .min(-MAX_THRESHOLD, {
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: -MAX_THRESHOLD },
          }),
        })
        .int(),
    })
    .superRefine(
      ({ scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold }, ctx) => {
        if (scoreBlockAndReviewThreshold < scoreReviewThreshold) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scoreBlockAndReviewThreshold'],
            message: t('scenarios:validation.decision.score_threshold_min', {
              replace: { min: scoreReviewThreshold },
            }),
          });
        }
        if (scoreDeclineThreshold < scoreBlockAndReviewThreshold) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['scoreDeclineThreshold'],
            message: t('scenarios:validation.decision.score_threshold_min', {
              replace: { min: scoreBlockAndReviewThreshold },
            }),
          });
        }
      },
    );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, data, t, { scenario }] = await Promise.all([
    getSession(request),
    request.json(),
    getFixedT(request, ['common', 'scenarios']),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const result = getFormSchema(t).safeParse(data);

  if (!result.success) {
    return json(
      { status: 'error', errors: result.error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const iterationId = fromParams(params, 'iterationId');
    await scenario.updateScenarioIteration(iterationId, data);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.save'),
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export default function Decision() {
  const { t } = useTranslation(handle.i18n);

  const editorMode = useEditorMode();

  return (
    <Collapsible.Container className="bg-grey-100 max-w-3xl">
      <Collapsible.Title>{t('scenarios:decision.score_based.title')}</Collapsible.Title>
      <Collapsible.Content>
        <Callout variant="outlined" className="mb-4 lg:mb-6">
          <p className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="scenarios:decision.score_based.callout"
              components={{
                DocLink: <ExternalLink href={scenarioDecisionDocHref} />,
              }}
            />
          </p>
        </Callout>
        {editorMode === 'view' ? <ViewScoreThresholds /> : <EditScoreThresholds />}
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function ViewScoreThresholds() {
  const { scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold } =
    useCurrentScenarioIteration();

  return (
    <ScoreOutcomeThresholds
      scoreReviewThreshold={scoreReviewThreshold}
      scoreBlockAndReviewThreshold={scoreBlockAndReviewThreshold}
      scoreDeclineThreshold={scoreDeclineThreshold}
    />
  );
}

function EditScoreThresholds() {
  const { t } = useTranslation(handle.i18n);
  const iteration = useCurrentScenarioIteration();

  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const fetcher = useFetcher<typeof action>();
  const editorMode = useEditorMode();

  const schema = React.useMemo(() => getFormSchema(t), [t]);

  const form = useForm({
    defaultValues: {
      scoreReviewThreshold: iteration.scoreReviewThreshold ?? 0,
      scoreBlockAndReviewThreshold: iteration.scoreBlockAndReviewThreshold ?? 0,
      scoreDeclineThreshold: iteration.scoreDeclineThreshold ?? 0,
    } as z.infer<typeof schema>,
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, { method: 'POST', encType: 'application/json' });
      }
    },
  });

  const scoreReviewThreshold = useStore(form.store, (store) => store.values.scoreReviewThreshold);
  const scoreBlockAndReviewThreshold = useStore(
    form.store,
    (store) => store.values.scoreBlockAndReviewThreshold,
  );
  const scoreDeclineThreshold = useStore(form.store, (store) => store.values.scoreDeclineThreshold);

  const serverErrors = R.pipe(
    scenarioValidation.decision.errors,
    R.filter((error) => !conflictingWithSchemaValidationErrors.includes(error)),
    R.map(getScenarioErrorMessage),
  );

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="grid grid-cols-[max-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
        <OutcomeBadge size="md" outcome="approve" className="w-full justify-center" />
        <form.Field
          name="scoreReviewThreshold"
          validators={{
            onChange: schema._def.schema.shape.scoreReviewThreshold,
            onBlur: schema._def.schema.shape.scoreReviewThreshold,
          }}
        >
          {(field) => (
            <div className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
              <FormLabel name={field.name} className="sr-only">
                {t('scenarios:decision.score_based.score_review_threshold')}
              </FormLabel>
              <Trans
                t={t}
                i18nKey="scenarios:decision.score_based.approve_condition"
                components={{
                  ReviewThreshold: (
                    <FormInput
                      type="number"
                      name={field.name}
                      onBlur={field.handleBlur}
                      className="relative w-fit"
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(+e.currentTarget.value)}
                      valid={field.state.meta.errors?.length === 0}
                    />
                  ),
                }}
                shouldUnescape
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
                errorClassName={style.errorMessage}
              />
            </div>
          )}
        </form.Field>

        <OutcomeBadge size="md" outcome="review" className="w-full justify-center" />
        <form.Field
          name="scoreBlockAndReviewThreshold"
          validators={{
            onChange: schema._def.schema.shape.scoreBlockAndReviewThreshold,
            onBlur: schema._def.schema.shape.scoreBlockAndReviewThreshold,
          }}
        >
          {(field) => (
            <div className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
              <FormLabel name={field.name} className="sr-only">
                {t('scenarios:decision.score_based.score_block_and_review_threshold')}
              </FormLabel>
              <Trans
                t={t}
                i18nKey="scenarios:decision.score_based.review_condition"
                values={{
                  reviewThreshold: scoreReviewThreshold,
                }}
                components={{
                  BlockAndReviewThreshold: (
                    <FormInput
                      type="number"
                      name={field.name}
                      onBlur={field.handleBlur}
                      min={scoreReviewThreshold}
                      className="relative w-fit"
                      defaultValue={scoreBlockAndReviewThreshold}
                      onChange={(e) => field.handleChange(+e.currentTarget.value)}
                      valid={field.state.meta.errors?.length === 0}
                    />
                  ),
                }}
                shouldUnescape
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
                errorClassName={style.errorMessage}
              />
            </div>
          )}
        </form.Field>

        <OutcomeBadge size="md" outcome="block_and_review" className="w-full justify-center" />
        <form.Field
          name="scoreDeclineThreshold"
          validators={{
            onChange: schema._def.schema.shape.scoreDeclineThreshold,
            onBlur: schema._def.schema.shape.scoreDeclineThreshold,
          }}
        >
          {(field) => (
            <div className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
              <FormLabel name={field.name} className="sr-only">
                {t('scenarios:decision.score_based.score_decline_threshold')}
              </FormLabel>
              <Trans
                t={t}
                i18nKey="scenarios:decision.score_based.score_block_and_review_condition"
                values={{
                  blockAndReviewThreshold: scoreBlockAndReviewThreshold,
                }}
                components={{
                  DeclineThreshold: (
                    <FormInput
                      type="number"
                      name={field.name}
                      onBlur={field.handleBlur}
                      className="relative w-fit"
                      min={scoreBlockAndReviewThreshold}
                      defaultValue={scoreDeclineThreshold}
                      onChange={(e) => field.handleChange(+e.currentTarget.value)}
                      valid={field.state.meta.errors?.length === 0}
                    />
                  ),
                }}
                shouldUnescape
              />
              <FormErrorOrDescription
                errors={getFieldErrors(field.state.meta.errors)}
                errorClassName={style.errorMessage}
              />
            </div>
          )}
        </form.Field>

        <OutcomeBadge size="md" outcome="decline" className="w-full justify-center" />
        {t('scenarios:decision.score_based.decline_condition', {
          replace: {
            declineThreshold: scoreDeclineThreshold,
          },
        })}
      </div>

      {editorMode === 'edit' ? (
        <div className="flex flex-row-reverse items-center justify-between gap-2">
          <Button type="submit">{t('common:save')}</Button>
          <EvaluationErrors errors={serverErrors} />
        </div>
      ) : (
        <EvaluationErrors errors={serverErrors} />
      )}
    </form>
  );
}

const style = {
  errorMessage: 'bg-red-95 rounded px-2 py-1 h-8 flex items-center justify-center',
} as const;
