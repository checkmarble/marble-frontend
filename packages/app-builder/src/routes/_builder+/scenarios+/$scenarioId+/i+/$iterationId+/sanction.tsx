import { Callout, Page, scenarioI18n } from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { FieldAstFormula } from '@app-builder/components/Scenario/Sanction/FieldAstFormula';
import { FieldDataset } from '@app-builder/components/Scenario/Sanction/FieldDataset';
import { FieldNode } from '@app-builder/components/Scenario/Sanction/FieldNode';
import { FieldNodeConcat } from '@app-builder/components/Scenario/Sanction/FieldNodeConcat';
import { FieldOutcomes } from '@app-builder/components/Scenario/Sanction/FieldOutcomes';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Sanction/FieldRuleGroup';
import { FieldToolTip } from '@app-builder/components/Scenario/Sanction/FieldToolTip';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type AstNode, NewUndefinedAstNode } from '@app-builder/models';
import { isStringConcatAstNode } from '@app-builder/models/astNode/strings';
import { knownOutcomes, type SanctionOutcome } from '@app-builder/models/outcome';
import { DeleteSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/delete';
import { type BuilderOptionsResource } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/builder-options';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { Dict } from '@swan-io/boxed';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useRef } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { difference } from 'remeda';
import { Button, cn, Tag } from 'ui-design-system';
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

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute('/scenarios/:scenarioId/i/:iterationId/sanction', {
              scenarioId: fromUUIDtoSUUID(iteration.scenarioId),
              iterationId: fromUUIDtoSUUID(iteration.id),
            })}
          >
            {iteration.sanctionCheckConfig?.name ?? t('common:no_name')}
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
  name: z.string().nonempty(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  forcedOutcome: z.union([
    z.literal('review'),
    z.literal('decline'),
    z.literal('block_and_review'),
  ]),
  triggerRule: z.any(),
  query: z.object({
    name: z.any().nullish(),
    label: z.any().nullish(),
  }),
  counterPartyId: z.any().nullish(),
  datasets: z.array(z.string()),
});

type EditSanctionForm = z.infer<typeof editSanctionFormSchema>;

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
    const nameQuery = data.query?.name;

    await scenarioIterationSanctionRepository.upsertSanctionCheckConfig({
      iterationId: fromParams(params, 'iterationId'),
      changes: {
        ...data,
        counterPartyId: data.counterPartyId as AstNode | undefined,
        triggerRule: data.triggerRule as AstNode | undefined,
        query: {
          name: nameQuery && isStringConcatAstNode(nameQuery) ? nameQuery : undefined,
          label: data.query?.label as AstNode | undefined,
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
  const { id: iterationId, sanctionCheckConfig } = useCurrentScenarioIteration();
  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
      name: sanctionCheckConfig?.name ?? 'Sanction Check',
      description: sanctionCheckConfig?.description ?? '',
      ruleGroup: sanctionCheckConfig?.ruleGroup ?? 'Sanction Check',
      datasets: sanctionCheckConfig?.datasets ?? [],
      forcedOutcome: (sanctionCheckConfig?.forcedOutcome as SanctionOutcome) ?? 'block_and_review',
      triggerRule: sanctionCheckConfig?.triggerRule,
      query: {
        name: sanctionCheckConfig?.query?.name,
        label: sanctionCheckConfig?.query?.label,
      },
      counterPartyId: sanctionCheckConfig?.counterPartyId,
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
          <form
            className="relative flex max-w-[800px] flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div
              className={cn(
                'bg-purple-99 sticky top-0 flex h-[88px] items-center justify-between gap-4',
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
                  <DeleteSanction iterationId={iterationId} scenarioId={scenario.id}>
                    <Button color="red" className="w-fit">
                      <Icon icon="delete" className="size-5" aria-hidden />
                      {t('common:delete')}
                    </Button>
                  </DeleteSanction>

                  <Button type="submit" className="flex-1">
                    <Icon icon="save" className="size-5" aria-hidden />
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
                        className="form-textarea text-grey-50 text-s w-full resize-none border-none bg-transparent font-medium outline-none"
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
                        disabled={editor === 'view'}
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
                <span className="text-s font-medium">
                  {t('scenarios:edit_sanction.global_settings')}
                </span>
                <div className="bg-grey-100 border-grey-90 rounded-md border p-6">
                  <Callout variant="outlined" className="mb-4 lg:mb-6">
                    <p className="whitespace-pre text-wrap">
                      <Trans
                        t={t}
                        i18nKey="scenarios:sanction.trigger_object.callout"
                        components={{
                          DocLink: (
                            <ExternalLink href="https://docs.checkmarble.com/docs/getting-started" />
                          ),
                        }}
                      />
                    </p>
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
                <div className="bg-grey-100 border-grey-90 rounded-md border p-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-grey-95 text-grey-50 text-s inline-flex rounded p-2 font-medium">
                      {t('scenarios:sanction_forced_outcome_heading')}
                    </span>
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
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-s inline-flex items-center gap-2 font-medium">
                  {t('scenarios:sanction_counterparty_id')}
                  <FieldToolTip>{t('scenarios:sanction_counterparty_id.tooltip')}</FieldToolTip>
                </span>
                <form.Field name="counterPartyId">
                  {(field) => (
                    <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded border p-6">
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
                  <span className="text-s font-medium">
                    {t('scenarios:sanction.match_settings.title')}
                  </span>
                  <div className="bg-grey-100 border-grey-90 flex flex-col gap-2 rounded border p-6">
                    <Callout variant="outlined" className="mb-4 lg:mb-6">
                      <p className="whitespace-pre text-wrap">
                        {t('scenarios:sanction.match_settings.callout')}
                      </p>
                    </Callout>
                    <div className="flex flex-col gap-6">
                      <form.Field name="query.name">
                        {(field) => {
                          const value = sanctionCheckConfig?.query?.name;
                          return (
                            <div className="flex flex-col gap-4">
                              <FormLabel
                                className="inline-flex items-center gap-1"
                                name={field.name}
                              >
                                {t('scenarios:sanction_counterparty_name')}
                                <FieldToolTip>
                                  {t('scenarios:sanction_counterparty_name.tooltip')}
                                </FieldToolTip>
                              </FormLabel>
                              <FieldNodeConcat
                                viewOnly={editor === 'view'}
                                value={value && isStringConcatAstNode(value) ? value : undefined}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                                placeholder={t('scenarios:sanction_counterparty_name_placeholder')}
                                limit={5}
                              />
                              <FormErrorOrDescription
                                errors={getFieldErrors(field.state.meta.errors)}
                              />
                            </div>
                          );
                        }}
                      </form.Field>
                      <form.Field name="query.label">
                        {(field) => (
                          <div className="flex flex-col gap-4">
                            <FormLabel name={field.name}>
                              {t('scenarios:sanction_transaction_label')}
                            </FormLabel>
                            <FieldNode
                              value={field.state.value}
                              onChange={field.handleChange}
                              onBlur={field.handleBlur}
                              placeholder={t('scenarios:sanction_transaction_label_placeholder')}
                            />
                            <FormErrorOrDescription
                              errors={getFieldErrors(field.state.meta.errors)}
                            />
                          </div>
                        )}
                      </form.Field>
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
