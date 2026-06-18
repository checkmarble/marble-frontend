import { Page, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import { DeleteScreeningRule } from '@app-builder/components/Scenario/Screening/Actions/DeleteScreeningRule';
import { FieldAstFormula } from '@app-builder/components/Scenario/Screening/FieldAstFormula';
import { FieldDataset } from '@app-builder/components/Scenario/Screening/FieldDataset';
import { FieldEntityType } from '@app-builder/components/Scenario/Screening/FieldEntityType';
import { FieldNode } from '@app-builder/components/Scenario/Screening/FieldNode';
import { FieldNodeConcat } from '@app-builder/components/Scenario/Screening/FieldNodeConcat';
import { FieldOutcomes } from '@app-builder/components/Scenario/Screening/FieldOutcomes';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Screening/FieldRuleGroup';
import { FieldSkipIfUnder } from '@app-builder/components/Scenario/Screening/FieldSkipIfUnder';
import { FieldToolTip } from '@app-builder/components/Scenario/Screening/FieldToolTip';
import { ScreeningTermIgnoreList } from '@app-builder/components/Scenario/Screening/ScreeningTermIgnoreList';
import { ScreeningThreshold } from '@app-builder/components/ScreeningThreshold';
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import {
  useDerivedIterationRuleGroupsData,
  useDetectionScenarioData,
  useDetectionScenarioIterationData,
} from '@app-builder/hooks/routes-layout-data';
import useIntersection from '@app-builder/hooks/useIntersection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { NewUndefinedAstNode } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { knownOutcomes, ScreeningOutcome } from '@app-builder/models/outcome';
import { getBuilderOptionsFn } from '@app-builder/server-fns/scenarios';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { isAccessible } from '@app-builder/services/feature-access';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import {
  collectScreeningValidationIssues,
  findScreeningValidation,
  hasScreeningErrors,
} from '@app-builder/services/validation/scenario-validation';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import {
  collectFormValidationIssues,
  getScreeningQueryFieldLabel,
  hasRequiredScreeningCriteria,
  issueDedupeKey,
  mergeScreeningValidationIssues,
  screeningFieldHasError,
  screeningSectionHasError,
} from '@app-builder/utils/screening-form-validation';
import { fromSUUIDtoUUID, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { pick } from 'radash';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const searchParamsSchema = z.object({ isNew: z.boolean().optional() });
const screeningLoaderDataSchema = z.object({
  scenarioId: z.string().transform((shortId) => fromSUUIDtoUUID(shortId)),
  screeningId: z.string().transform((shortId) => fromSUUIDtoUUID(shortId)),
});

const screeningLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(screeningLoaderDataSchema)
  .handler(async function screeningLoader({ data, context }) {
    const { entitlements, screening } = context.authInfo;

    const [{ sections }, builderOptions] = await Promise.all([
      screening.listDatasets(),
      getBuilderOptionsFn({ data: { scenarioId: data.scenarioId } }),
    ]);

    return {
      screeningId: data.screeningId,
      sections,
      entitlements,
      builderOptions,
    };
  });

const editScreeningFormSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  datasets: protectArray(z.array(z.string())),
  threshold: z.number().optional(),
  forcedOutcome: z.enum(['review', 'decline', 'block_and_review']),
  triggerRule: z.any(),
  entityType: z.enum(['Person', 'Organization', 'Vehicle', 'Thing']).optional(),
  query: z.record(z.string(), z.any()),
  counterPartyId: z.any().nullish(),
  preprocessing: z
    .object({
      useNer: z.boolean().optional(),
      nerIgnoreClassification: z.boolean().optional(),
      skipIfUnder: z.number().nullish(),
      removeNumbers: z.boolean().optional(),
      blacklistListId: z.string().nullish(),
    })
    .optional(),
});

type EditScreeningForm = z.infer<typeof editScreeningFormSchema>;

const clearQuery = (
  entityType: EditScreeningForm['entityType'],
  query: Record<string, unknown>,
): Record<string, unknown> => (entityType ? pick(query, SEARCH_ENTITIES[entityType].fields) : query);

const editScreeningConfigurationSchema = z.object({
  params: z.object({
    scenarioId: z.string(),
    iterationId: z.string(),
    screeningId: z.string(),
  }),
  payload: editScreeningFormSchema,
});

const editScreeningAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editScreeningConfigurationSchema)
  .handler(async function editScreeningAction({ context, data: { params, payload } }) {
    const { scenarioIterationScreeningRepository } = context.authInfo;

    return scenarioIterationScreeningRepository.updateScreeningConfig({
      iterationId: params.iterationId,
      screeningId: params.screeningId,
      changes: {
        ...payload,
        counterPartyId: payload.counterPartyId ?? NewUndefinedAstNode(),
        query: clearQuery(payload.entityType, payload.query) as Partial<{
          [key: string]: import('@app-builder/models').AstNode;
        }>,
        preprocessing: {
          ...payload.preprocessing,
          useNer: payload.entityType === 'Thing' ? payload.preprocessing?.useNer : undefined,
          nerIgnoreClassification: payload.preprocessing?.useNer
            ? payload.preprocessing?.nerIgnoreClassification
            : undefined,
          skipIfUnder: payload.preprocessing?.skipIfUnder ?? undefined,
          blacklistListId: payload.preprocessing?.blacklistListId ?? undefined,
        },
      } as any,
    });
  });

export const Route = createFileRoute(
  '/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/screenings/$screeningId',
)({
  validateSearch: searchParamsSchema,
  loader: ({ params }) => {
    return screeningLoader({ data: params });
  },
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        const scenarioId = useParam('scenarioId');
        const iterationId = useParam('iterationId');

        return (
          <BreadCrumbLink
            isLast={isLast}
            to="/detection/scenarios/$scenarioId/i/$iterationId/rules"
            params={{ scenarioId: fromUUIDtoSUUID(scenarioId), iterationId: fromUUIDtoSUUID(iterationId) }}
          >
            {t('navigation:scenario.rules')}
          </BreadCrumbLink>
        );
      },
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['common']);
        const { scenarioIteration } = useDetectionScenarioIterationData();
        const editorMode = useEditorMode();
        const configId = useParam('screeningId');

        return (
          <div className="flex items-center gap-sm">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId/i/$iterationId/screenings/$screeningId"
              params={{
                scenarioId: fromUUIDtoSUUID(scenarioIteration.scenarioId),
                iterationId: fromUUIDtoSUUID(scenarioIteration.id),
                screeningId: fromUUIDtoSUUID(configId),
              }}
            >
              {scenarioIteration.screeningConfigs.find((c) => c.id === configId)?.name ?? t('common:no_name')}
            </BreadCrumbLink>
            {editorMode === 'edit' ? <Tag size="big">{t('common:edit')}</Tag> : null}
          </div>
        );
      },
    ],
  },
  component: ScreeningDetail,
});

