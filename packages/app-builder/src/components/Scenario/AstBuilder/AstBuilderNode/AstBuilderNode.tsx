import { type AstNode } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { useGetNodeEvaluationErrorMessage } from '@app-builder/services/validation';

import { ScenarioValidationError } from '../../ScenarioValidationError';
import { Operand } from './Operand';
import {
  adaptTwoOperandsLineViewModel,
  TwoOperandsLine,
} from './TwoOperandsLine/TwoOperandsLine';

interface AstBuilderNodeProps {
  builder: AstBuilder;
  editorNodeViewModel: EditorNodeViewModel;
  viewOnly?: boolean;
  onSave?: (astNode: AstNode) => void;
  ariaLabel?: string;
  root?: boolean;
}

export function AstBuilderNode({
  editorNodeViewModel,
  builder,
  viewOnly,
  onSave,
  ariaLabel,
  root = false,
}: AstBuilderNodeProps) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();

  const twoOperandsViewModel =
    adaptTwoOperandsLineViewModel(editorNodeViewModel);

  if (twoOperandsViewModel) {
    const errorMessages = twoOperandsViewModel.errors.map((error) =>
      getNodeEvaluationErrorMessage(error)
    );

    return (
      <div className="flex w-full flex-col gap-2">
        <TwoOperandsLine
          builder={builder}
          twoOperandsViewModel={twoOperandsViewModel}
          viewOnly={viewOnly}
          root={root}
        />
        {root && (
          <div className="flex flex-row flex-wrap gap-2">
            {errorMessages.map((error) => (
              <ScenarioValidationError key={error}>
                {error}
              </ScenarioValidationError>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Operand
      builder={builder}
      operandViewModel={editorNodeViewModel}
      viewOnly={viewOnly}
      onSave={onSave}
      ariaLabel={ariaLabel}
    />
  );
}
