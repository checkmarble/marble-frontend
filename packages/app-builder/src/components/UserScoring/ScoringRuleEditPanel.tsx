import { AstBuilder } from '@app-builder/components/AstBuilder';
import { Panel, PanelSharpFactory } from '@app-builder/components/Panel';
import { type DataModel } from '@app-builder/models';
import { type CustomList } from '@app-builder/models/custom-list';
import {
  buildAstNodeFromModel,
  type DraftRuleModel,
  isCompleteRule,
  RISK_TYPES,
  type ScoringRule,
  transformAstNodeToModel,
} from '@app-builder/models/scoring';
import {
  type BuilderOptionsResource,
  buildDatabaseAccessorsFromDataModel,
  buildPayloadAccessorsFromDataModel,
} from '@app-builder/server-fns/scenarios';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { cn, type SelectOption, SelectV2, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { SwitchNode } from './SwitchNode';

type ScoringRuleEditPanelProps = {
  rule: ScoringRule;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  customLists?: CustomList[];
  hasValidLicense?: boolean;
  onChange?: (rule: ScoringRule) => Promise<boolean>;
  onDelete?: () => void;
};

export function ScoringRuleEditPanel({
  rule,
  dataModel,
  entityType,
  maxRiskLevel,
  customLists = [],
  hasValidLicense,
  onChange,
  onDelete,
}: ScoringRuleEditPanelProps) {
  const { t } = useTranslation(['user-scoring']);
  const sharp = PanelSharpFactory.useSharp();

  const payloadAccessors = useMemo(
    () => buildPayloadAccessorsFromDataModel(dataModel, entityType),
    [dataModel, entityType],
  );
  const databaseAccessors = useMemo(
    () => buildDatabaseAccessorsFromDataModel(dataModel, entityType),
    [dataModel, entityType],
  );

  const builderOptionsData = useMemo(
    (): BuilderOptionsResource => ({
      dataModel,
      triggerObjectType: entityType,
      customLists,
      databaseAccessors,
      payloadAccessors,
      hasValidLicense,
      hasContinuousScreening: false,
      screeningConfigs: [],
      hasScoringRuleset: false,
      scoringSettings: null,
    }),
    [dataModel, entityType, customLists, databaseAccessors, payloadAccessors, hasValidLicense],
  );
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(rule.name);
  const [nameTouched, setNameTouched] = useState(false);
  const [riskType, setRiskType] = useState(rule.riskType);

  useEffect(() => {
    if (!rule.name) {
      // Delay to run after the panel's focus trap effect
      const id = setTimeout(() => nameInputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, []);
  const [currentModel, setCurrentModel] = useState<DraftRuleModel | null>(() =>
    transformAstNodeToModel(rule.ast, entityType, dataModel),
  );

  const RISK_TYPE_OPTIONS: SelectOption<string>[] = RISK_TYPES.map((v) => ({
    value: v,
    label: t(`user-scoring:risk_type.${v}`),
  }));

  const isValid = !!name.trim() && !!riskType && !!currentModel && isCompleteRule(currentModel);

  const handleValidate = async () => {
    if (isValid && currentModel && isCompleteRule(currentModel) && onChange) {
      const result = await onChange({
        ...rule,
        name,
        riskType,
        ast: buildAstNodeFromModel(currentModel, { entityType }),
      });
      if (result) {
        sharp.actions.close();
      }
    }
  };

  return (
    <AstBuilder.StaticProvider data={builderOptionsData} mode="edit">
      <Panel.Container size="small">
        <Panel.Content>
          <Panel.Header className="flex items-center">
            <div className="flex flex-1 flex-col">
              <input
                ref={nameInputRef}
                className={cn(
                  'text-h2 font-semibold outline-none h-6',
                  nameTouched && !name.trim() ? 'border-b border-red-primary' : '',
                )}
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setNameTouched(true)}
                placeholder={t('user-scoring:rule_edit.name_placeholder')}
              />
              {nameTouched && !name.trim() ? (
                <span className="text-xs text-red-primary mt-1">{t('user-scoring:rule_edit.name_required')}</span>
              ) : null}
            </div>
            {onDelete ? (
              <button
                onClick={onDelete}
                className="ms-auto flex size-6 shrink-0 items-center justify-center rounded-lg border border-red-primary text-red-primary hover:bg-red-primary hover:text-white"
                aria-label="Delete rule"
              >
                <Icon icon="delete" className="size-4" />
              </button>
            ) : null}
          </Panel.Header>
          <div className="flex flex-wrap items-center gap-2 pb-md">
            <Tag color="grey">{entityType}</Tag>
            {currentModel ? (
              <Tag color="grey">
                {match(currentModel)
                  .with({ type: 'user_attribute' }, () => t('user-scoring:rule_edit.model_type.user_attribute'))
                  .with({ type: 'aggregate' }, () => t('user-scoring:rule_edit.model_type.aggregate'))
                  .with({ type: 'screening_tags' }, () => t('user-scoring:rule_edit.model_type.screening_tags'))
                  .with({ type: 'entity_tags' }, () => t('user-scoring:rule_edit.model_type.entity_tags'))
                  .with({ type: 'past_alerts' }, () => t('user-scoring:rule_edit.model_type.past_alerts'))
                  .exhaustive()}
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
          <div className="flex flex-col gap-md p-md border border-grey-border rounded-md">
            <SwitchNode
              mode="edit"
              node={rule.ast}
              dataModel={dataModel}
              entityType={entityType}
              maxRiskLevel={maxRiskLevel}
              customLists={customLists}
              onModelChange={(model) => setCurrentModel(model)}
            />
          </div>
          <Panel.Footer>
            <Panel.FooterButton
              variant="secondary"
              onClick={sharp.actions.close}
              label={t('user-scoring:rule_edit.cancel')}
            />
            <Panel.FooterButton
              variant="primary"
              onClick={handleValidate}
              disabled={!isValid}
              label={t('user-scoring:rule_edit.save')}
            />
          </Panel.Footer>
        </Panel.Content>
      </Panel.Container>
    </AstBuilder.StaticProvider>
  );
}
