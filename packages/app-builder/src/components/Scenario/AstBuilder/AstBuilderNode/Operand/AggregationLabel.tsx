import { type LabelledAst } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Fragment } from 'react';

import { LogicalOperatorLabel } from '../../RootAstBuilderNode/LogicalOperator';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
} from '../AggregationEdit';
import { useGetOperatorName } from '../Operator';
import { Operand } from './Operand';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export const AggregationLabel = ({
  builder,
  labelledAst,
  viewModel,
}: {
  builder: AstBuilder;
  labelledAst: LabelledAst;
  viewModel: AggregationEditorNodeViewModel;
}) => {
  const getOperatorName = useGetOperatorName();
  const aggregation = adaptAggregationViewModel(viewModel);
  const aggregatedFieldName = `${
    aggregation.aggregatedField?.tableName ?? ''
  }.${aggregation.aggregatedField?.fieldName ?? ''}`;

  return (
    <OperandLabel
      operandLabelledAst={labelledAst}
      type="view"
      tooltipContent={
        <div className="grid grid-cols-[min-content_1fr] items-center gap-2">
          <span className="text-center font-bold text-purple-100">
            {aggregation.aggregator}
          </span>
          <span className="font-bold">{aggregatedFieldName}</span>
          {aggregation.filters.map((filter, index) => (
            <Fragment key={`filter_${index}`}>
              <LogicalOperatorLabel
                className="text-grey-50"
                operator={index === 0 ? 'where' : 'and'}
              />
              <div className="flex items-center gap-1">
                <p className="whitespace-nowrap text-right">
                  {`${filter.filteredField?.fieldName ?? ''} ${getOperatorName(
                    filter.operator ?? '',
                  )}`}
                </p>
                <Operand
                  operandViewModel={filter.value}
                  builder={builder}
                  viewOnly
                />
              </div>
            </Fragment>
          ))}
        </div>
      }
    />
  );
};
