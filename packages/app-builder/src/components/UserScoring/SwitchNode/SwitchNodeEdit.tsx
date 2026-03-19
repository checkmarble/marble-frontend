import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel, getDataTypeIcon } from '@app-builder/models/data-model';
import {
  type AllowedScoringRuleSourceType,
  type BoolSwitch,
  isAllowedScoringRuleType,
  type NumberSwitch,
  type RuleModel,
  type StringSwitch,
  transformSwitchAstNodeToModel,
} from '@app-builder/models/scoring';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { type SelectOption, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BoolSwitchEdit } from './BoolSwitchEdit';
import { NumberSwitchEdit } from './NumberSwitchEdit';
import { StringSwitchEdit } from './StringSwitchEdit';
import { FieldPlaceholder } from './shared';

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
  const { t } = useTranslation(['user-scoring']);
  const model = transformSwitchAstNodeToModel(node, entityType, dataModel);
  const [conditions, setConditions] = useState<NumberSwitch | StringSwitch | BoolSwitch | null>(
    model ? model.conditions : null,
  );
  const [selectedField, setSelectedField] = useState<string | null>(() => {
    if (model?.type !== 'user_attribute' || !model.field) return null;
    return model.field.children[0].constant;
  });

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

  const handleConditionsChange = (next: NumberSwitch | StringSwitch | BoolSwitch) => {
    setConditions(next);
    if (!model || !onModelChange) return;
    const field =
      model.type === 'user_attribute' ? (selectedField ? NewPayloadAstNode(selectedField) : null) : model.field;
    onModelChange({ type: model.type, field, conditions: next } as RuleModel);
  };

  const isAttributeType = model?.type === 'user_attribute';

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
      <div className="flex flex-wrap items-center gap-v2-sm">
        <span className="font-medium">{t('user-scoring:switch.depending_on')}</span>
        {isAttributeType ? (
          <SelectV2
            value={selectedField}
            placeholder="—"
            options={fieldOptions}
            onChange={handleFieldChange}
            className="w-[164px]"
          />
        ) : (
          <FieldPlaceholder />
        )}
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
    </div>
  );
}
