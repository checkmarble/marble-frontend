import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import { getOperationType, isCompleteRuleModel, transformSwitchAstNodeToModel } from '@app-builder/models/scoring';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BoolSwitchDescription } from './BoolSwitchDescription';
import { NumberSwitchDescription } from './NumberSwitchDescription';
import { StringSwitchDescription } from './StringSwitchDescription';
import { FieldPill } from './shared';

interface SwitchNodeViewProps {
  node: SwitchAstNode;
  dataModel: DataModel;
  entityType: string;
  maxRiskLevel: number;
  customLists?: CustomList[];
}

export function SwitchNodeView({ node, dataModel, entityType, maxRiskLevel, customLists }: SwitchNodeViewProps) {
  const { t: tAstBuilder } = useTranslation(['common', 'scenarios']);
  const {
    t,
    i18n: { language },
  } = useTranslation(['user-scoring']);
  const fieldType = getOperationType(entityType, dataModel, node);
  const model = transformSwitchAstNodeToModel(node, entityType, dataModel);

  return (
    <div className="flex flex-col gap-v2-sm pl-10 text-xs text-grey-secondary">
      <div className="flex flex-wrap items-center gap-v2-sm">
        {model && isCompleteRuleModel(model)
          ? match(model)
              .with({ type: 'user_attribute' }, (userAttributeModel) => (
                <>
                  <span>{t('user-scoring:switch.depending_on')}</span>
                  <FieldPill field={userAttributeModel.field} fieldType={fieldType} />
                  <span>, {t('user-scoring:switch.apply_conditions')}</span>
                </>
              ))
              .with({ type: 'aggregate' }, (aggregateModel) => (
                <>
                  <span>{t('user-scoring:switch.depending_on')}</span>
                  <Tag color="grey" className="gap-v2-sm">
                    <span>
                      {getAstNodeDisplayName(aggregateModel.field, {
                        customLists: [],
                        language,
                        t: tAstBuilder,
                      })}
                    </span>
                    <Icon icon="function" className="size-4" />
                  </Tag>
                  <span>, {t('user-scoring:switch.apply_conditions')}</span>
                </>
              ))
              .otherwise(() => null)
          : null}
      </div>

      {node.children.length === 0 ? (
        <p className="italic text-grey-placeholder">{t('user-scoring:switch.no_condition')}</p>
      ) : model && isCompleteRuleModel(model) ? (
        match(model.conditions)
          .with({ type: 'number' }, (c) => <NumberSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
          .with({ type: 'bool' }, (c) => <BoolSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
          .with({ type: 'string' }, (c) => (
            <StringSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} customLists={customLists} />
          ))
          .exhaustive()
      ) : null}
    </div>
  );
}
