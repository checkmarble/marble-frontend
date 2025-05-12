import type { AstNode, DataType } from '@app-builder/models';
import type { OperandType } from '@app-builder/models/operand-type';
import type { IconName } from 'ui-icons';

export type OperandEditorContext = {
  searchValue?: string;
  initialAstNode: AstNode;
};

export type OperandOption = {
  createNode: (context: OperandEditorContext) => AstNode;
  dataType: DataType;
  operandType: OperandType;
  displayName: string;
  searchShortcut?: string;
  icon?: IconName;
};
