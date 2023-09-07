import { Button, type ButtonProps } from '@ui-design-system';
import { Plus } from '@ui-icons';
import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const AddLogicalOperatorButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    operator: 'if' | 'and' | 'or' | 'where';
  }
>(({ className, operator, ...props }, ref) => {
  const { t } = useTranslation(['scenarios']);
  return (
    <Button className={clsx('w-fit uppercase', className)} {...props} ref={ref}>
      <Plus className="text-m" />
      {t(`scenarios:logical_operator.${operator}`)}
    </Button>
  );
});
AddLogicalOperatorButton.displayName = 'AddLogicalOperatorButton';
