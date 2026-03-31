import { AggregationEditContent } from '@app-builder/components/AstBuilder/edition/EditModal/modals/Aggregation/Aggregation';
import { useRoot } from '@app-builder/components/AstBuilder/edition/hooks/useRoot';
import { AstBuilderNodeSharpFactory } from '@app-builder/components/AstBuilder/edition/node-store';
import { type AggregationAstNode, NewAggregatorAstNode } from '@app-builder/models/astNode/aggregation';
import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel, getDataTypeIcon } from '@app-builder/models/data-model';
import {
  type AllowedScoringRuleSourceType,
  type BoolSwitch,
  getAggregationReturnType,
  isAllowedScoringRuleType,
  type NumberSwitch,
  type RuleModel,
  type StringSwitch,
  TagsSwitch,
  transformSwitchAstNodeToModel,
} from '@app-builder/models/scoring';
import {
  SCREENING_CATEGORIES,
  SCREENING_CATEGORY_I18N_KEY_MAP,
  topicsToCategories,
} from '@app-builder/models/screening';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clone } from 'remeda';
import { match } from 'ts-pattern';
import { type SelectOption, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BoolSwitchEdit } from './BoolSwitchEdit';
import { NumberSwitchEdit } from './NumberSwitchEdit';
import { StringSwitchEdit } from './StringSwitchEdit';
import { TagsSwitchEdit } from './TagsSwitchEdit';

function createDefaultConditions(fieldType: AllowedScoringRuleSourceType): NumberSwitch | StringSwitch | BoolSwitch {
  switch (fieldType) {
    case 'Int':
    case 'Float':
      return {
        type: 'number',
        branches: [{ value: 0, impact: { modifier: 0 } }],
        default: { modifier: 0 },
      };
    case 'String':
      return {
        type: 'string',
        branches: [{ value: { op: '=', value: '' }, impact: { modifier: 0 } }],
        default: { modifier: 0 },
      };
    case 'Bool':
      return { type: 'bool', ifTrue: { modifier: 0 }, ifFalse: { modifier: 0 } };
  }
}

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

interface SwitchNodeEditProps {
  node: SwitchAstNode;
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
  const { t } = useTranslation(['user-scoring', 'scenarios']);
  const { orgObjectTags } = useOrganizationObjectTags();
  const model = transformSwitchAstNodeToModel(node, entityType, dataModel);
  const [conditions, setConditions] = useState<NumberSwitch | StringSwitch | BoolSwitch | TagsSwitch | null>(
    model ? model.conditions : null,
  );
  const [selectedField, setSelectedField] = useState<string | null>(() => {
    if (model?.type !== 'user_attribute' || !model.field) return null;
    return model.field.children[0].constant;
  });

  const [aggregationNode, setAggregationNode] = useState<AggregationAstNode | null>(() =>
    model?.type === 'aggregate' ? (model.field ?? null) : null,
  );

  const handleFieldChange = (newField: string | null) => {
    setSelectedField(newField);

    const entityTable = dataModel.find((t) => t.name === entityType);
    const fieldDef = newField ? entityTable?.fields.find((f) => f.name === newField) : undefined;
    const fieldType = fieldDef && isAllowedScoringRuleType(fieldDef.dataType) ? fieldDef.dataType : null;

    const newConditions = fieldType ? createDefaultConditions(fieldType) : null;
    setConditions(newConditions);

    if (!model || !onModelChange) return;
    onModelChange({
      type: model.type,
      field: newField ? NewPayloadAstNode(newField) : null,
      conditions: newConditions,
    } as RuleModel);
  };

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

  const handleConditionsChange = (next: NumberSwitch | StringSwitch | BoolSwitch | TagsSwitch) => {
    setConditions(next);
    if (!model || !onModelChange) return;
    if ((model.type === 'screening_tags' || model.type === 'entity_tags') && next.type === 'tags') {
      onModelChange({ type: model.type, conditions: next });
      return;
    }
    const field =
      model.type === 'user_attribute' ? (selectedField ? NewPayloadAstNode(selectedField) : null) : aggregationNode;
    onModelChange({ type: model.type, field, conditions: next } as RuleModel);
  };

  const fieldOptions = useMemo((): SelectOption<string>[] => {
    const entityTable = dataModel.find((t) => t.name === entityType);
    if (!entityTable) return [];
    return entityTable.fields
      .filter((f) => isAllowedScoringRuleType(f.dataType))
      .map((f) => ({
        label: (
          <span className="flex items-center gap-v2-xs">
            {getDataTypeIcon(f.dataType) ? (
              <Icon icon={getDataTypeIcon(f.dataType)!} className="size-4 shrink-0" />
            ) : null}
            <span>{f.name}</span>
          </span>
        ),
        value: f.name,
      }));
  }, [dataModel, entityType]);

  if (!model) return null;

  return (
    <div className="flex flex-col gap-v2-sm text-s text-grey-secondary">
      {match(model)
        .with({ type: 'user_attribute' }, () => (
          <div className="flex flex-wrap items-center gap-v2-sm">
            <span className="font-medium">{t('user-scoring:switch.depending_on')}</span>
            <SelectV2
              value={selectedField}
              placeholder="—"
              options={fieldOptions}
              onChange={handleFieldChange}
              className="w-[164px]"
            />
          </div>
        ))
        .with({ type: 'aggregate' }, () => (
          <div className="flex flex-col gap-v2-sm">
            <span className="font-medium">{t('user-scoring:switch.depending_on')}</span>
            <div className="p-v2-md bg-grey-background-light border border-grey-border rounded-v2-md flex flex-col gap-v2-lg">
              <InlineAggregationEditor
                node={aggregationNode ?? NewAggregatorAstNode('SUM')}
                onChange={handleAggregationChange}
              />
            </div>
          </div>
        ))
        .with({ type: 'screening_tags' }, () => (
          <span className="font-medium">{t('user-scoring:switch.screening_tags.depending_on')}</span>
        ))
        .with({ type: 'entity_tags' }, () => (
          <span className="font-medium">{t('user-scoring:switch.entity_tags.depending_on')}</span>
        ))
        .exhaustive()}
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
            .with({ type: 'tags' }, (c) => {
              const tagOptions: SelectOption<string>[] =
                model.type === 'screening_tags'
                  ? SCREENING_CATEGORIES.map((cat) => ({
                      value: cat,
                      label: t(
                        `scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[cat]}`,
                      ),
                    }))
                  : orgObjectTags.map((tag) => ({ value: tag.id, label: tag.name }));
              return (
                <TagsSwitchEdit
                  conditions={c}
                  maxRiskLevel={maxRiskLevel}
                  options={tagOptions}
                  normalizeValue={model.type === 'screening_tags' ? topicsToCategories : undefined}
                  onChange={handleConditionsChange}
                />
              );
            })
            .exhaustive()}
        </>
      ) : null}
    </div>
  );
}
