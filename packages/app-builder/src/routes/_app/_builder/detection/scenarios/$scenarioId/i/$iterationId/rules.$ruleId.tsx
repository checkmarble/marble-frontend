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
import {
  buildDatabaseAccessorsFromDataModel,
  buildPayloadAccessorsFromDataModel,
} from '@app-builder/server-fns/scenarios';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import {
  hasAnyEntitlement,
  isAiRuleBuildingAvailable,
  isContinuousScreeningAvailable,
} from '@app-builder/services/feature-access';
import { getFieldErrors } from '@app-builder/utils/form';
import { fromSUUIDtoUUID, fromUUIDtoSUUID, useParam } from '@app-builder/utils/short-uuid';
import { useDebouncedCallbackRef } from '@marble/shared';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

const paramsSchema = z.object({
  scenarioId: z.string().transform((id) => fromSUUIDtoUUID(id)),
  ruleId: z.string().transform((id) => fromSUUIDtoUUID(id)),
});

const ruleLoader = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .inputValidator(paramsSchema)
  .handler(async function ruleLoader({ data, context }) {
    const {
      customListsRepository,
      dataModelRepository,
      scenario,
      scenarioIterationRuleRepository,
      entitlements,
      continuousScreening,
    } = context.authInfo;

    const [currentScenario, dataModel, customLists, rule, screeningConfigs] = await Promise.all([
      scenario.getScenario({ scenarioId: data.scenarioId }),
      dataModelRepository.getDataModel(),
      customListsRepository.listCustomLists(),
      scenarioIterationRuleRepository.getRule({ ruleId: data.ruleId }),
      isContinuousScreeningAvailable(entitlements) ? continuousScreening.listConfigurations() : Promise.resolve([]),
    ]);

    return {
      databaseAccessors: buildDatabaseAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
      payloadAccessors: buildPayloadAccessorsFromDataModel(dataModel, currentScenario.triggerObjectType),
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

const editRuleConfigurationSchema = z.object({
  params: z.object({
    scenarioId: z.string(),
    iterationId: z.string(),
    ruleId: z.string(),
  }),
  payload: editRuleFormSchema,
});

const editRuleAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(editRuleConfigurationSchema)
  .handler(async function editRuleAction({ context, data: { params, payload } }) {
    const { scenarioIterationRuleRepository } = context.authInfo;

    return await scenarioIterationRuleRepository.updateRule({
      ruleId: params.ruleId,
      ...payload,
    });
  });

export const Route = createFileRoute('/_app/_builder/detection/scenarios/$scenarioId/i/$iterationId/rules/$ruleId')({
  loader: ({ params }) => ruleLoader({ data: params }),
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
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: (value: EditRuleForm) =>
      editRuleAction({ data: { params: { scenarioId, iterationId, ruleId: rule.id }, payload: value } }),
    onSuccess: async () => {
      await router.invalidate();
      toast.success(t('common:success.save'));
    },
    onError: () => {
      toast.error(t('common:errors.unknown'));
    },
  });

  const { currentScenario } = useDetectionScenarioData();
  const editor = useEditorMode();
  const ruleGroups = useDerivedIterationRuleGroupsData();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(descriptionRef, {
    root: containerRef.current,
    rootMargin: '-30px',
    threshold: 1,
  });

  useEffect(() => {
    if (!rule.name && editor === 'edit') {
      nameInputRef.current?.focus();
    }
  }, []);

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
  const [isDuplicateRuleOpen, setIsDuplicateRuleOpen] = useState(false);
  const [isDeleteRuleOpen, setIsDeleteRuleOpen] = useState(false);

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
                      ref={nameInputRef}
                      type="text"
                      name={field.name}
                      disabled={editor === 'view'}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      className={cn(
                        'text-grey-primary text-l w-full border-none bg-transparent font-normal outline-hidden',
                        field.state.meta.errors.length > 0 && 'border-b border-red-primary',
                      )}
                      placeholder={t('scenarios:edit_rule.name_placeholder')}
                    />
                    {field.state.meta.errors.length > 0 ? (
                      <span className="text-xs text-red-primary">{t('scenarios:edit_rule.name_required')}</span>
                    ) : null}
                  </div>
                )}
              </form.Field>
              {editor === 'edit' ? (
                <div className="flex items-center gap-2">
                  <DuplicateRule
                    ruleId={rule.id}
                    iterationId={rule.scenarioIterationId}
                    scenarioId={scenarioId}
                    open={isDuplicateRuleOpen}
                    onOpenChange={setIsDuplicateRuleOpen}
                  />
                  <DeleteRule
                    ruleId={rule.id}
                    iterationId={rule.scenarioIterationId}
                    scenarioId={scenarioId}
                    open={isDeleteRuleOpen}
                    onOpenChange={setIsDeleteRuleOpen}
                  />
                  <MenuCommand.Menu>
                    <MenuCommand.Trigger>
                      <Button variant="secondary" className="size-8 p-0">
                        <Icon icon="dots-three" className="size-5" />
                      </Button>
                    </MenuCommand.Trigger>
                    <MenuCommand.Content align="end" sideOffset={4} size="small">
                      <MenuCommand.List>
                        <MenuCommand.Item onSelect={() => setIsDuplicateRuleOpen(true)}>
                          <div className="flex items-center gap-v2-xs">
                            <Icon icon="copy" className="size-4" aria-hidden />
                            {t('scenarios:clone_rule.button')}
                          </div>
                        </MenuCommand.Item>
                        <MenuCommand.Item onSelect={() => setIsDeleteRuleOpen(true)}>
                          <div className="text-red-primary flex items-center gap-v2-xs">
                            <Icon icon="delete" className="size-4" aria-hidden />
                            {t('common:delete')}
                          </div>
                        </MenuCommand.Item>
                      </MenuCommand.List>
                    </MenuCommand.Content>
                  </MenuCommand.Menu>

                  <Button variant="primary" type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? <Icon icon="spinner" className="size-4 animate-spin" aria-hidden /> : null}
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
