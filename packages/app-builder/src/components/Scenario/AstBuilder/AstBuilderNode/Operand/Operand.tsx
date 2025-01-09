import {
  type AstNode,
  type ConstantAstNode,
  type ConstantType,
  type DataType,
  isKnownOperandAstNode,
} from '@app-builder/models';
import { type OperandType } from '@app-builder/models/operand-type';
import {
  type AstNodeErrors,
  type ValidationStatus,
} from '@app-builder/services/validation/ast-node-validation';
import { type OperandOption } from '@app-builder/types/operand-options';
import { cva } from 'class-variance-authority';

import { OperandEditor } from './OperandEditor';
import { OperandLabel } from './OperandLabel';

export function Operand({
  astNode,
  dataType,
  operandType,
  displayName,
  placeholder,
  returnValue,
  onSave,
  viewOnly,
  validationStatus,
  astNodeErrors,
  options,
  coerceToConstant,
}: {
  astNode: AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  placeholder?: string;
  returnValue?: string;
  onSave?: (astNode: AstNode) => void;
  viewOnly?: boolean;
  validationStatus: ValidationStatus;
  astNodeErrors?: AstNodeErrors;
  options: OperandOption[];
  coerceToConstant?: (searchValue: string) => {
    astNode: ConstantAstNode<ConstantType>;
    displayName: string;
    dataType: DataType;
  }[];
}) {
  if (!isKnownOperandAstNode(astNode)) {
    return (
      <div className={defaultClassnames({ validationStatus })}>
        {displayName}
      </div>
    );
  }

  if (viewOnly || !onSave) {
    return (
      <OperandLabel
        interactionMode="viewer"
        astNode={astNode}
        placeholder={placeholder}
        dataType={dataType}
        operandType={operandType}
        displayName={displayName}
        returnValue={returnValue}
        validationStatus={validationStatus}
      />
    );
  }

  return (
    <OperandEditor
      astNode={astNode}
      placeholder={placeholder}
      dataType={dataType}
      operandType={operandType}
      displayName={displayName}
      returnValue={returnValue}
      validationStatus={validationStatus}
      astNodeErrors={astNodeErrors}
      onSave={onSave}
      options={options}
      coerceToConstant={coerceToConstant}
    />
  );
}

const defaultClassnames = cva(
  'bg-grey-02 flex size-fit min-h-[40px] min-w-[40px] items-center justify-between rounded px-2 outline-none',
  {
    variants: {
      validationStatus: {
        valid: 'border border-grey-02',
        error: 'border border-red-100',
        'light-error': 'border border-red-25',
      },
    },
    defaultVariants: {
      validationStatus: 'valid',
    },
  },
);
