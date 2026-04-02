import { type BoolSwitch, type PastAlertsRule, type RuleModel } from '@app-builder/models/scoring';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BoolSwitchEdit } from './BoolSwitchEdit';

interface PastAlertsRuleEditProps {
  model: PastAlertsRule;
  maxRiskLevel: number;
  onModelChange?: (model: RuleModel) => void;
}

export function PastAlertsRuleEdit({ model, maxRiskLevel, onModelChange }: PastAlertsRuleEditProps) {
  const { t } = useTranslation(['user-scoring']);
  const [conditions, setConditions] = useState<BoolSwitch>(model.conditions);

  const handleConditionsChange = (next: BoolSwitch) => {
    setConditions(next);
    onModelChange?.({ type: 'past_alerts', conditions: next });
  };

  return (
    <>
      <span className="font-medium">{t('user-scoring:switch.past_alerts.depending_on')}</span>
      <span className="font-medium">{t('user-scoring:switch.apply_conditions')}</span>
      <BoolSwitchEdit conditions={conditions} maxRiskLevel={maxRiskLevel} onChange={handleConditionsChange} />
    </>
  );
}
