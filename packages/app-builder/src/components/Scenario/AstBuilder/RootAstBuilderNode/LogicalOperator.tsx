import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';

export type LogicalOperatorType = 'if' | 'and' | 'or' | 'where';

interface LogicalOperatorLabelProps {
  operator: LogicalOperatorType;
  className?: string;
}

export function LogicalOperatorLabel({
  operator,
  className,
}: LogicalOperatorLabelProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <div
      className={clsx(
        'flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded',
        className
      )}
    >
      <span className="text-s w-full text-center font-semibold">
        {t(`scenarios:logical_operator.${operator}`)}
      </span>
    </div>
  );
}
