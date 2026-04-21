import { Callout, decisionsI18n, OutcomeBadge, scenarioI18n } from '@app-builder/components';
import { ScoreOutcomeThresholds } from '@app-builder/components/Decisions/ScoreOutcomeThresholds';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { useDetectionScenarioIterationData } from '@app-builder/hooks/routes-layout-data';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { scenarioDecisionDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getFieldErrors } from '@app-builder/utils/form';
import { fromParams } from '@app-builder/utils/short-uuid';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { type TFunction } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as React from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible } from 'ui-design-system';
import * as z from 'zod/v4';

const MAX_THRESHOLD = 10000;

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
    .superRefine(({ scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold }, ctx) => {
      if (scoreBlockAndReviewThreshold < scoreReviewThreshold) {
        ctx.issues.push({
          code: 'custom',
          path: ['scoreBlockAndReviewThreshold'],
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: scoreReviewThreshold },
          }),
          input: '',
        });
      }
      if (scoreDeclineThreshold < scoreBlockAndReviewThreshold) {
        ctx.issues.push({
          code: 'custom',
          path: ['scoreDeclineThreshold'],
          message: t('scenarios:validation.decision.score_threshold_min', {
            replace: { min: scoreBlockAndReviewThreshold },
          }),
          input: '',
        });
      }
    });
}

const handle = {
  i18n: [...decisionsI18n, ...scenarioI18n, 'common'] as const,
};

type SaveDecisionResult = { status: 'success' | 'error'; errors: any };

const saveDecisionInputSchema = z.object({
  params: z.record(z.string(), z.string()),
  scoreReviewThreshold: z.number(),
  scoreBlockAndReviewThreshold: z.number(),
  scoreDeclineThreshold: z.number(),
});

const saveDecisionAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input) => saveDecisionInputSchema.parse(input))
  .handler(async function saveDecisionAction({ context, data }): Promise<SaveDecisionResult> {
    const request = getRequest();
    const { i18nextService } = context.services;
    const { scenario } = context.authInfo;

    const t = await i18nextService.getFixedT(request, ['common', 'scenarios']);
    const { params, scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold } = data;

    const result = getFormSchema(t).safeParse({
      scoreReviewThreshold,
      scoreBlockAndReviewThreshold,
      scoreDeclineThreshold,
    });

    if (!result.success) {
      return { status: 'error' as const, errors: z.treeifyError(result.error) };
    }

    try {
      const iterationId = fromParams(params, 'iterationId');
      await scenario.updateScenarioIteration(iterationId, result.data);

      return { status: 'success' as const, errors: [] };
    } catch (_error) {
      return { status: 'error' as const, errors: [] };
    }
  });

export const Route = createFileRoute(
  '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/_edit-view/decision',
)({
  component: Decision,
});

function Decision() {
  const { t } = useTranslation(handle.i18n);

  const editorMode = useEditorMode();

  return (
    <Collapsible.Container className="bg-surface-card max-w-3xl">
      <Collapsible.Title>{t('scenarios:decision.score_based.title')}</Collapsible.Title>
      <Collapsible.Content>
        <Callout variant="outlined" className="mb-4 lg:mb-6">
          <p className="whitespace-pre-wrap">
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
  const {
    scenarioIteration: { scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold },
  } = useDetectionScenarioIterationData();

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
  const params = Route.useParams();
  const { scenarioIteration, scenarioValidation } = useDetectionScenarioIterationData();

  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const mutation = useMutation({
    mutationFn: (value: z.infer<ReturnType<typeof getFormSchema>>) => {
      return saveDecisionAction({ data: { params, ...value } });
    },
    onSuccess: (result) => {
      if (result.status === 'success') {
        toast.success(t('common:success.save'));
        return;
      }
      toast.error(t('common:errors.unknown'));
    },
    onError: () => {
      toast.error(t('common:errors.unknown'));
    },
  });

  const editorMode = useEditorMode();

  const schema = React.useMemo(() => getFormSchema(t), [t]);
  const fieldValidators = React.useMemo(() => {
    return {
      scoreReviewThreshold: z
        .number({ message: t('scenarios:validation.decision.score_threshold_missing') })
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
      scoreBlockAndReviewThreshold: z
        .number({ message: t('scenarios:validation.decision.score_threshold_missing') })
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
      scoreDeclineThreshold: z
        .number({ message: t('scenarios:validation.decision.score_threshold_missing') })
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
    } as const;
  }, [t]);

  const form = useForm({
    defaultValues: {
      scoreReviewThreshold: scenarioIteration.scoreReviewThreshold ?? 0,
      scoreBlockAndReviewThreshold: scenarioIteration.scoreBlockAndReviewThreshold ?? 0,
      scoreDeclineThreshold: scenarioIteration.scoreDeclineThreshold ?? 0,
    } as z.infer<typeof schema>,
    validators: {
      onSubmit: schema as unknown as any,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        mutation.mutate(value);
      }
    },
  });

  const scoreReviewThreshold = useStore(form.store, (store) => store.values.scoreReviewThreshold);
  const scoreBlockAndReviewThreshold = useStore(form.store, (store) => store.values.scoreBlockAndReviewThreshold);
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
            onChange: fieldValidators.scoreReviewThreshold,
            onBlur: fieldValidators.scoreReviewThreshold,
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
            onChange: fieldValidators.scoreBlockAndReviewThreshold,
            onBlur: fieldValidators.scoreBlockAndReviewThreshold,
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
            onChange: fieldValidators.scoreDeclineThreshold,
            onBlur: fieldValidators.scoreDeclineThreshold,
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
          <Button variant="primary" type="submit">
            {t('common:save')}
          </Button>
          <EvaluationErrors errors={serverErrors} />
        </div>
      ) : (
        <EvaluationErrors errors={serverErrors} />
      )}
    </form>
  );
}

const style = {
  errorMessage: 'bg-red-background rounded-sm px-2 py-1 h-8 flex items-center justify-center',
} as const;
