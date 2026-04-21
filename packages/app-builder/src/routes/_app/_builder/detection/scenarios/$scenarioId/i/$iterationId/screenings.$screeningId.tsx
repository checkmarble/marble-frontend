import { Callout, Page, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
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
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
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
import { type BuilderOptionsResource } from '@app-builder/server-fns/scenarios';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { isAccessible, isContinuousScreeningAvailable } from '@app-builder/services/feature-access';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { protectArray } from '@app-builder/utils/schema/helpers/array';
import { fromSUUIDtoUUID, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { pick } from 'radash';
import { useRef, useState } from 'react';
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
    const { customListsRepository, editor, dataModelRepository, screening, continuousScreening, entitlements } =
      context.authInfo;

    const [{ databaseAccessors, payloadAccessors }, dataModel, customLists, { sections }, screeningConfigs] =
      await Promise.all([
        editor.listAccessors({ scenarioId: data.scenarioId }),
        dataModelRepository.getDataModel(),
        customListsRepository.listCustomLists(),
        screening.listDatasets(),
        isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
      ]);

    return {
      databaseAccessors,
      payloadAccessors,
      dataModel,
      customLists,
      sections,
      entitlements,
      screeningConfigs,
      screeningId: data.screeningId,
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
          <div className="flex items-center gap-2">
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
  const {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    sections,
    entitlements,
    screeningConfigs: continuousScreeningConfigs,
    screeningId,
  } = Route.useLoaderData();
  const editor = useEditorMode();

  const { currentScenario: scenario } = useDetectionScenarioData();
  const ruleGroups = useDerivedIterationRuleGroupsData();
  const {
    scenarioIteration: { id: iterationId, screeningConfigs },
  } = useDetectionScenarioIterationData();
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

  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { org } = useOrganizationDetails();
  const screeningConfig = screeningConfigs.find((c) => c.id === screeningId);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  // Initialize hasBeenSaved based on whether this is a newly created screening
  // New screenings (isNew query param) start with hasBeenSaved=false
  // Existing screenings start with hasBeenSaved=true
  const [hasBeenSaved, setHasBeenSaved] = useState(!isNew);

  const form = useForm({
    onSubmit: async ({ value, formApi }) => {
      if (formApi.state.isValid) {
        try {
          await mutation.mutateAsync(value);
          setHasBeenSaved(true);
          toast.success(t('common:success.save'));
        } catch {
          toast.error(t('common:errors.unknown'));
        }
      }
    },
    validators: {
      onSubmit: editScreeningFormSchema,
    },
    defaultValues: {
      id: screeningConfig?.id,
      name: screeningConfig?.name ?? 'Screening',
      description: screeningConfig?.description ?? '',
      ruleGroup: screeningConfig?.ruleGroup ?? 'Screening',
      datasets: screeningConfig?.datasets ?? [],
      threshold: screeningConfig?.threshold,
      forcedOutcome: (screeningConfig?.forcedOutcome as ScreeningOutcome) ?? 'block_and_review',
      triggerRule: screeningConfig?.triggerRule,
      entityType: screeningConfig?.entityType,
      query: screeningConfig?.query,
      counterPartyId: screeningConfig?.counterPartyId,
      preprocessing: screeningConfig?.preprocessing,
    } as EditScreeningForm,
  });

  const options: BuilderOptionsResource = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
    hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
    screeningConfigs: continuousScreeningConfigs,
  };

  const entityType = useStore(form.store, (state) => state.values.entityType);
  const query = useStore(form.store, (state) => state.values.query);
  const useNerEnabled = useStore(form.store, (state) => state.values.preprocessing?.useNer === true);

  const hasRequiredFields = match(entityType)
    .with('Organization', () => Boolean(query['name'] || query['registrationNumber']))
    .with('Vehicle', () => Boolean(query['name'] || query['registrationNumber']))
    .with('Person', () => Boolean(query['name'] || query['passportNumber']))
    .with('Thing', () => query['name'])
    .otherwise(() => true);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs back={rulesRoute.href} />
      </Page.Header>
      <Page.Container ref={containerRef}>
        <Page.Content className="pt-0 lg:pt-0">
          <form className="relative flex max-w-[800px] flex-col" onSubmit={handleSubmit(form)}>
            <div
              className={cn('bg-surface-page sticky top-0 z-40 flex h-[88px] items-center justify-between gap-4', {
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
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name={field.name}
                      disabled={editor === 'view'}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      className="text-grey-primary text-l w-full border-none bg-transparent font-normal outline-hidden"
                      placeholder={t('scenarios:sanction_name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              {editor === 'edit' ? (
                <div className="flex items-center gap-2">
                  <DeleteScreeningRule iterationId={iterationId} scenarioId={scenario.id} screeningId={screeningId}>
                    <Button variant="destructive" className="w-fit" size="small">
                      <Icon icon="delete" className="size-4" aria-hidden />
                      {t('common:delete')}
                    </Button>
                  </DeleteScreeningRule>

                  <form.Subscribe selector={(state) => [state.canSubmit]}>
                    {([canSubmit]) => (
                      <Button
                        variant="primary"
                        type="submit"
                        className="flex-1"
                        size="small"
                        disabled={!canSubmit || mutation.isPending}
                      >
                        {mutation.isPending ? (
                          <Icon icon="spinner" className="size-4 animate-spin" />
                        ) : (
                          <Icon icon="save" className="size-4" aria-hidden />
                        )}
                        {t('common:save')}
                      </Button>
                    )}
                  </form.Subscribe>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-8">
              <div className="border-grey-border flex flex-col items-start gap-6 border-b pb-6">
                <form.Field
                  name="description"
                  validators={{
                    onChange: editScreeningFormSchema.shape.description,
                    onBlur: editScreeningFormSchema.shape.description,
                  }}
                >
                  {(field) => (
                    <div ref={descriptionRef} className="flex w-full flex-col gap-1">
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
                    <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-2">
                <span className="text-s font-semibold">{t('scenarios:edit_sanction.global_settings')}</span>
                <div className="bg-surface-card border-grey-border flex flex-col gap-4 rounded-md border p-4">
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
                        options={options}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        astNode={field.state.value}
                        defaultValue={NewUndefinedAstNode()}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="bg-surface-card border-grey-border flex flex-col gap-2 rounded-md border p-4">
                  <div className="text-s flex items-center">
                    {t('scenarios:edit_sanction.consideration_matchings')}
                    <form.Field
                      name="threshold"
                      validators={{
                        onChange: editScreeningFormSchema.shape.threshold,
                        onBlur: editScreeningFormSchema.shape.threshold,
                      }}
                    >
                      {(field) => (
                        <div className="flex flex-col gap-1">
                          <FormInput
                            type="number"
                            name={field.name}
                            onBlur={field.handleBlur}
                            min={50}
                            max={100}
                            disabled={editor === 'view'}
                            className="z-0 ml-2 mr-1 w-14 py-1.5"
                            defaultValue={field.state.value}
                            onChange={(e) => field.handleChange(+e.currentTarget.value)}
                            valid={field.state.meta.errors?.length === 0}
                          />
                          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                        </div>
                      )}
                    </form.Field>
                    <Trans
                      t={t}
                      i18nKey="scenarios:edit_sanction.default_value"
                      components={{ Style: <span className="m-1 font-semibold" /> }}
                      values={{ threshold: org.sanctionThreshold }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-s">{t('scenarios:sanction_forced_outcome_heading')}</span>
                    <form.Field name="forcedOutcome">
                      {(field) => (
                        <div className="flex flex-col gap-1">
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

              <div className="flex flex-col gap-2">
                <span className="text-s inline-flex items-center gap-2 font-semibold">
                  {t('scenarios:sanction_counterparty_id')}
                  <FieldToolTip>{t('scenarios:sanction_counterparty_id.tooltip')}</FieldToolTip>
                </span>
                <form.Field name="counterPartyId">
                  {(field) => (
                    <div className="bg-surface-card border-grey-border flex flex-col gap-4 rounded-sm border p-4">
                      <AstBuilder.Provider scenarioId={scenario.id} initialData={options} mode={editor}>
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

              <AstBuilder.Provider scenarioId={scenario.id} initialData={options} mode={editor}>
                <div className="flex flex-col gap-2">
                  <span className="text-s font-semibold">{t('scenarios:sanction.match_settings.title')}</span>
                  <div className="bg-surface-card border-grey-border flex flex-col gap-4 rounded-sm border p-4">
                    <Callout variant="outlined">
                      <p className="whitespace-pre-wrap">{t('scenarios:sanction.match_settings.callout')}</p>
                    </Callout>
                    <div className="flex flex-col gap-1">
                      <span className="text-s inline-flex items-center gap-1">
                        {t('scenarios:edit_sanction.entity_type.heading')}
                        <FieldToolTip>{t('scenarios:edit_sanction.entity_type.tooltip')}</FieldToolTip>
                      </span>
                      <form.Field name="entityType">
                        {(field) => <FieldEntityType entityType={entityType} onChange={field.handleChange} />}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-surface-card border-grey-border flex flex-col gap-2 rounded-sm border p-2">
                        <form.Field name="query.name">
                          {(field) => {
                            const value = screeningConfig?.query?.name;
                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-col gap-1">
                                  <span className="text-s inline-flex items-center gap-1">
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
                              customLists={customLists}
                            />
                          )}
                        </form.Field>
                        <form.Field name="preprocessing.removeNumbers">
                          {(field) => (
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={field.state.value}
                                onCheckedChange={field.handleChange}
                                onBlur={field.handleBlur}
                                disabled={editor === 'view'}
                              />
                              <span className="text-s">{t('scenarios:edit_sanction.exclude_numbers')}</span>
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
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={field.state.value}
                                  onCheckedChange={(checked) => field.handleChange(checked)}
                                  onBlur={field.handleBlur}
                                  disabled={editor === 'view' || !isAccessible(entitlements.nameRecognition)}
                                />
                                <span className="text-s">{t('scenarios:edit_sanction.enable_entity_recognition')}</span>
                                <FieldToolTip>
                                  {t('scenarios:edit_sanction.enable_entity_recognition.tooltip')}
                                </FieldToolTip>
                                <span className="text-xs rounded-full bg-purple-primary px-2 py-0.5 text-grey-white">
                                  beta
                                </span>
                              </div>
                            )}
                          </form.Field>
                        ) : null}
                        {useNerEnabled ? (
                          <form.Field name="preprocessing.nerIgnoreClassification">
                            {(field) => (
                              <div className="flex items-center gap-2 ml-12 mt-1">
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
                                const value = screeningConfig?.query?.['birthDate'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['nationality'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['passportNumber'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['address'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['country'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['registrationNumber'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                                const value = screeningConfig?.query?.['address'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
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
                              const value = screeningConfig?.query?.['registrationNumber'];
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-s inline-flex items-center gap-1">
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
                  <FieldDataset
                    defaultValue={field.state.value}
                    onChange={field.handleChange}
                    onBlur={field.handleBlur}
                    sections={sections}
                  />
                )}
              </form.Field>
            </div>
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
