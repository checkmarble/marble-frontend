import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type DataModel } from '@app-builder/models/data-model';
import { getOperationType, isCompleteRuleModel, transformSwitchAstNodeToModel } from '@app-builder/models/scoring';
import { match } from 'ts-pattern';
import { BoolSwitchDescription } from './BoolSwitchDescription';
import { NumberSwitchDescription } from './NumberSwitchDescription';
import { FieldPill } from './shared';

export function SwitchNodeView({
  node,
  dataModel,
  entityType,
  maxRiskLevel,
}: {
  node: SwitchAstNode;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
}) {
  const fieldType = getOperationType(entityType, dataModel, node);
  const model = transformSwitchAstNodeToModel(node, entityType, dataModel);

  return (
    <div className="flex flex-col gap-v2-sm pl-10 text-xs text-grey-secondary">
      <div className="flex flex-wrap items-center gap-v2-sm">
        <span>Depending on the value of</span>
        {model && isCompleteRuleModel(model) && <FieldPill field={model.field} fieldType={fieldType} />}
        <span>, apply the following conditions:</span>
      </div>

      {node.children.length === 0 ? (
        <p className="italic text-grey-placeholder">No condition defined</p>
      ) : model && isCompleteRuleModel(model) ? (
        match(model.conditions)
          .with({ type: 'number' }, (c) => <NumberSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
          .with({ type: 'bool' }, (c) => <BoolSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
          .with({ type: 'string' }, () => null)
          .exhaustive()
      ) : null}
    </div>
  );
}
