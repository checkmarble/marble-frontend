import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';

export type LogicalOperatorType = 'if' | 'and' | 'or' | 'where';

interface LogicalOperatorLabelProps {
  operator: LogicalOperatorType;
  className?: string;
  color?: 'purple' | 'grey' | 'red';
}

export function LogicalOperatorLabel({
  operator,
  className,
  color = 'grey',
}: LogicalOperatorLabelProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <div
      className={clsx(
        'text-s mb-2 flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded',
        { 'border border-red-100': color === 'red' },
        className
      )}
    >
      <span
        className={clsx('w-full text-center font-semibold', {
          'text-purple-100': color === 'purple',
          'text-grey-25': color === 'grey',
          'text-red-100': color === 'red',
        })}
      >
        {t(`scenarios:logical_operator.${operator}`)}
      </span>
    </div>
  );
}
