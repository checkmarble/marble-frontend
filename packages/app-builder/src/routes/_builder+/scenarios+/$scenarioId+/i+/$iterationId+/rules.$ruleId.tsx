import { Callout, Page, Paper, scenarioI18n } from '@app-builder/components';
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { Highlight } from '@app-builder/components/Highlight';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { EvaluationErrors } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  type DatabaseAccessAstNode,
  NewEmptyRuleAstNode,
  type PayloadAstNode,
} from '@app-builder/models';
import { type DataModel } from '@app-builder/models/data-model';
import { type OperatorFunction } from '@app-builder/models/editable-operators';
import { type ScenarioIterationRule } from '@app-builder/models/scenario-iteration-rule';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { DeleteRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete';
import { DuplicateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate';
import { useRuleValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import { useEditorMode } from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
  useAstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import { useGetScenarioErrorMessage } from '@app-builder/services/validation';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type CustomList } from 'marble-api';
import { matchSorter } from 'match-sorter';
import * as React from 'react';
import {
  type ControllerRenderProps,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import {
  Button,
  Collapsible,
  Combobox,
  ComboboxItem,
  ComboboxLabel,
  ComboboxPopover,
  ComboboxRoot,
  Input,
  ScrollAreaV2,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import {
  useCurrentRuleValidationRule,
  useCurrentScenarioIterationRule,
  useRuleGroups,
} from './_layout';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient, editor, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const scenarioId = fromParams(params, 'scenarioId');

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const accessorsPromise = editor.listAccessors({
    scenarioId,
  });

  const dataModelPromise = dataModelRepository.getDataModel();
  const { custom_lists } = await apiClient.listCustomLists();

  return json({
    databaseAccessors: (await accessorsPromise).databaseAccessors,
    payloadAccessors: (await accessorsPromise).payloadAccessors,
    operators: await operatorsPromise,
    dataModel: await dataModelPromise,
    customLists: custom_lists,
  });
}

const editRuleFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  ruleGroup: z.string(),
  scoreModifier: z.coerce.number().int().min(-1000).max(1000),
});
type EditRuleFormValues = z.infer<typeof editRuleFormSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { formValues: formValuesRaw, astNode } = (await request.json()) as {
    formValues: z.infer<typeof editRuleFormSchema>;
    astNode: AstNode;
  };

  const session = await getSession(request);
  const { scenarioIterationRuleRepository } = await authService.isAuthenticated(
    request,
    {
      failureRedirect: getRoute('/sign-in'),
    },
  );

  const parsedForm = editRuleFormSchema.safeParse(formValuesRaw);
  if (!parsedForm.success) {
    return json({
      success: false as const,
      values: null,
      errors: parsedForm.error.flatten(),
    });
  }

  const formValues = parsedForm.data;
  try {
    const ruleId = fromParams(params, 'ruleId');

    await scenarioIterationRuleRepository.updateRule({
      ruleId,
      formula: astNode,
      name: formValues.name,
      description: formValues.description,
      ruleGroup: formValues.ruleGroup,
      scoreModifier: formValues.scoreModifier,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });
    return json(
      {
        success: true as const,
        errors: null,
        values: formValues,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    return json(
      {
        success: false as const,
        errors: null,
        values: formValues,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export default function RuleDetail() {
  const { t } = useTranslation(handle.i18n);

  const {
    databaseAccessors,
    payloadAccessors,
    operators,
    dataModel,
    customLists,
  } = useLoaderData<typeof loader>();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const { validate, validation: localValidation } = useRuleValidationFetcher(
    scenarioId,
    iterationId,
    ruleId,
  );

  const scenario = useCurrentScenario();
  const rule = useCurrentScenarioIterationRule();
  const ruleValidation = useCurrentRuleValidationRule();

  const editorMode = useEditorMode();

  const initialAst = rule.formula ?? NewEmptyRuleAstNode();
  const astEditor = useAstBuilder({
    backendAst: initialAst,
    backendEvaluation: ruleValidation.ruleEvaluation,
    localEvaluation: localValidation,
    onValidate: validate,
  });

  const options = {
    databaseAccessors,
    payloadAccessors,
    operators,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
  };

  return (
    <Page.Container>
      <Page.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Page.BackButton />
          <span className="line-clamp-2 text-left">
            {rule.name ?? fromUUID(ruleId)}
          </span>
          {editorMode === 'edit' ? (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          ) : null}
        </div>
      </Page.Header>

      {editorMode === 'view' ? (
        <RuleViewContent
          options={options}
          setOperand={astEditor.setOperand}
          setOperator={astEditor.setOperator}
          appendChild={astEditor.appendChild}
          remove={astEditor.remove}
          editorNodeViewModel={astEditor.editorNodeViewModel}
          rule={rule}
        />
      ) : (
        <RuleEditContent
          options={options}
          setOperand={astEditor.setOperand}
          setOperator={astEditor.setOperator}
          appendChild={astEditor.appendChild}
          remove={astEditor.remove}
          editorNodeViewModel={astEditor.editorNodeViewModel}
          rule={rule}
          scenarioId={scenarioId}
        />
      )}
    </Page.Container>
  );
}

function RuleViewContent({
  options,
  setOperand,
  setOperator,
  appendChild,
  remove,
  editorNodeViewModel,
  rule,
}: {
  options: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunction[];
    dataModel: DataModel;
    customLists: CustomList[];
    triggerObjectType: string;
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  rule: ScenarioIterationRule;
}) {
  const { t } = useTranslation(handle.i18n);
  const language = useFormatLanguage();

  return (
    <Page.Content>
      <Callout className="max-w-3xl" variant="outlined">
        {rule.description}
      </Callout>

      <div className="flex flex-col gap-4">
        <div className="bg-purple-10 inline-flex h-8 w-fit items-center justify-center whitespace-pre rounded px-2 font-normal text-purple-100">
          <Trans
            t={t}
            i18nKey="scenarios:rules.consequence.score_modifier"
            components={{
              Score: <span className="font-semibold" />,
            }}
            values={{
              score: formatNumber(rule.scoreModifier, {
                language,
                signDisplay: 'always',
              }),
            }}
          />
        </div>
        <Paper.Container scrollable={false} className="bg-grey-00 max-w-3xl">
          <AstBuilder
            options={options}
            setOperand={setOperand}
            setOperator={setOperator}
            appendChild={appendChild}
            remove={remove}
            editorNodeViewModel={editorNodeViewModel}
            viewOnly={true}
          />
        </Paper.Container>
      </div>
    </Page.Content>
  );
}

function RuleEditContent({
  options,
  setOperand,
  setOperator,
  appendChild,
  remove,
  editorNodeViewModel,
  rule,
  scenarioId,
}: {
  options: {
    databaseAccessors: DatabaseAccessAstNode[];
    payloadAccessors: PayloadAstNode[];
    operators: OperatorFunction[];
    dataModel: DataModel;
    customLists: CustomList[];
    triggerObjectType: string;
  };
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  appendChild: (nodeId: string, childAst: AstNode) => void;
  remove: (nodeId: string) => void;
  editorNodeViewModel: EditorNodeViewModel;
  rule: ScenarioIterationRule;
  scenarioId: string;
}) {
  const { t } = useTranslation(handle.i18n);

  const ruleValidation = useCurrentRuleValidationRule();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<EditRuleFormValues>({
    defaultValues: {
      name: rule.name,
      description: rule.description,
      ruleGroup: rule.ruleGroup,
      scoreModifier: rule.scoreModifier,
    },
    mode: 'onChange',
  });
  const { setError } = formMethods;
  const { data } = fetcher;
  const errors = data?.errors;

  React.useEffect(() => {
    if (!errors) return;

    R.forEachObj(errors.fieldErrors, (err, name) => {
      const message = err?.[0];
      if (message === undefined) return;
      setError(name, {
        type: 'custom',
        message,
      });
    });
  }, [errors, setError]);

  const handleSave = () => {
    const values = formMethods.getValues();
    fetcher.submit(
      {
        astNode: adaptAstNodeFromEditorViewModel(editorNodeViewModel),
        formValues: values,
      },
      {
        method: 'PATCH',
        encType: 'application/json',
      },
    );
  };

  return (
    <Page.Content>
      <Collapsible.Container className="bg-grey-00 max-w-3xl">
        <Collapsible.Title>
          {t('scenarios:edit_rule.informations')}
        </Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col gap-4 lg:gap-6">
            <FormProvider {...formMethods}>
              <FormField
                name="name"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t('common:name')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t('scenarios:edit_rule.name_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <FormField
                name="description"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t('common:description')}</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder={t(
                          'scenarios:edit_rule.description_placeholder',
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
              <FormField
                name="ruleGroup"
                control={formMethods.control}
                render={({ field }) => <RuleGroup field={field} />}
              />
              <FormField
                name="scoreModifier"
                control={formMethods.control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t('scenarios:edit_rule.score')}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={t('scenarios:edit_rule.score_placeholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormError />
                  </FormItem>
                )}
              />
            </FormProvider>
          </div>
        </Collapsible.Content>
      </Collapsible.Container>

      <Collapsible.Container className="bg-grey-00 max-w-3xl">
        <Collapsible.Title>
          {t('scenarios:edit_rule.formula')}
        </Collapsible.Title>
        <Collapsible.Content>
          <div className="flex flex-col gap-4 lg:gap-6">
            <AstBuilder
              options={options}
              setOperand={setOperand}
              setOperator={setOperator}
              appendChild={appendChild}
              remove={remove}
              editorNodeViewModel={editorNodeViewModel}
            />

            <EvaluationErrors
              errors={ruleValidation.errors
                .filter((error) => error != 'RULE_FORMULA_REQUIRED')
                .map(getScenarioErrorMessage)}
            />
          </div>
        </Collapsible.Content>
      </Collapsible.Container>

      <div className="sticky bottom-4 left-4 flex w-full max-w-3xl items-center justify-center lg:bottom-6 lg:left-6">
        <div className="bg-grey-00 border-grey-10 flex w-fit flex-row gap-2 rounded-md border p-2 drop-shadow-md">
          <DeleteRule
            ruleId={rule.id}
            iterationId={rule.scenarioIterationId}
            scenarioId={scenarioId}
          >
            <Button color="red" className="w-fit">
              <Icon icon="delete" className="size-5" aria-hidden />
              {t('common:delete')}
            </Button>
          </DeleteRule>

          <DuplicateRule
            ruleId={rule.id}
            iterationId={rule.scenarioIterationId}
            scenarioId={scenarioId}
          >
            <Button variant="secondary" className="w-fit">
              <Icon icon="copy" className="size-5" aria-hidden />
              {t('scenarios:clone_rule.button')}
            </Button>
          </DuplicateRule>

          <Button onClick={handleSave} className="flex-1">
            <Icon icon="save" className="size-5" aria-hidden />
            {t('common:save')}
          </Button>
        </div>
      </div>
    </Page.Content>
  );
}

function RuleGroup({
  field,
}: {
  field: ControllerRenderProps<EditRuleFormValues, 'ruleGroup'>;
}) {
  const { t } = useTranslation(handle.i18n);
  const searchValue = React.useDeferredValue(field.value);
  const ruleGroups = useRuleGroups();

  const matches = React.useMemo(
    () => matchSorter(ruleGroups, searchValue),
    [searchValue, ruleGroups],
  );

  return (
    <ComboboxRoot
      open={ruleGroups.length === 0 ? false : undefined}
      value={field.value}
      setValue={field.onChange}
      selectedValue={field.value}
      setSelectedValue={field.onChange}
    >
      <FormItem className="flex flex-col gap-2">
        <ComboboxLabel render={<FormLabel />}>
          {t('scenarios:rules.rule_group')}
        </ComboboxLabel>
        <FormControl>
          <Combobox
            ref={field.ref}
            disabled={field.disabled}
            name={field.name}
            onBlur={field.onBlur}
            placeholder={t('scenarios:edit_rule.rule_group_placeholder')}
          />
        </FormControl>
        <FormError />
        <ComboboxPopover
          className="flex flex-col gap-2 p-2"
          fitViewport
          portal
          sameWidth
        >
          <ScrollAreaV2>
            {matches.map((item) => {
              return (
                <ComboboxItem key={item} value={item}>
                  <Highlight text={item} query={searchValue} />
                </ComboboxItem>
              );
            })}
            {matches.length === 0 ? (
              <p className="text-grey-50 text-xs">
                {t('scenarios:edit_rule.rule_group.empty_matches')}
              </p>
            ) : null}
          </ScrollAreaV2>
        </ComboboxPopover>
      </FormItem>
    </ComboboxRoot>
  );
}
