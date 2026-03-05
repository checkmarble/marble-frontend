import { type NumberSwitch } from '@app-builder/models/scoring';
import { SwitchCaseRow } from './shared';

export function NumberSwitchDescription({
  conditions,
  maxRiskLevel,
}: {
  conditions: NumberSwitch;
  maxRiskLevel: number;
}) {
  return (
    <ul className="flex flex-col gap-v2-sm">
      {conditions.branches.map((branch, idx) => {
        const label =
          idx === 0
            ? `If value ≤ ${branch.value}`
            : `If value is between ${conditions.branches[idx - 1]!.value + 1} and ${branch.value}`;
        return (
          <SwitchCaseRow key={idx} impact={branch.impact} maxRiskLevel={maxRiskLevel}>
            {label}
          </SwitchCaseRow>
        );
      })}
      <SwitchCaseRow impact={conditions.default} maxRiskLevel={maxRiskLevel}>
        Else
      </SwitchCaseRow>
    </ul>
  );
}
