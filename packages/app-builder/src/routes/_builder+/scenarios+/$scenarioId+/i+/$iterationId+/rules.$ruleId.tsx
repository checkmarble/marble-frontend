import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { AstBuilder } from '@app-builder/components/Scenario/AstBuilder';
import { ScenarioValidationError } from '@app-builder/components/Scenario/ScenarioValidationError';
import {
  type AstNode,
  NewEmptyRuleAstNode,
  type ScenarioIterationRule,
} from '@app-builder/models';
import { adaptDataModelDto } from '@app-builder/models/data-model';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { DeleteRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete';
import { DuplicateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate';
import { useTriggerOrRuleValidationFetcher } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/validate-with-given-trigger-or-rule';
import {
  useCurrentScenarioIterationRule,
  useEditorMode,
} from '@app-builder/services/editor';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder as AstBuilderType,
  useAstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import {
  useCurrentRuleValidationRule,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { formatNumber } from '@app-builder/utils/format';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { FormProvider, useForm, type UseFormReturn } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, Input, Tag } from 'ui-design-system';
import { z } from 'zod';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient, editor } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const scenarioId = fromParams(params, 'scenarioId');

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const identifiersPromise = editor.listIdentifiers({
    scenarioId,
  });

  const dataModelPromise = apiClient.getDataModel();
  const { custom_lists } = await apiClient.listCustomLists();

  return json({
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    dataModel: adaptDataModelDto((await dataModelPromise).data_model),
    customLists: custom_lists,
  });
}

const editRuleFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
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
  const { editor } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

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

    await editor.saveRule({
      ruleId,
      astNode,
      name: formValues.name,
      description: formValues.description,
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

export default function RuleEdit() {
  const { t } = useTranslation(handle.i18n);

  const { identifiers, operators, dataModel, customLists } =
    useLoaderData<typeof loader>();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const fetcher = useFetcher<typeof action>();
  const { validate, validation: localValidation } =
    useTriggerOrRuleValidationFetcher(scenarioId, iterationId, ruleId);

  const scenario = useCurrentScenario();
  const rule = useCurrentScenarioIterationRule();
  const ruleValidation = useCurrentRuleValidationRule();

  const editorMode = useEditorMode();

  const initialAst = rule.formula ?? NewEmptyRuleAstNode();
  const astEditor = useAstBuilder({
    backendAst: initialAst,
    backendValidation: ruleValidation.ruleEvaluation,
    localValidation,
    identifiers,
    operators,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
    onValidate: validate,
  });
  const getCurrentAstNode = () =>
    adaptAstNodeFromEditorViewModel(astEditor.editorNodeViewModel);

  const formMethods = useForm<EditRuleFormValues>({
    defaultValues: {
      name: rule.name,
      description: rule.description,
      scoreModifier: rule.scoreModifier,
    },
    mode: 'onChange',
  });
  const { setError } = formMethods;
  const { data } = fetcher;
  const errors = data?.errors;

  useEffect(() => {
    if (!errors) return;

    R.forEachObj.indexed(errors.fieldErrors, (err, name) => {
      const message = err?.[0];
      if (message === undefined) return;
      setError(name, {
        type: 'custom',
        message,
      });
    });
  }, [errors, setError]);

  return (
    <ScenarioPage.Container>
      <ScenarioPage.Header className="justify-between">
        <div className="flex flex-row items-center gap-4">
          <Link to="./..">
            <ScenarioPage.BackButton />
          </Link>
          {rule.name ?? fromUUID(ruleId)}
          {editorMode === 'edit' ? (
            <Tag size="big" border="square">
              {t('common:edit')}
            </Tag>
          ) : null}
        </div>
        {editorMode === 'edit' ? (
          <div className="flex flex-row gap-4">
            <DuplicateRule
              ruleId={ruleId}
              iterationId={iterationId}
              scenarioId={scenarioId}
            />
            <Button
              onClick={() => {
                const values = formMethods.getValues();
                fetcher.submit(
                  {
                    astNode: getCurrentAstNode(),
                    formValues: values,
                  },
                  {
                    method: 'PATCH',
                    encType: 'application/json',
                  },
                );
              }}
            >
              {t('common:save')}
            </Button>
          </div>
        ) : null}
      </ScenarioPage.Header>

      {editorMode === 'view' ? (
        <RuleViewContent builder={astEditor} rule={rule} />
      ) : (
        <RuleEditContent
          builder={astEditor}
          iterationId={iterationId}
          scenarioId={scenarioId}
          ruleId={ruleId}
          formMethods={formMethods}
        />
      )}
    </ScenarioPage.Container>
  );
}

function RuleViewContent({
  builder,
  rule,
}: {
  builder: AstBuilderType;
  rule: ScenarioIterationRule;
}) {
  const {
    t,
    i18n: { language },
  } = useTranslation(handle.i18n);

  return (
    <ScenarioPage.Content>
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
          <AstBuilder builder={builder} viewOnly={true} />
        </Paper.Container>
      </div>
    </ScenarioPage.Content>
  );
}

function RuleEditContent({
  ruleId,
  iterationId,
  scenarioId,
  builder,
  formMethods,
}: {
  builder: AstBuilderType;
  ruleId: string;
  scenarioId: string;
  iterationId: string;
  formMethods: UseFormReturn<EditRuleFormValues>;
}) {
  const { t } = useTranslation(handle.i18n);

  const ruleValidation = useCurrentRuleValidationRule();
  const getScenarioErrorMessage = useGetScenarioErrorMessage();

  return (
    <ScenarioPage.Content>
      <Paper.Container scrollable={false} className="bg-grey-00 max-w-3xl">
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
            name="scoreModifier"
            control={formMethods.control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('scenarios:create_rule.score')}</FormLabel>
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
      </Paper.Container>

      <Paper.Container scrollable={false} className="bg-grey-00 max-w-3xl">
        <AstBuilder builder={builder} />

        {ruleValidation.errors ? (
          <div className="flex flex-row flex-wrap gap-1">
            {ruleValidation.errors
              .filter((error) => error != 'RULE_FORMULA_REQUIRED')
              .map((error) => (
                <ScenarioValidationError key={error}>
                  {getScenarioErrorMessage(error)}
                </ScenarioValidationError>
              ))}
          </div>
        ) : null}
      </Paper.Container>

      <DeleteRule
        ruleId={ruleId}
        iterationId={iterationId}
        scenarioId={scenarioId}
      />
    </ScenarioPage.Content>
  );
}
