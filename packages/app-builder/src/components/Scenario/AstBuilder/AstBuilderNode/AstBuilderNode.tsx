import { type AstNode } from '@app-builder/models';
import {
  type AstNodeViewModel,
  isTwoLineOperandAstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  useEnumValuesFromNeighbour,
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { getValidationStatus } from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';

import { Operand } from './Operand';
import { TwoOperandsLine } from './TwoOperandsLine';

interface AstBuilderNodeProps {
  setOperand: (nodeId: string, operandAst: AstNode) => void;
  setOperator: (nodeId: string, name: string) => void;
  astNodeVM: AstNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  astNodeVM,
  setOperand,
  setOperator,
  viewOnly,
  onSave,
  root = false,
}: AstBuilderNodeProps) {
  if (isTwoLineOperandAstNodeViewModel(astNodeVM)) {
    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          setOperand={setOperand}
          setOperator={setOperator}
          twoOperandsViewModel={astNodeVM}
          viewOnly={viewOnly}
          root={root}
        />
      </div>
    );
  }

  return (
    <OperandBuilderNode
      viewOnly={viewOnly}
      onSave={onSave}
      astNodeVM={astNodeVM}
    />
  );
}

export function OperandBuilderNode({
  astNodeVM,
  viewOnly,
  onSave,
}: {
  astNodeVM: AstNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
}) {
  const enumValues = useEnumValuesFromNeighbour(astNodeVM);
  const getAstNodeOption = useGetAstNodeOption();

  const options = useOperandOptions(astNodeVM);

  const operandProps = React.useMemo(() => {
    return {
      ...getAstNodeOption(astNodeVM, { enumValues }),
      validationStatus: getValidationStatus(astNodeVM),
    };
  }, [astNodeVM, enumValues, getAstNodeOption]);

  return (
    <Operand
      viewOnly={viewOnly}
      onSave={onSave}
      options={options}
      {...operandProps}
    />
  );
}
