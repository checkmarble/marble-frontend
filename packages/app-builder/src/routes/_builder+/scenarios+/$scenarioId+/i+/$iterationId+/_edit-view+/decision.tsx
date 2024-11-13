import {
  Callout,
  decisionsI18n,
  OutcomeTag,
  scenarioI18n,
} from '@app-builder/components';
import { ScoreOutcomeThresholds } from '@app-builder/components/Decisions/ScoreOutcomeThresholds';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { scenarioDecisionDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { Form, useActionData } from '@remix-run/react';
import { type Namespace, type TFunction } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible } from 'ui-design-system';
import * as z from 'zod';

import {
  useCurrentScenarioIteration,
  useCurrentScenarioValidation,
} from '../_layout';

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
      (
        {
          scoreReviewThreshold,
          scoreBlockAndReviewThreshold,
          scoreDeclineThreshold,
        },
        ctx,
      ) => {
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
  } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const t = await getFixedT(request, ['common', 'scenarios']);
  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: getFormSchema(t),
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { getSession, commitSession } = serverServices.toastSessionService;
  const session = await getSession(request);

  try {
    const iterationId = fromParams(params, 'iterationId');
    await scenario.updateScenarioIteration(iterationId, submission.value);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.save'),
    });

    return json(submission.reply(), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    const message = t('common:errors.unknown');
    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(submission.reply({ formErrors: [message] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export default function Decision() {
  const { t } = useTranslation(handle.i18n);

  const editorMode = useEditorMode();

  return (
    <Collapsible.Container className="bg-grey-00 max-w-3xl">
      <Collapsible.Title>
        {t('scenarios:decision.score_based.title')}
      </Collapsible.Title>
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
        {editorMode === 'view' ? (
          <ViewScoreThresholds />
        ) : (
          <EditScoreThresholds />
        )}
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function ViewScoreThresholds() {
  const {
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold,
  } = useCurrentScenarioIteration();

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
  const {
    scoreReviewThreshold,
    scoreBlockAndReviewThreshold,
    scoreDeclineThreshold,
  } = useCurrentScenarioIteration();

  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const lastResult = useActionData<typeof action>();
  const editorMode = useEditorMode();

  const schema = React.useMemo(() => getFormSchema(t), [t]);

  const [form, fields] = useForm({
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    defaultValue: {
      scoreReviewThreshold,
      scoreBlockAndReviewThreshold,
      scoreDeclineThreshold,
    },
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const reviewThreshold =
    fields.scoreReviewThreshold.value ?? scoreReviewThreshold;
  const blockAndReviewThreshold =
    fields.scoreBlockAndReviewThreshold.value ?? scoreBlockAndReviewThreshold;
  const declineThreshold =
    fields.scoreDeclineThreshold.value ?? scoreDeclineThreshold;

  const serverErrors = R.pipe(
    scenarioValidation.decision.errors,
    R.filter((error) => !conflictingWithSchemaValidationErrors.includes(error)),
    R.map(getScenarioErrorMessage),
  );

  return (
    <FormProvider context={form.context}>
      <Form
        className="flex flex-col gap-2"
        method="POST"
        {...getFormProps(form)}
      >
        <div className="grid grid-cols-[max-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
          <OutcomeTag border="square" size="big" outcome="approve" />
          <FormField
            name={fields.scoreReviewThreshold.name}
            className="flex flex-row flex-wrap items-center gap-1 lg:gap-2"
          >
            <FormLabel className="sr-only">
              {t('scenarios:decision.score_based.score_review_threshold')}
            </FormLabel>
            <Trans
              t={t}
              i18nKey="scenarios:decision.score_based.approve_condition"
              components={{
                ReviewThreshold: (
                  <FormInput type="number" className="relative w-fit" />
                ),
              }}
              shouldUnescape
            />
            <FormErrorOrDescription errorClassName={style.errorMessage} />
          </FormField>

          <OutcomeTag border="square" size="big" outcome="review" />
          <FormField
            name={fields.scoreBlockAndReviewThreshold.name}
            className="flex flex-row flex-wrap items-center gap-1 lg:gap-2"
          >
            <FormLabel className="sr-only">
              {t(
                'scenarios:decision.score_based.score_block_and_review_threshold',
              )}
            </FormLabel>
            <Trans
              t={t}
              i18nKey="scenarios:decision.score_based.review_condition"
              values={{
                reviewThreshold,
              }}
              components={{
                BlockAndReviewThreshold: (
                  <FormInput
                    type="number"
                    className="relative w-fit"
                    min={reviewThreshold}
                  />
                ),
              }}
              shouldUnescape
            />
            <FormErrorOrDescription errorClassName={style.errorMessage} />
          </FormField>

          <OutcomeTag border="square" size="big" outcome="block_and_review" />
          <FormField
            name={fields.scoreDeclineThreshold.name}
            className="flex flex-row flex-wrap items-center gap-1 lg:gap-2"
          >
            <FormLabel className="sr-only">
              {t('scenarios:decision.score_based.score_decline_threshold')}
            </FormLabel>
            <Trans
              t={t}
              i18nKey="scenarios:decision.score_based.score_block_and_review_condition"
              values={{
                blockAndReviewThreshold,
              }}
              components={{
                DeclineThreshold: (
                  <FormInput
                    type="number"
                    className="relative w-fit"
                    min={blockAndReviewThreshold}
                  />
                ),
              }}
              shouldUnescape
            />
            <FormErrorOrDescription errorClassName={style.errorMessage} />
          </FormField>

          <OutcomeTag border="square" size="big" outcome="decline" />
          {t('scenarios:decision.score_based.decline_condition', {
            replace: {
              declineThreshold,
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
      </Form>
    </FormProvider>
  );
}

const style = {
  errorMessage:
    'bg-red-05 rounded px-2 py-1 h-8 flex items-center justify-center',
} as const;
