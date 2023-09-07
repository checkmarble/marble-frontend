import { adaptAggregationViewModel } from '@app-builder/components/AstBuilder/AggregationEdit';
import { type AstNode, isAggregationIdentifier } from '@app-builder/models';
import { useEditorIdentifiers } from '@app-builder/services/editor';
import { adaptAstNodeFromEditorViewModel } from '@app-builder/services/editor/ast-editor';
import { Fragment, useId } from 'react';

import { Formula } from '../Formula';
import { LogicalOperatorLabel } from '../LogicalOperator';

export const NestedAggregation = ({
  formula,
  displayRow,
}: {
  formula: AstNode;
  displayRow: number;
}) => {
  const editorIdentifier = useEditorIdentifiers();
  const id = useId();
  if (!isAggregationIdentifier(formula, editorIdentifier)) {
    return;
  }
  const aggregation = adaptAggregationViewModel(id, formula);
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
