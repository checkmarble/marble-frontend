import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

type AddLogicalOperatorButtonProps = React.ComponentProps<'button'> & {
  operator: 'and' | 'or';
};

export const AddLogicalOperatorButton = React.forwardRef<
  HTMLButtonElement,
  AddLogicalOperatorButtonProps
>(function AddLogicalOperatorButton({ className, operator, ...props }, ref) {
  const { t } = useTranslation(['scenarios']);
  return (
    <button
      className={clsx(
        'flex size-fit flex-row items-center justify-center gap-1 rounded border-none px-4 py-2 outline-none',
        'text-grey-25 disabled:text-grey-50 text-xs font-semibold hover:text-purple-100',
        'hover:bg-purple-10 active:bg-grey-10 bg-grey-00 disabled:bg-grey-00 focus:border-purple-100',
        className,
      )}
      {...props}
      ref={ref}
    >
      <Icon icon="plus" className="size-4" />
      {t(`scenarios:logical_operator.${operator}_button`)}
    </button>
  );
});
