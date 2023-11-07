import { type LabelledAst } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

import { isAggregationEditorNodeViewModel } from '../AggregationEdit';
import { AggregationLabel } from './AggregationLabel';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export const OperandViewer = ({
  builder,
  labelledAst,
  operandViewModel,
  ariaLabel,
}: {
  builder: AstBuilder;
  labelledAst: LabelledAst;
  operandViewModel: OperandViewModel;
  ariaLabel?: string;
}) => {
  if (isAggregationEditorNodeViewModel(operandViewModel)) {
    return (
      <AggregationLabel
        labelledAst={labelledAst}
        ariaLabel={ariaLabel}
        viewModel={operandViewModel}
        builder={builder}
      />
    );
  }

  return (
    <OperandLabel
      operandLabelledAst={labelledAst}
      ariaLabel={ariaLabel}
      variant="view"
    />
  );
};
