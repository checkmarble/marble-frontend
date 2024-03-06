import { type LabelledAst } from '@app-builder/models';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';

import { OperandLabel } from '../OperandLabel';

const operandTriggerClassnames = cva(
  [
    'size-fit min-h-[40px] min-w-[40px] rounded border px-2 outline-none transition-colors',
    'aria-expanded:bg-purple-05 aria-expanded:border-purple-100',
  ],
  {
    variants: {
      borderColor: {
        'grey-10':
          'enabled:aria-[expanded=false]:border-grey-10 enabled:aria-[expanded=false]:focus:border-purple-100',
        'red-100':
          'enabled:aria-[expanded=false]:border-red-100 enabled:aria-[expanded=false]:focus:border-purple-100',
        'red-25':
          'enabled:aria-[expanded=false]:border-red-25 enabled:aria-[expanded=false]:focus:border-purple-100',
      },
    },
    defaultVariants: {
      borderColor: 'grey-10',
    },
  },
);

interface OperandTriggerProps
  extends Omit<React.ComponentProps<'button'>, 'children'>,
    VariantProps<typeof operandTriggerClassnames> {
  operandLabelledAst: LabelledAst;
}

export const OperandTrigger = forwardRef<
  HTMLButtonElement,
  OperandTriggerProps
>(({ borderColor, operandLabelledAst, className, ...props }, ref) => {
  const { t } = useTranslation('scenarios');

  return (
    <button
      ref={ref}
      className={operandTriggerClassnames({
        borderColor,
        className: ['group', className],
      })}
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
