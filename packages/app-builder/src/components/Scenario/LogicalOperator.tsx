import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from './scenario-i18n';
import { ScenarioBox } from './ScenarioBox';

export type LogicalOperatorType = 'if' | 'and' | 'or' | 'where';

interface LogicalOperatorLabelProps {
  operator: LogicalOperatorType;
  className?: string;
  color?: 'purple' | 'grey';
}

export function LogicalOperatorLabel({
  operator,
  className,
  color = 'grey',
}: LogicalOperatorLabelProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <ScenarioBox className={className}>
      <span
        className={clsx(
          'w-full text-center font-semibold',
          color === 'purple' ? 'text-purple-100' : 'text-grey-25'
        )}
      >
        {t(`scenarios:logical_operator.${operator}`)}
      </span>
    </ScenarioBox>
  );
}
