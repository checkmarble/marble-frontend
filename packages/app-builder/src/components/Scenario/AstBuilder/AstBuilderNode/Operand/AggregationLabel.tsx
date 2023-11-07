import { type LabelledAst } from '@app-builder/models';
import {
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import clsx from 'clsx';
import { Fragment, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Tip } from 'ui-icons';

import { LogicalOperatorLabel } from '../../RootAstBuilderNode/LogicalOperator';
import {
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
} from '../AggregationEdit';
import { Operand } from './Operand';
import { TypeInfos } from './OperandLabel';

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
      <Modal.Trigger asChild>
        <button
          aria-label={ariaLabel}
          className={clsx(
            'text-s text-grey-100 group flex flex-row items-center justify-between gap-2 font-normal transition-colors',
            'bg-grey-02 h-fit min-h-[40px] w-fit min-w-[40px] rounded px-2'
          )}
        >
          <TypeInfos operandType="Function" dataType="unknown" disabled />
          {labelledAst.name}
          <Tooltip.Default
            content={<span>{t('scenarios:view_aggregation.tooltip')}</span>}
          >
            <Tip className="shrink-0 text-[21px] text-transparent transition-colors group-hover:text-purple-50 group-hover:hover:text-purple-100" />
          </Tooltip.Default>
        </button>
      </Modal.Trigger>
      <Modal.Content>
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
                    onSave={() => console.log('oh no')}
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
