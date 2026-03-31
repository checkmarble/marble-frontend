import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { NewAstNode } from '@app-builder/models';
import { NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import { isSwitchAstNode, NewSwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import { type ScoringRule, type ScoringRulesetWithRules } from '@app-builder/models/scoring';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { useUpdateScoringRulesetMutation } from '@app-builder/queries/scoring/update-ruleset';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { v7 as uuidv7 } from 'uuid';
import { PanelRoot } from '../Panel';
import { Spinner } from '../Spinner';
import { ScoringRuleEditPanel } from './ScoringRuleEditPanel';
import { SwitchNode } from './SwitchNode';

const RULE_TYPES = [
  { value: 'user_attribute', label: 'User attribute' },
  { value: 'aggregate', label: 'Agregates (transaction, event, ...)' },
  { value: 'entity_tags', label: 'Tags' },
  { value: 'screening_tags', label: 'Screening (PEP, Sanction, ...)' },
  { value: 'past_alerts', label: 'Past alerts' },
] as const;

type RuleType = (typeof RULE_TYPES)[number]['value'];

interface AddRuleMenuContentProps {
  onConfirm: (ruleType: RuleType) => void;
  onCancel: () => void;
}

function AddRuleMenuContent({ onConfirm, onCancel }: AddRuleMenuContentProps) {
  const { t } = useTranslation(['user-scoring']);
  const [selectedType, setSelectedType] = useState<RuleType>('user_attribute');

  return (
    <MenuCommand.Content align="end" sideOffset={4} className="min-w-80">
      <MenuCommand.List className="p-v2-md">
        <MenuCommand.Group heading={<div className="mb-v2-md">{t('user-scoring:ruleset.rule_type_heading')}</div>}>
          <div className="flex flex-col gap-v2-sm">
            {RULE_TYPES.map(({ value, label }) => (
              <MenuCommand.HeadlessItem key={value} value={value} onSelect={() => setSelectedType(value)}>
                <div className="flex items-center gap-v2-sm">
                  <div
                    className={cn(
                      'border-purple-primary flex size-4 shrink-0 items-center justify-center rounded-full border',
                      selectedType === value ? 'bg-purple-primary' : 'bg-white',
                    )}
                  >
                    {selectedType === value && <div className="size-2 rounded-full bg-white" />}
                  </div>
                  <span
                    className={cn('text-s text-grey-primary', selectedType === value ? 'font-semibold' : 'font-normal')}
                  >
                    {label}
                  </span>
                </div>
              </MenuCommand.HeadlessItem>
            ))}
          </div>
        </MenuCommand.Group>
      </MenuCommand.List>
      <div className="border-grey-border flex items-center justify-end gap-v2-sm border-t p-v2-sm">
        <Button variant="secondary" size="small" onClick={onCancel}>
          {t('user-scoring:ruleset.cancel')}
        </Button>
        <Button variant="primary" size="small" onClick={() => onConfirm(selectedType)}>
          {t('user-scoring:ruleset.create_rule')}
        </Button>
      </div>
    </MenuCommand.Content>
  );
}

interface RulesTableProps {
  ruleset: ScoringRulesetWithRules;
  maxRiskLevel: number;
  customLists: CustomList[];
}

export function RulesTable({ ruleset, maxRiskLevel, customLists }: RulesTableProps) {
  const { t } = useTranslation(['user-scoring']);
  const revalidate = useLoaderRevalidator();
  const { rules, recordType: entityType } = ruleset;
  const [open, setOpen] = useState(false);
  const [panelRule, setPanelRule] = useState<ScoringRule | null>(null);
  const dataModelQuery = useDataModelQuery();
  const mutation = useUpdateScoringRulesetMutation();

  const handleConfirm = (ruleType: RuleType) => {
    const fieldNode = match(ruleType)
      .with('user_attribute', () => NewAstNode())
      .with('aggregate', () => NewAggregatorAstNode('SUM'))
      .otherwise(() => undefined);

    setPanelRule({
      stableId: uuidv7(),
      name: '',
      description: '',
      riskType: 'customer_features',
      ast: NewSwitchAstNode(ruleType, fieldNode),
    });
    setOpen(false);
  };

  const handleRuleChange = (stableId: string, newRule: ScoringRule) => {
    mutation
      .mutateAsync({
        id: ruleset.id,
        recordType: ruleset.recordType,
        name: ruleset.name,
        thresholds: ruleset.thresholds,
        cooldownSeconds: ruleset.cooldownSeconds,
        rules: ruleset.rules.map((r) =>
          r.stableId === stableId
            ? {
                stableId: r.stableId,
                name: newRule.name,
                description: newRule.description,
                riskType: newRule.riskType,
                ast: newRule.ast,
              }
            : { stableId: r.stableId, name: r.name, description: r.description, riskType: r.riskType, ast: r.ast },
        ),
      })
      .then(() => {
        revalidate();
      });
  };

  const handleRuleAdd = (newRule: ScoringRule) => {
    mutation
      .mutateAsync({
        id: ruleset.id,
        recordType: ruleset.recordType,
        name: ruleset.name,
        thresholds: ruleset.thresholds,
        cooldownSeconds: ruleset.cooldownSeconds,
        rules: [
          ...ruleset.rules.map((r) => ({
            stableId: r.stableId,
            name: r.name,
            description: r.description,
            riskType: r.riskType,
            ast: r.ast,
          })),
          {
            stableId: newRule.stableId,
            name: newRule.name,
            description: newRule.description,
            riskType: newRule.riskType,
            ast: newRule.ast,
          },
        ],
      })
      .then(() => {
        revalidate();
        setPanelRule(null);
      });
  };

  const handleRuleDelete = (stableId: string) => {
    mutation
      .mutateAsync({
        id: ruleset.id,
        recordType: ruleset.recordType,
        name: ruleset.name,
        thresholds: ruleset.thresholds,
        cooldownSeconds: ruleset.cooldownSeconds,
        rules: ruleset.rules
          .filter((r) => r.stableId !== stableId)
          .map((r) => ({
            stableId: r.stableId,
            name: r.name,
            description: r.description,
            riskType: r.riskType,
            ast: r.ast,
          })),
      })
      .then(() => {
        revalidate();
      });
  };

  return (
    <>
      <div className="bg-surface-card border-grey-border rounded-v2-md overflow-hidden border">
        <div className="border-grey-border flex items-center justify-between border-b px-v2-md py-v2-sm">
          <div className="text-s text-grey-secondary grid flex-1 grid-cols-[150px_1fr] gap-v2-md font-semibold">
            <span>{t('user-scoring:ruleset.risk_types_column')}</span>
            <span>{t('user-scoring:ruleset.rules_column')}</span>
          </div>
          <MenuCommand.Menu open={open} onOpenChange={setOpen} persistOnSelect>
            <MenuCommand.Trigger>
              <Button variant="secondary">
                <Icon icon="plus" className="size-4" />
                {t('user-scoring:ruleset.add_rule')}
              </Button>
            </MenuCommand.Trigger>
            <AddRuleMenuContent onConfirm={handleConfirm} onCancel={() => setOpen(false)} />
          </MenuCommand.Menu>
        </div>
        {rules.length === 0 ? (
          <div className="text-s text-grey-secondary flex items-center justify-center py-v2-xl">
            {t('user-scoring:ruleset.no_rules')}
          </div>
        ) : (
          match(dataModelQuery)
            .with({ isPending: true }, () => (
              <div className="flex items-center justify-center py-v2-xl">
                <Spinner />
              </div>
            ))
            .with({ isError: true }, () => (
              <div className="text-s text-red-primary flex items-center justify-center py-v2-xl">
                {t('user-scoring:ruleset.error')}
              </div>
            ))
            .with({ isSuccess: true }, ({ data: { dataModel } }) =>
              rules.map((rule) => (
                <RuleRow
                  key={rule.stableId}
                  rule={rule}
                  dataModel={dataModel}
                  entityType={entityType}
                  maxRiskLevel={maxRiskLevel}
                  customLists={customLists}
                  onRuleChange={(newRule) => handleRuleChange(rule.stableId, newRule)}
                  onRuleDelete={() => handleRuleDelete(rule.stableId)}
                />
              )),
            )
            .exhaustive()
        )}
      </div>
      <PanelRoot
        open={panelRule !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setPanelRule(null);
        }}
      >
        {panelRule && dataModelQuery.data ? (
          <ScoringRuleEditPanel
            rule={panelRule}
            dataModel={dataModelQuery.data.dataModel}
            entityType={entityType}
            maxRiskLevel={maxRiskLevel}
            customLists={customLists}
            onChange={handleRuleAdd}
          />
        ) : null}
      </PanelRoot>
    </>
  );
}

interface RuleRowProps {
  rule: ScoringRule;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  customLists: CustomList[];
  onRuleChange?: (rule: ScoringRule) => void;
  onRuleDelete?: () => void;
}

function RuleRow({ rule, dataModel, entityType, maxRiskLevel, customLists, onRuleChange, onRuleDelete }: RuleRowProps) {
  const { t } = useTranslation(['user-scoring']);
  const switchNode = rule.ast && isSwitchAstNode(rule.ast) ? rule.ast : null;
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="border-grey-border flex border-b last:border-b-0">
      <div className="flex w-[150px] shrink-0 items-center px-v2-md py-v2-sm">
        {rule.riskType ? <Tag color="grey">{t(`user-scoring:risk_type.${rule.riskType}`)}</Tag> : null}
      </div>
      <div className="flex flex-1 flex-col gap-v2-sm px-v2-md py-v2-sm">
        <span className="text-grey-primary text-s font-medium">{rule.name}</span>
        {switchNode ? (
          <SwitchNode
            node={switchNode}
            mode="view"
            dataModel={dataModel}
            entityType={entityType}
            maxRiskLevel={maxRiskLevel}
            customLists={customLists}
          />
        ) : null}
      </div>
      {switchNode ? (
        <div className="flex shrink-0 items-center justify-end px-v2-md py-v2-sm">
          <button
            type="button"
            className="border-purple-primary text-purple-primary flex size-6 items-center justify-center rounded-lg border shadow-sm"
            aria-label="Edit rule"
            onClick={() => setIsEditing(true)}
          >
            <Icon icon="edit" className="size-4" />
          </button>
          <PanelRoot open={isEditing} onOpenChange={setIsEditing}>
            <ScoringRuleEditPanel
              rule={rule}
              dataModel={dataModel}
              entityType={entityType}
              maxRiskLevel={maxRiskLevel}
              customLists={customLists}
              onChange={onRuleChange}
              onDelete={
                onRuleDelete
                  ? () => {
                      onRuleDelete();
                      setIsEditing(false);
                    }
                  : undefined
              }
            />
          </PanelRoot>
        </div>
      ) : null}
    </div>
  );
}
