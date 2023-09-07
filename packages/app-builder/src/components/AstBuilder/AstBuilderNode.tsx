import { type ConstantType } from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Input } from '@ui-design-system';
import { useState } from 'react';

import { Default } from '../Scenario/Formula/Operators/Default';
import {
  adaptRootAndViewModel,
  adaptRootOrWithAndViewModel,
  RootAnd,
  RootOrWithAnd,
} from './Root';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine/TwoOperandsLine';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
}

export function AstBuilderNode({
  editorNodeViewModel,
  builder,
}: AstBuilderNodeProps) {
  const rootOrWithAndViewModel =
    adaptRootOrWithAndViewModel(editorNodeViewModel);
  if (rootOrWithAndViewModel) {
    return (
      <RootOrWithAnd
        builder={builder}
        rootOrWithAndViewModel={rootOrWithAndViewModel}
      />
    );
  }

  //TODO: handle root case in a specific initialisation phase. With that, we will display the RootAnd for any child And node due to the recursive call of AstBuilderNode.
  const rootAndViewModel = adaptRootAndViewModel(editorNodeViewModel);
  if (rootAndViewModel) {
    return <RootAnd builder={builder} rootAndViewModel={rootAndViewModel} />;
  }

  const constantViewModel = adaptConstantViewModel(editorNodeViewModel);
  if (constantViewModel) {
    return (
      <ConstantEditor builder={builder} constantViewModel={constantViewModel} />
    );
  }

  const twoOperandsViewModel =
    adaptTwoOperandsLineViewModel(editorNodeViewModel);
  if (twoOperandsViewModel) {
    return (
      <TwoOperandsLine
        builder={builder}
        twoOperandsViewModel={twoOperandsViewModel}
      />
    );
  }

  return (
    <Default node={adaptAstNodeFromEditorViewModel(editorNodeViewModel)} />
  );
}

interface ConstantViewModel {
  nodeId: string;
  constant: ConstantType;
}

function adaptConstantViewModel(
  editorNodeViewModel: EditorNodeViewModel
): ConstantViewModel | null {
  if (editorNodeViewModel.constant === undefined) {
    return null;
  }
  if (editorNodeViewModel.funcName) {
    throw new Error('Constant node must have no name');
  }

  return {
    nodeId: editorNodeViewModel.nodeId,
    constant: editorNodeViewModel.constant,
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
