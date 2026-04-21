import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import { type RuleModel } from '@app-builder/models/scoring';
import { SwitchNodeEdit } from './SwitchNodeEdit';
import { SwitchNodeView } from './SwitchNodeView';

interface SwitchNodeProps {
  node: SwitchAstNode;
  mode: 'edit' | 'view';
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  customLists?: CustomList[];
  onModelChange?: (model: RuleModel) => void;
}

export function SwitchNode({
  node,
  mode,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists,
  onModelChange,
}: SwitchNodeProps) {
  if (mode === 'view')
    return (
      <SwitchNodeView
        node={node}
        dataModel={dataModel}
        entityType={entityType}
        maxRiskLevel={maxRiskLevel}
        customLists={customLists}
      />
    );
  return (
    <SwitchNodeEdit
      node={node}
      maxRiskLevel={maxRiskLevel}
      dataModel={dataModel}
      entityType={entityType}
      customLists={customLists}
      onModelChange={onModelChange}
    />
  );
}
