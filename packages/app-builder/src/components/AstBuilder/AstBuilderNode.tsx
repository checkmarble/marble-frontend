import {
  type ConstantAstNode,
  type ConstantType,
  isConstant,
  isOrAndGroup,
} from '@app-builder/models';
import type {
  AstBuilder,
  EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Input } from '@ui-design-system';
import { useState } from 'react';

import { Default } from '../Scenario/Formula/Operators/Default';
import { RootOrWithAnd } from './RootOrWithAnd';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  astNodeViewModel: EditorNodeViewModel;
}

export function AstBuilderNode({
  astNodeViewModel,
  builder,
}: AstBuilderNodeProps) {
  const { ast, nodeId } = astNodeViewModel;

  if (isOrAndGroup(ast)) {
    return (
      <RootOrWithAnd
        builder={builder}
        rootOrWithAndViewModel={astNodeViewModel}
      />
    );
  }

  if (isConstant(ast)) {
    const constantViewModel: ConstantViewModel = adaptConstantViewModel(
      ast,
      nodeId
    );

    return (
      <ConstantEditor builder={builder} constantViewModel={constantViewModel} />
    );
  }
  return <Default node={ast} />;
}

interface ConstantViewModel {
  nodeId: string;
  constant: ConstantType;
}

function adaptConstantViewModel(
  node: ConstantAstNode,
  nodeId: string
): ConstantViewModel {
  return {
    nodeId,
    constant: node.constant,
  };
}

export function ConstantEditor({
  builder,
  constantViewModel,
}: {
  builder: AstBuilder;
  constantViewModel: ConstantViewModel;
}) {
  const [constantTxt, setConstantTxt] = useState<string>(() =>
    JSON.stringify(constantViewModel.constant)
  );
  return (
    <div>
      <Input
        value={constantTxt}
        onChange={(event) => {
          const newConstantTxt = event?.target.value ?? '';
          setConstantTxt(newConstantTxt);
          try {
            const newValue = JSON.parse(newConstantTxt) as ConstantType;
            builder.setConstant(constantViewModel.nodeId, newValue);
          } catch (e) {
            if (e instanceof Error) {
              console.log(`Invalid constant: ${e.message}`);
            }
          }
        }}
      />
    </div>
  );
}
