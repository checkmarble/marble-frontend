import { Page, scenarioI18n } from '@app-builder/components';
import { BreadCrumbLink, type BreadCrumbProps, BreadCrumbs } from '@app-builder/components/Breadcrumbs';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { DeleteRule } from '@app-builder/components/Scenario/Rules/Actions/DeleteRule';
import { DuplicateRule } from '@app-builder/components/Scenario/Rules/Actions/DuplicateRule';
import { AiDescription } from '@app-builder/components/Scenario/Rules/AiDescription';
import { AiGenerateRule } from '@app-builder/components/Scenario/Rules/AiGenerateRule';
import { FieldAstFormula } from '@app-builder/components/Scenario/Screening/FieldAstFormula';
import { FieldRuleGroup } from '@app-builder/components/Scenario/Screening/FieldRuleGroup';
import { useDerivedIterationRuleGroupsData, useDetectionScenarioData } from '@app-builder/hooks/routes-layout-data';
import useIntersection from '@app-builder/hooks/useIntersection';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { AstNode, NewEmptyRuleAstNode } from '@app-builder/models';
import { useRuleDescriptionMutation } from '@app-builder/queries/scenarios/rule-description';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import {
  hasAnyEntitlement,
  isAiRuleBuildingAvailable,
  isContinuousScreeningAvailable,
} from '@app-builder/services/feature-access';
import { setToast } from '@app-builder/services/toast.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { fromParams, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import * as Ariakit from '@ariakit/react';
import { useDebouncedCallbackRef } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CtaClassName, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const ruleLoader = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function ruleLoader({ data, context }) {
    const {
      customListsRepository,
      editor,
      dataModelRepository,
      scenarioIterationRuleRepository,
      entitlements,
      continuousScreening,
    } = context.authInfo;

    const ruleId = fromParams(data?.params ?? {}, 'ruleId');

    const [{ databaseAccessors, payloadAccessors }, dataModel, customLists, rule, screeningConfigs] = await Promise.all(
      [
        editor.listAccessors({ scenarioId: fromParams(data?.params ?? {}, 'scenarioId') }),
        dataModelRepository.getDataModel(),
        customListsRepository.listCustomLists(),
        scenarioIterationRuleRepository.getRule({ ruleId }),
        isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
      ],
    );

    return {
      databaseAccessors,
      payloadAccessors,
      dataModel,
      customLists,
      isAiRuleDescriptionEnabled: isAiRuleBuildingAvailable(entitlements),
      rule,
      hasValidLicense: hasAnyEntitlement(entitlements),
      hasContinuousScreening: isContinuousScreeningAvailable(entitlements),
      screeningConfigs,
    };
  });

const editRuleFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().optional(),
  ruleGroup: z.string().optional(),
  scoreModifier: z.number().int().min(-1000).max(1000),
  formula: z.any(),
});

type EditRuleForm = z.infer<typeof editRuleFormSchema>;

type EditRuleActionResult = { status: 'success' | 'error'; errors: any };

const editRuleAction = createServerFn()
  .middleware([authMiddleware])
  .inputValidator((input: { params?: Record<string, string> } | undefined) => input)
  .handler(async function editRuleAction({ context, data }): Promise<EditRuleActionResult> {
    const request = getRequest();
    const { scenarioIterationRuleRepository } = context.authInfo;

    const raw = await request.json();

    const result = editRuleFormSchema.safeParse(raw);

    if (!result.success) {
      return { status: 'error' as const, errors: z.treeifyError(result.error) };
    }

    try {
      await scenarioIterationRuleRepository.updateRule({
        ruleId: fromParams(data?.params ?? {}, 'ruleId'),
        ...result.data,
      });

      await setToast({
        type: 'success',
        messageKey: 'common:success.save',
      });

      return { status: 'success' as const, errors: [] };
    } catch {
      await setToast({
        type: 'error',
        messageKey: 'common:errors.unknown',
      });

      return { status: 'error' as const, errors: [] };
    }
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/rules/$ruleId')({
  loader: ({ params }) => ruleLoader({ data: { params } }),
  staticData: {
    BreadCrumbs: [
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['navigation']);
        const scenarioId = useParam('scenarioId');
        const iterationId = useParam('iterationId');

        return (
          <BreadCrumbLink
            isLast={isLast}
            to="/detection/scenarios/$scenarioId/i/$iterationId/rules"
            params={{ scenarioId: fromUUIDtoSUUID(scenarioId), iterationId: fromUUIDtoSUUID(iterationId) }}
          >
            {t('navigation:scenario.rules')}
          </BreadCrumbLink>
        );
      },
      ({ isLast }: BreadCrumbProps) => {
        const { t } = useTranslation(['common']);
        const { rule } = Route.useLoaderData();
        const scenarioId = useParam('scenarioId');
        const iterationId = useParam('iterationId');
        const editorMode = useEditorMode();

        return (
          <div className="flex items-center gap-2">
            <BreadCrumbLink
              isLast={isLast}
              to="/detection/scenarios/$scenarioId/i/$iterationId/rules/$ruleId"
              params={{
                scenarioId: fromUUIDtoSUUID(scenarioId),
                iterationId: fromUUIDtoSUUID(iterationId),
                ruleId: fromUUIDtoSUUID(rule.id),
              }}
            >
              {rule.name ?? fromUUIDtoSUUID(rule.id)}
            </BreadCrumbLink>
            {editorMode === 'edit' ? <Tag size="big">{t('common:edit')}</Tag> : null}
          </div>
        );
      },
    ],
  },
  component: RuleDetail,
});

