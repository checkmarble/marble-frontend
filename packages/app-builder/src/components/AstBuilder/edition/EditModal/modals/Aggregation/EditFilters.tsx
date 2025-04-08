import { Callout } from '@app-builder/components';
import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { RemoveButton } from '@app-builder/components/AstBuilder/styles/RemoveButton';
import { scenarioI18n } from '@app-builder/components/Scenario';
import { type DataModel, isUndefinedAstNode, NewUndefinedAstNode } from '@app-builder/models';
import {
  type AggregationAstNode,
  aggregationFilterOperators,
  type BinaryAggregationFilterAstNode,
  type ComplexAggregationFilterAstNode,
  isBinaryAggregationFilter,
  isBinaryAggregationFilterOperator,
  isComplexAggregationFilter,
  isUnaryAggregationFilterOperator,
  NewAggregatorFilterAstNode,
  NewFuzzyMatchFilterOptionsAstNode,
  type UnaryAggregationFilterAstNode,
} from '@app-builder/models/astNode/aggregation';
import {
  isKnownOperandAstNode,
  type KnownOperandAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import { getAstNodeDisplayName } from '@app-builder/services/ast-node/getAstNodeDisplayName';
import { useFormatLanguage } from '@app-builder/utils/format';
import clsx from 'clsx';
import { Fragment, type ReactNode, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { EditionAstBuilderOperand } from '../../../EditionOperand';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { getErrorsForNode } from '../../../helpers';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModal } from '../../EditModal';
import { type DataModelFieldOption, EditDataModelFieldTableMenu } from './EditDataModelField';

type EditFiltersProps = {
  aggregatedField: DataModelFieldOption | null;
  dataModel: DataModel;
};
export function EditFilters({ aggregatedField, dataModel }: EditFiltersProps) {
  const { t } = useTranslation(scenarioI18n);
  const { t: stringifyContextT } = useTranslation(['common', 'scenarios']);
  const language = useFormatLanguage();
  const customLists = AstBuilderDataSharpFactory.select((s) => s.data.customLists);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const filters = nodeSharp.select(
    (s) => (s.node as AggregationAstNode).namedChildren.filters.children,
  );
  const evaluation = nodeSharp.select((s) => s.validation);
  const [isEditingFilter, setIsEditingFilter] = useState(false);

  const tableName = aggregatedField?.tableName;
  const options = useMemo(() => {
    return tableName
      ? dataModel
          .find((t) => t.name === tableName)
          ?.fields.map((f) => ({ tableName, fieldName: f.name, field: f }))
      : null;
  }, [tableName, dataModel]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-m">
        <Trans
          t={t}
          i18nKey={
            tableName
              ? 'scenarios:edit_aggregation.filters_in'
              : 'scenarios:edit_aggregation.filters'
          }
          values={{ tableName }}
        />
      </div>
      {filters.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filters.map((filter, filterIndex) => {
            const binaryFilter = isBinaryAggregationFilter(filter);
            const complexFilter = isComplexAggregationFilter(filter);
            const isLastFilter = filterIndex === filters.length - 1;
            const filteredFieldErrors = getErrorsForNode(evaluation, [
              filter.namedChildren.fieldName.id,
              filter.namedChildren.tableName.id,
            ]);
            const operatorErrors = getErrorsForNode(evaluation, filter.namedChildren.operator.id);
            const valueErrors = binaryFilter
              ? getErrorsForNode(evaluation, filter.namedChildren.value.id, true)
              : [];

            const displayName =
              complexFilter && !isUndefinedAstNode(filter.namedChildren.options.namedChildren.value)
                ? getAstNodeDisplayName(filter.namedChildren.options, {
                    t: stringifyContextT,
                    language,
                    customLists,
                  })
                : '...';

            return (
              <Fragment key={filterIndex}>
                <div className="border-grey-90 flex flex-col gap-4 rounded-md border-[0.5px] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-grey-50 flex items-center gap-2 pl-2 text-xs">
                      <span>{t('scenarios:edit_aggregation.filter_field_label')}</span>
                      <FieldSelect
                        tableName={tableName}
                        options={options}
                        trigger={
                          <div
                            className={clsx(
                              'text-s aria-disabled:bg-grey-98 text-grey-00 flex h-10 items-center justify-between rounded border px-2',
                              {
                                'border-grey-90': filteredFieldErrors.length === 0,
                                'border-red-47': filteredFieldErrors.length > 0,
                              },
                            )}
                          >
                            {filter.namedChildren.fieldName.constant}
                            <Icon icon="arrow-2-down" className="size-5" />
                          </div>
                        }
                        onChange={(filteredField) => {
                          nodeSharp.update(() => {
                            filter.namedChildren.tableName.constant = filteredField.tableName;
                            filter.namedChildren.fieldName.constant = filteredField.fieldName;
                          });
                          nodeSharp.actions.validate();
                        }}
                      />
                      <span>{t('scenarios:edit_aggregation.filter_operator_label')}</span>
                      <OperatorSelect
                        isFilter
                        options={aggregationFilterOperators}
                        operator={filter.namedChildren.operator.constant}
                        onOperatorChange={(operator) => {
                          nodeSharp.update(() => {
                            if (isUnaryAggregationFilterOperator(operator)) {
                              (filter as UnaryAggregationFilterAstNode).namedChildren = {
                                tableName: filter.namedChildren.tableName,
                                fieldName: filter.namedChildren.fieldName,
                                operator: NewConstantAstNode({ constant: operator }),
                              };
                              return;
                            }

                            if (isBinaryAggregationFilterOperator(operator)) {
                              const valueNode = match(filter)
                                .when(
                                  isBinaryAggregationFilter,
                                  (binFilter: BinaryAggregationFilterAstNode) =>
                                    binFilter.namedChildren.value,
                                )
                                .when(
                                  isComplexAggregationFilter,
                                  (compFilter: ComplexAggregationFilterAstNode) =>
                                    compFilter.namedChildren.options.namedChildren.value,
                                )
                                .otherwise(() => NewUndefinedAstNode());

                              (filter as BinaryAggregationFilterAstNode).namedChildren = {
                                tableName: filter.namedChildren.tableName,
                                fieldName: filter.namedChildren.fieldName,
                                operator: NewConstantAstNode({ constant: operator }),
                                value: valueNode,
                              };
                              return;
                            }

                            const valueNode = match(filter)
                              .when(
                                isBinaryAggregationFilter,
                                (binFilter: BinaryAggregationFilterAstNode) =>
                                  binFilter.namedChildren.value,
                              )
                              .when(
                                isComplexAggregationFilter,
                                (compFilter: ComplexAggregationFilterAstNode) =>
                                  compFilter.namedChildren.options.namedChildren.value,
                              )
                              .otherwise(() => NewUndefinedAstNode());

                            (filter as ComplexAggregationFilterAstNode).namedChildren = {
                              tableName: filter.namedChildren.tableName,
                              fieldName: filter.namedChildren.fieldName,
                              operator: NewConstantAstNode({ constant: operator }),
                              options: NewFuzzyMatchFilterOptionsAstNode({ value: valueNode }),
                            };

                            // TODO: Manage complex operator change
                          });
                          nodeSharp.actions.validate();
                        }}
                        validationStatus={operatorErrors.length > 0 ? 'error' : 'valid'}
                      />
                      {binaryFilter && filter.namedChildren.operator.constant ? (
                        <>
                          <span>{t('scenarios:edit_aggregation.filter_value_label')}</span>
                          <EditionAstBuilderOperand
                            node={filter.namedChildren.value as KnownOperandAstNode}
                            onChange={(node) => {
                              if (isKnownOperandAstNode(node)) {
                                filter.namedChildren.value = node;
                                nodeSharp.actions.validate();
                              }
                            }}
                            optionsDataType={(opt) => opt.operandType !== 'Modeling'}
                            validationStatus={valueErrors.length > 0 ? 'error' : 'valid'}
                          />
                        </>
                      ) : null}
                      {complexFilter && filter.namedChildren.operator.constant ? (
                        <>
                          <Button variant="secondary" onClick={() => setIsEditingFilter(true)}>
                            {displayName}
                          </Button>
                          {filter.namedChildren.options && isEditingFilter ? (
                            <OperandEditModal
                              node={filter.namedChildren.options}
                              onSave={() => {
                                setIsEditingFilter(false);
                              }}
                              onCancel={() => {
                                setIsEditingFilter(false);
                              }}
                            />
                          ) : null}
                        </>
                      ) : null}
                    </div>
                    <RemoveButton
                      onClick={() => {
                        filters.splice(filterIndex, 1);
                      }}
                    />
                  </div>
                  <EditionEvaluationErrors id={filter.id} />
                </div>
                {!isLastFilter ? (
                  <div className="text-grey-50 text-xs">{t('scenarios:logical_operator.and')}</div>
                ) : null}
              </Fragment>
            );
          })}
        </div>
      ) : null}
      <div className="flex flex-row justify-start gap-2">
        <FieldSelect
          tableName={tableName}
          options={options}
          trigger={
            <Button disabled={!tableName} className="h-fit" variant="secondary">
              <Icon icon="plus" className="size-6" />
              {t('scenarios:edit_aggregation.add_filter')}
            </Button>
          }
          onChange={(filteredField) => {
            filters.push(
              NewAggregatorFilterAstNode({
                namedChildren: {
                  fieldName: NewConstantAstNode({ constant: filteredField.fieldName }),
                  tableName: NewConstantAstNode({ constant: filteredField.tableName }),
                  operator: NewConstantAstNode({ constant: null }),
                  value: NewUndefinedAstNode(),
                },
              }),
            );
          }}
        />
        {filters.length === 0 ? (
          <Callout>{t('scenarios:edit_aggregation.add_filter.callout')}</Callout>
        ) : null}
      </div>
    </div>
  );
}

function FieldSelect({
  tableName,
  options,
  trigger,
  onChange,
}: {
  tableName: string | undefined;
  options: DataModelFieldOption[] | null | undefined;
  trigger: ReactNode;
  onChange: (filteredField: DataModelFieldOption) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>{trigger}</MenuCommand.Trigger>
      <MenuCommand.Content>
        {tableName && options ? (
          <EditDataModelFieldTableMenu tableName={tableName} fields={options} onChange={onChange} />
        ) : null}
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}
