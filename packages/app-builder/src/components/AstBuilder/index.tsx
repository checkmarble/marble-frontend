import { OperandEditModal } from './edition/EditModal/EditModal';
import { AstBuilderOperand } from './Operand';
import { AstBuilderProvider } from './Provider';
import { AstBuilderRoot } from './Root';

export const AstBuilder = {
  Root: AstBuilderRoot,
  Operand: AstBuilderOperand,
  Provider: AstBuilderProvider,
  EditModal: OperandEditModal,
};
