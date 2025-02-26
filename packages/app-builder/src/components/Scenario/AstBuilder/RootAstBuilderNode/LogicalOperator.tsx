import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

import { scenarioI18n } from '../../scenario-i18n';

const logicalOperatorClassnames = cva(
  'flex h-fit min-h-[40px] min-w-[40px] flex-wrap items-center justify-center gap-1 rounded p-2 border',
  {
    variants: {
      type: {
        text: '',
        contained: 'bg-grey-98',
      },
      validationStatus: {
        valid: 'text-grey-80',
        error: 'text-red-47 border-red-47',
      },
    },
    compoundVariants: [
      {
        type: 'text',
        validationStatus: 'valid',
        className: 'border-transparent',
      },
      {
        type: 'contained',
        validationStatus: 'valid',
        className: 'border-grey-98',
      },
    ],
  },
);

export type LogicalOperatorType = 'if' | 'and' | 'or' | 'where';

interface LogicalOperatorLabelProps extends VariantProps<typeof logicalOperatorClassnames> {
  operator: LogicalOperatorType;
  className?: string;
}

export function LogicalOperatorLabel({
  operator,
  type = 'text',
  validationStatus = 'valid',
  className,
}: LogicalOperatorLabelProps) {
  const { t } = useTranslation(scenarioI18n);

  return (
    <div
      className={logicalOperatorClassnames({
        type,
        validationStatus,
        className,
      })}
    >
      <span className="text-s w-full text-center font-semibold">
        {t(`scenarios:logical_operator.${operator}`)}
      </span>
    </div>
  );
}
