import { type IdLessAstNode } from '@app-builder/models';
import { type KnownOperandAstNode } from '@app-builder/models/astNode/builder-ast-node';
import { cva } from 'class-variance-authority';

import { type AstBuilderOperandProps } from '../Operand';
import { OperandDisplayName } from '../styles/OperandDisplayName';

const viewingOperandLabelClassnames = cva(
  [
    'group',
    'size-fit min-h-[40px] min-w-[40px] rounded outline-none',
    'flex flex-row items-center justify-between gap-2 px-2',
    'bg-grey-98',
  ],
  {
    variants: {
      validationStatus: {
        valid: 'border border-grey-98',
        error: 'border border-red-47',
        'light-error': 'border border-red-87',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);

type ViewingAstBuilderOperandProps = Omit<
  AstBuilderOperandProps,
  'node' | 'placeholder' | 'onChange' | 'optionsDataType' | 'coerceDataType'
> & { node: IdLessAstNode<KnownOperandAstNode> };
export function ViewingAstBuilderOperand({
  validationStatus,
  ...props
}: ViewingAstBuilderOperandProps) {
  return (
    <div className={viewingOperandLabelClassnames({ validationStatus })}>
      <OperandDisplayName interactionMode="viewer" {...props} />
    </div>
  );
}
