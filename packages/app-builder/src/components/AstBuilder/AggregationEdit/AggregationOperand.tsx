import {
  type AstNode,
  getAstNodeLabelName,
  isValidationFailure,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
} from '@app-builder/services/editor/ast-editor';

import { ErrorMessage } from '../ErrorMessage';
import { OperandViewer } from '../Operand/OperandViewer';
import { getBorderColor } from '../utils';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  useEditAggregation,
} from './Modal';

export function AggregationOperand({
  builder,
  aggregationEditorNodeViewModel,
  onSave,
}: {
  builder: AstBuilder;
  aggregationEditorNodeViewModel: AggregationEditorNodeViewModel;
  onSave: (astNode: AstNode) => void;
}) {
  const aggregation = adaptAggregationViewModel(aggregationEditorNodeViewModel);
  const editAggregation = useEditAggregation();

  const astNodeLabelName = getAstNodeLabelName(
    adaptAstNodeFromEditorViewModel(aggregationEditorNodeViewModel),
    builder
  );

  const aggregationRootValidation = aggregation.validation.aggregation;

  return (
    <div className="flex flex-col gap-1">
      <OperandViewer
        onClick={() =>
          editAggregation({ initialAggregation: aggregation, onSave })
        }
        borderColor={getBorderColor(aggregationRootValidation)}
      >
        {astNodeLabelName}
      </OperandViewer>
      {isValidationFailure(aggregationRootValidation) && (
        <ErrorMessage errors={aggregationRootValidation.errors} />
      )}
    </div>
  );
}
