import { type NumberSwitch, type ScoreImpact } from '@app-builder/models/scoring';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { RiskLevelSelect } from './shared';

interface NumberSwitchEditProps {
  conditions: NumberSwitch;
  maxRiskLevel: number;
  onChange: (next: NumberSwitch) => void;
}

export function NumberSwitchEdit({ conditions, maxRiskLevel, onChange }: NumberSwitchEditProps) {
  const { t } = useTranslation(['user-scoring']);
  const { branches, default: defaultImpact } = conditions;

  const setThreshold = (idx: number, value: number) => {
    const next = branches.map((b, i) => (i === idx ? { ...b, value } : b));
    onChange({ ...conditions, branches: next });
  };

  const setImpact = (idx: number | 'default', impact: ScoreImpact) => {
    if (idx === 'default') {
      onChange({ ...conditions, default: impact });
    } else {
      const next = branches.map((b, i) => (i === idx ? { ...b, impact } : b));
      onChange({ ...conditions, branches: next });
    }
  };

  const addBranch = () => {
    const lastValue = branches.at(-1)?.value ?? 0;
    onChange({ ...conditions, branches: [...branches, { value: lastValue + 1, impact: { modifier: 0 } }] });
  };

  const removeBranch = (idx: number) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };

  // Swap impacts between adjacent branches (thresholds stay sorted)
  const swapImpacts = (idx: number, dir: 'up' | 'down') => {
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= branches.length) return;
    const next = branches.map((b, i) => {
      if (i === idx) return { ...b, impact: branches[target]!.impact };
      if (i === target) return { ...b, impact: branches[idx]!.impact };
      return b;
    });
    onChange({ ...conditions, branches: next });
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      {branches[0] && (
        <BranchRow
          variant="first"
          threshold={branches[0].value}
          impact={branches[0].impact}
          maxRiskLevel={maxRiskLevel}
          onThresholdChange={(v) => setThreshold(0, v)}
          onImpactChange={(imp) => setImpact(0, imp)}
        />
      )}
      {branches.slice(1).map((branch, i) => {
        const realIdx = i + 1;
        return (
          <BranchRow
            key={realIdx}
            variant="middle"
            rangeStart={branches[realIdx - 1]!.value + 1}
            threshold={branch.value}
            impact={branch.impact}
            maxRiskLevel={maxRiskLevel}
            onThresholdChange={(v) => setThreshold(realIdx, v)}
            onImpactChange={(imp) => setImpact(realIdx, imp)}
            onMoveUp={() => swapImpacts(realIdx, 'up')}
            onMoveDown={() => swapImpacts(realIdx, 'down')}
            onDelete={() => removeBranch(realIdx)}
          />
        );
      })}
      <BranchRow
        variant="default"
        rangeStart={branches.at(-1) != null ? branches.at(-1)!.value + 1 : null}
        impact={defaultImpact}
        maxRiskLevel={maxRiskLevel}
        onImpactChange={(imp) => setImpact('default', imp)}
      />
      <Button onClick={addBranch} className="self-start shadow-sm" appearance="stroked">
        {t('user-scoring:switch.add_condition')}
      </Button>
    </div>
  );
}

type BranchRowProps = {
  variant: 'first' | 'middle' | 'default';
  threshold?: number;
  rangeStart?: number | null;
  impact: ScoreImpact;
  maxRiskLevel: number;
  onThresholdChange?: (v: number) => void;
  onImpactChange: (imp: ScoreImpact) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
};

function BranchRow({
  variant,
  threshold,
  rangeStart,
  impact,
  maxRiskLevel,
  onThresholdChange,
  onImpactChange,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BranchRowProps) {
  const { t } = useTranslation(['user-scoring']);
  const label =
    variant === 'first'
      ? t('user-scoring:switch.number.first')
      : variant === 'middle'
        ? t('user-scoring:switch.number.middle')
        : t('user-scoring:switch.number.default');

  const reorderButtons = (
    <>
      <button type="button" onClick={onMoveUp} className="leading-none">
        <Icon icon="arrow-2-up" className="size-4" />
      </button>
      <button type="button" onClick={onMoveDown} className="leading-none">
        <Icon icon="arrow-2-down" className="size-4" />
      </button>
    </>
  );

  let conditionRow: ReactNode;
  if (variant === 'middle') {
    conditionRow = (
      <div className="grid grid-cols-[24px_164px_70px_minmax(auto,_40px)_70px_1fr_24px] items-center gap-2">
        <div className="flex flex-col">{reorderButtons}</div>
        <span className="text-right text-purple-primary">{label}</span>
        <Input type="number" readOnly value={rangeStart ?? ''} />
        <span className="text-center text-grey-secondary">{t('user-scoring:switch.number.and')}</span>
        <Input type="number" value={threshold ?? ''} onChange={(e) => onThresholdChange?.(e.target.valueAsNumber)} />
        <div />
        <button type="button" onClick={onDelete} className="text-grey-secondary hover:text-red-primary">
          <Icon icon="delete" className="size-5" />
        </button>
      </div>
    );
  } else {
    conditionRow = (
      <div className="grid grid-cols-[24px_164px_70px] items-center gap-2">
        <div className="invisible flex flex-col">{reorderButtons}</div>
        <span className="text-right text-purple-primary">{label}</span>
        {variant === 'first' ? (
          <Input type="number" value={threshold ?? ''} onChange={(e) => onThresholdChange?.(e.target.valueAsNumber)} />
        ) : (
          <Input type="number" readOnly value={rangeStart ?? ''} />
        )}
      </div>
    );
  }

  const impactRow = (
    <div className="grid grid-cols-[24px_164px_minmax(auto,_40px)_70px_auto] items-center gap-2">
      <div />
      <div />
      <span className="text-center text-grey-secondary">{t('user-scoring:switch.number.then')}</span>
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

  return (
    <div className="flex flex-col gap-2">
      {conditionRow}
      {impactRow}
    </div>
  );
}
