import {
  Callout,
  CalloutV2,
  OutcomeTag,
  Page,
  scenarioI18n,
} from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelectWithCombobox } from '@app-builder/components/Form/FormSelectWithCombobox';
import { Highlight } from '@app-builder/components/Highlight';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { Operand } from '@app-builder/components/Scenario/AstBuilder/AstBuilderNode/Operand';
import {
  type AstNode,
  astNodeSchema,
  NewEmptyTriggerAstNode,
  NewUndefinedAstNode,
} from '@app-builder/models';
import { type KnownOutcome, knownOutcomes } from '@app-builder/models/outcome';
import { DeleteSanction } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/sanctions+/delete';
import { useTriggerValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import {
  useAstNodeEditor,
  useValidateAstNode,
} from '@app-builder/services/editor/ast-editor';
import {
  OptionsProvider,
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { serverServices } from '@app-builder/services/init.server';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { matchSorter } from 'match-sorter';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { difference } from 'remeda';
import {
  Button,
  Collapsible,
  CollapsibleV2,
  Input,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenario } from '../../_layout';
import {
  useCurrentScenarioIteration,
  useCurrentScenarioValidation,
  useRuleGroups,
} from './_layout';

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

  return {
    databaseAccessors: (await accessorsPromise).databaseAccessors,
    payloadAccessors: (await accessorsPromise).payloadAccessors,
    dataModel: await dataModelPromise,
    sanction: await scenarioIterationSanctionRepository.getSanction({
      sanctionId,
    }),
    customLists,
  };
}

const editSanctionFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  ruleGroup: z.string(),
  similarityScore: z.coerce.number().int().min(0).max(100),
  forcedOutcome: z.enum(['review', 'decline', 'block_and_review']),
  formula: astNodeSchema,
  matches: z.array(astNodeSchema),
});

