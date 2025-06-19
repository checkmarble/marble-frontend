import { Callout, Page, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { FieldAstFormula } from '@app-builder/components/Scenario/Sanction/FieldAstFormula';
import { FieldBlackListId } from '@app-builder/components/Scenario/Sanction/FieldBlackListId';
import { FieldDataset } from '@app-builder/components/Scenario/Sanction/FieldDataset';
import { FieldNode } from '@app-builder/components/Scenario/Sanction/FieldNode';
import { FieldNodeConcat } from '@app-builder/components/Scenario/Sanction/FieldNodeConcat';
import { FieldOutcomes } from '@app-builder/components/Scenario/Sanction/FieldOutcomes';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Sanction/FieldRuleGroup';
import { FieldSkipIfUnder } from '@app-builder/components/Scenario/Sanction/FieldSkipIfUnder';
import { FieldToolTip } from '@app-builder/components/Scenario/Sanction/FieldToolTip';
import { SEARCH_ENTITIES } from '@app-builder/constants/sanction-check-entity';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { knownOutcomes, type SanctionOutcome } from '@app-builder/models/outcome';
import { DeleteSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/$sanctionId+/delete';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { useForm, useStore } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { pick } from 'radash';
import { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { difference } from 'remeda';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario } from '../../_layout';
import { useCurrentScenarioIteration, useRuleGroups } from './_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common', 'decisions'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
            scenarioId: fromUUIDtoSUUID(scenarioId),
            iterationId: fromUUIDtoSUUID(iterationId),
          })}
        >
          {t('navigation:scenario.rules')}
        </BreadCrumbLink>
      );
    },
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['common']);
      const iteration = useCurrentScenarioIteration();
      const editorMode = useEditorMode();
      const configId = useParam('sanctionId');

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId', {
              scenarioId: fromUUIDtoSUUID(iteration.scenarioId),
              iterationId: fromUUIDtoSUUID(iteration.id),
              sanctionId: fromUUIDtoSUUID(configId),
            })}
          >
            {iteration.sanctionCheckConfigs.find((c) => c.id === configId)?.name ??
              t('common:no_name')}
          </BreadCrumbLink>
          {editorMode === 'edit' ? (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          ) : null}
        </div>
      );
    },
  ],
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const scenarioId = fromParams(params, 'scenarioId');
  const { authService } = initServerServices(request);
  const { customListsRepository, editor, dataModelRepository, sanctionCheck } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const [{ databaseAccessors, payloadAccessors }, dataModel, customLists, { sections }] =
    await Promise.all([
      editor.listAccessors({ scenarioId }),
      dataModelRepository.getDataModel(),
      customListsRepository.listCustomLists(),
      sanctionCheck.listDatasets(),
    ]);

  return {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    sections,
  };
}

const editSanctionFormSchema = z.object({
  id: z.string().nonempty(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  datasets: z.array(z.string()),
  threshold: z.number().optional(),
  forcedOutcome: z.enum(['review', 'decline', 'block_and_review']),
  triggerRule: z.any(),
  entityType: z.enum(['Person', 'Organization', 'Vehicle', 'Thing']).optional(),
  query: z.record(z.any()),
  counterPartyId: z.any().nullish(),
  preprocessing: z
    .object({
      useNer: z.boolean().optional(),
      skipIfUnder: z.number().nullish(),
      removeNumbers: z.boolean().optional(),
      blacklistListId: z.string().nullish(),
    })
    .optional(),
});

type EditSanctionForm = z.infer<typeof editSanctionFormSchema>;

const clearQuery = (
  entityType: EditSanctionForm['entityType'],
  query: Record<string, unknown>,
): Record<string, unknown> =>
  entityType ? pick(query, SEARCH_ENTITIES[entityType].fields) : query;

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { scenarioIterationSanctionRepository }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common']),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { error, data, success } = editSanctionFormSchema.safeParse(raw);

  if (!success) return json({ status: 'error', errors: error.flatten() });

  try {
    await scenarioIterationSanctionRepository.updateSanctionCheckConfig({
      iterationId: fromParams(params, 'iterationId'),
      sanctionId: fromParams(params, 'sanctionId'),
      changes: {
        ...data,
        counterPartyId: data.counterPartyId ?? NewUndefinedAstNode(),
        query: clearQuery(data.entityType, data.query) as Partial<{
          [key: string]: AstNode;
          name: AstNode;
        }>,
        preprocessing: {
          ...data.preprocessing,
          useNer: data.entityType === 'Thing' ? data.preprocessing?.useNer : undefined,
          skipIfUnder: data.preprocessing?.skipIfUnder ?? undefined,
          blacklistListId: data.preprocessing?.blacklistListId ?? undefined,
        },
      },
    });

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.save'),
    });

    return json({ status: 'success' }, { headers: { 'Set-Cookie': await commitSession(session) } });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json({ status: 'error' }, { headers: { 'Set-Cookie': await commitSession(session) } });
  }
}

