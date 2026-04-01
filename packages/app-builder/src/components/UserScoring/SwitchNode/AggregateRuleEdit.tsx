import { AggregationEditContent } from '@app-builder/components/AstBuilder/edition/EditModal/modals/Aggregation/Aggregation';
import { useRoot } from '@app-builder/components/AstBuilder/edition/hooks/useRoot';
import { AstBuilderNodeSharpFactory } from '@app-builder/components/AstBuilder/edition/node-store';
import { type AggregationAstNode, NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import {
  type BoolSwitch,
  type DraftAggregateRule,
  getAggregationReturnType,
  isAllowedScoringRuleType,
  type NumberSwitch,
  type RuleModel,
  type StringSwitch,
} from '@app-builder/models/scoring';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clone } from 'remeda';
import { match } from 'ts-pattern';
import { BoolSwitchEdit } from './BoolSwitchEdit';
import { createDefaultConditions } from './conditions-utils';
import { NumberSwitchEdit } from './NumberSwitchEdit';
import { StringSwitchEdit } from './StringSwitchEdit';

function InlineAggregationEditorContent({ onChange }: { onChange: (node: AggregationAstNode) => void }) {
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  return <AggregationEditContent onChange={() => onChange(clone(nodeSharp.value.node) as AggregationAstNode)} />;
}

function InlineAggregationEditor({
  node,
  onChange,
}: {
  node: AggregationAstNode;
  onChange: (node: AggregationAstNode) => void;
}) {
  const nodeSharp = useRoot({ node, validation: { errors: [], evaluation: [] } }, false);
  return (
    <AstBuilderNodeSharpFactory.Provider value={nodeSharp}>
      <InlineAggregationEditorContent onChange={onChange} />
    </AstBuilderNodeSharpFactory.Provider>
  );
}

interface AggregateRuleEditProps {
  model: DraftAggregateRule;
  maxRiskLevel: number;
  dataModel: DataModel;
  customLists?: CustomList[];
  onModelChange?: (model: RuleModel) => void;
}

export function AggregateRuleEdit({
  model,
  maxRiskLevel,
  dataModel,
  customLists,
  onModelChange,
}: AggregateRuleEditProps) {
  const { t } = useTranslation(['user-scoring']);

  const [conditions, setConditions] = useState<NumberSwitch | StringSwitch | BoolSwitch | null>(model.conditions);
  const [aggregationNode, setAggregationNode] = useState<AggregationAstNode | null>(model.field);

  const handleAggregationChange = (updatedNode: AggregationAstNode) => {
    const newReturnType = getAggregationReturnType(updatedNode, dataModel);
    const prevReturnType = aggregationNode ? getAggregationReturnType(aggregationNode, dataModel) : null;

    let newConditions = conditions;
    if (!newConditions || newReturnType !== prevReturnType) {
      newConditions =
        newReturnType && isAllowedScoringRuleType(newReturnType) ? createDefaultConditions(newReturnType) : null;
      setConditions(newConditions);
    }
    setAggregationNode(updatedNode);
    onModelChange?.({ type: 'aggregate', field: updatedNode, conditions: newConditions } as RuleModel);
  };

  const handleConditionsChange = (next: NumberSwitch | StringSwitch | BoolSwitch) => {
    setConditions(next);
    onModelChange?.({ type: 'aggregate', field: aggregationNode, conditions: next } as RuleModel);
  };

  return (
    <>
      <div className="flex flex-col gap-v2-sm">
        <span className="font-medium">{t('user-scoring:switch.depending_on')}</span>
        <div className="p-v2-md bg-grey-background-light border border-grey-border rounded-v2-md flex flex-col gap-v2-lg">
          <InlineAggregationEditor
            node={aggregationNode ?? NewAggregatorAstNode('SUM')}
            onChange={handleAggregationChange}
          />
        </div>
      </div>
      {conditions ? (
        <>
          <span className="font-medium">{t('user-scoring:switch.apply_conditions')}</span>
          {match(conditions)
            .with({ type: 'number' }, (c) => (
              <NumberSwitchEdit conditions={c} maxRiskLevel={maxRiskLevel} onChange={handleConditionsChange} />
            ))
            .with({ type: 'bool' }, (c) => (
              <BoolSwitchEdit conditions={c} maxRiskLevel={maxRiskLevel} onChange={handleConditionsChange} />
            ))
            .with({ type: 'string' }, (c) => (
              <StringSwitchEdit
                conditions={c}
                maxRiskLevel={maxRiskLevel}
                customLists={customLists}
                onChange={handleConditionsChange}
              />
            ))
            .exhaustive()}
        </>
      ) : null}
    </>
  );
}
