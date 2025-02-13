import { Callout, Page, scenarioI18n } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type AstBuilderProps } from '@app-builder/components/Scenario/AstBuilder';
import { FieldNode } from '@app-builder/components/Scenario/Sanction/FieldNode';
import { FieldNodeConcat } from '@app-builder/components/Scenario/Sanction/FieldNodeConcat';
import { FieldOutcomes } from '@app-builder/components/Scenario/Sanction/FieldOutcomes';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Sanction/FieldRuleGroup';
import { FieldSanction } from '@app-builder/components/Scenario/Sanction/FieldSanction';
import { FieldTrigger } from '@app-builder/components/Scenario/Sanction/FieldTrigger';
import { type AstNode } from '@app-builder/models';
import {
  knownOutcomes,
  type SanctionOutcome,
} from '@app-builder/models/outcome';
import { DeleteSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/delete';
import { useEditorMode } from '@app-builder/services/editor';
import { OptionsProvider } from '@app-builder/services/editor/options';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { decode as formDataToObject } from 'decode-formdata';
import { type Namespace } from 'i18next';
import { serialize as objectToFormData } from 'object-to-formdata';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { difference } from 'remeda';
import { Button, Collapsible, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario } from '../../_layout';
import { useCurrentScenarioIteration, useRuleGroups } from './_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
  BreadCrumbs: [
    ({ isLast }: BreadCrumbProps) => {
      const { t } = useTranslation(['navigation']);
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');

      return (
        <BreadCrumbLink
          isLast={isLast}
          to={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
            scenarioId: fromUUID(scenarioId),
            iterationId: fromUUID(iterationId),
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
              scenarioId: fromUUID(iteration.scenarioId),
              iterationId: fromUUID(iteration.id),
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
  const { authService } = serverServices;
  const { customListsRepository, editor, dataModelRepository, sanctionCheck } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const [
    { databaseAccessors, payloadAccessors },
    dataModel,
    customLists,
    { sections },
  ] = await Promise.all([
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
  scoreModifier: z.coerce.number(),
  ruleGroup: z.string().nonempty(),
  forceOutcome: z.union([
    z.literal('review'),
    z.literal('decline'),
    z.literal('block_and_review'),
  ]),
  triggerRule: z.any().nullish(),
  query: z.object({
    name: z.any(),
    label: z.any().nullish(),
  }),
  counterPartyId: z.any().nullish(),
  datasets: z.array(z.string()),
});

type EditSanctionForm = z.infer<typeof editSanctionFormSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [session, formData, { scenarioIterationSanctionRepository }] =
    await Promise.all([
      getSession(request),
      request.formData(),
      authService.isAuthenticated(request, {
        failureRedirect: getRoute('/sign-in'),
      }),
    ]);

  const iterationId = fromParams(params, 'iterationId');
  const formDataDecoded = formDataToObject(formData, {
    arrays: ['datasets'],
  });

  try {
    const data = editSanctionFormSchema.parse(formDataDecoded);

    await scenarioIterationSanctionRepository.upsertSanctionCheckConfig({
      iterationId,
      changes: {
        ...data,
        counterPartyId: data.counterPartyId as AstNode | undefined,
        triggerRule: data.triggerRule as AstNode | undefined,
        query: {
          name: data.query.name as AstNode,
          label: data.query.label as AstNode | undefined,
        },
      },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'success' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { status: 'error' },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export default function SanctionDetail() {
  const { t } = useTranslation(['scenarios', 'common', 'decisions']);
  const {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    sections,
  } = useLoaderData<typeof loader>();
  const editor = useEditorMode();
  const fetcher = useFetcher<typeof action>();
  const scenario = useCurrentScenario();
  const defaultRuleGroups = useRuleGroups();
  const { id: iterationId, sanctionCheckConfig } =
    useCurrentScenarioIteration();

  const ruleGroups = useMemo(
    () => [...defaultRuleGroups, 'Sanction check'],
    [defaultRuleGroups],
  );

  const form = useForm<EditSanctionForm>({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid)
        fetcher.submit(
          objectToFormData(value, {
            dotsForObjectNotation: true,
            indices: true,
          }),
          { method: 'PATCH' },
        );
    },
    validators: {
      onChange: editSanctionFormSchema,
      onBlur: editSanctionFormSchema,
      onSubmit: editSanctionFormSchema,
    },
    defaultValues: {
      name: sanctionCheckConfig?.name ?? 'Sanction Check',
      description: sanctionCheckConfig?.description ?? '',
      ruleGroup: sanctionCheckConfig?.ruleGroup ?? 'Sanction check',
      datasets: sanctionCheckConfig?.datasets ?? [],
      forceOutcome:
        (sanctionCheckConfig?.forceOutcome as SanctionOutcome) ?? 'decline',
      scoreModifier: sanctionCheckConfig?.scoreModifier ?? 0,
      triggerRule: sanctionCheckConfig?.triggerRule,
      query: {
        name: sanctionCheckConfig?.query?.name,
        label: sanctionCheckConfig?.query?.label,
      },
      counterPartyId: sanctionCheckConfig?.counterPartyId,
    },
  });

  const options: AstBuilderProps['options'] = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
  };

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <form
            className="flex flex-col gap-8"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <Collapsible.Container className="bg-grey-100 max-w-3xl">
              <Collapsible.Title>
                {t('scenarios:edit_rule.informations')}
              </Collapsible.Title>
              <Collapsible.Content>
                <div className="flex flex-col gap-4 lg:gap-6">
                  <form.Field name="name">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel
                          name={field.name}
                          className="text-m"
                          valid={field.state.meta.errors.length === 0}
                        >
                          {t('common:name')}
                        </FormLabel>
                        <FormInput
                          disabled={editor === 'view'}
                          defaultValue={field.state.value}
                          type="text"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                          placeholder={t(
                            'scenarios:edit_rule.name_placeholder',
                          )}
                          valid={field.state.meta.errors.length === 0}
                        />
                        <FormErrorOrDescription
                          errors={field.state.meta.errors}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="description">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel
                          name={field.name}
                          className="text-m"
                          valid={field.state.meta.errors.length === 0}
                        >
                          {t('common:description')}
                        </FormLabel>
                        <FormInput
                          disabled={editor === 'view'}
                          defaultValue={field.state.value}
                          type="text"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(e.currentTarget.value)
                          }
                          placeholder={t(
                            'scenarios:edit_rule.description_placeholder',
                          )}
                          valid={field.state.meta.errors.length === 0}
                        />
                        <FormErrorOrDescription
                          errors={field.state.meta.errors}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="scoreModifier">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel
                          name={field.name}
                          className="text-m"
                          valid={field.state.meta.errors.length === 0}
                        >
                          {t('scenarios:edit_rule.score')}
                        </FormLabel>
                        <FormInput
                          disabled={editor === 'view'}
                          defaultValue={field.state.value}
                          type="number"
                          name={field.name}
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(+e.currentTarget.value)
                          }
                          placeholder={t(
                            'scenarios:edit_rule.score_placeholder',
                          )}
                          valid={field.state.meta.errors.length === 0}
                        />
                        <FormErrorOrDescription
                          errors={field.state.meta.errors}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="ruleGroup">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel
                          name={field.name}
                          className="text-m"
                          valid={field.state.meta.errors.length === 0}
                        >
                          {t('scenarios:rules.rule_group')}
                        </FormLabel>
                        <FieldRuleGroup
                          disabled
                          name={field.name}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                          selectedRuleGroup={field.state.value}
                          ruleGroups={ruleGroups}
                        />
                        <FormErrorOrDescription
                          errors={field.state.meta.errors}
                        />
                      </div>
                    )}
                  </form.Field>
                  <form.Field name="forceOutcome">
                    {(field) => (
                      <div className="flex flex-col gap-2">
                        <FormLabel
                          name={field.name}
                          className="text-m"
                          valid={field.state.meta.errors.length === 0}
                        >
                          {t('decisions:outcome')}
                        </FormLabel>
                        <FieldOutcomes
                          disabled={editor === 'view'}
                          name={field.name}
                          onChange={field.handleChange}
                          onBlur={field.handleBlur}
                          selectedOutcome={field.state.value}
                          outcomes={
                            difference(knownOutcomes, [
                              'approve',
                            ]) as SanctionOutcome[]
                          }
                        />
                        <FormErrorOrDescription
                          errors={field.state.meta.errors}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              </Collapsible.Content>
            </Collapsible.Container>

            <Collapsible.Container className="bg-grey-100 max-w-3xl">
              <Collapsible.Title>
                {t('scenarios:trigger.trigger_object.title')}
              </Collapsible.Title>
              <Collapsible.Content>
                <Callout variant="outlined" className="mb-4 lg:mb-6">
                  <p className="whitespace-pre text-wrap">
                    <Trans
                      t={t}
                      i18nKey="scenarios:trigger.trigger_object.callout"
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
                    <FieldTrigger
                      scenarioId={scenario.id}
                      iterationId={iterationId}
                      options={options}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      trigger={field.state.value}
                    />
                  )}
                </form.Field>
              </Collapsible.Content>
            </Collapsible.Container>

            <Collapsible.Container className="bg-grey-100 max-w-3xl">
              <Collapsible.Title>
                {t('scenarios:sanction.match_settings.title')}
              </Collapsible.Title>
              <Collapsible.Content>
                <Callout variant="outlined" className="mb-4 lg:mb-6">
                  <p className="whitespace-pre text-wrap">
                    {t('scenarios:sanction.match_settings.callout')}
                  </p>
                </Callout>
                <OptionsProvider {...options}>
                  <div className="flex flex-col gap-6">
                    <form.Field name="counterPartyId">
                      {(field) => (
                        <div className="flex flex-col gap-4">
                          <FormLabel name={field.name}>
                            {t('scenarios:sanction_counterparty_id')}
                          </FormLabel>
                          <FieldNode
                            viewOnly={editor === 'view'}
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            placeholder="Select the transaction ID"
                          />
                          <FormErrorOrDescription
                            errors={field.state.meta.errors}
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="query.name">
                      {(field) => (
                        <div className="flex flex-col gap-4">
                          <FormLabel name={field.name}>
                            {t('scenarios:sanction_counterparty_name')}
                          </FormLabel>
                          <FieldNodeConcat
                            viewOnly={editor === 'view'}
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            placeholder="Select the First name or Full Name"
                            limit={5}
                          />
                          <FormErrorOrDescription
                            errors={field.state.meta.errors}
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name="query.label">
                      {(field) => (
                        <div className="flex flex-col gap-4">
                          <FormLabel name={field.name}>
                            {t('scenarios:sanction_transaction_label')}
                          </FormLabel>
                          <FieldNode
                            viewOnly={editor === 'view'}
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            placeholder="Select the transaction label"
                          />
                          <FormErrorOrDescription
                            errors={field.state.meta.errors}
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </OptionsProvider>
              </Collapsible.Content>
            </Collapsible.Container>

            <Collapsible.Container className="bg-grey-100 max-w-3xl">
              <Collapsible.Title>
                {t('scenarios:sanction.lists.title')}
              </Collapsible.Title>
              <Collapsible.Content>
                <Callout variant="outlined" className="mb-4 lg:mb-6">
                  <p className="whitespace-pre text-wrap">
                    {t('scenarios:sanction.lists.callout')}
                  </p>
                </Callout>
                <form.Field name="datasets">
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldSanction
                        defaultValue={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        sections={sections}
                      />
                      <FormErrorOrDescription
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                </form.Field>
              </Collapsible.Content>
            </Collapsible.Container>

            {editor === 'edit' ? (
              <div className="sticky bottom-4 flex w-full max-w-3xl items-center justify-center lg:bottom-6">
                <div className="bg-grey-100 border-grey-90 flex w-fit flex-row gap-2 rounded-md border p-2 drop-shadow-md">
                  <DeleteSanction
                    iterationId={iterationId}
                    scenarioId={scenario.id}
                  >
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
              </div>
            ) : null}
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
