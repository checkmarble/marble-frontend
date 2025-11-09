import { Callout, OutcomeBadge } from '@app-builder/components';
import { ScoreOutcomeThresholds } from '@app-builder/components/Decisions/ScoreOutcomeThresholds';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  buildEditScoreThresholdsPayloadSchema,
  useEditScoreThresholdsMutation,
} from '@app-builder/queries/scenarios/edit-score-thresholds';
import { scenarioDecisionDocHref } from '@app-builder/services/documentation-href';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { type ScenarioValidationErrorCodeDto } from 'marble-api';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Collapsible } from 'ui-design-system';
import { useCurrentScenarioIteration, useCurrentScenarioValidation } from '../_layout';

export const handle = {
  i18n: ['common', 'scenarios', 'decisions'] as const satisfies Namespace,
};

/**
 * This is a list of validation errors comming from the backend that are handled by the form schema.
 * The form schema is responsible for displaying the error message.
 */
const conflictingWithSchemaValidationErrors: string[] = [
  'SCORE_THRESHOLDS_MISMATCH',
  'SCORE_THRESHOLD_MISSING',
] satisfies ScenarioValidationErrorCodeDto[];

export default function Decision() {
  const { t } = useTranslation(handle.i18n);

  const editorMode = useEditorMode();

  return (
    <Collapsible.Container className="bg-grey-100 max-w-3xl">
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
  const { scoreReviewThreshold, scoreBlockAndReviewThreshold, scoreDeclineThreshold } = useCurrentScenarioIteration();

  return (
    <ScoreOutcomeThresholds
      scoreReviewThreshold={scoreReviewThreshold}
      scoreBlockAndReviewThreshold={scoreBlockAndReviewThreshold}
      scoreDeclineThreshold={scoreDeclineThreshold}
    />
  );
}

function EditScoreThresholds() {
  const { t: tErrors } = useTranslation(['common', 'scenarios']);
  const { t } = useTranslation(handle.i18n);
  const iteration = useCurrentScenarioIteration();
  const revalidate = useLoaderRevalidator();

  const scenarioValidation = useCurrentScenarioValidation();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const editorMode = useEditorMode();
  const schema = React.useMemo(() => buildEditScoreThresholdsPayloadSchema(tErrors), [tErrors]);
  const editScoreThresholdsMutation = useEditScoreThresholdsMutation(iteration.id);

  const form = useForm({
    defaultValues: {
      scoreReviewThreshold: iteration.scoreReviewThreshold ?? 0,
      scoreBlockAndReviewThreshold: iteration.scoreBlockAndReviewThreshold ?? 0,
      scoreDeclineThreshold: iteration.scoreDeclineThreshold ?? 0,
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        editScoreThresholdsMutation.mutateAsync(value).then((_res) => {
          revalidate();
        });
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
    <form className="flex flex-col gap-2" onSubmit={handleSubmit(form)}>
      <div className="grid grid-cols-[max-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
        <OutcomeBadge size="md" outcome="approve" className="w-full justify-center" />
        <form.Field
          name="scoreReviewThreshold"
          validators={{
            onChange: schema.shape.scoreReviewThreshold,
            onBlur: schema.shape.scoreReviewThreshold,
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
            onChange: schema.shape.scoreBlockAndReviewThreshold,
            onBlur: schema.shape.scoreBlockAndReviewThreshold,
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
            onChange: schema.shape.scoreDeclineThreshold,
            onBlur: schema.shape.scoreDeclineThreshold,
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
  errorMessage: 'bg-red-95 rounded-sm px-2 py-1 h-8 flex items-center justify-center',
} as const;
