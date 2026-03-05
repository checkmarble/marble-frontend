import { DataModel } from '@app-builder/models';
import { SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import {
  buildSwitchAstNodeFromModel,
  isCompleteRuleModel,
  RuleModel,
  transformSwitchAstNodeToModel,
} from '@app-builder/models/scoring';
import { useState } from 'react';
import { Button } from 'ui-design-system';
import { PanelContainer, PanelContent, PanelFooter, PanelHeader } from '../Panel';
import { PanelSharpFactory } from '../Panel/Panel';
import { SwitchNode } from './SwitchNode';

type ScoringRuleEditPanelProps = {
  node: SwitchAstNode;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  onChange?: (node: SwitchAstNode) => void;
};

export function ScoringRuleEditPanel({
  node,
  dataModel,
  entityType,
  maxRiskLevel,
  onChange,
}: ScoringRuleEditPanelProps) {
  const sharp = PanelSharpFactory.useSharp();
  const [currentModel, setCurrentModel] = useState<RuleModel | null>(() => transformSwitchAstNodeToModel(node));

  const handleValidate = () => {
    if (currentModel && isCompleteRuleModel(currentModel)) {
      const newNode = buildSwitchAstNodeFromModel(currentModel);
      onChange?.(newNode);
    }
    sharp.actions.close();
  };

  return (
    <PanelContainer size="xxxl" className="flex flex-col">
      <PanelHeader>Rule update</PanelHeader>
      <PanelContent>
        <SwitchNode
          mode="edit"
          node={node}
          dataModel={dataModel}
          entityType={entityType}
          maxRiskLevel={maxRiskLevel}
          onModelChange={setCurrentModel}
        />
      </PanelContent>
      <PanelFooter>
        <div className="flex justify-end gap-v2-sm">
          <Button variant="secondary" onClick={sharp.actions.close}>
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleValidate}
            disabled={!currentModel || !isCompleteRuleModel(currentModel)}
          >
            Valider les modifications
          </Button>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
}
