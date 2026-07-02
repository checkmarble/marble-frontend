import { AstBuilder } from '@app-builder/components/AstBuilder';
import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { ScreeningThreshold } from '@app-builder/components/ScreeningThreshold';
import { SEARCH_ENTITIES } from '@app-builder/constants/screening-entity';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { NewUndefinedAstNode, ScenarioValidation } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { knownOutcomes, ScreeningOutcome } from '@app-builder/models/outcome';
import { Scenario } from '@app-builder/models/scenario';
import { ScreeningConfig } from '@app-builder/models/screening-config';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import {
  collectScreeningValidationIssues,
  findScreeningValidation,
  hasScreeningErrors,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
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
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { pick } from 'radash';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { match } from 'ts-pattern';
import { Button, Card, cn, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { EvaluationErrors } from '../ScenarioValidationError';
import { DeleteScreeningRule } from '../Screening/Actions/DeleteScreeningRule';
import { FieldAstFormula } from '../Screening/FieldAstFormula';
import { FieldDataset } from '../Screening/FieldDataset';
import { FieldEntityType } from '../Screening/FieldEntityType';
import { FieldNode } from '../Screening/FieldNode';
import { FieldNodeConcat } from '../Screening/FieldNodeConcat';
import { FieldOutcomes } from '../Screening/FieldOutcomes';
import { FieldRuleGroup } from '../Screening/FieldRuleGroup';
import { FieldSkipIfUnder } from '../Screening/FieldSkipIfUnder';
import { FieldToolTip } from '../Screening/FieldToolTip';
import { ScreeningTermIgnoreList } from '../Screening/ScreeningTermIgnoreList';

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

const editScreeningConfigurationSchema = z.object({
  params: z.object({
    scenarioId: z.string(),
    iterationId: z.string(),
    screeningId: z.string(),
  }),
  payload: editScreeningFormSchema,
});

const clearQuery = (
  entityType: EditScreeningForm['entityType'],
  query: Record<string, unknown>,
): Record<string, unknown> => (entityType ? pick(query, SEARCH_ENTITIES[entityType].fields) : query);

const editScreeningAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editScreeningConfigurationSchema)
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

type ScreeningRuleEditPanelProps = {
  configs: ScreeningConfig[];
  rule: ScreeningConfig;
  scenario: Scenario;
  iterationId: string;
  ruleGroups: string[];
  scenarioValidation: ScenarioValidation;
  isNameRecognitionAvailable: boolean;
  onSuccess: (ruleId?: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

export function ScreeningRuleEditPanel({
  configs,
  rule,
  scenario,
  iterationId,
  ruleGroups,
  scenarioValidation,
  isNameRecognitionAvailable,
  onSuccess,
  onDelete,
}: ScreeningRuleEditPanelProps) {
  const { t } = useTranslation(['common', 'scenarios', 'decisions']);
  const panelSharp = PanelSharpFactory.useSharp();
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const { org } = useOrganizationDetails();

  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const screeningValidationIndex = useMemo(
    () => configs.findIndex((c) => c.id === rule.id).toString(),
    [configs, rule],
  );

  const screeningValidation = useMemo(
    () => findScreeningValidation(scenarioValidation, screeningValidationIndex),
    [scenarioValidation, screeningValidationIndex],
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

  const mutation = useMutation({
    mutationFn: (value: EditScreeningForm) =>
      editScreeningAction({
        data: { params: { scenarioId: scenario.id, iterationId, screeningId: rule.id! }, payload: value },
      }),
    onSuccess: () => {
      toast.success(t('common:success.save'));
      onSuccess();
    },
    onError: () => {
      toast.error(t('common:errors.unknown'));
    },
  });

  const nameInputRef = useRef<HTMLInputElement>(null);

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
          .mutateAsync({
            ...value,
            threshold: value.threshold === org.sanctionThreshold ? undefined : value.threshold,
          });
      }
    },
    validators: {
      onSubmit: editScreeningFormSchema,
    },
    defaultValues: {
      id: rule?.id,
      name: rule?.name ?? '',
      description: rule?.description ?? '',
      ruleGroup: rule?.ruleGroup ?? 'Screening',
      datasets: rule?.datasets ?? [],
      threshold: rule?.threshold ?? org.sanctionThreshold ?? 70,
      forcedOutcome: (rule?.forcedOutcome as ScreeningOutcome) ?? 'block_and_review',
      triggerRule: rule?.triggerRule,
      entityType: rule?.entityType,
      query: rule?.query,
      counterPartyId: rule?.counterPartyId,
      preprocessing: rule?.preprocessing,
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

  const handleRuleSubmit = async (closeOnSuccess: boolean) => {
    await form.handleSubmit();
    if (closeOnSuccess) {
      panelSharp.actions.close();
    }
  };
  const handleRuleDelete = async () => {
    await onDelete();
  };

  return (
    <form onSubmit={handleSubmit(form)}>
      <Panel.Content>
        <Panel.Header className="flex justify-between items-center">
          <div className="flex gap-sm">
            <form.Field name="name">
              {(field) => (
                <Panel.HeaderInput
                  ref={nameInputRef}
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            </form.Field>
            <form.Field name="ruleGroup">
              {(field) => (
                <div className="flex flex-col gap-sm">
                  <FieldRuleGroup
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
          <div className="flex gap-sm">
            {rule.id ? (
              <DeleteScreeningRule
                screeningId={rule.id}
                iterationId={iterationId}
                scenarioId={scenario.id}
                onDeleteSuccess={handleRuleDelete}
              >
                <Button size="small" variant="destructive" appearance="stroked" mode="icon">
                  <Icon icon="delete" className="size-4" />
                </Button>
              </DeleteScreeningRule>
            ) : null}
          </div>
        </Panel.Header>
        <div className="flex flex-col gap-md">
          {validationIssues.length > 0 ? (
            <Callout color="red" icon="lightbulb" iconColor="red" className="max-w-3xl">
              <ul className="flex flex-col gap-xs ps-md">
                {validationIssues.map((issue) => (
                  <li key={issueDedupeKey(issue)}>{issue.message}</li>
                ))}
              </ul>
            </Callout>
          ) : null}
          <form.Field name="description">
            {(field) => (
              <Card className="flex w-full flex-col gap-xs">
                <textarea
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  className="form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
                  placeholder={t('scenarios:edit_rule.description_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </Card>
            )}
          </form.Field>
          <div className="flex flex-col gap-xl">
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
                      triggerObjectType={scenario.triggerObjectType}
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
                    <AstBuilder.Provider scenarioId={scenario.id} mode="edit">
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

            <AstBuilder.Provider scenarioId={scenario.id} mode="edit">
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
                            editor="edit"
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
                            editor="edit"
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
                                disabled={!isNameRecognitionAvailable}
                                id="enable-entity-recognition"
                              />
                              <label htmlFor="enable-entity-recognition" className="text-s">
                                {t('scenarios:edit_sanction.enable_entity_recognition')}
                              </label>
                              <FieldToolTip>
                                {t('scenarios:edit_sanction.enable_entity_recognition.tooltip')}
                              </FieldToolTip>
                              <span className="text-xs rounded-full bg-purple-primary px-xs py-0.5 text-grey-white">
                                {t('common:beta')}
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
                                <div className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('birthDate'))}>
                                  <div className="flex flex-col gap-xs">
                                    <span className="text-s inline-flex items-center gap-xs">
                                      {t('scenarios:edit_sanction.birthdate')}
                                    </span>
                                    <FieldNodeConcat
                                      value={value && isStringConcatAstNode(value) ? value : undefined}
                                      onChange={field.handleChange}
                                      onBlur={field.handleBlur}
                                      placeholder={t('scenarios:edit_sanction.birthdate_placeholder')}
                                      limit={5}
                                      withDate
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
                                  className={cn('flex flex-col gap-xs', queryFieldHighlightClassName('passportNumber'))}
                                >
                                  <div className="flex flex-col gap-xs">
                                    <span className="text-s inline-flex items-center gap-xs">
                                      {t('scenarios:edit_sanction.passport_number')}
                                    </span>
                                    <FieldNodeConcat
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
                  {!hasRequiredFields && (
                    <EvaluationErrors errors={[t('scenarios:edit_sanction.required_fields_error')]} />
                  )}
                </div>
              </div>
            </AstBuilder.Provider>

            <form.Field name="datasets">
              {(field) => <FieldDataset value={field.state.value} onChange={field.handleChange} />}
            </form.Field>
          </div>
        </div>
        <Panel.Footer>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <>
                <Panel.FooterButton
                  disabled={!canSubmit}
                  onClick={() => handleRuleSubmit(false)}
                  variant="primary-outline"
                  label={t('common:save')}
                />
                <Panel.FooterButton
                  disabled={!canSubmit}
                  onClick={() => handleRuleSubmit(true)}
                  trailingIcon="save"
                  variant="primary"
                  label={t('common:save_and_close')}
                />
              </>
            )}
          </form.Subscribe>
        </Panel.Footer>
      </Panel.Content>
    </form>
  );
}
