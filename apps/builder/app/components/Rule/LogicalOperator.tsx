import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { ruleI18n } from './rule-i18n';

interface LogicalOperatorProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  operator: 'if' | 'and' | 'or';
}

export function LogicalOperator({
  operator,
  className,
  ...spanProps
}: LogicalOperatorProps) {
  const { t } = useTranslation(ruleI18n);

  return (
    <span
      className={clsx(
        'text-grey-25 flex h-10 w-10 items-center justify-center font-semibold',
        operator === 'or' && 'bg-grey-02 rounded uppercase',
        className
      )}
      {...spanProps}
    >
      {t(`rule:logical_operator.${operator}`)}
    </span>
  );
}
