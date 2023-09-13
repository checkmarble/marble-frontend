import {
  Callout,
  Paper,
  scenarioI18n,
  ScenarioPage,
} from '@app-builder/components';
import { AstBuilder } from '@app-builder/components/AstBuilder';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type AstNode } from '@app-builder/models';
import { adaptDataModelDto } from '@app-builder/models/data-model';
import { DeleteRule } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/rules/delete';
import { useTriggerOrRuleValidationFetcher } from '@app-builder/routes/ressources/scenarios/$scenarioId/$iterationId/validate-with-given-trigger-or-rule';
import {
  adaptAstNodeFromEditorViewModel,
  useAstBuilder,
} from '@app-builder/services/editor/ast-editor';
import { serverServices } from '@app-builder/services/init.server';
import { countNodeEvaluationErrors } from '@app-builder/services/validation/scenario-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { Button, Input, Tag } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { z } from 'zod';

export const handle = {
  i18n: [...scenarioI18n, 'common'] satisfies Namespace,
};

export async function loader({ request, params }: LoaderArgs) {
  const { authService, makeScenarioService } = serverServices;
  const { apiClient, editor, scenario, user } =
    await authService.isAuthenticated(request, {
      failureRedirect: '/login',
    });

  const ruleId = fromParams(params, 'ruleId');
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  if (!user.permissions.canManageScenario) {
    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/view/rules/:ruleId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
        ruleId: fromUUID(ruleId),
      })
    );
  }

  const operatorsPromise = editor.listOperators({
    scenarioId,
  });

  const identifiersPromise = editor.listIdentifiers({
    scenarioId,
  });

  const dataModelPromise = apiClient.getDataModel();
  const { custom_lists } = await apiClient.listCustomLists();

  const scenarioService = makeScenarioService(scenario);
  const scenarioIterationRulePromise = scenarioService.getScenarioIterationRule(
    {
      iterationId,
      ruleId,
    }
  );

  return json({
    rule: await scenarioIterationRulePromise,
    identifiers: await identifiersPromise,
    operators: await operatorsPromise,
    dataModels: adaptDataModelDto((await dataModelPromise).data_model),
    customLists: custom_lists,
  });
}

const editRuleFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  scoreModifier: z.coerce.number().int().min(-1000).max(1000),
});

export async function action({ request, params }: ActionArgs) {
  const {
    authService,
    sessionService: { getSession, commitSession },
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
      { headers: { 'Set-Cookie': await commitSession(session) } }
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
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function RuleEdit() {
  const { t } = useTranslation(handle.i18n);

  const { identifiers, operators, rule, dataModels, customLists } =
    useLoaderData<typeof loader>();

  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');
  const ruleId = useParam('ruleId');

  const fetcher = useFetcher<typeof action>();
  const { validate, validation: localValidation } =
    useTriggerOrRuleValidationFetcher(scenarioId, iterationId, ruleId);

  const astEditor = useAstBuilder({
    backendAst: rule.ast,
    backendValidation: rule.validation,
    localValidation,
    identifiers,
    operators,
    dataModels,
    customLists,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSave: () => {},
    onValidate: validate,
  });
  const getCurrentAstNode = () =>
    adaptAstNodeFromEditorViewModel(astEditor.editorNodeViewModel);

  const formMethods = useForm<z.infer<typeof editRuleFormSchema>>({
    defaultValues: {
      name: rule.name,
      description: rule.description,
      scoreModifier: rule.scoreModifier,
    },
    mode: 'onChange',
  });
  const { control, setError } = formMethods;
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
          <Tag size="big" border="square">
            {t('common:edit')}
          </Tag>
        </div>
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
              }
            );
          }}
        >
          {t('common:save')}
        </Button>
      </ScenarioPage.Header>

      <Callout variant="error">
        {t('common:validation_error', {
          count: countNodeEvaluationErrors(rule.validation),
        })}
      </Callout>

      <ScenarioPage.Content className="max-w-3xl">
        <Paper.Container scrollable={false}>
          <FormProvider {...formMethods}>
            <FormField
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>{t('common:name')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t('scenarios:edit_rule.name_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="description"
              control={control}
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>{t('common:description')}</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder={t(
                        'scenarios:edit_rule.description_placeholder'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
            <FormField
              name="scoreModifier"
              control={control}
              render={({ field, fieldState }) => (
                <FormItem className="flex flex-col gap-2">
                  <FormLabel>{t('scenarios:create_rule.score')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder={t('scenarios:edit_rule.score_placeholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
              )}
            />
          </FormProvider>
        </Paper.Container>

        <div className="max-w flex flex-col gap-4">
          <Paper.Container scrollable={false}>
            <AstBuilder builder={astEditor} />
          </Paper.Container>
        </div>
        <DeleteRule
          ruleId={ruleId}
          iterationId={iterationId}
          scenarioId={scenarioId}
        />
      </ScenarioPage.Content>
    </ScenarioPage.Container>
  );
}
