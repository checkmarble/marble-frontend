import { Callout } from '@app-builder/components/Callout';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { AstNode, NewEmptyRuleAstNode, ScenarioValidation } from '@app-builder/models';
import { Scenario } from '@app-builder/models/scenario';
import { ScenarioIterationRule } from '@app-builder/models/scenario/iteration-rule';
import { useRuleDescriptionMutation } from '@app-builder/queries/scenarios/rule-description';
import { useScenarioIterationRule } from '@app-builder/queries/scenarios/scenario-iteration-rule';
import {
  collectRuleValidationMessages,
  findRuleValidation,
  hasRuleErrors,
  useGetScenarioErrorMessage,
} from '@app-builder/services/validation';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { useDebouncedCallbackRef } from '@marble/shared';
import { useForm, useStore } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { createServerFn } from '@tanstack/react-start';
import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Card, cn, NumberInput } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { FieldAstFormula } from '../Screening/FieldAstFormula';
import { FieldRuleGroup } from '../Screening/FieldRuleGroup';
import { DeleteRule } from './Actions/DeleteRule';
import { DuplicateRule } from './Actions/DuplicateRule';
import { AiDescription } from './AiDescription';
import { AiGenerateRule } from './AiGenerateRule';

type RuleEditPanelProps = {
  ruleId: string;
  scenario: RuleEditFormProps['scenario'];
  ruleGroups: RuleEditFormProps['ruleGroups'];
  scenarioValidation: RuleEditFormProps['scenarioValidation'];
  isAiRuleDescriptionEnabled: RuleEditFormProps['isAiRuleDescriptionEnabled'];
  onSuccess: RuleEditFormProps['onSuccess'];
  onDelete: RuleEditFormProps['onDelete'];
};

export function RuleEditPanel({ ruleId, ...props }: RuleEditPanelProps) {
  const { t } = useTranslation(['common']);
  const ruleQuery = useScenarioIterationRule(ruleId);

  return match(ruleQuery)
    .with({ isError: true }, ({ error }) => <>{error.message}</>)
    .with({ isPending: true }, () => <>{t('common:loading')}</>)
    .with({ isSuccess: true }, ({ data }) => {
      return <RuleEditForm rule={data.rule} {...props} />;
    })
    .exhaustive();
}

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
    ruleId: z.string(),
  }),
  payload: editRuleFormSchema,
});

const editRuleAction = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .validator(editRuleConfigurationSchema)
  .handler(async function editRuleAction({ context, data: { params, payload } }) {
    const { scenarioIterationRuleRepository } = context.authInfo;

    return await scenarioIterationRuleRepository.updateRule({
      ruleId: params.ruleId,
      ...payload,
    });
  });

type RuleEditFormProps = {
  rule: ScenarioIterationRule;
  scenario: Scenario;
  ruleGroups: string[];
  scenarioValidation: ScenarioValidation;
  isAiRuleDescriptionEnabled: boolean;
  onSuccess: (ruleId?: string) => Promise<void>;
  onDelete: () => Promise<void>;
};