function RuleDetail() {
  const {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    isAiRuleDescriptionEnabled,
    rule,
    hasValidLicense,
    hasContinuousScreening,
    screeningConfigs,
  } = Route.useLoaderData();

  const { t } = useTranslation([...scenarioI18n, 'common']);
  const iterationId = useParam('iterationId');
  const scenarioId = useParam('scenarioId');

  const mutation = useMutation({
    mutationFn: (value: EditRuleForm) =>
      editRuleAction({ data: { params: { scenarioId, iterationId, ruleId: rule.id }, ...value } }),
  });

  const { currentScenario } = useDetectionScenarioData();
  const editor = useEditorMode();
  const ruleGroups = useDerivedIterationRuleGroupsData();

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
        mutation.mutate(value);
      }
    },
    validators: {
      onSubmit: editRuleFormSchema,
    },
    defaultValues: rule as EditRuleForm,
  });

  const [formulaKey, setFormulaKey] = useState(0);

  const ruleDescriptionMutation = useRuleDescriptionMutation(rule.id);
  const [ruleDescription, setRuleDescription] = useState<string | undefined>(undefined);
  const [isDebouncing, setIsDebouncing] = useState(false);

  useEffect(() => {
    if (!isAiRuleDescriptionEnabled) return;

    setRuleDescription(undefined);
    if (rule.formula) {
      ruleDescriptionMutation.mutateAsync({ scenarioId: currentScenario.id, astNode: rule.formula }).then((res) => {
        if (res.success && !ruleDescription && res.data.isRuleValid) {
          setRuleDescription(res.data.description);
        }
      });
    }
  }, [rule.id]);

  const innerHandleFormulaChange = useDebouncedCallbackRef((value: AstNode | undefined) => {
    setIsDebouncing(false);
    if (value) {
      ruleDescriptionMutation.mutateAsync({ scenarioId: currentScenario.id, astNode: value }).then((res) => {
        if (res.success && res.data.isRuleValid) {
          setRuleDescription(res.data.description);
        }
      });
    }
  }, 3000);
  const handleFormulaChange = (value: AstNode | undefined) => {
    if (!isAiRuleDescriptionEnabled) return;

    setIsDebouncing(true);
    innerHandleFormulaChange(value);
  };

  const options = {
    databaseAccessors,
    payloadAccessors,
    dataModel,
    customLists,
    triggerObjectType: currentScenario.triggerObjectType,
    rule,
    hasValidLicense,
    hasContinuousScreening,
    screeningConfigs,
  };

  return (
    <Page.Main>
      <Page.Header>
        <BreadCrumbs
          back={`/detection/scenarios/${fromUUIDtoSUUID(currentScenario.id)}/i/${fromUUIDtoSUUID(iterationId)}/rules`}
        />
      </Page.Header>
      <Page.Container>
        <Page.Content>
          <form
            className="relative flex flex-col"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <div
              className={cn('bg-surface-page sticky top-0 flex h-[88px] items-center justify-between gap-4 max-w-3xl', {
                'border-b-grey-border border-b': !intersection?.isIntersecting,
              })}
            >
              <form.Field
                name="name"
                validators={{
                  onChange: editRuleFormSchema.shape.name,
                  onBlur: editRuleFormSchema.shape.name,
                }}
              >
                {(field) => (
                  <div className="flex w-full flex-col gap-1">
                    <input
                      type="text"
                      name={field.name}
                      disabled={editor === 'view'}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      className="text-grey-primary text-l w-full border-none bg-transparent font-normal outline-hidden"
                      placeholder={t('scenarios:edit_rule.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
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
                        className: 'size-8',
                      })}
                    >
                      <Icon icon="dots-three" className="size-5" />
                    </Ariakit.MenuButton>
                    <Ariakit.Menu
                      shift={-80}
                      className="bg-surface-card border-grey-border mt-2 flex flex-col gap-2 rounded-sm border p-2"
                    >
                      <DuplicateRule ruleId={rule.id} iterationId={rule.scenarioIterationId} scenarioId={scenarioId}>
                        <Button variant="secondary" type="button">
                          <Icon icon="copy" className="size-5" aria-hidden />
                          {t('scenarios:clone_rule.button')}
                        </Button>
                      </DuplicateRule>

                      <DeleteRule ruleId={rule.id} iterationId={rule.scenarioIterationId} scenarioId={scenarioId}>
                        <Button variant="destructive" type="button">
                          <Icon icon="delete" className="size-5" aria-hidden />
                          {t('common:delete')}
                        </Button>
                      </DeleteRule>
                    </Ariakit.Menu>
                  </Ariakit.MenuProvider>

                  <Button variant="primary" type="submit">
                    <Icon icon="save" className="size-5" aria-hidden />
                    {t('common:save')}
                  </Button>
                </div>
              ) : null}
            </div>
            <div className="flex flex-col gap-8">
              <div className="border-grey-border flex flex-col items-start gap-6 border-b pb-6 max-w-3xl">
                <form.Field
                  name="description"
                  validators={{
                    onChange: editRuleFormSchema.shape.description,
                    onBlur: editRuleFormSchema.shape.description,
                  }}
                >
                  {(field) => (
                    <div ref={descriptionRef} className="flex w-full flex-col gap-1">
                      <textarea
                        name={field.name}
                        disabled={editor === 'view'}
                        defaultValue={field.state.value}
                        onChange={(e) => field.handleChange(e.currentTarget.value)}
                        onBlur={field.handleBlur}
                        className="form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
                        placeholder={t('scenarios:edit_rule.description_placeholder')}
                      />
                      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                    </div>
                  )}
                </form.Field>
                <form.Field
                  name="ruleGroup"
                  validators={{
                    onChange: editRuleFormSchema.shape.ruleGroup,
                    onBlur: editRuleFormSchema.shape.ruleGroup,
                  }}
                >
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
                <span className="text-s font-medium">{t('scenarios:edit_rule.formula')}</span>
                <div className="grid grid-cols-[var(--container-3xl)_1fr] gap-v2-lg">
                  <div className="bg-surface-card border-grey-border rounded-md border p-6 max-w-3xl">
                    <form.Field
                      name="formula"
                      validators={{
                        onChange: editRuleFormSchema.shape.formula,
                        onBlur: editRuleFormSchema.shape.formula,
                      }}
                    >
                      {(field) => (
                        <FieldAstFormula
                          key={formulaKey}
                          type="rule"
                          scenarioId={currentScenario.id}
                          options={options}
                          onBlur={field.handleBlur}
                          onChange={(node) => {
                            field.handleChange(node);
                            handleFormulaChange(node);
                          }}
                          astNode={field.state.value}
                          defaultValue={NewEmptyRuleAstNode()}
                        />
                      )}
                    </form.Field>
                  </div>

                  {isAiRuleDescriptionEnabled ? (
                    <AiDescription
                      isPending={isDebouncing || ruleDescriptionMutation.isPending}
                      description={ruleDescription}
                      className="self-start max-w-2xl"
                    />
                  ) : null}

                  {isAiRuleDescriptionEnabled && editor === 'edit' ? (
                    <AiGenerateRule
                      scenarioId={currentScenario.id}
                      ruleId={rule.id}
                      onFormulaGenerated={(ruleAst) => {
                        form.setFieldValue('formula', ruleAst);
                        handleFormulaChange(ruleAst);
                        setFormulaKey((k) => k + 1);
                      }}
                    />
                  ) : null}
                </div>
                <div className="bg-surface-card border-grey-border rounded-md border p-6 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="bg-grey-background text-grey-secondary dark:text-grey-secondary text-s inline-flex rounded-sm p-2 font-medium">
                      {t('scenarios:edit_rule.score_heading')}
                    </span>
                    <form.Field
                      name="scoreModifier"
                      validators={{
                        onChange: editRuleFormSchema.shape.scoreModifier,
                        onBlur: editRuleFormSchema.shape.scoreModifier,
                      }}
                    >
                      {(field) => (
                        <div className="flex flex-col gap-1">
                          <FormInput
                            type="number"
                            name={field.name}
                            defaultValue={field.state.value}
                            onBlur={field.handleBlur}
                            disabled={editor === 'view'}
                            onChange={(e) => field.handleChange(+e.currentTarget.value)}
                            valid={field.state.meta.errors?.length === 0}
                          />
                          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
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
