import { type BoolSwitch, type ScoreImpact } from '@app-builder/models/scoring';
import { Input } from 'ui-design-system';
import { RiskLevelSelect } from './shared';

export function BoolSwitchEdit({
  conditions,
  maxRiskLevel,
  onChange,
}: {
  conditions: BoolSwitch;
  maxRiskLevel: number;
  onChange: (next: BoolSwitch) => void;
}) {
  const setIfTrue = (impact: ScoreImpact) => onChange({ ...conditions, ifTrue: impact });
  const setIfFalse = (impact: ScoreImpact) => onChange({ ...conditions, ifFalse: impact });

  return (
    <div className="flex flex-col gap-v2-sm">
      <BoolRow
        label="si oui"
        showAlors
        impact={conditions.ifTrue}
        maxRiskLevel={maxRiskLevel}
        onImpactChange={setIfTrue}
      />
      <BoolRow label="sinon" impact={conditions.ifFalse} maxRiskLevel={maxRiskLevel} onImpactChange={setIfFalse} />
    </div>
  );
}

function BoolRow({
  label,
  showAlors = false,
  impact,
  maxRiskLevel,
  onImpactChange,
}: {
  label: string;
  showAlors?: boolean;
  impact: ScoreImpact;
  maxRiskLevel: number;
  onImpactChange: (imp: ScoreImpact) => void;
}) {
  return (
    <div className="grid grid-cols-[164px_minmax(auto,_40px)_70px_auto] items-center gap-2">
      <span className="text-right text-purple-primary">{label}</span>
      <span className="text-center text-grey-secondary">{showAlors ? 'alors' : ''}</span>
      <Input
        type="number"
        value={impact.modifier}
        onChange={(e) => onImpactChange({ ...impact, modifier: e.target.valueAsNumber })}
      />
      <RiskLevelSelect
        floor={impact.floor}
        maxRiskLevel={maxRiskLevel}
        onChange={(floor) => onImpactChange({ ...impact, floor })}
      />
    </div>
  );
}
