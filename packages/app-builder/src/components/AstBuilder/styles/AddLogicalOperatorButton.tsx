import clsx from 'clsx';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';

type AddLogicalOperatorButtonProps = Omit<React.ComponentProps<'button'>, 'type'> & {
  operator: 'and' | 'or';
};

export const AddLogicalOperatorButton = React.forwardRef<HTMLButtonElement, AddLogicalOperatorButtonProps>(
  function AddLogicalOperatorButton({ className, operator, ...props }, ref) {
    const { t } = useTranslation(['scenarios']);
    return (
      <button
        type="button"
        className={clsx(
          'flex size-fit flex-row items-center justify-center gap-1 rounded-sm border px-4 py-2 outline-hidden text-xs font-semibold',
          'bg-transparent border-purple-primary text-purple-primary',
          'hover:bg-purple-background hover:border-purple-hover hover:text-purple-hover',
          'disabled:bg-grey-background disabled:border-grey-border disabled:text-grey-disabled',
          'dark:border-purple-hover dark:text-purple-hover',
          'dark:hover:bg-transparent dark:hover:border-purple-hover dark:hover:text-purple-hover',
          'dark:disabled:bg-transparent dark:disabled:border-purple-disabled dark:disabled:text-purple-disabled',
          className,
        )}
        {...props}
        ref={ref}
      >
        <Icon icon="plus" className="size-4" />
        {t(`scenarios:logical_operator.${operator}_button`)}
      </button>
    );
  },
);