export default function SanctionDetail() {
  const { t } = useTranslation(handle.i18n);
  const { databaseAccessors, payloadAccessors, dataModel, customLists, sections } =
    useLoaderData<typeof loader>();
  const editor = useEditorMode();
  const { submit, data } = useFetcher<typeof action>();
  const lastData = data as
    | {
        status: 'error' | 'success';
        errors?: z.typeToFlattenedError<EditSanctionForm>;
      }
    | undefined;
  const scenario = useCurrentScenario();
  const ruleGroups = useRuleGroups();
  const configId = useParam('sanctionId');
  const { id: iterationId, sanctionCheckConfigs } = useCurrentScenarioIteration();
  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { org } = useOrganizationDetails();
  const sanctionCheckConfig = sanctionCheckConfigs.find((c) => c.id === configId);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  const form = useForm({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        submit(value, { method: 'PATCH', encType: 'application/json' });
      }
    },
    validators: {
      onChange: editSanctionFormSchema,
      onBlur: editSanctionFormSchema,
      onSubmit: editSanctionFormSchema,
    },
    defaultValues: {
      id: sanctionCheckConfig?.id,
      name: sanctionCheckConfig?.name ?? 'Sanction Check',
      description: sanctionCheckConfig?.description ?? '',
      ruleGroup: sanctionCheckConfig?.ruleGroup ?? 'Sanction Check',
      datasets: sanctionCheckConfig?.datasets ?? [],
      threshold: sanctionCheckConfig?.threshold,
      forcedOutcome: (sanctionCheckConfig?.forcedOutcome as SanctionOutcome) ?? 'block_and_review',
      triggerRule: sanctionCheckConfig?.triggerRule,
      entityType: sanctionCheckConfig?.entityType,
      query: sanctionCheckConfig?.query,
      counterPartyId: sanctionCheckConfig?.counterPartyId,
      preprocessing: sanctionCheckConfig?.preprocessing,
    } as EditSanctionForm,
  });

  const options: BuilderOptionsResource = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
  };

  if (!form.state.isTouched && lastData?.status === 'error' && lastData?.errors) {
    Dict.entries(lastData.errors.fieldErrors).forEach(([field, errors]) =>
      form.setFieldMeta(field, (prev) => ({
        ...prev,
        errors: errors ?? [],
      })),
    );
  }

  const entityType = useStore(form.store, (state) => state.values.entityType);

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs
          back={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
            iterationId: fromUUIDtoSUUID(iterationId),
            scenarioId: fromUUIDtoSUUID(scenario.id),
          })}
        />
      </Page.Header>
      <Page.Container ref={containerRef}>
        <Page.Content className="pt-0 lg:pt-0">
          <form className="relative flex max-w-[800px] flex-col" onSubmit={handleSubmit(form)}>
            <div
              className={cn(
                'bg-purple-99 sticky top-0 z-40 flex h-[88px] items-center justify-between gap-4',
                {
                  'border-b-grey-90 border-b': !intersection?.isIntersecting,
                },
              )}
            >
              <form.Field name="name">
                {(field) => (
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name={field.name}
                      disabled={editor === 'view'}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      className="text-grey-00 text-l w-full border-none bg-transparent font-normal outline-none"
                      placeholder={t('scenarios:sanction_name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              {editor === 'edit' ? (
                <div className="flex items-center gap-2">
                  <DeleteSanction
                    iterationId={iterationId}
                    scenarioId={scenario.id}
                    sanctionId={configId}
                  >
                    <Button color="red" className="w-fit" size="small">
                      <Icon icon="delete" className="size-4" aria-hidden />
                      {t('common:delete')}
                    </Button>
                  </DeleteSanction>

                  <Button type="submit" className="flex-1" size="small">
                    <Icon icon="save" className="size-4" aria-hidden />
                    {t('common:save')}
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-8">
              <div className="border-grey-90 flex flex-col items-start gap-6 border-b pb-6">
                <form.Field name="description">
                  {(field) => (
                    <div ref={descriptionRef} className="flex w-full flex-col gap-1">
                      <textarea
                        name={field.name}
                        defaultValue={field.state.value}
                        disabled={editor === 'view'}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        className="form-textarea text-grey-50 text-r w-full resize-none border-none bg-transparent font-medium outline-none"
                        placeholder={t('scenarios:sanction_description_placeholder')}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
                <form.Field name="ruleGroup">
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
                <span className="text-s font-semibold">
                  {t('scenarios:edit_sanction.global_settings')}
                </span>
                <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded-md border p-4">
                  <Callout variant="outlined">
                    <span>
                      <Trans
                        t={t}
                        i18nKey="scenarios:sanction.trigger_object.callout"
                        components={{
                          DocLink: (
                            <ExternalLink href="https://docs.checkmarble.com/docs/getting-started" />
                          ),
                        }}
                      />
                    </span>
                  </Callout>
                  <form.Field name="triggerRule">
                    {(field) => (
                      <FieldAstFormula
                        type="sanction"
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
                <div className="bg-grey-100 border-grey-90 flex flex-col gap-2 rounded-md border p-4">
                  <div className="text-s flex items-center">
                    {t('scenarios:edit_sanction.consideration_matchings')}
                    <form.Field name="threshold">
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
                          <FormErrorOrDescription
                            errors={getFieldErrors(field.state.meta.errors)}
                          />
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
                            outcomes={difference(knownOutcomes, ['approve']) as SanctionOutcome[]}
                          />
                          <FormErrorOrDescription
                            errors={getFieldErrors(field.state.meta.errors)}
                          />
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
                    <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded border p-4">
                      <AstBuilder.Provider
                        scenarioId={scenario.id}
                        initialData={options}
                        mode={editor}
                      >
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
                  <span className="text-s font-semibold">
                    {t('scenarios:sanction.match_settings.title')}
                  </span>
                  <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded border p-4">
                    <Callout variant="outlined">
                      <p className="whitespace-pre text-wrap">
                        {t('scenarios:sanction.match_settings.callout')}
                      </p>
                    </Callout>
                    <div className="flex flex-col gap-1">
                      <span className="text-s inline-flex items-center gap-1">
                        {t('scenarios:edit_sanction.entity_type.heading')}
                        <FieldToolTip>
                          {t('scenarios:edit_sanction.entity_type.tooltip')}
                        </FieldToolTip>
                      </span>
                      <form.Field name="entityType">
                        {(field) => (
                          <div className="flex flex-col gap-4">
                            <MenuCommand.Menu persistOnSelect={false}>
                              <MenuCommand.Trigger>
                                <Button
                                  variant="secondary"
                                  size="medium"
                                  className="w-52 justify-between"
                                  disabled={editor === 'view'}
                                >
                                  <span className="text-grey-00 text-s font-medium">
                                    {match(entityType)
                                      .with('Thing', () =>
                                        t('scenarios:edit_sanction.entity_type.thing'),
                                      )
                                      .with('Person', () =>
                                        t('scenarios:edit_sanction.entity_type.person'),
                                      )
                                      .with('Organization', () =>
                                        t('scenarios:edit_sanction.entity_type.organization'),
                                      )
                                      .with('Vehicle', () =>
                                        t('scenarios:edit_sanction.entity_type.vehicle'),
                                      )
                                      .otherwise(() => entityType)}
                                  </span>
                                  <Icon icon="caret-down" className="text-grey-50 size-4" />
                                </Button>
                              </MenuCommand.Trigger>
                              <MenuCommand.Content sameWidth className="mt-2">
                                <MenuCommand.List>
                                  <MenuCommand.Item onSelect={() => field.handleChange('Thing')}>
                                    {t('scenarios:edit_sanction.entity_type.thing')}
                                  </MenuCommand.Item>
                                  <MenuCommand.Item onSelect={() => field.handleChange('Person')}>
                                    {t('scenarios:edit_sanction.entity_type.person')}
                                  </MenuCommand.Item>
                                  <MenuCommand.Item
                                    onSelect={() => field.handleChange('Organization')}
                                  >
                                    {t('scenarios:edit_sanction.entity_type.organization')}
                                  </MenuCommand.Item>
                                  <MenuCommand.Item onSelect={() => field.handleChange('Vehicle')}>
                                    {t('scenarios:edit_sanction.entity_type.vehicle')}
                                  </MenuCommand.Item>
                                </MenuCommand.List>
                              </MenuCommand.Content>
                            </MenuCommand.Menu>
                          </div>
                        )}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="bg-grey-98 flex flex-col gap-2 rounded p-2">
                        <form.Field name="query.name">
                          {(field) => {
                            const value = sanctionCheckConfig?.query?.name;
                            return (
                              <div className="flex flex-col gap-1">
                                <div className="flex flex-col gap-1">
                                  <span className="text-s inline-flex items-center gap-1">
                                    {t('scenarios:screening.filter.name')}
                                    <FieldToolTip>
                                      {t('scenarios:screening.filter.name.tooltip')}
                                    </FieldToolTip>
                                  </span>
                                  <FieldNodeConcat
                                    viewOnly={editor === 'view'}
                                    value={
                                      value && isStringConcatAstNode(value) ? value : undefined
                                    }
                                    onChange={field.handleChange}
                                    onBlur={field.handleBlur}
                                    placeholder={t('scenarios:screening.filter.name_placeholder')}
                                    limit={5}
                                  />
                                  <FormErrorOrDescription
                                    errors={getFieldErrors(field.state.meta.errors)}
                                  />
                                </div>
                              </div>
                            );
                          }}
                        </form.Field>
                        <form.Field name="preprocessing.blacklistListId">
                          {(field) => (
                            <FieldBlackListId
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
                              <span className="text-s">
                                {t('scenarios:edit_sanction.ignore_numbers')}
                              </span>
                              <FieldToolTip>
                                {t('scenarios:edit_sanction.ignore_numbers.tooltip')}
                              </FieldToolTip>
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
                                  disabled={editor === 'view'}
                                />
                                <span className="text-s">
                                  {t('scenarios:edit_sanction.enable_entity_recognition')}
                                </span>
                                <FieldToolTip>
                                  {t('scenarios:edit_sanction.enable_entity_recognition.tooltip')}
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
                                const value = sanctionCheckConfig?.query?.['birthDate'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.birthdate')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.birthdate_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.nationality">
                              {(field) => {
                                const value = sanctionCheckConfig?.query?.['nationality'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.nationality')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.nationality_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.idNumber">
                              {(field) => {
                                const value = sanctionCheckConfig?.query?.['idNumber'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.idnumber')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.idnumber_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.address">
                              {(field) => {
                                const value = sanctionCheckConfig?.query?.['address'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.address')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.address_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
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
                                const value = sanctionCheckConfig?.query?.['country'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.country')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.country_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.registrationNumber">
                              {(field) => {
                                const value = sanctionCheckConfig?.query?.['registrationNumber'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.registrationnumber')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.registrationnumber_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
                                    </div>
                                  </div>
                                );
                              }}
                            </form.Field>
                            <form.Field name="query.address">
                              {(field) => {
                                const value = sanctionCheckConfig?.query?.['address'];
                                return (
                                  <div className="flex flex-col gap-1">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-s inline-flex items-center gap-1">
                                        {t('scenarios:edit_sanction.address')}
                                      </span>
                                      <FieldNodeConcat
                                        viewOnly={editor === 'view'}
                                        value={
                                          value && isStringConcatAstNode(value) ? value : undefined
                                        }
                                        onChange={field.handleChange}
                                        onBlur={field.handleBlur}
                                        placeholder={t(
                                          'scenarios:edit_sanction.address_placeholder',
                                        )}
                                        limit={5}
                                      />
                                      <FormErrorOrDescription
                                        errors={getFieldErrors(field.state.meta.errors)}
                                      />
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
                              const value = sanctionCheckConfig?.query?.['registrationNumber'];
                              return (
                                <div className="flex flex-col gap-1">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-s inline-flex items-center gap-1">
                                      {t('scenarios:edit_sanction.registrationnumber')}
                                    </span>
                                    <FieldNodeConcat
                                      viewOnly={editor === 'view'}
                                      value={
                                        value && isStringConcatAstNode(value) ? value : undefined
                                      }
                                      onChange={field.handleChange}
                                      onBlur={field.handleBlur}
                                      placeholder={t(
                                        'scenarios:edit_sanction.registrationnumber_placeholder',
                                      )}
                                      limit={5}
                                    />
                                    <FormErrorOrDescription
                                      errors={getFieldErrors(field.state.meta.errors)}
                                    />
                                  </div>
                                </div>
                              );
                            }}
                          </form.Field>
                        ))
                        .otherwise(() => null)}
                    </div>
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
