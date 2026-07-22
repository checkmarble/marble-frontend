import { type TagsSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Tag } from 'ui-design-system';
import { SwitchCaseRow } from './shared';

interface TagsSwitchDescriptionProps {
  conditions: TagsSwitch;
  maxRiskLevel: number;
  getTagLabel: (value: string) => string;
  matchedBranchIndex?: number | null;
}

export function TagsSwitchDescription({
  conditions,
  maxRiskLevel,
  getTagLabel,
  matchedBranchIndex,
}: TagsSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <ul className="flex flex-col gap-sm">
      {conditions.branches.map((branch, idx) => (
        <SwitchCaseRow
          key={idx}
          impact={branch.impact}
          maxRiskLevel={maxRiskLevel}
          matched={matchedBranchIndex === idx}
        >
          <span>{t('user-scoring:switch.screening_tags.if_tags_include')}</span>
          <span className="flex flex-wrap gap-xs">
            {branch.value.map((tag) => (
              <Tag key={tag} color="grey">
                {getTagLabel(tag)}
              </Tag>
            ))}
          </span>
        </SwitchCaseRow>
      ))}
      <SwitchCaseRow
        impact={conditions.default}
        maxRiskLevel={maxRiskLevel}
        matched={matchedBranchIndex === conditions.branches.length}
      >
        {t('user-scoring:switch.description.else')}
      </SwitchCaseRow>
    </ul>
  );
}
