import { type BoolSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { SwitchCaseRow } from './shared';

interface BoolSwitchDescriptionProps {
  conditions: BoolSwitch;
  maxRiskLevel: number;
  matchedBranchIndex?: number | null;
}

export function BoolSwitchDescription({ conditions, maxRiskLevel, matchedBranchIndex }: BoolSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <ul className="flex flex-col gap-sm">
      <SwitchCaseRow impact={conditions.ifTrue} maxRiskLevel={maxRiskLevel} matched={matchedBranchIndex === 0}>
        {t('user-scoring:switch.description.if_true')}
      </SwitchCaseRow>
      <SwitchCaseRow impact={conditions.ifFalse} maxRiskLevel={maxRiskLevel} matched={matchedBranchIndex === 1}>
        {t('user-scoring:switch.description.if_false')}
      </SwitchCaseRow>
    </ul>
  );
}
