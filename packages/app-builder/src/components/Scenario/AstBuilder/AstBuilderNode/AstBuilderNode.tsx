import {
  type AstNode,
  isMainAstBinaryNode,
  isMainAstUnaryNode,
} from '@app-builder/models';
import {
  useEnumValuesFromNeighbour,
  useEvaluation,
  useValidationStatus,
} from '@app-builder/services/editor/ast-editor';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOperandProps,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import { useFormatReturnValue } from '@app-builder/services/editor/return-value';
import * as React from 'react';

import {
  MainAstBinaryOperatorLine,
  MainAstUnaryOperatorLine,
} from './MainAstLine';
import { Operand } from './Operand';

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
  if (isMainAstBinaryNode(astNode)) {
    return (
      // it looks like the previous container was not necessary anymore. It still need to be checked
      <MainAstBinaryOperatorLine
        treePath={treePath}
        mainAstNode={astNode}
        viewOnly={viewOnly}
        root={root}
      />
    );
  }

  if (isMainAstUnaryNode(astNode)) {
    return (
      <MainAstUnaryOperatorLine
        treePath={treePath}
        mainAstNode={astNode}
        viewOnly={viewOnly}
        root={root}
      />
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

  const options = useOperandOptions(enumValues);
  const coerceToConstant = useDefaultCoerceToConstant();

  const getAstNodeOperandProps = useGetAstNodeOperandProps();
  const astNodeOperandProps = React.useMemo(() => {
    return getAstNodeOperandProps(astNode, { enumValues });
  }, [astNode, enumValues, getAstNodeOperandProps]);

  const evaluation = useEvaluation(treePath);
  const formatReturnValue = useFormatReturnValue();
  const returnValue = React.useMemo(() => {
    return formatReturnValue(evaluation?.returnValue);
  }, [evaluation?.returnValue, formatReturnValue]);
  const validationStatus = useValidationStatus(
    treePath,
    evaluation?.returnValue,
  );

  return (
    <Operand
      viewOnly={viewOnly}
      onSave={onSave}
      options={options}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={evaluation}
      returnValue={returnValue}
      {...astNodeOperandProps}
    />
  );
}
