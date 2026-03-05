import { type BoolSwitch } from '@app-builder/models/scoring';
import { SwitchCaseRow } from './shared';

export function BoolSwitchDescription({ conditions, maxRiskLevel }: { conditions: BoolSwitch; maxRiskLevel: number }) {
  return (
    <ul className="flex flex-col gap-v2-sm">
      <SwitchCaseRow impact={conditions.ifTrue} maxRiskLevel={maxRiskLevel}>
        If true
      </SwitchCaseRow>
      <SwitchCaseRow impact={conditions.ifFalse} maxRiskLevel={maxRiskLevel}>
        If false
      </SwitchCaseRow>
    </ul>
  );
}
