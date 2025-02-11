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
import { FieldMatches } from '@app-builder/components/Scenario/Sanction/FieldMatches';
import { FieldOutcomes } from '@app-builder/components/Scenario/Sanction/FieldOutcomes';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Sanction/FieldRuleGroup';
import {
  FieldSanction,
  type SanctionCategory,
} from '@app-builder/components/Scenario/Sanction/FieldSanction';
import { FieldTrigger } from '@app-builder/components/Scenario/Sanction/FieldTrigger';
import {
  NewEmptyTriggerAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import {
  knownOutcomes,
  type SanctionOutcome,
} from '@app-builder/models/outcome';
import { DeleteSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/delete';
import { useEditorMode } from '@app-builder/services/editor';
import { OptionsProvider } from '@app-builder/services/editor/options';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { difference } from 'remeda';
import { Button, Collapsible, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario } from '../../_layout';
import { useRuleGroups } from './_layout';

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
      const { sanction } = useLoaderData<typeof loader>();
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');
      const editorMode = useEditorMode();

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute(
              '/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId',
              {
                scenarioId: fromUUID(scenarioId),
                iterationId: fromUUID(iterationId),
                sanctionId: fromUUID(sanction.id),
              },
            )}
          >
            {sanction.name ?? fromUUID(sanction.id)}
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
  const { authService } = serverServices;
  const {
    customListsRepository,
    editor,
    dataModelRepository,
    scenarioIterationSanctionRepository,
  } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const sanctionId = fromParams(params, 'sanctionId');

  const accessorsPromise = editor.listAccessors({
    scenarioId,
  });

  const dataModelPromise = dataModelRepository.getDataModel();
  const customLists = await customListsRepository.listCustomLists();
  const categories: SanctionCategory[] = [
    {
      id: 'global',
      name: 'Global',
      lists: [
        {
          id: 'global-1',
          name: 'Global 1',
        },
        {
          id: 'global-2',
          name: 'Global 2',
        },
      ],
    },
    {
      id: 'warrants-and-criminal-entities',
      name: 'Warrants and Criminal Entities',
      lists: [
        {
          id: 'warrants-and-criminal-entities-1',
          name: 'Warrants and Criminal Entities 1',
        },
        {
          id: 'warrants-and-criminal-entities-2',
          name: 'Warrants and Criminal Entities 2',
        },
      ],
    },
    {
      id: 'luxembourg-administrative-sanctions',
      name: 'Luxembourg Administrative Sanctions',
      lists: [
        {
          id: 'luxembourg-administrative-sanctions-1',
          name: 'Luxembourg Administrative Sanctions 1',
        },
        {
          id: 'luxembourg-administrative-sanctions-2',
          name: 'Luxembourg Administrative Sanctions 2',
        },
      ],
    },
    {
      id: 'türkiye-ministry-of-internal-affairs-terrorist-wanted-list',
      name: 'Türkiye Ministry Of Internal Affairs Terrorist Wanted List',
      lists: [
        {
          id: 'türkiye-ministry-of-internal-affairs-terrorist-wanted-list-1',
          name: 'Türkiye Ministry Of Internal Affairs Terrorist Wanted List 1',
        },
        {
          id: 'türkiye-ministry-of-internal-affairs-terrorist-wanted-list-2',
          name: 'Türkiye Ministry Of Internal Affairs Terrorist Wanted List 2',
        },
      ],
    },
  ];

  return {
    databaseAccessors: (await accessorsPromise).databaseAccessors,
    payloadAccessors: (await accessorsPromise).payloadAccessors,
    dataModel: await dataModelPromise,
    sanction: await scenarioIterationSanctionRepository.getSanction({
      sanctionId,
    }),
    customLists,
    categories,
  };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const session = await getSession(request);
  const formData = await request.formData();

  console.log('Form Data Keys', formData.keys().toArray());
  console.log('Form Data Values', formData.values().toArray());

  const submission = parseWithZod(formData, { schema: editSanctionFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { scenarioIterationSanctionRepository, organization, user } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  try {
    const sanctionId = fromParams(params, 'sanctionId');

    await scenarioIterationSanctionRepository.updateSanction({
      sanctionId,
      name: submission.value.name,
      description: submission.value.description,
      ruleGroup: submission.value.ruleGroup,
      formula: submission.value.formula,
      counterPartyName: submission.value.counterPartyName,
      transactionLabel: submission.value.transactionLabel,
      lists: submission.value.lists,
    });

    await organization.updateOrganization({
      organizationId: user.organizationId,
      changes: {
        sanctionCheck: {
          forcedOutcome: submission.value.forcedOutcome,
          similarityScore: submission.value.similarityScore,
        },
      },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'error' },
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

const editSanctionFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  ruleGroup: z.string().min(1),
  forcedOutcome: z.union([
    z.literal('review'),
    z.literal('decline'),
    z.literal('block_and_review'),
  ]),
  formula: z.any().nullish(),
  matchSettings: z.object({
    counterPartyName: z.array(z.any()).max(5),
    transactionLabel: z.array(z.any()).max(1),
  }),
  lists: z.array(z.string()).min(1),
});

type EditSanctionForm = z.infer<typeof editSanctionFormSchema>;

export default function SanctionDetail() {
  const { t } = useTranslation(['scenarios', 'common', 'decisions']);
  const {
    sanction,
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    categories,
  } = useLoaderData<typeof loader>();
  const iterationId = useParam('iterationId');
  const fetcher = useFetcher<typeof action>();
  const scenario = useCurrentScenario();
  const defaultRuleGroups = useRuleGroups();
  const ruleGroups = useMemo(
    () => [...defaultRuleGroups, 'Sanction check'],
    [defaultRuleGroups],
  );
  const {
    org: { sanctionCheck },
  } = useOrganizationDetails();

  const form = useForm<EditSanctionForm>({
    onSubmit: ({ value }) => fetcher.submit(value),
    validators: {
      onChange: editSanctionFormSchema,
      onBlur: editSanctionFormSchema,
      onSubmit: editSanctionFormSchema,
    },
    defaultValues: {
      name: sanction.name,
      lists: sanction.lists,
      description: sanction.description,
      ruleGroup: sanction.ruleGroup ?? 'Sanction check',
      forcedOutcome: sanctionCheck.forcedOutcome,
      formula: sanction.formula ?? NewEmptyTriggerAstNode(),
      matchSettings: {
        transactionLabel: sanction.transactionLabel ?? [NewUndefinedAstNode()],
        counterPartyName: sanction.counterPartyName ?? [NewUndefinedAstNode()],
      },
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
          <fetcher.Form
            className="flex flex-col gap-8"
            // action={getRoute(
            //   '/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId',
            //   {
            //     scenarioId: fromUUID(scenario.id),
            //     iterationId: fromUUID(iterationId),
            //     sanctionId: fromUUID(sanction.id),
            //   },
            // )}
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
                  <form.Field name="forcedOutcome">
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
                <form.Field name="formula">
                  {(field) => (
                    <FieldTrigger
                      scenarioId={scenario.id}
                      iterationId={iterationId}
                      options={options}
                      onBlur={field.handleBlur}
                      onChange={field.handleChange}
                      name={field.name}
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
                    <form.Field name="matchSettings.counterPartyName">
                      {(field) => (
                        <div className="flex flex-col gap-4">
                          <FormLabel name={field.name}>
                            Counterparty name
                          </FormLabel>
                          <FieldMatches
                            name={field.name}
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
                    <form.Field name="matchSettings.transactionLabel">
                      {(field) => (
                        <div className="flex flex-col gap-4">
                          <FormLabel name={field.name}>
                            Transaction Label
                          </FormLabel>
                          <FieldMatches
                            name={field.name}
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            placeholder="Select the transaction label"
                            limit={1}
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
                <form.Field name="lists">
                  {(field) => (
                    <div className="flex flex-col gap-2">
                      <FieldSanction
                        name={field.name}
                        defaultValue={field.state.value}
                        onChange={field.handleChange}
                        onBlur={field.handleBlur}
                        categories={categories}
                      />
                      <FormErrorOrDescription
                        errors={field.state.meta.errors}
                      />
                    </div>
                  )}
                </form.Field>
              </Collapsible.Content>
            </Collapsible.Container>

            <div className="sticky bottom-4 flex w-full max-w-3xl items-center justify-center lg:bottom-6">
              <div className="bg-grey-100 border-grey-90 flex w-fit flex-row gap-2 rounded-md border p-2 drop-shadow-md">
                <DeleteSanction
                  sanctionId={sanction.id}
                  iterationId={sanction.scenarioIterationId}
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
          </fetcher.Form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