function RuleEditForm({
  rule,
  scenario,
  scenarioValidation,
  ruleGroups,
  isAiRuleDescriptionEnabled,
  onSuccess,
  onDelete,
}: RuleEditFormProps) {
  const { t } = useTranslation(['common']);
  const panelSharp = PanelSharpFactory.useSharp();
  const nameInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (value: EditRuleForm) => editRuleAction({ data: { params: { ruleId: rule.id }, payload: value } }),
    onSuccess: async () => {
      toast.success(t('common:success.save'));
      await onSuccess();
    },
    onError: () => {
      toast.error(t('common:errors.unknown'));
    },
    meta: {
      invalidates: () => [['scenario-iteration-rule', rule.id]],
    },
  });
  const ruleDescriptionMutation = useRuleDescriptionMutation(rule.id);
  const [ruleDescription, setRuleDescription] = useState<string | undefined>(undefined);

  const getScenarioErrorMessage = useGetScenarioErrorMessage();
  const ruleValidation = useMemo(() => findRuleValidation(scenarioValidation, rule.id), [scenarioValidation, rule.id]);

  const form = useForm({
    onSubmitMeta: { closeOnSuccess: false },
    onSubmit: async ({ value, formApi, meta }) => {
      if (serverValidationMessages.length > 0 || !formApi.state.isValid) {
        return;
      }

      await mutation.mutateAsync(value);
      if (meta.closeOnSuccess) {
        panelSharp.actions.close();
      }
    },
    validators: {
      // onMount is required so canSubmit is false for invalid default values
      // (TanStack keeps canSubmit true until the form is touched otherwise).
      onMount: editRuleFormSchema,
      onChange: editRuleFormSchema,
      onSubmit: editRuleFormSchema,
    },
    defaultValues: {
      name: rule.name ?? '',
      description: rule.description ?? '',
      ruleGroup: rule.ruleGroup,
      scoreModifier: rule.scoreModifier,
      formula: rule.formula,
    } as EditRuleForm,
  });

  const formFormula = useStore(form.store, (state) => state.values.formula);
  const [formulaKey, setFormulaKey] = useState(0);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const serverValidationMessages = useMemo(() => {
    if (!hasRuleErrors(ruleValidation, { formFormula })) {
      return [];
    }
    return collectRuleValidationMessages(ruleValidation, getScenarioErrorMessage, t('scenarios:edit_rule.formula'), {
      formFormula,
    });
  }, [ruleValidation, formFormula, getScenarioErrorMessage, t]);

  const innerHandleFormulaChange = useDebouncedCallbackRef((value: AstNode | undefined) => {
    setIsDebouncing(false);
    if (value) {
      ruleDescriptionMutation.mutateAsync({ scenarioId: scenario.id, astNode: value }).then((res) => {
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

  const handleRuleSubmit = async (closeOnSuccess: boolean) => {
    await form.handleSubmit({ closeOnSuccess });
  };
  const handleRuleDelete = async () => {
    await onDelete();
  };
  const handleRuleDuplicate = async (ruleId: string) => {
    await onSuccess(ruleId);
  };

  return (
    <form onSubmit={handleSubmit(form)}>
      <Panel.Content>
        <Panel.Header className="flex justify-between items-center">
          <div className="flex gap-sm">
            <form.Field name="name">
              {(field) => (
                <div className="flex flex-col gap-xs">
                  <Panel.HeaderInput
                    ref={nameInputRef}
                    name={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    placeholder={t('scenarios:edit_rule.name_placeholder')}
                    data-testid="rule_edit_panel.name_input"
                    aria-invalid={field.state.meta.errors.length > 0 || undefined}
                  />
                  {field.state.meta.isTouched ? (
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  ) : null}
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
                <div className="flex flex-col gap-sm">
                  <FieldRuleGroup
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
          <div className="flex gap-sm">
            <DuplicateRule
              ruleId={rule.id}
              iterationId={rule.scenarioIterationId}
              scenarioId={scenario.id}
              onDuplicateSuccess={handleRuleDuplicate}
            >
              <Button size="small" variant="primary" appearance="stroked" mode="icon" aria-label="Clone rule">
                <Icon icon="copy" className="size-4" />
              </Button>
            </DuplicateRule>
            <DeleteRule
              ruleId={rule.id}
              iterationId={rule.scenarioIterationId}
              scenarioId={scenario.id}
              onDeleteSuccess={handleRuleDelete}
            >
              <Button size="small" variant="destructive" appearance="stroked" mode="icon" aria-label="Delete rule">
                <Icon icon="delete" className="size-4" />
              </Button>
            </DeleteRule>
          </div>
        </Panel.Header>
        <div className="flex flex-col gap-md">
          {serverValidationMessages.length > 0 ? (
            <Callout color="red" icon="lightbulb" iconColor="red" className="max-w-3xl">
              <ul className="flex flex-col gap-xs ps-md">
                {serverValidationMessages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </Callout>
          ) : null}
          <form.Field
            name="description"
            validators={{
              onChange: editRuleFormSchema.shape.description,
              onBlur: editRuleFormSchema.shape.description,
            }}
          >
            {(field) => (
              <Card className="flex w-full flex-col gap-xs">
                <textarea
                  name={field.name}
                  defaultValue={field.state.value}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  onBlur={field.handleBlur}
                  className="form-textarea text-grey-primary text-s w-full resize-none border-none bg-transparent font-medium outline-hidden"
                  placeholder={t('scenarios:edit_rule.description_placeholder')}
                />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </Card>
            )}
          </form.Field>
          <div className={cn('grid grid-cols-1', { 'grid-cols-[2fr_1fr] gap-md': isAiRuleDescriptionEnabled })}>
            <div className="flex flex-col gap-xl">
              <div className="flex flex-col gap-sm">
                <span className="text-s font-medium">{t('scenarios:edit_rule.formula')}</span>
                <Card
                  className={cn({
                    'border-red-primary': serverValidationMessages.length > 0,
                  })}
                >
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
                        scenarioId={scenario.id}
                        triggerObjectType={scenario.triggerObjectType}
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
                </Card>

                <AiGenerateRule
                  scenarioId={scenario.id}
                  ruleId={rule.id}
                  onFormulaGenerated={(ruleAst) => {
                    form.setFieldValue('formula', ruleAst);
                    handleFormulaChange(ruleAst);
                    setFormulaKey((k) => k + 1);
                  }}
                />

                <Card>
                  <div className="flex items-center gap-sm">
                    <span className="bg-grey-background text-grey-secondary dark:text-grey-secondary text-s inline-flex rounded-sm p-sm font-medium">
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
                        <div className="flex flex-col gap-xs">
                          <NumberInput
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={field.handleChange}
                            borderColor={field.state.meta.errors?.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                          />
                          <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                        </div>
                      )}
                    </form.Field>
                  </div>
                </Card>
              </div>
            </div>
            {isAiRuleDescriptionEnabled ? (
              <AiDescription
                isPending={isDebouncing || ruleDescriptionMutation.isPending}
                description={ruleDescription}
                className="self-start max-w-2xl"
              />
            ) : null}
          </div>
        </div>
        <Panel.Footer>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <>
                <Panel.FooterButton
                  type="button"
                  disabled={!canSubmit}
                  isLoading={isSubmitting}
                  onClick={() => handleRuleSubmit(false)}
                  variant="primary-outline"
                  label={t('common:save')}
                />
                <Panel.FooterButton
                  type="button"
                  disabled={!canSubmit || isSubmitting}
                  isLoading={isSubmitting}
                  onClick={() => handleRuleSubmit(true)}
                  trailingIcon="save"
                  variant="primary"
                  label={t('common:save_and_close')}
                />
              </>
            )}
          </form.Subscribe>
        </Panel.Footer>
      </Panel.Content>
    </form>
  );
}
