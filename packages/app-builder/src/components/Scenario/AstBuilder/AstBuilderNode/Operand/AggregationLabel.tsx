import { type LabelledAst } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';

import { LogicalOperatorLabel } from '../../RootAstBuilderNode/LogicalOperator';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
} from '../AggregationEdit';
import { Operand } from './Operand';
import { OperandLabel } from './OperandLabel';

export type OperandViewModel = EditorNodeViewModel;

export const AggregationLabel = ({
  builder,
  labelledAst,
  viewModel,
  ariaLabel,
}: {
  builder: AstBuilder;
  labelledAst: LabelledAst;
  viewModel: AggregationEditorNodeViewModel;
  ariaLabel?: string;
}) => {
  const { t } = useTranslation(['common', 'scenarios']);
  const [isOpen, setIsOpen] = useState(false);
  const aggregation = adaptAggregationViewModel(viewModel);
  const aggregatedFieldName = `${
    aggregation.aggregatedField?.tableName ?? ''
  }.${aggregation.aggregatedField?.fieldName ?? ''}`;

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger>
        <OperandLabel
          operandLabelledAst={labelledAst}
          variant="view"
          ariaLabel={ariaLabel}
          tooltipContent={
            <span className="text-xs">
              {t('scenarios:view_aggregation.tooltip')}
            </span>
          }
        />
      </Modal.Trigger>
      <Modal.Content size="medium">
        <Modal.Title>{aggregation.label}</Modal.Title>
        <div className="bg-grey-00 flex flex-col p-8">
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
                    {`${filter.filteredField?.fieldName ?? ''} ${
                      filter.operator ?? ''
                    }`}
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
          <div className="flex justify-center pt-4">
            <Modal.Close asChild>
              <Button name="close">{t('common:close')}</Button>
            </Modal.Close>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
