import { type DataModel } from '@app-builder/models';
import { NewAstNode, NewUndefinedAstNode } from '@app-builder/models/astNode/ast-node';
import { type WorkflowCondition } from '@app-builder/models/scenario/workflow';
import { useGetLatestRulesReferencesQuery } from '@app-builder/queries/Workflows';
import { type OutcomeDto } from 'marble-api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PayloadEvaluationCondition } from './PayloadEvaluationCondition';
import { RuleHitSelector } from './RuleHitSelector';
import { useRule } from './RuleProvider';
import { SelectOutcomesList } from './SelectOutcomesList';

interface ConditionSelectorProps {
  condition?: WorkflowCondition;
  isFirst?: boolean;
  triggerObjectType?: string;
  dataModel?: DataModel;
  onChange?: (condition: WorkflowCondition) => void;
}

export function ConditionSelector({
  condition,
  isFirst = false,
  triggerObjectType,
  dataModel,
  onChange,
}: ConditionSelectorProps) {
  const { t } = useTranslation(['workflows']);
  const [open, setOpen] = useState(false);
  const { scenarioId } = useRule();
  const latestRulesReferences = useGetLatestRulesReferencesQuery(scenarioId);
  const conditionOptions = useMemo(
    () =>
      [
        {
          value: 'always',
          label: t('workflows:condition_selector.always_matches'),
          description: t('workflows:condition_selector.always_matches_description'),
        },
        {
          value: 'never',
          label: t('workflows:condition_selector.never_matches'),
          description: t('workflows:condition_selector.never_matches_description'),
        },
        {
          value: 'outcome_in',
          label: t('workflows:condition_selector.outcome_in'),
          description: t('workflows:condition_selector.outcome_in_description'),
        },
        ...(latestRulesReferences.data && latestRulesReferences.data.size > 0
          ? [
              {
                value: 'rule_hit',
                label: t('workflows:condition_selector.rule_hit'),
                description: t('workflows:condition_selector.rule_hit_description'),
              },
            ]
          : []),
        {
          value: 'payload_evaluates',
          label: t('workflows:condition_selector.payload_evaluates'),
          description: t('workflows:condition_selector.payload_evaluates_description'),
        },
      ] as const,
    [latestRulesReferences.data, t],
  );

  const handleConditionSelect = (conditionType: (typeof conditionOptions)[number]['value']) => {
    const id = condition?.id || `temp-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const newCondition: WorkflowCondition = {
      function: conditionType,
      id,
    } as WorkflowCondition;

    onChange?.(newCondition);
    setOpen(false);
  };

  const handleParamsSelect = (paramValue: string | string[]) => {
    if (!condition) return;

    let params;
    const conditionFunction = condition.function;
    switch (conditionFunction) {
      case 'outcome_in':
        if (typeof paramValue === 'string') {
          params = paramValue
            .split(',')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);
        } else {
          params = paramValue;
        }
        break;
      case 'rule_hit':
        params = { rule_ids: Array.isArray(paramValue) ? paramValue : [paramValue] };
        break;
      case 'payload_evaluates':
        params = {
          expression: NewAstNode({
            name: '=',
            children: [NewUndefinedAstNode(), NewUndefinedAstNode()],
          }),
        };
        break;
      default:
        params = {};
    }

    const newCondition: WorkflowCondition = {
      function: conditionFunction,
      params,
      id: condition.id,
    } as WorkflowCondition;

    onChange?.(newCondition);
  };

  const needsParams =
    (condition?.function && condition.function !== 'always' && condition.function !== 'never') ??
    false;
  const selectedCondition = condition?.function;

  if (selectedCondition === 'payload_evaluates' && triggerObjectType && dataModel) {
    return (
      <div className="flex items-center">
        <div className="bg-grey-20 px-2 py-1 rounded">
          <span className="text-grey-60 font-bold text-sm">
            {isFirst ? t('workflows:condition.prefix.if') : t('workflows:condition.prefix.and')}
          </span>
        </div>

        <PayloadEvaluationCondition condition={condition as any} onChange={onChange!} />
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {selectedCondition && (
        <div className="bg-grey-20 px-2 py-1 rounded">
          <span className="text-grey-60 font-bold text-sm">
            {isFirst ? t('workflows:condition.prefix.if') : t('workflows:condition.prefix.and')}
          </span>
        </div>
      )}

      <MenuCommand.Menu open={open} onOpenChange={setOpen}>
        <MenuCommand.Trigger>
          <Button variant="secondary">
            {selectedCondition ? (
              conditionOptions.find((opt) => opt.value === selectedCondition)?.label
            ) : (
              <>
                <Icon icon="plus" className="size-4" />
                <span>{t('workflows:condition_selector.add_condition.label')}</span>
              </>
            )}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content>
          <MenuCommand.List>
            {conditionOptions.map((option) => (
              <MenuCommand.Item
                key={option.value}
                value={option.value}
                onSelect={() => handleConditionSelect(option.value)}
                className="flex flex-col items-start gap-1 p-3 hover:bg-grey-05 rounded-md cursor-pointer"
              >
                <div className="flex items-center">
                  <span className="font-medium text-grey-00">{option.label}</span>
                </div>
                <span className="text-sm text-grey-50">{option.description}</span>
              </MenuCommand.Item>
            ))}
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>

      {needsParams && (
        <div className="bg-grey-20 px-2 py-1 rounded">
          <span className="text-grey-60 font-bold text-sm">=</span>
        </div>
      )}

      {needsParams &&
        match(condition as WorkflowCondition | undefined)
          .with({ function: 'outcome_in' }, (c) => (
            <div className="flex-1 min-w-0">
              <SelectOutcomesList
                selectedOutcomes={(c.params as unknown as OutcomeDto[]) || []}
                onSelectedOutcomesChange={(outcomes) =>
                  handleParamsSelect(outcomes?.join(',') || '')
                }
              />
            </div>
          ))
          .with({ function: 'rule_hit' }, (c) => (
            <div className="flex-1 min-w-0">
              <RuleHitSelector
                selectedRuleIds={(c as any).params?.rule_ids ?? []}
                rulesList={latestRulesReferences.data ?? new Map()}
                onChange={(ruleIds) => handleParamsSelect(ruleIds)}
              />
            </div>
          ))
          .otherwise(() => null)}
    </div>
  );
}