type EditSanctionFormValues = z.infer<typeof editSanctionFormSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const formData = await request.formData();
  const session = await getSession(request);
  const { scenarioIterationSanctionRepository, organization, user } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const submission = parseWithZod(formData, { schema: editSanctionFormSchema });

  if (submission.status !== 'success') {
    console.log('Error when submission', submission.error);
    return submission.reply();
  }

  const formValues = submission.value;

  try {
    const sanctionId = fromParams(params, 'sanctionId');

    await scenarioIterationSanctionRepository.updateSanction({
      sanctionId,
      name: formValues.name,
      description: formValues.description,
      ruleGroup: formValues.ruleGroup,
      formula: formValues.formula,
    });

    await organization.updateOrganization({
      organizationId: user.organizationId,
      changes: {
        sanctionCheck: {
          forcedOutcome: formValues.forcedOutcome,
          similarityScore: formValues.similarityScore,
        },
      },
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(submission.reply(), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    console.log('Error when saving sanction', error);

    return json(submission.reply(), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

const MatchOperand = ({ node }: { node: AstNode }) => {
  const getOperandAstNodeOperandProps = useGetAstNodeOperandProps();
  const options = useOperandOptions();

  return (
    <Operand
      {...getOperandAstNodeOperandProps(node)}
      placeholder="Select the First name or Full Name"
      options={options.filter((o) => o.dataType === 'String')}
      validationStatus="valid"
      onSave={(astNode) => console.log(astNode)}
    />
  );
};

export default function SanctionDetail() {
  const { t } = useTranslation(['scenarios', 'common', 'decisions']);
  const {
    sanction,
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
  } = useLoaderData<typeof loader>();
  const iterationId = useParam('iterationId');
  const fetcher = useFetcher<typeof action>();
  const scenario = useCurrentScenario();
  const scenarioValidation = useCurrentScenarioValidation();
  const scenarioIteration = useCurrentScenarioIteration();
  const defaultRuleGroups = useRuleGroups();
  const ruleGroups = useMemo(
    () => [...defaultRuleGroups, 'Sanction check'],
    [defaultRuleGroups],
  );
  const {
    org: { sanctionCheck },
  } = useOrganizationDetails();

  const { validate, validation } = useTriggerValidationFetcher(
    scenarioIteration.scenarioId,
    scenarioIteration.id,
  );

  const astEditorStore = useAstNodeEditor({
    initialAstNode: sanction.formula ?? NewEmptyTriggerAstNode(),
    initialEvaluation: scenarioValidation.trigger.triggerEvaluation,
  });

  const [nodes, setNodes] = useState<AstNode[]>([NewUndefinedAstNode()]);

  useValidateAstNode(astEditorStore, validate, validation);

  const formRef = useRef<HTMLFormElement>(null);
  const [form, fields] = useForm<EditSanctionFormValues>({
    lastResult: fetcher.data,
    constraint: getZodConstraint(editSanctionFormSchema),
    shouldRevalidate: 'onInput',
    defaultValue: {
      name: sanction.name,
      description: sanction.description,
      ruleGroup: 'Sanction check',
      forcedOutcome: sanctionCheck.forcedOutcome as KnownOutcome,
      similarityScore: sanctionCheck.similarityScore,
      formula: sanction.formula,
      matches: sanction.matches,
    },
    onValidate: ({ formData }) =>
      parseWithZod(formData, { schema: editSanctionFormSchema }),
  });

  return (
    <Page.Main>
      <Page.Header className="justify-between">
        <BreadCrumbs />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <FormProvider context={form.context}>
            <fetcher.Form
              className="flex flex-col gap-8"
              ref={formRef}
              method="post"
              action={getRoute(
                '/scenarios/:scenarioId/i/:iterationId/sanctions/:sanctionId',
                {
                  scenarioId: fromUUID(scenario.id),
                  iterationId: fromUUID(iterationId),
                  sanctionId: fromUUID(sanction.id),
                },
              )}
              {...getFormProps(form)}
            >
              <Collapsible.Container className="bg-grey-100 max-w-3xl">
                <Collapsible.Title>
                  {t('scenarios:edit_rule.informations')}
                </Collapsible.Title>
                <Collapsible.Content>
                  <div className="flex flex-col gap-4 lg:gap-6">
                    <FormField
                      name={fields.name.name}
                      className="flex flex-col gap-2"
                    >
                      <FormLabel className="text-m">
                        {t('common:name')}
                      </FormLabel>
                      <FormInput
                        type="text"
                        placeholder={t('scenarios:edit_rule.name_placeholder')}
                      />
                      <FormErrorOrDescription />
                    </FormField>
                    <FormField
                      name={fields.description.name}
                      className="flex flex-col gap-2"
                    >
                      <FormLabel className="text-m">
                        {t('common:description')}
                      </FormLabel>
                      <FormInput
                        type="text"
                        placeholder={t(
                          'scenarios:edit_rule.description_placeholder',
                        )}
                      />
                      <FormErrorOrDescription />
                    </FormField>
                    <FormField
                      name={fields.ruleGroup.name}
                      className="flex flex-col gap-2"
                    >
                      <FormLabel className="text-m">
                        {t('scenarios:rules.rule_group')}
                      </FormLabel>
                      <FormSelectWithCombobox.Control
                        multiple={false}
                        options={ruleGroups}
                        render={({ selectedValue }) => (
                          <RuleGroup
                            disabled
                            selectedRuleGroup={selectedValue}
                            ruleGroups={ruleGroups}
                          />
                        )}
                      />
                      <FormErrorOrDescription />
                    </FormField>
                  </div>
                </Collapsible.Content>
              </Collapsible.Container>

              <Collapsible.Container className="bg-grey-100 max-w-3xl">
                <Collapsible.Title>
                  {t('scenarios:edit_sanction.global_settings')}
                </Collapsible.Title>
                <Collapsible.Content>
                  <div className="flex flex-col gap-4 lg:gap-6">
                    <CalloutV2>
                      {t('scenarios:edit_sanction.global_settings.callout')}
                    </CalloutV2>
                    <FormField
                      name={fields.forcedOutcome.name}
                      className="flex flex-col gap-2"
                    >
                      <FormLabel className="text-m">
                        {t('decisions:outcome')}
                      </FormLabel>
                      <FormSelectWithCombobox.Control
                        multiple={false}
                        options={difference(knownOutcomes, ['approve'])}
                        render={({ selectedValue }) => (
                          <Outcomes
                            selectedOutcome={selectedValue as KnownOutcome}
                            outcomes={difference(knownOutcomes, ['approve'])}
                          />
                        )}
                      />
                      <FormErrorOrDescription />
                    </FormField>
                    <FormField
                      name={fields.similarityScore.name}
                      className="flex flex-col gap-2"
                    >
                      <FormLabel className="text-m">
                        {t('scenarios:edit_sanction.similarity_score')}
                      </FormLabel>
                      <FormInput
                        type="number"
                        endAdornment="number"
                        placeholder={t(
                          'scenarios:edit_sanction.similarity_score',
                        )}
                      />
                      <FormErrorOrDescription />
                    </FormField>
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
                  <FormField name={fields.formula.name}>
                    <AstBuilder
                      astEditorStore={astEditorStore}
                      options={{
                        databaseAccessors,
                        payloadAccessors,
                        dataModel,
                        customLists,
                        triggerObjectType: scenario.triggerObjectType,
                      }}
                    />
                  </FormField>
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
                  <FormField name={fields.matches.name}>
                    <div className="flex gap-2">
                      <OptionsProvider
                        customLists={customLists}
                        dataModel={dataModel}
                        databaseAccessors={databaseAccessors}
                        payloadAccessors={payloadAccessors}
                        triggerObjectType={scenario.triggerObjectType}
                      >
                        {nodes.map((n, i) => (
                          <>
                            <MatchOperand key={i} node={n} />
                            {i === nodes.length - 1 ? null : (
                              <Button variant="secondary">
                                <Icon icon="plus" className="size-5" />
                              </Button>
                            )}
                          </>
                        ))}
                      </OptionsProvider>
                    </div>
                  </FormField>
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
                  <FormField name={fields.formula.name}>
                    <CollapsibleV2.Provider>
                      <CollapsibleV2.Title>Global</CollapsibleV2.Title>
                      <CollapsibleV2.Content>TATATATATA</CollapsibleV2.Content>
                    </CollapsibleV2.Provider>
                  </FormField>
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
          </FormProvider>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}

const RuleGroup = ({
  selectedRuleGroup,
  ruleGroups,
  disabled,
}: {
  selectedRuleGroup?: string;
  ruleGroups: string[];
  disabled?: boolean;
}) => {
  const { t } = useTranslation(['scenarios']);
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(ruleGroups, deferredSearchValue),
    [ruleGroups, deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedRuleGroup}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
    >
      <FormSelectWithCombobox.Select disabled={disabled} className="w-full">
        <span className={clsx({ 'text-grey-80': disabled })}>
          {selectedRuleGroup}
        </span>
        {disabled ? null : <FormSelectWithCombobox.Arrow />}
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((group) => (
            <FormSelectWithCombobox.ComboboxItem key={group} value={group}>
              <Highlight text={group} query={deferredSearchValue} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
          {matches.length === 0 ? (
            <p className="text-grey-50 text-xs">
              {t('scenarios:edit_rule.rule_group.empty_matches')}
            </p>
          ) : null}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
};

const Outcomes = ({
  selectedOutcome,
  outcomes,
  onOpenChange,
}: {
  selectedOutcome?: KnownOutcome;
  outcomes: KnownOutcome[];
  onOpenChange?: (open: boolean) => void;
}) => {
  const [searchValue, setSearchValue] = useState('');
  const deferredSearchValue = useDeferredValue(searchValue);

  const matches = useMemo(
    () => matchSorter(outcomes, deferredSearchValue),
    [outcomes, deferredSearchValue],
  );

  return (
    <FormSelectWithCombobox.Root
      selectedValue={selectedOutcome}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onOpenChange={onOpenChange}
    >
      <FormSelectWithCombobox.Select className="w-full">
        {selectedOutcome ? (
          <OutcomeTag border="square" outcome={selectedOutcome} />
        ) : null}
        <FormSelectWithCombobox.Arrow />
      </FormSelectWithCombobox.Select>
      <FormSelectWithCombobox.Popover className="z-50 flex flex-col gap-2 p-2">
        <FormSelectWithCombobox.Combobox
          render={<Input className="shrink-0" />}
          autoSelect
          autoFocus
        />
        <FormSelectWithCombobox.ComboboxList>
          {matches.map((outcome) => (
            <FormSelectWithCombobox.ComboboxItem key={outcome} value={outcome}>
              <OutcomeTag border="square" outcome={outcome} />
            </FormSelectWithCombobox.ComboboxItem>
          ))}
        </FormSelectWithCombobox.ComboboxList>
      </FormSelectWithCombobox.Popover>
    </FormSelectWithCombobox.Root>
  );
};
