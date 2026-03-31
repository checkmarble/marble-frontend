import { type ScoreImpact, type TagsSwitch } from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Button, NumberInput, type SelectOption, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { RiskLevelSelect } from './shared';

interface TagsSwitchEditProps {
  options: SelectOption<string>[];
  conditions: TagsSwitch;
  maxRiskLevel: number;
  onChange: (next: TagsSwitch) => void;
  normalizeValue?: (v: string[]) => string[];
}

export function TagsSwitchEdit({
  options,
  conditions,
  maxRiskLevel,
  onChange,
  normalizeValue,
}: TagsSwitchEditProps) {
  const { t } = useTranslation(['user-scoring']);
  const { branches, default: defaultImpact } = conditions;

  const setBranch = (idx: number, branch: { value: string[]; impact: ScoreImpact }) => {
    onChange({ ...conditions, branches: branches.map((b, i) => (i === idx ? branch : b)) });
  };

  const addBranch = () => {
    onChange({ ...conditions, branches: [...branches, { value: [], impact: { modifier: 0 } }] });
  };

  const removeBranch = (idx: number) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };

  const setDefaultImpact = (impact: ScoreImpact) => {
    onChange({ ...conditions, default: impact });
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      {branches.map((branch, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_minmax(auto,_40px)_70px_auto_auto] items-center gap-2">
          <SelectV2<string>
            multiple
            options={options}
            placeholder={t('user-scoring:switch.screening_tags.tags_placeholder')}
            value={normalizeValue ? normalizeValue(branch.value) : branch.value}
            onChange={(values) => setBranch(idx, { ...branch, value: values })}
            className="flex-1"
          />
          <span className="text-center text-grey-secondary">{t('user-scoring:switch.then')}</span>
          <NumberInput
            value={branch.impact.modifier}
            onChange={(value) => setBranch(idx, { ...branch, impact: { ...branch.impact, modifier: value } })}
          />
          <RiskLevelSelect
            floor={branch.impact.floor}
            maxRiskLevel={maxRiskLevel}
            onChange={(floor) => setBranch(idx, { ...branch, impact: { ...branch.impact, floor } })}
          />
          <button
            type="button"
            onClick={() => removeBranch(idx)}
            className="text-grey-secondary hover:text-red-primary"
          >
            <Icon icon="delete" className="size-5" />
          </button>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_minmax(auto,_40px)_70px_auto_auto] items-center gap-2">
        <span className="text-right text-purple-primary">{t('user-scoring:switch.else')}</span>
        <div />
        <NumberInput
          value={defaultImpact.modifier}
          onChange={(value) => setDefaultImpact({ ...defaultImpact, modifier: value })}
        />
        <RiskLevelSelect
          floor={defaultImpact.floor}
          maxRiskLevel={maxRiskLevel}
          onChange={(floor) => setDefaultImpact({ ...defaultImpact, floor })}
        />
        <div />
      </div>
      <Button onClick={addBranch} className="self-start shadow-sm" appearance="stroked">
        {t('user-scoring:switch.screening_tags.add_branch')}
      </Button>
    </div>
  );
}
