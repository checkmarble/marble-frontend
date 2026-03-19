import { type BoolSwitch, type ScoreImpact } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Input } from 'ui-design-system';
import { RiskLevelSelect } from './shared';

interface BoolSwitchEditProps {
  conditions: BoolSwitch;
  maxRiskLevel: number;
  onChange: (next: BoolSwitch) => void;
}

export function BoolSwitchEdit({ conditions, maxRiskLevel, onChange }: BoolSwitchEditProps) {
  const { t } = useTranslation(['user-scoring']);
  const setIfTrue = (impact: ScoreImpact) => onChange({ ...conditions, ifTrue: impact });
  const setIfFalse = (impact: ScoreImpact) => onChange({ ...conditions, ifFalse: impact });

  return (
    <div className="flex flex-col gap-v2-sm">
      <BoolRow
        label={t('user-scoring:switch.bool.if_true')}
        showAlors
        impact={conditions.ifTrue}
        maxRiskLevel={maxRiskLevel}
        onImpactChange={setIfTrue}
      />
      <BoolRow
        label={t('user-scoring:switch.bool.if_false')}
        impact={conditions.ifFalse}
        maxRiskLevel={maxRiskLevel}
        onImpactChange={setIfFalse}
      />
    </div>
  );
}

interface BoolRowProps {
  label: string;
  showAlors?: boolean;
  impact: ScoreImpact;
  maxRiskLevel: number;
  onImpactChange: (imp: ScoreImpact) => void;
}

function BoolRow({ label, showAlors = false, impact, maxRiskLevel, onImpactChange }: BoolRowProps) {
  const { t } = useTranslation(['user-scoring']);
  return (
    <div className="grid grid-cols-[164px_minmax(auto,_40px)_70px_auto] items-center gap-2">
      <span className="text-right text-purple-primary">{label}</span>
      <span className="text-center text-grey-secondary">{showAlors ? t('user-scoring:switch.bool.then') : ''}</span>
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
