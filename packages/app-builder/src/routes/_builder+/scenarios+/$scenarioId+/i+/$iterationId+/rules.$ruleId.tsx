import { Page, scenarioI18n } from '@app-builder/components';
import {
  BreadCrumbLink,
  type BreadCrumbProps,
  BreadCrumbs,
} from '@app-builder/components/Breadcrumbs';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Sanction/FieldRuleGroup';
import { FieldTrigger } from '@app-builder/components/Scenario/Sanction/FieldTrigger';
import useIntersection from '@app-builder/hooks/useIntersection';
import { useCurrentScenario } from '@app-builder/routes/_builder+/scenarios+/$scenarioId+/_layout';
import { DeleteRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/delete';
import { DuplicateRule } from '@app-builder/routes/ressources+/scenarios+/$scenarioId+/$iterationId+/rules+/duplicate';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID, useParam } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
} from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, CtaClassName, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { useCurrentScenarioIterationRule, useRuleGroups } from './_layout';

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
      const rule = useCurrentScenarioIterationRule();
      const scenarioId = useParam('scenarioId');
      const iterationId = useParam('iterationId');
      const editorMode = useEditorMode();

      return (
        <div className="flex items-center gap-2">
          <BreadCrumbLink
            isLast={isLast}
            to={getRoute(
              '/scenarios/:scenarioId/i/:iterationId/rules/:ruleId',
              {
                scenarioId: fromUUID(scenarioId),
                iterationId: fromUUID(iterationId),
                ruleId: fromUUID(rule.id),
              },
            )}
          >
            {rule.name ?? fromUUID(rule.id)}
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
  const { customListsRepository, editor, dataModelRepository } =
    await authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    });

  const [{ databaseAccessors, payloadAccessors }, dataModel, customLists] =
    await Promise.all([
      editor.listAccessors({ scenarioId: fromParams(params, 'scenarioId') }),
      dataModelRepository.getDataModel(),
      customListsRepository.listCustomLists(),
    ]);

  return {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
  };
}

const editRuleFormSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  ruleGroup: z.string().min(1),
  scoreModifier: z.coerce.number().int().min(-1000).max(1000),
  formula: z.any(),
});

type EditRuleFormValues = z.infer<typeof editRuleFormSchema>;

export async function action({ request, params }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [session, data, { scenarioIterationRuleRepository }] =
    await Promise.all([
      getSession(request),
      request.json(),
      authService.isAuthenticated(request, {
        failureRedirect: getRoute('/sign-in'),
      }),
    ]);

  const result = editRuleFormSchema.safeParse(data);

  if (!result.success) {
    return json(
      { status: 'error', errors: result.error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await scenarioIterationRuleRepository.updateRule({
      ruleId: fromParams(params, 'ruleId'),
      ...result.data,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'success', errors: [] },
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
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export default function RuleDetail() {
  const { databaseAccessors, payloadAccessors, dataModel, customLists } =
    useLoaderData<typeof loader>();

  const { t } = useTranslation(handle.i18n);
  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');

  const fetcher = useFetcher<typeof action>();
  const scenario = useCurrentScenario();
  const rule = useCurrentScenarioIterationRule();
  const editor = useEditorMode();
  const ruleGroups = useRuleGroups();

  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  const form = useForm<EditRuleFormValues>({
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, { method: 'PATCH', encType: 'application/json' });
      }
    },
    validators: {
      onChangeAsync: editRuleFormSchema,
      onBlurAsync: editRuleFormSchema,
      onSubmitAsync: editRuleFormSchema,
    },
    defaultValues: rule,
  });

  const options = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: scenario.triggerObjectType,
  };

  //TODO Add errors from the servers if they are present

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs
          back={getRoute('/scenarios/:scenarioId/i/:iterationId/rules', {
            iterationId: fromUUID(iterationId),
            scenarioId: fromUUID(scenario.id),
          })}
        />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <form
            className="relative flex max-w-3xl flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div
              className={cn(
                'bg-purple-99 sticky top-0 z-20 flex h-[88px] items-center justify-between',
                {
                  'border-b-grey-90 border-b': !intersection?.isIntersecting,
                },
              )}
            >
              <form.Field name="name">
                {(field) => (
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      name={field.name}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.currentTarget.value)
                      }
                      onBlur={field.handleBlur}
                      className="text-grey-00 text-l w-full border-none bg-transparent font-normal outline-none"
                      placeholder={t('scenarios:edit_rule.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>
              {editor === 'edit' ? (
                <div className="flex items-center gap-2">
                  <Ariakit.MenuProvider>
                    <Ariakit.MenuButton
                      className={CtaClassName({
                        variant: 'secondary',
                        size: 'icon',
                        className: 'size-[40px]',
                      })}
                    >
                      <Icon icon="dots-three" className="size-4" />
                    </Ariakit.MenuButton>
                    <Ariakit.Menu
                      shift={-80}
                      className="bg-grey-100 border-grey-90 mt-2 flex flex-col gap-2 rounded border p-2"
                    >
                      <DuplicateRule
                        ruleId={rule.id}
                        iterationId={rule.scenarioIterationId}
                        scenarioId={scenarioId}
                      >
                        <Button variant="secondary" type="button">
                          <Icon icon="copy" className="size-5" aria-hidden />
                          {t('scenarios:clone_rule.button')}
                        </Button>
                      </DuplicateRule>

                      <DeleteRule
                        ruleId={rule.id}
                        iterationId={rule.scenarioIterationId}
                        scenarioId={scenarioId}
                      >
                        <Button color="red" type="button">
                          <Icon icon="delete" className="size-5" aria-hidden />
                          {t('common:delete')}
                        </Button>
                      </DeleteRule>
                    </Ariakit.Menu>
                  </Ariakit.MenuProvider>

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
                    <div
                      ref={descriptionRef}
                      className="flex w-full flex-col gap-1"
                    >
                      <textarea
                        name={field.name}
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.currentTarget.value)
                        }
                        onBlur={field.handleBlur}
                        className="form-textarea text-grey-50 text-s w-full resize-none border-none bg-transparent font-medium outline-none"
                        placeholder={t(
                          'scenarios:edit_rule.description_placeholder',
                        )}
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
                      <FieldRuleGroup
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
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-s font-medium">
                  {t('scenarios:edit_rule.formula')}
                </span>
                <div className="bg-grey-100 border-grey-90 rounded-md border p-6">
                  <form.Field name="formula">
                    {(field) => (
                      <FieldTrigger
                        type="rule"
                        scenarioId={scenario.id}
                        iterationId={iterationId}
                        options={options}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        trigger={field.state.value}
                      />
                    )}
                  </form.Field>
                </div>
                <div className="bg-grey-100 border-grey-90 rounded-md border p-6">
                  <div className="flex items-center gap-2">
                    <span className="bg-grey-95 text-grey-50 text-s inline-flex rounded p-2 font-medium">
                      {t('scenarios:edit_rule.score_heading')}
                    </span>
                    <form.Field name="scoreModifier">
                      {(field) => (
                        <div className="flex flex-col gap-1">
                          <FormInput
                            type="text"
                            name={field.name}
                            value={field.state.value}
                            onChange={(e) =>
                              field.handleChange(+e.currentTarget.value)
                            }
                            onBlur={field.handleBlur}
                          />
                          <FormErrorOrDescription
                            errors={field.state.meta.errors}
                          />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </Page.Content>
      </Page.Container>
    </Page.Main>
  );
}
