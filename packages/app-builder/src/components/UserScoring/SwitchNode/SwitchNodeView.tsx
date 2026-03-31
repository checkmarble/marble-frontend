import { type SwitchAstNode } from '@app-builder/models/astNode/control-flow';
import { type CustomList } from '@app-builder/models/custom-list';
import { type DataModel } from '@app-builder/models/data-model';
import { getOperationType, isCompleteRule, transformSwitchAstNodeToModel } from '@app-builder/models/scoring';
import { SCREENING_CATEGORY_I18N_KEY_MAP, topicsToCategories } from '@app-builder/models/screening';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { BoolSwitchDescription } from './BoolSwitchDescription';
import { NumberSwitchDescription } from './NumberSwitchDescription';
import { StringSwitchDescription } from './StringSwitchDescription';
import { FieldPill } from './shared';
import { TagsSwitchDescription } from './TagsSwitchDescription';

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
  } = useTranslation(['user-scoring', 'scenarios']);
  const { getTagById } = useOrganizationObjectTags();
  const fieldType = getOperationType(entityType, dataModel, node);
  const model = transformSwitchAstNodeToModel(node, entityType, dataModel);

  return (
    <div className="flex flex-col gap-v2-sm pl-10 text-xs text-grey-secondary">
      <div className="flex flex-wrap items-center gap-v2-sm">
        {model
          ? match(model)
              .with({ type: 'user_attribute' }, (m) =>
                isCompleteRule(m) ? (
                  <>
                    <span>{t('user-scoring:switch.depending_on')}</span>
                    <FieldPill field={m.field} fieldType={fieldType} />
                    <span>, {t('user-scoring:switch.apply_conditions')}</span>
                  </>
                ) : null,
              )
              .with({ type: 'aggregate' }, (m) =>
                isCompleteRule(m) ? (
                  <>
                    <span>{t('user-scoring:switch.depending_on')}</span>
                    <Tag color="grey" className="gap-v2-sm">
                      <span>
                        {getAstNodeDisplayName(m.field, {
                          customLists: [],
                          language,
                          t: tAstBuilder,
                        })}
                      </span>
                      <Icon icon="function" className="size-4" />
                    </Tag>
                    <span>, {t('user-scoring:switch.apply_conditions')}</span>
                  </>
                ) : null,
              )
              .with({ type: 'screening_tags' }, () => (
                <span>{t('user-scoring:switch.screening_tags.depending_on')}</span>
              ))
              .with({ type: 'entity_tags' }, () => <span>{t('user-scoring:switch.entity_tags.depending_on')}</span>)
              .exhaustive()
          : null}
      </div>

      {node.children.length === 0 ? (
        <p className="italic text-grey-placeholder">{t('user-scoring:switch.no_condition')}</p>
      ) : model && isCompleteRule(model) ? (
        match(model)
          .with({ type: 'user_attribute' }, { type: 'aggregate' }, (m) =>
            match(m.conditions)
              .with({ type: 'number' }, (c) => <NumberSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
              .with({ type: 'bool' }, (c) => <BoolSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} />)
              .with({ type: 'string' }, (c) => (
                <StringSwitchDescription conditions={c} maxRiskLevel={maxRiskLevel} customLists={customLists} />
              ))
              .exhaustive(),
          )
          .with({ type: 'screening_tags' }, (m) => (
            <TagsSwitchDescription
              conditions={m.conditions}
              maxRiskLevel={maxRiskLevel}
              getTagLabel={(value) => {
                const cats = topicsToCategories([value]);
                const cat = cats[0];
                return cat
                  ? t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[cat]}`)
                  : value;
              }}
            />
          ))
          .with({ type: 'entity_tags' }, (m) => (
            <TagsSwitchDescription
              conditions={m.conditions}
              maxRiskLevel={maxRiskLevel}
              getTagLabel={(value) => getTagById(value)?.name ?? value}
            />
          ))
          .exhaustive()
      ) : null}
    </div>
  );
}
