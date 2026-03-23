import { type CustomList } from '@app-builder/models/custom-list';
import {
  type ScoreImpact,
  type StringListOp,
  type StringListValue,
  type StringOperation,
  type StringSingleValueOp,
  type StringSwitch,
} from '@app-builder/models/scoring';
import { useTranslation } from 'react-i18next';
import { Button, Input, type SelectOption, SelectV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ListValueInput } from './ListValueInput';
import { RiskLevelSelect } from './shared';

interface StringSwitchEditProps {
  conditions: StringSwitch;
  maxRiskLevel: number;
  onChange: (next: StringSwitch) => void;
  customLists?: CustomList[];
}

export function StringSwitchEdit({ conditions, maxRiskLevel, onChange, customLists = [] }: StringSwitchEditProps) {
  const { t } = useTranslation(['user-scoring']);
  const { branches, default: defaultImpact } = conditions;

  const opOptions: SelectOption<StringSingleValueOp | StringListOp>[] = [
    { label: t('user-scoring:switch.string.op.eq'), value: '=' },
    { label: t('user-scoring:switch.string.op.neq'), value: '≠' },
    { label: t('user-scoring:switch.string.op.contains'), value: 'StringContains' },
    { label: t('user-scoring:switch.string.op.not_contains'), value: 'StringNotContain' },
    { label: t('user-scoring:switch.string.op.starts_with'), value: 'StringStartsWith' },
    { label: t('user-scoring:switch.string.op.ends_with'), value: 'StringEndsWith' },
    { label: t('user-scoring:switch.string.op.in_list'), value: 'IsInList' },
    { label: t('user-scoring:switch.string.op.not_in_list'), value: 'IsNotInList' },
  ];

  const setOp = (idx: number, op: StringSingleValueOp | StringListOp) => {
    const isListOp = op === 'IsInList' || op === 'IsNotInList';
    const defaultValue: StringOperation['value'] = isListOp ? { type: 'customList' as const, listId: '' } : '';
    const next = branches.map((b, i) =>
      i === idx ? { ...b, value: { op, value: defaultValue } as StringOperation } : b,
    );
    onChange({ ...conditions, branches: next });
  };

  const setValue = (idx: number, value: string | StringListValue) => {
    const next = branches.map((b, i) => {
      if (i !== idx) return b;
      return { ...b, value: { ...b.value, value } as StringOperation };
    });
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
    onChange({
      ...conditions,
      branches: [...branches, { value: { op: '=', value: '' }, impact: { modifier: 0 } }],
    });
  };

  const removeBranch = (idx: number) => {
    onChange({ ...conditions, branches: branches.filter((_, i) => i !== idx) });
  };

  return (
    <div className="flex flex-col gap-v2-sm">
      {branches.map((branch, idx) => {
        const op = branch.value.op;
        const isListOp = op === 'IsInList' || op === 'IsNotInList';
        return (
          <div key={idx} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <SelectV2
                value={op}
                placeholder="="
                options={opOptions}
                onChange={(v) => v && setOp(idx, v)}
                className="w-[200px]"
              />
              {isListOp ? (
                <ListValueInput
                  value={branch.value.value as StringListValue}
                  customLists={customLists}
                  onChange={(v) => setValue(idx, v)}
                />
              ) : (
                <Input
                  className="flex-1"
                  value={branch.value.value as string}
                  onChange={(e) => setValue(idx, e.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => removeBranch(idx)}
                className="text-grey-secondary hover:text-red-primary"
              >
                <Icon icon="delete" className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-[200px_minmax(auto,_40px)_70px_auto] items-center gap-2">
              <div />
              <span className="text-center text-grey-secondary">{t('user-scoring:switch.string.then')}</span>
              <Input
                type="number"
                value={branch.impact.modifier}
                onChange={(e) => setImpact(idx, { ...branch.impact, modifier: e.target.valueAsNumber })}
              />
              <RiskLevelSelect
                floor={branch.impact.floor}
                maxRiskLevel={maxRiskLevel}
                onChange={(floor) => setImpact(idx, { ...branch.impact, floor })}
              />
            </div>
          </div>
        );
      })}
      <div className="grid grid-cols-[200px_minmax(auto,_40px)_70px_auto] items-center gap-2">
        <span className="text-right text-purple-primary">{t('user-scoring:switch.string.else')}</span>
        <div />
        <Input
          type="number"
          value={defaultImpact.modifier}
          onChange={(e) => setImpact('default', { ...defaultImpact, modifier: e.target.valueAsNumber })}
        />
        <RiskLevelSelect
          floor={defaultImpact.floor}
          maxRiskLevel={maxRiskLevel}
          onChange={(floor) => setImpact('default', { ...defaultImpact, floor })}
        />
      </div>
      <Button onClick={addBranch} className="self-start shadow-sm" appearance="stroked">
        {t('user-scoring:switch.add_condition')}
      </Button>
    </div>
  );
}
