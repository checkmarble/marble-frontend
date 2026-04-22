import { type AstNode } from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import { type RuleModel, transformAstNodeToModel } from '@app-builder/models/scoring';
import { match } from 'ts-pattern';
import { AggregateRuleEdit } from './AggregateRuleEdit';
import { PastAlertsRuleEdit } from './PastAlertsRuleEdit';
import { TagsRuleEdit } from './TagsRuleEdit';
import { UserAttributeRuleEdit } from './UserAttributeRuleEdit';

interface SwitchNodeEditProps {
  node: AstNode;
  maxRiskLevel: number;
  dataModel: DataModel;
  entityType: string;
  customLists?: CustomList[];
  onModelChange?: (model: RuleModel) => void;
}

export function SwitchNodeEdit({
  node,
  maxRiskLevel,
  dataModel,
  entityType,
  customLists,
  onModelChange,
}: SwitchNodeEditProps) {
  const model = transformAstNodeToModel(node, entityType, dataModel);
  if (!model) return null;

  return (
    <div className="flex flex-col gap-v2-sm text-s text-grey-secondary">
      {match(model)
        .with({ type: 'user_attribute' }, (m) => (
          <UserAttributeRuleEdit
            model={m}
            maxRiskLevel={maxRiskLevel}
            dataModel={dataModel}
            entityType={entityType}
            customLists={customLists}
            onModelChange={onModelChange}
          />
        ))
        .with({ type: 'aggregate' }, (m) => (
          <AggregateRuleEdit
            model={m}
            maxRiskLevel={maxRiskLevel}
            dataModel={dataModel}
            customLists={customLists}
            onModelChange={onModelChange}
          />
        ))
        .with({ type: 'screening_tags' }, { type: 'entity_tags' }, (m) => (
          <TagsRuleEdit model={m} maxRiskLevel={maxRiskLevel} onModelChange={onModelChange} />
        ))
        .with({ type: 'past_alerts' }, (m) => (
          <PastAlertsRuleEdit model={m} maxRiskLevel={maxRiskLevel} onModelChange={onModelChange} />
        ))
        .exhaustive()}
    </div>
  );
}
