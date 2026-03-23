import { type BoolSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { SwitchCaseRow } from './shared';

interface BoolSwitchDescriptionProps {
  conditions: BoolSwitch;
  maxRiskLevel: number;
}

export function BoolSwitchDescription({ conditions, maxRiskLevel }: BoolSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <ul className="flex flex-col gap-v2-sm">
      <SwitchCaseRow impact={conditions.ifTrue} maxRiskLevel={maxRiskLevel}>
        {t('user-scoring:switch.description.if_true')}
      </SwitchCaseRow>
      <SwitchCaseRow impact={conditions.ifFalse} maxRiskLevel={maxRiskLevel}>
        {t('user-scoring:switch.description.if_false')}
      </SwitchCaseRow>
    </ul>
  );
}
