import { type ConstantType } from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Input } from '@ui-design-system';
import { useState } from 'react';

import { Default } from '../Scenario/Formula/Operators/Default';
import { adaptRootOrWithAndViewModel, RootOrWithAnd } from './RootOrWithAnd';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine/TwoOperandsLine';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  astNodeViewModel: EditorNodeViewModel;
}

export function AstBuilderNode({
  astNodeViewModel,
  builder,
}: AstBuilderNodeProps) {
  const rootOrWithAndViewModel = adaptRootOrWithAndViewModel(astNodeViewModel);
  if (rootOrWithAndViewModel) {
    return (
      <RootOrWithAnd
        builder={builder}
        rootOrWithAndViewModel={rootOrWithAndViewModel}
      />
    );
  }

  const constantViewModel = adaptConstantViewModel(astNodeViewModel);
  if (constantViewModel) {
    return (
      <ConstantEditor builder={builder} constantViewModel={constantViewModel} />
    );
  }

  const twoOperandsViewModel = adaptTwoOperandsLineViewModel(astNodeViewModel);
  if (twoOperandsViewModel) {
    return (
      <TwoOperandsLine
        builder={builder}
        twoOperandsViewModel={twoOperandsViewModel}
      />
    );
  }

  return <Default node={adaptAstNodeFromEditorViewModel(astNodeViewModel)} />;
}

interface ConstantViewModel {
  nodeId: string;
  constant: ConstantType;
}

function adaptConstantViewModel(
  astNodeViewModel: EditorNodeViewModel
): ConstantViewModel | null {
  if (astNodeViewModel.constant === undefined) {
    return null;
  }
  if (astNodeViewModel.funcName) {
    throw new Error('Constant node must have no name');
  }

  return {
    nodeId: astNodeViewModel.nodeId,
    constant: astNodeViewModel.constant,
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
