import {
  Callout,
  decisionsI18n,
  Outcome,
  scenarioI18n,
} from '@app-builder/components';
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
import React from 'react';
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

/**
 * This is a list of validation errors comming from the backend that are handled by the form schema.
 * The form schema is responsible for displaying the error message.
 */
const conflictingWithSchemaValidationErrors: string[] = [
  'SCORE_REJECT_REVIEW_THRESHOLDS_MISSMATCH',
  'SCORE_REJECT_THRESHOLD_REQUIRED',
  'SCORE_REVIEW_THRESHOLD_REQUIRED',
] satisfies ScenarioValidationErrorCodeDto[];
function getFormSchema(t: TFunction<typeof handle.i18n>) {
  return z
    .object({
      thresholds: z.object({
        scoreReviewThreshold: z.coerce
          .number({
            required_error: t(
              'scenarios:validation.decision.score_review_threshold_required',
            ),
          })
          .int(),
        scoreDeclineThreshold: z.coerce
          .number({
            required_error: t(
              'scenarios:validation.decision.score_decline_threshold_required',
            ),
          })
          .int(),
      }),
    })
    .refine(
      ({ thresholds: { scoreReviewThreshold, scoreDeclineThreshold } }) => {
        return scoreDeclineThreshold >= scoreReviewThreshold;
      },
      {
        message: t(
          'scenarios:validation.decision.score_reject_review_thresholds_missmatch',
        ),
        path: ['thresholds'],
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
    const { thresholds } = submission.value;
    await scenario.updateScenarioIteration(iterationId, thresholds);

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
        <ScoreThresholdsForm />
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function ScoreThresholdsForm() {
  const { t } = useTranslation(handle.i18n);
  const { scoreDeclineThreshold, scoreReviewThreshold } =
    useCurrentScenarioIteration();

  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const lastResult = useActionData<typeof action>();
  const editorMode = useEditorMode();

  const schema = React.useMemo(() => getFormSchema(t), [t]);

  const [form, fields] = useForm({
    shouldValidate: 'onInput',
    defaultValue: {
      thresholds: {
        scoreReviewThreshold,
        scoreDeclineThreshold,
      },
    },
    lastResult,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });
  const disabled = editorMode === 'view';

  const serverErrors = R.pipe(
    scenarioValidation.decision.errors,
    R.filter((error) => !conflictingWithSchemaValidationErrors.includes(error)),
    R.map(getScenarioErrorMessage),
  );
  const evaluationErrors = R.pipe(
    [...(fields.thresholds.errors ?? []), ...serverErrors],
    R.filter(R.isString),
  );

  const thresholds = fields.thresholds.getFieldset();

  return (
    <FormProvider context={form.context}>
      <Form
        className="flex flex-col gap-2"
        method="POST"
        {...getFormProps(form)}
      >
        <div className="grid grid-cols-[min-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
          <Outcome border="square" size="big" outcome="approve" />
          <FormField
            name={thresholds.scoreReviewThreshold.name}
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
                  <FormInput
                    type="number"
                    className="relative w-fit"
                    disabled={disabled}
                  />
                ),
              }}
              shouldUnescape
            />
            <FormErrorOrDescription errorClassName={style.errorMessage} />
          </FormField>

          <Outcome border="square" size="big" outcome="review" />
          {t('scenarios:decision.score_based.review_condition', {
            replace: {
              reviewThreshold:
                thresholds.scoreReviewThreshold.value ?? scoreReviewThreshold,
              declineThreshold:
                thresholds.scoreDeclineThreshold.value ?? scoreDeclineThreshold,
            },
          })}

          <Outcome border="square" size="big" outcome="decline" />
          <FormField
            name={thresholds.scoreDeclineThreshold.name}
            className="flex flex-row flex-wrap items-center gap-1 lg:gap-2"
          >
            <FormLabel className="sr-only">
              {t('scenarios:decision.score_based.score_reject_threshold')}
            </FormLabel>
            <Trans
              t={t}
              i18nKey="scenarios:decision.score_based.decline_condition"
              components={{
                DeclineThreshold: (
                  <FormInput
                    type="number"
                    className="relative w-fit"
                    disabled={disabled}
                  />
                ),
              }}
              shouldUnescape
            />
            <FormErrorOrDescription errorClassName={style.errorMessage} />
          </FormField>
        </div>

        {editorMode === 'edit' ? (
          <div className="flex flex-row-reverse items-center justify-between gap-2">
            <Button type="submit">{t('common:save')}</Button>
            <EvaluationErrors errors={evaluationErrors} />
          </div>
        ) : (
          <EvaluationErrors errors={evaluationErrors} />
        )}
      </Form>
    </FormProvider>
  );
}

const style = {
  errorMessage:
    'bg-red-05 rounded px-2 py-1 h-8 flex items-center justify-center',
} as const;
