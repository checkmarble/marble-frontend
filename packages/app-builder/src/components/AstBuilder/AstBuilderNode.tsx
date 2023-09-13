import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

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
