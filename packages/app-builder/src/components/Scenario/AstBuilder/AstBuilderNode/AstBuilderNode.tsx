import { isTwoLineOperandAstNode, type AstNode } from '@app-builder/models';
import {
  useDefaultCoerceToConstant,
  useGetAstNodeOption,
  useOperandOptions,
} from '@app-builder/services/editor/options';
import * as React from 'react';

import { Operand } from './Operand';
import { TwoOperandsLine } from './TwoOperandsLine';
import { useFormatReturnValue } from '@app-builder/services/editor/return-value';
import {
  useEnumValuesFromNeighbour,
  useEvaluation,
  useValidationStatus,
} from '@app-builder/services/editor/ast-editor copy';

interface AstBuilderNodeProps {
  path: string;
  astNode: AstNode;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  root?: boolean;
}

export function AstBuilderNode({
  path,
  astNode,
  viewOnly,
  onSave,
  root = false,
}: AstBuilderNodeProps) {
  if (isTwoLineOperandAstNode(astNode)) {
    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          path={path}
          twoLineOperandAstNode={astNode}
          viewOnly={viewOnly}
          root={root}
        />
      </div>
    );
  }

  return (
    <OperandBuilderNode
      path={path}
      astNode={astNode}
      viewOnly={viewOnly}
      onSave={onSave}
    />
  );
}

export function OperandBuilderNode({
  path,
  astNode,
  viewOnly,
  onSave,
}: {
  path: string;
  astNode: AstNode;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
}) {
  const enumValues = useEnumValuesFromNeighbour(path);
  const getAstNodeOption = useGetAstNodeOption();

  const options = useOperandOptions(enumValues);
  const coerceToConstant = useDefaultCoerceToConstant();
  const evaluation = useEvaluation(path);
  const formatReturnValue = useFormatReturnValue();

  const validationStatus = useValidationStatus(path);

  const operandProps = React.useMemo(() => {
    return {
      ...getAstNodeOption(astNode, { enumValues }),
      returnValue: formatReturnValue(evaluation?.returnValue),
    };
  }, [astNode, enumValues, getAstNodeOption]);

  return (
    <Operand
      viewOnly={viewOnly}
      onSave={onSave}
      options={options}
      coerceToConstant={coerceToConstant}
      validationStatus={validationStatus}
      astNodeErrors={evaluation}
      {...operandProps}
    />
  );
}