function ScreeningDetail() {
  const { t } = useTranslation([...scenarioI18n, 'common', 'decisions']);
  const router = useRouter();
  const { isNew = false } = Route.useSearch();
  const { entitlements, screeningId, builderOptions } = Route.useLoaderData();
  const editor = useEditorMode();

  const { currentScenario: scenario } = useDetectionScenarioData();
  const ruleGroups = useDerivedIterationRuleGroupsData();
  const {
    scenarioIteration: { id: iterationId, screeningConfigs },
    scenarioValidation,
  } = useDetectionScenarioIterationData();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const rulesRoute = router.buildLocation({
    to: '/detection/scenarios/$scenarioId/i/$iterationId/rules',
    params: {
      scenarioId: fromUUIDtoSUUID(scenario.id),
      iterationId: fromUUIDtoSUUID(iterationId),
    },
  });

  const mutation = useMutation({
    mutationFn: (value: EditScreeningForm) =>
      editScreeningAction({ data: { params: { scenarioId: scenario.id, iterationId, screeningId }, payload: value } }),
  });

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { org } = useOrganizationDetails();
  const screeningConfig = screeningConfigs.find((c) => c.id === screeningId);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });
  const revalidate = useLoaderRevalidator();
  // Initialize hasBeenSaved based on whether this is a newly created screening
  // New screenings (isNew query param) start with hasBeenSaved=false
  // Existing screenings start with hasBeenSaved=true
  const [hasBeenSaved, setHasBeenSaved] = useState(!isNew);

  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const screeningValidationIndex = useMemo(
    () => screeningConfigs.findIndex((c) => c.id === screeningId).toString(),
    [screeningConfigs, screeningId],
  );

  const screeningValidation = useMemo(
    () => findScreeningValidation(scenarioValidation, screeningValidationIndex),
    [scenarioValidation, screeningValidationIndex],
  );

  useEffect(() => {
    if (isNew && editor === 'edit') {
      nameInputRef.current?.focus();
    }
  }, []);

  const form = useForm({
    onSubmit: async ({ value }) => {
      const submitValidationOptions = {
        ignoreLegacyAggregateQuery: true,
        formQuery: value.query ?? {},
        entityType: value.entityType,
      };
      const formIssues = collectFormValidationIssues(value, editScreeningFormSchema, t);
      const serverIssues = hasScreeningErrors(screeningValidation, submitValidationOptions)
        ? collectScreeningValidationIssues(
            screeningValidation,
            getScenarioErrorMessage,
            screeningValidationLabels,
            submitValidationOptions,
          )
        : [];
      // Server trigger/counterparty validation reflects persisted state, not the current draft.
      // Both fields are edited locally (and aren't validated by the zod schema), so stale server
      // errors must not block submit — saving triggers server re-validation. They remain in the
      // display memos for the summary/highlight.
      const blockingServerIssues = serverIssues.filter(
        (issue) =>
          !(
            issue.source.type === 'section' &&
            (issue.source.section === 'trigger' || issue.source.section === 'counterparty')
          ),
      );
      const allIssues = mergeScreeningValidationIssues(formIssues, blockingServerIssues);

      if (allIssues.length > 0) {
        setShowValidationSummary(true);
        return;
      }
      if (form.state.isValid) {
        mutation
          // leave threshold undefined if it is the same as the organization threshold
          .mutateAsync({ ...value, threshold: value.threshold === org.sanctionThreshold ? undefined : value.threshold })
          .then(() => {
            setHasBeenSaved(true);
            toast.success(t('common:success.save'));
            revalidate();
            // TODO: wait for second thought, we might not need to navigate back to the rules list
            // router.navigate({
            //   to: '/detection/scenarios/$scenarioId/i/$iterationId/rules',
            //   params: { scenarioId: fromUUIDtoSUUID(scenario.id), iterationId: fromUUIDtoSUUID(iterationId) },
            // });
          })
          .catch(() => {
            toast.error(t('common:errors.unknown'));
          });
      }
    },
    validators: {
      onSubmit: editScreeningFormSchema,
    },
    defaultValues: {
      id: screeningConfig?.id,
      name: screeningConfig?.name ?? '',
      description: screeningConfig?.description ?? '',
      ruleGroup: screeningConfig?.ruleGroup ?? 'Screening',
      datasets: screeningConfig?.datasets ?? [],
      threshold: screeningConfig?.threshold ?? org.sanctionThreshold ?? 70,
      forcedOutcome: (screeningConfig?.forcedOutcome as ScreeningOutcome) ?? 'block_and_review',
      triggerRule: screeningConfig?.triggerRule,
      entityType: screeningConfig?.entityType,
      query: screeningConfig?.query,
      counterPartyId: screeningConfig?.counterPartyId,
      preprocessing: screeningConfig?.preprocessing,
    } as EditScreeningForm,
  });

  const formValues = useStore(form.store, (state) => state.values);
  const entityType = formValues.entityType;
  const query = formValues.query;
  const useNerEnabled = formValues.preprocessing?.useNer === true;

  const hasRequiredFields = hasRequiredScreeningCriteria(entityType, query);

  const screeningValidationOptions = useMemo(
    () => ({
      ignoreLegacyAggregateQuery: true,
      formQuery: query ?? {},
      entityType,
    }),
    [query, entityType],
  );

  const screeningValidationLabels = useMemo(
    () => ({
      trigger: t('scenarios:edit_sanction.trigger_title'),
      counterparty: t('scenarios:sanction_counterparty_id'),
      matchCriteria: t('scenarios:sanction.match_settings.title'),
      queryField: (fieldKey: string) => getScreeningQueryFieldLabel(fieldKey, t),
    }),
    [t],
  );

  const serverValidationIssues = useMemo(() => {
    if (!showValidationSummary) {
      return [];
    }
    if (!hasScreeningErrors(screeningValidation, screeningValidationOptions)) {
      return [];
    }
    return collectScreeningValidationIssues(
      screeningValidation,
      getScenarioErrorMessage,
      screeningValidationLabels,
      screeningValidationOptions,
    );
  }, [
    showValidationSummary,
    screeningValidation,
    getScenarioErrorMessage,
    screeningValidationLabels,
    screeningValidationOptions,
  ]);

  const formValidationIssues = useMemo(() => {
    if (!showValidationSummary) {
      return [];
    }
    return collectFormValidationIssues(formValues, editScreeningFormSchema, t);
  }, [showValidationSummary, formValues, t]);

  const validationIssues = useMemo(
    () => mergeScreeningValidationIssues(formValidationIssues, serverValidationIssues),
    [formValidationIssues, serverValidationIssues],
  );

  const highlight = useMemo(
    () => ({
      name: screeningFieldHasError(validationIssues, 'name'),
      trigger: screeningSectionHasError(validationIssues, 'trigger'),
      counterparty: screeningSectionHasError(validationIssues, 'counterparty'),
      matchSettings: screeningSectionHasError(validationIssues, 'matchSettings'),
      queryField: (fieldKey: string) => screeningFieldHasError(validationIssues, `query.${fieldKey}`),
    }),
    [validationIssues],
  );

  const screeningCardClassName = (hasError: boolean, className?: string) =>
    cn(
      'bg-surface-card border-grey-border flex flex-col gap-md rounded-md border p-md',
      hasError && 'border-red-primary',
      className,
    );

  const queryFieldHighlightClassName = (fieldKey: string) =>
    cn(highlight.queryField(fieldKey) && 'rounded-sm border border-red-primary p-xs');

  useEffect(() => {
    if (showValidationSummary && formValidationIssues.length === 0 && serverValidationIssues.length === 0) {
      setShowValidationSummary(false);
    }
  }, [showValidationSummary, formValidationIssues.length, serverValidationIssues.length]);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs back={rulesRoute.href} />
      </Page.Header>
      <Page.Container ref={containerRef}>
        <Page.Content className="pt-0 lg:pt-0">
          <form className="relative flex max-w-[800px] flex-col" onSubmit={handleSubmit(form)}>
            <div className="sticky top-0 z-40 flex flex-col gap-md bg-surface-page py-sm">
              <div
                className={cn('flex h-fit items-center justify-between gap-md', {
                  'border-b-grey-border border-b': !intersection?.isIntersecting,
                })}
              >
                <form.Field
                  name="name"
                  validators={{
                    onChange: editScreeningFormSchema.shape.name,
                    onBlur: editScreeningFormSchema.shape.name,
                  }}
                >
                  {(field) => (
                    <div className="flex w-full flex-col gap-xs">
                      <input
                        ref={nameInputRef}
                        type="text"
                        name={field.name}
                        disabled={editor === 'view'}
                        defaultValue={field.state.value}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        className={cn(
                          'text-grey-primary text-l w-full border-none bg-transparent font-normal outline-hidden',
                          (field.state.meta.errors.length > 0 || highlight.name) && 'border-b border-red-primary',
                        )}
                        placeholder={t('scenarios:sanction_name_placeholder')}
                      />
                      {field.state.meta.errors.length > 0 || highlight.name ? (
                        <span className="text-xs text-red-primary">{t('scenarios:edit_screening.name_required')}</span>
                      ) : null}
                    </div>
                  )}
                </form.Field>
                {editor === 'edit' ? (
                  <div className="flex items-center gap-sm">
                    <DeleteScreeningRule iterationId={iterationId} scenarioId={scenario.id} screeningId={screeningId}>
                      <Button variant="destructive" className="w-fit" size="small">
                        <Icon icon="delete" className="size-4" aria-hidden />
                        {t('common:delete')}
                      </Button>
                    </DeleteScreeningRule>

                    <Button
                      variant="primary"
                      type="submit"
                      className="flex-1"
                      size="small"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <Icon icon="spinner" className="size-4 animate-spin" />
                      ) : (
                        <Icon icon="save" className="size-4" aria-hidden />
                      )}
                      {t('common:save')}
                    </Button>
                  </div>
                ) : null}
              </div>

              {validationIssues.length > 0 ? (
                <Callout color="red" icon="lightbulb" iconColor="red">
                  <ul className="flex flex-col gap-xs ps-md">
                    {validationIssues.map((issue) => (
                      <li key={issueDedupeKey(issue)}>{issue.message}</li>
                    ))}
                  </ul>
                </Callout>
              ) : null}
            </div>

            <div className="flex flex-col gap-xl">
              <div className="border-grey-border flex flex-col items-start gap-lg border-b lg">
                <form.Field
                  name="description"
                  validators={{
                    onChange: editScreeningFormSchema.shape.description,
                    onBlur: editScreeningFormSchema.shape.description,
                  }}
                >
                  {(field) => (
                    <div ref={descriptionRef} className="flex w-full flex-col gap-xs">
                      <textarea
                        name={field.name}
                        defaultValue={field.state.value}
                        disabled={editor === 'view'}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        className="form-textarea text-grey-secondary text-r w-full resize-none border-none bg-transparent font-medium outline-hidden"
                        placeholder={t('scenarios:sanction_description_placeholder')}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
                <form.Field
                  name="ruleGroup"
                  validators={{
                    onChange: editScreeningFormSchema.shape.ruleGroup,
                    onBlur: editScreeningFormSchema.shape.ruleGroup,
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col gap-sm">
                      <FieldRuleGroup
                        disabled
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        selectedRuleGroup={field.state.value}
                        ruleGroups={ruleGroups}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="flex flex-col gap-sm">
                <span className="text-s font-semibold">{t('scenarios:edit_sanction.global_settings')}</span>
                <div className={screeningCardClassName(highlight.trigger)}>
                  <Callout variant="outlined">
                    <span>
                      <Trans
                        t={t}
                        i18nKey="scenarios:sanction.trigger_object.callout"
                        components={{
                          DocLink: <ExternalLink href="https://docs.checkmarble.com/docs/getting-started" />,
                        }}
                      />
                    </span>
                  </Callout>
                  <form.Field
                    name="triggerRule"
                    validators={{
                      onChange: editScreeningFormSchema.shape.triggerRule,
                      onBlur: editScreeningFormSchema.shape.triggerRule,
                    }}
                  >
                    {(field) => (
                      <FieldAstFormula
                        type="screening"
                        scenarioId={scenario.id}
                        options={builderOptions}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        astNode={field.state.value}
                        defaultValue={NewUndefinedAstNode()}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="bg-surface-card border-grey-border flex flex-col gap-sm rounded-md border p-md">
                  <form.Field
                    name="threshold"
                    validators={{
                      onChange: editScreeningFormSchema.shape.threshold,
                      onBlur: editScreeningFormSchema.shape.threshold,
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col gap-xs">
                        <ScreeningThreshold
                          threshold={field.state.value}
                          onChange={(value) => form.setFieldValue(field.name, value)}
                          title={t('scenarios:edit_sanction.consideration_matchings')}
                          disabled={editor === 'view'}
                        />

                        <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                      </div>
                    )}
                  </form.Field>

                  <div className="flex items-center gap-sm">
                    <span className="text-s">{t('scenarios:sanction_forced_outcome_heading')}</span>
                    <form.Field name="forcedOutcome">
                      {(field) => (
                        <div className="flex flex-col gap-xs">
                          <FieldOutcomes
                            disabled={editor === 'view'}
                            name={field.name}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            selectedOutcome={field.state.value}
                            outcomes={R.difference(knownOutcomes, ['approve']) as ScreeningOutcome[]}
                          />
                          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                        </div>
                      )}
                    </form.Field>
                    <span className="text-s">{t('scenarios:sanction_forced_outcome_suffix')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-sm">
                <span className="text-s inline-flex items-center gap-sm font-semibold">
                  {t('scenarios:sanction_counterparty_id')}
                  <FieldToolTip>{t('scenarios:sanction_counterparty_id.tooltip')}</FieldToolTip>
                </span>
                <form.Field name="counterPartyId">
                  {(field) => (
                    <div className={screeningCardClassName(highlight.counterparty, 'rounded-sm')}>
                      <AstBuilder.Provider scenarioId={scenario.id} initialData={builderOptions} mode={editor}>
                        <FieldNode
                          value={field.state.value}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                          placeholder={t('scenarios:sanction_counterparty_id_placeholder')}
                        />
                      </AstBuilder.Provider>
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
              </div>

              <AstBuilder.Provider scenarioId={scenario.id} initialData={builderOptions} mode={editor}>
                <div className="flex flex-col gap-sm">
                  <span className="text-s font-semibold">{t('scenarios:sanction.match_settings.title')}</span>
                  <div className={screeningCardClassName(highlight.matchSettings, 'rounded-sm')}>
                    <Callout variant="outlined">
                      <p className="whitespace-pre-wrap">{t('scenarios:sanction.match_settings.callout')}</p>
                    </Callout>
                    <div className="flex flex-col gap-xs">
                      <span className="text-s inline-flex items-center gap-xs">
                        {t('scenarios:edit_sanction.entity_type.heading')}
                        <FieldToolTip>{t('scenarios:edit_sanction.entity_type.tooltip')}</FieldToolTip>
                      </span>
                      <form.Field name="entityType">
                        {(field) => <FieldEntityType entityType={field.state.value} onChange={field.handleChange} />}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-sm">
                      <div className="bg-surface-card border-grey-border flex flex-col gap-sm rounded-sm border p-sm">
                        <form.Field name="query.name">
                          {(field) => {
                            const value = field.state.value;
                            return (
                              <div className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('name'))}>
                                <div className="flex flex-col gap-xs">
                                  <span className="text-s inline-flex items-center gap-xs">
                                    {t('scenarios:screening.filter.name')}
                                    <FieldToolTip>{t('scenarios:screening.filter.name.tooltip')}</FieldToolTip>
                                  </span>
                                  <FieldNodeConcat
                                    viewOnly={editor === 'view'}
                                    value={value && isStringConcatAstNode(value) ? value : undefined}
                                    onChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    placeholder={t('scenarios:screening.filter.name_placeholder')}
                                    limit={5}
                                  />
                                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                </div>
                              </div>
                            );
                          }}
                        </form.Field>
                        <form.Field name="preprocessing.blacklistListId">
                          {(field) => (
                            <ScreeningTermIgnoreList
                              value={field.state.value ?? null}
                              onBlur={field.handleBlur}
                              onChange={field.handleChange}
                              editor={editor}
                              customLists={builderOptions.customLists}
                            />
                          )}
                        </form.Field>
                        <form.Field name="preprocessing.removeNumbers">
                          {(field) => (
                            <div className="flex items-center gap-sm">
                              <Switch
                                checked={field.state.value}
                                onCheckedChange={field.handleChange}
                                onBlur={field.handleBlur}
                                disabled={editor === 'view'}
                                id="exclude-numbers"
                              />
                              <label htmlFor="exclude-numbers" className="text-s">
                                {t('scenarios:edit_sanction.exclude_numbers')}
                              </label>
                              <FieldToolTip>{t('scenarios:edit_sanction.exclude_numbers.tooltip')}</FieldToolTip>
                            </div>
                          )}
                        </form.Field>
                        <form.Field name="preprocessing.skipIfUnder">
                          {(field) => (
                            <FieldSkipIfUnder
                              value={field.state.value ?? null}
                              onBlur={field.handleBlur}
                              onChange={field.handleChange}
                              editor={editor}
                              name={field.name}
                            />
                          )}
                        </form.Field>
                        {entityType === 'Thing' ? (
                          <form.Field name="preprocessing.useNer">
                            {(field) => (
                              <div className="flex items-center gap-sm">
                                <Switch
                                  checked={field.state.value}
                                  onCheckedChange={(checked) => field.handleChange(checked)}
                                  onBlur={field.handleBlur}
                                  disabled={editor === 'view' || !isAccessible(entitlements.nameRecognition)}
                                  id="enable-entity-recognition"
                                />
                                <label htmlFor="enable-entity-recognition" className="text-s">
                                  {t('scenarios:edit_sanction.enable_entity_recognition')}
                                </label>
                                <FieldToolTip>
                                  {t('scenarios:edit_sanction.enable_entity_recognition.tooltip')}
                                </FieldToolTip>
                                <span className="text-xs rounded-full bg-purple-primary px-xs py-0.5 text-grey-white">
                                  beta
                                </span>
                              </div>
                            )}
                          </form.Field>
                        ) : null}
                        {useNerEnabled ? (
                          <form.Field name="preprocessing.nerIgnoreClassification">
                            {(field) => (
                              <div className="flex items-center gap-sm ms-3xl mt-xs">
                                <Switch
                                  checked={field.state.value}
                                  onCheckedChange={(checked) => field.handleChange(checked)}
                                  onBlur={field.handleBlur}
                                  disabled={editor === 'view'}
                                />
                                <span className="text-s">{t('scenarios:edit_sanction.skip_entity_recognition')}</span>
                                <FieldToolTip>
                                  {t('scenarios:edit_sanction.skip_entity_recognition.tooltip')}
                                </FieldToolTip>
                              </div>
                            )}
                          </form.Field>
                        ) : null}
                      </div>

                      {match(entityType)
                        .with('Person', () => (
                          <>
                            <form.Field name="query.birthDate">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div
                                    className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('birthDate'))}
                                  >
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.birthdate')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.birthdate_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.nationality">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div
                                    className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('nationality'))}
                                  >
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.nationality')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.nationality_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.passportNumber">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div
                                    className={cn(
                                      'flex flex-col gap-xs',
                                      queryFieldHighlightClassName('passportNumber'),
                                    )}
                                  >
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.passport_number')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.passport_number_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.address">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('address'))}>
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.address')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.address_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                          </>
                        ))
                        .with('Organization', () => (
                          <>
                            <form.Field name="query.country">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('country'))}>
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.country')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.country_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.registrationNumber">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div
                                    className={cn(
                                      'flex flex-col gap-xs',
                                      queryFieldHighlightClassName('registrationNumber'),
                                    )}
                                  >
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.registrationnumber')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.registrationnumber_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.address">
                              {(field) => {
                                const value = field.state.value;
                                return (
                                  <div className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('address'))}>
                                    <div className="flex flex-col gap-xs">
                                      <span className="text-s inline-flex items-center gap-xs">
                                        {t('scenarios:edit_sanction.address')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={value && isStringConcatAstNode(value) ? value : undefined}
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t('scenarios:edit_sanction.address_placeholder')}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                          </>
                        ))
                        .with('Vehicle', () => (
                          <form.Field name="query.registrationNumber">
                            {(field) => {
                              const value = field.state.value;
                              return (
                                <div
                                  className={cn(
                                    'flex flex-col gap-xs',
                                    queryFieldHighlightClassName('registrationNumber'),
                                  )}
                                >
                                  <div className="flex flex-col gap-xs">
                                    <span className="text-s inline-flex items-center gap-xs">
                                      {t('scenarios:edit_sanction.registrationnumber')}
                                    </span>
                                    <FieldNodeConcat
                                      viewOnly={editor === 'view'}
                                      value={value && isStringConcatAstNode(value) ? value : undefined}
                                      onChange={field.handleChange}
                                      onBlur={field.handleBlur}
                                      placeholder={t('scenarios:edit_sanction.registrationnumber_placeholder')}
                                      limit={5}
                                    />
                                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                                  </div>
                                </div>
                              );
                            }}
                          </form.Field>
                        ))
                        .otherwise(() => null)}
                    </div>

                    {!hasRequiredFields && (
                      <Callout icon="warning" color="yellow">
                        {t('scenarios:edit_sanction.required_fields_disclaimer')}
                      </Callout>
                    )}
                    {!hasRequiredFields && hasBeenSaved && (
                      <EvaluationErrors errors={[t('scenarios:edit_sanction.required_fields_error')]} />
                    )}
                  </div>
                </div>
              </AstBuilder.Provider>

              <form.Field name="datasets">
                {(field) => (
                  <FieldDataset value={field.state.value} onChange={field.handleChange} readOnly={editor === 'view'} />
                )}
              </form.Field>
            </div>
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
