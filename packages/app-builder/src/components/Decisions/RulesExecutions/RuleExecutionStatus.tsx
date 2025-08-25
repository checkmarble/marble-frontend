import {
  isRuleExecutionError,
  isRuleExecutionHit,
  isRuleExecutionSnoozed,
  type RuleExecution,
  type RuleExecutionError,
} from '@app-builder/models/decision';
import { formatNumber, useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { type TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import { decisionsI18n } from '../decisions-i18n';

export function RuleExecutionStatus({ ruleExecution }: { ruleExecution: RuleExecution }) {
  const { t } = useTranslation(decisionsI18n);
  const language = useFormatLanguage();
  const isHit = isRuleExecutionHit(ruleExecution);

  return (
    <div className="inline-flex h-8 gap-1">
      {isHit ? (
        <span className="bg-purple-96 text-s text-purple-65 flex items-center justify-center rounded-sm p-2 font-semibold">
          {formatNumber(ruleExecution.scoreModifier, {
            language,
            signDisplay: 'exceptZero',
          })}
        </span>
      ) : null}
      <span
        className={clsx(
          'text-s flex flex-1 items-center justify-center rounded-sm p-2 font-semibold capitalize',
          isRuleExecutionHit(ruleExecution) && 'bg-green-94 text-green-38',
          getRuleExecutionStatusColor(ruleExecution) === 'grey' && 'bg-grey-90 text-grey-00',
          getRuleExecutionStatusColor(ruleExecution) === 'lavender' && 'text-grey-100 bg-[#AAA6CC]',
          getRuleExecutionStatusColor(ruleExecution) === 'red' && 'bg-red-95 text-red-47',
        )}
      >
        {getRuleExecutionStatusLabel(t, ruleExecution)}
      </span>
    </div>
  );
}

function getRuleExecutionStatusColor(ruleExecution: RuleExecution) {
  if (isRuleExecutionHit(ruleExecution)) {
    return 'green';
  }
  if (isRuleExecutionError(ruleExecution)) {
    return 'red';
  }
  if (isRuleExecutionSnoozed(ruleExecution)) {
    return 'lavender';
  }
  return 'grey';
}

function getRuleExecutionStatusLabel(
  t: TFunction<typeof decisionsI18n>,
  ruleExecution: RuleExecution,
) {
  if (isRuleExecutionHit(ruleExecution)) {
    return t('decisions:rules.status.hit');
  }
  if (isRuleExecutionError(ruleExecution)) {
    return getRuleExecutionErrorLabel(t, ruleExecution);
  }
  if (isRuleExecutionSnoozed(ruleExecution)) {
    return t('decisions:rules.status.snoozed');
  }
  return t('decisions:rules.status.no_hit');
}

function getRuleExecutionErrorLabel(
  t: TFunction<typeof decisionsI18n>,
  ruleExecution: RuleExecutionError,
) {
  switch (ruleExecution.error.code) {
    case 'division_by_zero':
      return t('decisions:rules.error.division_by_zero');
    case 'null_value_found':
      return t('decisions:rules.error.null_value');
    default:
      return t('decisions:rules.status.error');
  }
}
