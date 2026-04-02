import { NewPayloadAstNode } from '@app-builder/models/astNode/data-accessor';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel, getDataTypeIcon } from '@app-builder/models/data-model';
import {
  type BoolSwitch,
  type DraftUserAttributeRule,
  isAllowedScoringRuleType,
  type NumberSwitch,
  type RuleModel,
  type StringSwitch,
} from '@app-builder/models/scoring';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { type SelectOption, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BoolSwitchEdit } from './BoolSwitchEdit';
import { createDefaultConditions } from './conditions-utils';
import { NumberSwitchEdit } from './NumberSwitchEdit';
import { StringSwitchEdit } from './StringSwitchEdit';

interface UserAttributeRuleEditProps {
  model: DraftUserAttributeRule;
  maxRiskLevel: number;
  dataModel: DataModel;
  entityType: string;
  customLists?: CustomList[];
  onModelChange?: (model: RuleModel) => void;
}

export function UserAttributeRuleEdit({
  model,
  maxRiskLevel,
  dataModel,
  entityType,
  customLists,
  onModelChange,
}: UserAttributeRuleEditProps) {
  const { t } = useTranslation(['user-scoring']);

  const [conditions, setConditions] = useState<NumberSwitch | StringSwitch | BoolSwitch | null>(model.conditions);
  const [selectedField, setSelectedField] = useState<string | null>(() => model.field?.children[0].constant ?? null);

  const handleFieldChange = (newField: string | null) => {
    setSelectedField(newField);

    const entityTable = dataModel.find((t) => t.name === entityType);
    const fieldDef = newField ? entityTable?.fields.find((f) => f.name === newField) : undefined;
    const fieldType = fieldDef && isAllowedScoringRuleType(fieldDef.dataType) ? fieldDef.dataType : null;

    const newConditions = fieldType ? createDefaultConditions(fieldType) : null;
    setConditions(newConditions);

    onModelChange?.({
      type: 'user_attribute',
      field: newField ? NewPayloadAstNode(newField) : null,
      conditions: newConditions,
    } as RuleModel);
  };

  const handleConditionsChange = (next: NumberSwitch | StringSwitch | BoolSwitch) => {
    setConditions(next);
    onModelChange?.({
      type: 'user_attribute',
      field: selectedField ? NewPayloadAstNode(selectedField) : null,
      conditions: next,
    } as RuleModel);
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

  return (
    <>
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
