import { DataModel } from '@app-builder/models';
import { isSwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  buildSwitchAstNodeFromModel,
  isCompleteRuleModel,
  RISK_TYPES,
  RuleModel,
  ScoringRule,
  transformSwitchAstNodeToModel,
} from '@app-builder/models/scoring';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { PanelContainer, PanelContent, PanelFooter } from '../Panel';
import { PanelSharpFactory } from '../Panel/Panel';
import { SwitchNode } from './SwitchNode';

type ScoringRuleEditPanelProps = {
  rule: ScoringRule;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  customLists?: CustomList[];
  onChange?: (rule: ScoringRule) => void;
  onDelete?: () => void;
};

export function ScoringRuleEditPanel({
  rule,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists = [],
  onChange,
  onDelete,
}: ScoringRuleEditPanelProps) {
  const { t } = useTranslation(['user-scoring']);
  const sharp = PanelSharpFactory.useSharp();
  const [name, setName] = useState(rule.name);
  const [riskType, setRiskType] = useState(rule.riskType);
  const [currentModel, setCurrentModel] = useState<RuleModel | null>(() =>
    isSwitchAstNode(rule.ast) ? transformSwitchAstNodeToModel(rule.ast, entityType, dataModel) : null,
  );

  const RISK_TYPE_OPTIONS: SelectOption<string>[] = RISK_TYPES.map((v) => ({
    value: v,
    label: t(`user-scoring:risk_type.${v}`),
  }));

  const isValid = !!name.trim() && !!riskType && !!currentModel && isCompleteRuleModel(currentModel);

  const handleValidate = () => {
    if (isValid && currentModel && isCompleteRuleModel(currentModel)) {
      onChange?.({ ...rule, name, riskType, ast: buildSwitchAstNodeFromModel(currentModel) });
    }
    sharp.actions.close();
  };

  return (
    <PanelContainer size="xxxl" className="flex flex-col">
      <div className="flex items-center gap-v2-md pb-v2-md">
        <Icon
          icon="cross"
          className="size-6 shrink-0 cursor-pointer text-grey-secondary hover:text-grey-primary"
          onClick={sharp.actions.close}
          aria-label="Close panel"
        />
        <input
          className="flex-1 text-l font-semibold outline-none"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('user-scoring:rule_edit.name_placeholder')}
        />
        {onDelete ? (
          <button
            onClick={onDelete}
            className="flex size-6 shrink-0 items-center justify-center rounded-lg border border-red-primary text-red-primary hover:bg-red-primary hover:text-white"
            aria-label="Delete rule"
          >
            <Icon icon="delete" className="size-4" />
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-center gap-2 pb-v2-md">
        <Tag color="grey">{entityType}</Tag>
        {currentModel ? (
          <Tag color="grey">
            {currentModel.type === 'user_attribute'
              ? t('user-scoring:rule_edit.model_type.user_attribute')
              : t('user-scoring:rule_edit.model_type.aggregate')}
          </Tag>
        ) : null}
        <SelectV2
          variant="tag"
          options={RISK_TYPE_OPTIONS}
          value={riskType}
          onChange={setRiskType}
          placeholder={t('user-scoring:rule_edit.risk_type_placeholder')}
          menuClassName="min-w-40"
        />
      </div>
      <PanelContent>
        <div className="flex flex-col gap-v2-md p-v2-md border border-grey-border rounded-v2-md">
          {isSwitchAstNode(rule.ast) ? (
            <SwitchNode
              mode="edit"
              node={rule.ast}
              dataModel={dataModel}
              entityType={entityType}
              maxRiskLevel={maxRiskLevel}
              customLists={customLists}
              onModelChange={setCurrentModel}
            />
          ) : null}
        </div>
      </PanelContent>
      <PanelFooter>
        <div className="flex justify-end gap-v2-sm">
          <Button variant="secondary" onClick={sharp.actions.close}>
            {t('user-scoring:rule_edit.cancel')}
          </Button>
          <Button variant="primary" onClick={handleValidate} disabled={!isValid}>
            {t('user-scoring:rule_edit.save')}
          </Button>
        </div>
      </PanelFooter>
    </PanelContainer>
  );
}
