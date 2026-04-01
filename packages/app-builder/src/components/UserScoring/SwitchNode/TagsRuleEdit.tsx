import {
  type EntityTagsRule,
  type RuleModel,
  type ScreeningTagsRule,
  type TagsSwitch,
} from '@app-builder/models/scoring';
import {
  SCREENING_CATEGORIES,
  SCREENING_CATEGORY_I18N_KEY_MAP,
  topicsToCategories,
} from '@app-builder/models/screening';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { type SelectOption } from 'ui-design-system';
import { TagsSwitchEdit } from './TagsSwitchEdit';

interface TagsRuleEditProps {
  model: ScreeningTagsRule | EntityTagsRule;
  maxRiskLevel: number;
  onModelChange?: (model: RuleModel) => void;
}

export function TagsRuleEdit({ model, maxRiskLevel, onModelChange }: TagsRuleEditProps) {
  const { t } = useTranslation(['user-scoring', 'scenarios']);
  const { orgObjectTags } = useOrganizationObjectTags();

  const [conditions, setConditions] = useState<TagsSwitch>(model.conditions);

  const handleConditionsChange = (next: TagsSwitch) => {
    setConditions(next);
    onModelChange?.({ type: model.type, conditions: next });
  };

  const tagOptions: SelectOption<string>[] = match(model)
    .with({ type: 'screening_tags' }, () =>
      SCREENING_CATEGORIES.map((cat) => ({
        value: cat,
        label: t(`scenarios:monitoring_list_check.hit_type.${SCREENING_CATEGORY_I18N_KEY_MAP[cat]}`),
      })),
    )
    .with({ type: 'entity_tags' }, () => orgObjectTags.map((tag) => ({ value: tag.id, label: tag.name })))
    .exhaustive();

  const normalizeValue = model.type === 'screening_tags' ? topicsToCategories : undefined;

  return (
    <>
      <span className="font-medium">
        {match(model)
          .with({ type: 'screening_tags' }, () => t('user-scoring:switch.screening_tags.depending_on'))
          .with({ type: 'entity_tags' }, () => t('user-scoring:switch.entity_tags.depending_on'))
          .exhaustive()}
      </span>
      <span className="font-medium">{t('user-scoring:switch.apply_conditions')}</span>
      <TagsSwitchEdit
        conditions={conditions}
        maxRiskLevel={maxRiskLevel}
        options={tagOptions}
        normalizeValue={normalizeValue}
        onChange={handleConditionsChange}
      />
    </>
  );
}
