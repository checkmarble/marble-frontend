import { type NumberSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { SwitchCaseRow } from './shared';

interface NumberSwitchDescriptionProps {
  conditions: NumberSwitch;
  maxRiskLevel: number;
}

export function NumberSwitchDescription({ conditions, maxRiskLevel }: NumberSwitchDescriptionProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <ul className="flex flex-col gap-v2-sm">
      {conditions.branches.map((branch, idx) => {
        const label =
          idx === 0
            ? t('user-scoring:switch.description.if_value_lte', { value: branch.value })
            : t('user-scoring:switch.description.if_value_between', {
                from: conditions.branches[idx - 1]!.value + 1,
                to: branch.value,
              });
        return (
          <SwitchCaseRow key={idx} impact={branch.impact} maxRiskLevel={maxRiskLevel}>
            {label}
          </SwitchCaseRow>
        );
      })}
      <SwitchCaseRow impact={conditions.default} maxRiskLevel={maxRiskLevel}>
        {t('user-scoring:switch.description.else')}
      </SwitchCaseRow>
    </ul>
  );
}
