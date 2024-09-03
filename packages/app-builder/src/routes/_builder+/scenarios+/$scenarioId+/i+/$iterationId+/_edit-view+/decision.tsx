import {
  Callout,
  decisionsI18n,
  Outcome,
  scenarioI18n,
} from '@app-builder/components';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { scenarioDecisionDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { type Namespace, type TFunction } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import { useEffect } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible, Input } from 'ui-design-system';
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
        scoreRejectThreshold: z.coerce
          .number({
            required_error: t(
              'scenarios:validation.decision.score_reject_threshold_required',
            ),
          })
          .int(),
      }),
    })
    .refine(
      ({ thresholds: { scoreReviewThreshold, scoreRejectThreshold } }) => {
        return scoreRejectThreshold >= scoreReviewThreshold;
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
  const { authService, i18nextService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const parsedForm = await parseFormSafe(request, getFormSchema(t));
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { getSession, commitSession } = serverServices.toastSessionService;
  const session = await getSession(request);

  try {
    const iterationId = fromParams(params, 'iterationId');
    const { thresholds } = parsedForm.data;
    await scenario.updateScenarioIteration(iterationId, thresholds);

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      {
        success: true as const,
        error: null,
        values: parsedForm.data,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
        error: null,
        values: parsedForm.data,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
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
  const { scoreRejectThreshold, scoreReviewThreshold } =
    useCurrentScenarioIteration();

  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const editorMode = useEditorMode();

  const submit = useSubmit();
  const formMethods = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      thresholds: {
        scoreReviewThreshold: 0,
        scoreRejectThreshold: 0,
      },
    },
    values: {
      thresholds: {
        scoreReviewThreshold: scoreReviewThreshold ?? 0,
        scoreRejectThreshold: scoreRejectThreshold ?? 0,
      },
    },
    disabled: editorMode === 'view',
  });
  const {
    control,
    trigger,
    watch,
    formState: { errors },
  } = formMethods;

  const thresholds = watch('thresholds');
  useEffect(() => {
    void trigger();
  }, [
    thresholds.scoreRejectThreshold,
    thresholds.scoreReviewThreshold,
    trigger,
  ]);

  const thresholdsError = errors.thresholds?.root?.message;
  const serverErrors = R.pipe(
    scenarioValidation.decision.errors,
    R.filter((error) => !conflictingWithSchemaValidationErrors.includes(error)),
    R.map(getScenarioErrorMessage),
  );
  const evaluationErrors = R.pipe(
    [thresholdsError, ...serverErrors],
    R.filter(R.isString),
  );

  return (
    <Form
      control={control}
      onSubmit={({ formData }): void => {
        submit(formData, { method: 'POST' });
      }}
      className="flex flex-col gap-2"
    >
      <FormProvider {...formMethods}>
        <div className="grid grid-cols-[min-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
          <Outcome border="square" size="big" outcome="approve" />
          <FormField
            control={control}
            name="thresholds.scoreReviewThreshold"
            render={({ field }) => (
              <FormItem className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
                <FormLabel className="sr-only">
                  {t('scenarios:decision.score_based.score_review_threshold')}
                </FormLabel>
                <FormControl>
                  <Trans
                    t={t}
                    i18nKey="scenarios:decision.score_based.approve_condition"
                    components={{
                      ReviewThreshold: (
                        <Input
                          type="number"
                          className="relative w-fit"
                          {...field}
                        />
                      ),
                    }}
                    shouldUnescape
                  />
                </FormControl>
                <FormError className={style.errorMessage} />
              </FormItem>
            )}
          />

          <Outcome border="square" size="big" outcome="review" />
          {t('scenarios:decision.score_based.review_condition', {
            replace: {
              reviewThreshold:
                thresholds.scoreReviewThreshold ?? scoreReviewThreshold,
              rejectThreshold:
                thresholds.scoreRejectThreshold ?? scoreRejectThreshold,
            },
          })}

          <Outcome border="square" size="big" outcome="decline" />
          <FormField
            control={control}
            name="thresholds.scoreRejectThreshold"
            render={({ field }) => (
              <FormItem className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
                <FormLabel className="sr-only">
                  {t('scenarios:decision.score_based.score_reject_threshold')}
                </FormLabel>
                <FormControl>
                  <Trans
                    t={t}
                    i18nKey="scenarios:decision.score_based.decline_condition"
                    components={{
                      RejectThreshold: (
                        <Input
                          type="number"
                          className="relative w-fit"
                          {...field}
                        />
                      ),
                    }}
                  />
                </FormControl>
                <FormError className={style.errorMessage} />
              </FormItem>
            )}
          />
        </div>

        {editorMode === 'edit' ? (
          <div className="flex flex-row-reverse items-center justify-between gap-2">
            <Button type="submit">{t('common:save')}</Button>
            <EvaluationErrors errors={evaluationErrors} />
          </div>
        ) : (
          <EvaluationErrors errors={evaluationErrors} />
        )}
      </FormProvider>
    </Form>
  );
}

const style = {
  errorMessage:
    'bg-red-05 rounded px-2 py-1 h-8 flex items-center justify-center',
} as const;
