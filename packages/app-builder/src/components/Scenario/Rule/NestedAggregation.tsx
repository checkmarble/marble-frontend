import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
} from '@app-builder/components/AstBuilder/AggregationEdit';
import { type AstNode, isAggregationIdentifier } from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Fragment } from 'react';

import { Formula } from '../Formula';
import { LogicalOperatorLabel } from '../LogicalOperator';

export const NestedAggregation = ({
  formula,
  displayRow,
}: {
  formula: AstNode;
  displayRow: number;
}) => {
  if (!isAggregationIdentifier(formula)) {
    return;
  }
  const aggregation = adaptAggregationViewModel(
    adaptEditorNodeViewModel({ ast: formula }) as AggregationEditorNodeViewModel
  );
  const aggregatedFieldName = `${
    aggregation.aggregatedField?.tableName ?? ''
  }.${aggregation.aggregatedField?.fieldName ?? ''}`;

  return (
    <div className={`col-start-2 row-start-${displayRow} mb-4 ml-2`}>
      <div className="grid grid-cols-[min-content_1fr] items-center gap-1">
        <div className="text-s flex h-fit min-h-[40px] min-w-[60px] flex-wrap items-center justify-center gap-1 font-bold text-purple-100">
          {aggregation.aggregator}
        </div>
        <div>{aggregatedFieldName}</div>
        {aggregation.filters.map((filter, index) => (
          <Fragment key={`filter_${index}`}>
            <LogicalOperatorLabel operator="where" />
            <div className="flex items-center">
              <p>
                {`${filter.filteredField?.fieldName ?? ''} ${
                  filter.operator ?? ''
                }`}
                &nbsp;
              </p>
              <Formula
                formula={adaptAstNodeFromEditorViewModel(filter.value)}
              />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
};
