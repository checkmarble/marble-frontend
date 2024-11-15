import { type AstNode, isTwoLineOperandAstNode } from '@app-builder/models';
import {
  useEnumValuesFromNeighbour,
  useEvaluation,
  useValidationStatus,
} from '@app-builder/services/editor/ast-editor';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { useFormatReturnValue } from '@app-builder/services/editor/return-value';
import * as React from 'react';

import { Operand } from './Operand';
import { TwoOperandsLine } from './TwoOperandsLine';

interface AstBuilderNodeProps {
  treePath: string;
  astNode: AstNode;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  treePath,
  astNode,
  viewOnly,
  onSave,
  root = false,
}: AstBuilderNodeProps) {
  if (isTwoLineOperandAstNode(astNode)) {
    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          treePath={treePath}
          twoLineOperandAstNode={astNode}
          viewOnly={viewOnly}
          root={root}
        />
      </div>
    );
  }

  return (
    <OperandBuilderNode
      treePath={treePath}
      astNode={astNode}
      viewOnly={viewOnly}
      onSave={onSave}
    />
  );
}

export function OperandBuilderNode({
  treePath,
  astNode,
  viewOnly,
  onSave,
}: {
  treePath: string;
  astNode: AstNode;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
}) {
  const enumValues = useEnumValuesFromNeighbour(treePath);
  const getAstNodeOption = useGetAstNodeOption();

  const options = useOperandOptions(enumValues);
  const coerceToConstant = useDefaultCoerceToConstant();

  const operandProps = React.useMemo(() => {
    return getAstNodeOption(astNode, { enumValues });
  }, [astNode, enumValues, getAstNodeOption]);

  const evaluation = useEvaluation(treePath);
  const formatReturnValue = useFormatReturnValue();
  const returnValue = React.useMemo(() => {
    return formatReturnValue(evaluation?.returnValue);
  }, [evaluation?.returnValue, formatReturnValue]);
  const validationStatus = useValidationStatus(treePath);

  return (
    <Operand
      viewOnly={viewOnly}
      onSave={onSave}
      options={options}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={evaluation}
      returnValue={returnValue}
      {...operandProps}
    />
  );
}
