import {
  type AstNode,
  getAstNodeLabelName,
  isValidationFailure,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import {
  adaptAggregationViewModel,
  isAggregationEditorNodeViewModel,
  useEditAggregation,
} from '../AggregationEdit';
import { ErrorMessage } from '../ErrorMessage';
import { getBorderColor } from '../utils';
import { OperandEditor } from './OperandEditor';
import { OperandViewer } from './OperandViewer';

export type OperandViewModel = EditorNodeViewModel;

export function Operand({
  builder,
  operandViewModel,
  onSave,
}: {
  builder: AstBuilder;
  operandViewModel: OperandViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const editAggregation = useEditAggregation();

  const astNodeLabelName = getAstNodeLabelName(
    adaptAstNodeFromEditorViewModel(operandViewModel),
    builder
  );

  if (isAggregationEditorNodeViewModel(operandViewModel)) {
    const aggregation = adaptAggregationViewModel(operandViewModel);
    return (
      <div className="flex flex-col gap-1">
        <OperandViewer
          onClick={() =>
            editAggregation({ initialAggregation: aggregation, onSave })
          }
          borderColor={getBorderColor(operandViewModel.validation)}
        >
          {astNodeLabelName}
        </OperandViewer>
        {isValidationFailure(aggregation.validation.aggregation) && (
          <ErrorMessage errors={aggregation.validation.aggregation.errors} />
        )}
      </div>
    );
  }

  return (
    <OperandEditor
      builder={builder}
      operandViewModel={operandViewModel}
      onSave={onSave}
    />
  );
}
