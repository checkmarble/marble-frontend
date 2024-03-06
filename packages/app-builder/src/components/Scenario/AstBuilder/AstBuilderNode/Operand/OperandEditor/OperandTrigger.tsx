import { type LabelledAst } from '@app-builder/models';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { OperandLabel } from '../OperandLabel';

export const selectBorderColor = ['grey-10', 'red-100', 'red-25'] as const;

interface OperandTriggerProps
  extends Omit<React.ComponentProps<'button'>, 'children'> {
  borderColor?: (typeof selectBorderColor)[number];
  operandLabelledAst: LabelledAst;
}

export const OperandTrigger = forwardRef<
  HTMLButtonElement,
  OperandTriggerProps
>(({ borderColor = 'grey-10', operandLabelledAst, ...props }, ref) => {
  const { t } = useTranslation('scenarios');

  return (
    <button
      ref={ref}
      data-border-color={borderColor}
      className={clsx(
        'group',
        'size-fit min-h-[40px] min-w-[40px] rounded border px-2 outline-none transition-colors',
        'aria-expanded:bg-purple-05 aria-expanded:border-purple-100',
        // Border color variants
        'enabled:aria-[expanded=false]:data-[border-color=grey-10]:border-grey-10 enabled:aria-[expanded=false]:data-[border-color=grey-10]:focus:border-purple-100',
        'enabled:aria-[expanded=false]:data-[border-color=red-100]:border-red-100 enabled:aria-[expanded=false]:data-[border-color=red-100]:focus:border-purple-100',
        'enabled:aria-[expanded=false]:data-[border-color=red-25]:border-red-25 enabled:aria-[expanded=false]:data-[border-color=red-25]:focus:border-purple-100',
      )}
      {...props}
    >
      {operandLabelledAst.name ? (
        <OperandLabel operandLabelledAst={operandLabelledAst} variant="edit" />
      ) : (
        <span className="text-s text-grey-25 font-medium transition-colors group-aria-expanded:text-purple-100">
          {t('edit_operand.placeholder')}
        </span>
      )}
    </button>
  );
});
OperandTrigger.displayName = 'OperandTrigger';
