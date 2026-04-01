import { type TagsSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { SwitchCaseRow } from './shared';

interface TagsSwitchDescriptionProps {
  conditions: TagsSwitch;
  maxRiskLevel: number;
  getTagLabel: (value: string) => string;
}

export function TagsSwitchDescription({ conditions, maxRiskLevel, getTagLabel }: TagsSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <ul className="flex flex-col gap-v2-sm">
      {conditions.branches.map((branch, idx) => (
        <SwitchCaseRow key={idx} impact={branch.impact} maxRiskLevel={maxRiskLevel}>
          <span>{t('user-scoring:switch.screening_tags.if_tags_include')}</span>
          <span className="flex flex-wrap gap-1">
            {branch.value.map((tag) => (
              <Tag key={tag} color="grey">
                {getTagLabel(tag)}
              </Tag>
            ))}
          </span>
        </SwitchCaseRow>
      ))}
      <SwitchCaseRow impact={conditions.default} maxRiskLevel={maxRiskLevel}>
        {t('user-scoring:switch.description.else')}
      </SwitchCaseRow>
    </ul>
  );
}
