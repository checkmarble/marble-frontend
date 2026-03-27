import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { aggregatorMetadata } from '@app-builder/models/aggregator-metadata';
import { type AggregationAstNode } from '@app-builder/models/astNode/aggregation';
import { NewConstantAstNode } from '@app-builder/models/astNode/constant';
import {
  type AggregatorOperator,
  aggregatorHasParams,
  aggregatorOperators,
  isPerformanceHeavyAggregator,
  isRestrictedAggregator,
} from '@app-builder/models/modale-operators';
import { aggregationDocHref } from '@app-builder/services/documentation-href';
import { computed } from '@preact/signals-react';
import { Trans, useTranslation } from 'react-i18next';
import { Input, Modal, Tooltip } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';
import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect, type OperatorSelectOptions } from '../../../OperatorSelect';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { type DataModelFieldOption, EditDataModelField } from './EditDataModelField';
import { EditFilters } from './EditFilters';

export function AggregationEditContent({ onChange }: { onChange?: () => void } = {}) {
  const { t } = useTranslation(['scenarios']);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as AggregationAstNode);

  const currentAggregator = node.namedChildren.aggregator.constant;
  const isCurrentRestricted = isRestrictedAggregator(currentAggregator);
  const isCurrentPerformanceHeavy = isPerformanceHeavyAggregator(currentAggregator);

  const aggregatedField = computed(() => {
    const tableName = node.namedChildren.tableName.constant;
    const fieldName = node.namedChildren.fieldName.constant;
    const dataModelField = dataModel.find((t) => t.name === tableName)?.fields.find((f) => f.name === fieldName);

    return dataModelField
      ? ({
          tableName: tableName,
          fieldName: fieldName,
          field: dataModelField,
        } satisfies DataModelFieldOption)
      : null;
  });

  const aggregatorOptions: OperatorSelectOptions<AggregatorOperator> = aggregatorOperators.reduce(
    (acc, op) => {
      acc[op] = { tooltipKey: aggregatorMetadata[op].tooltipKey };
      return acc;
    },
    {} as OperatorSelectOptions<AggregatorOperator>,
  );

  return (
    <>
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="aggregation.label">{t('scenarios:edit_aggregation.label_title')}</label>
          <Input
            type="text"
            id="aggregation.label"
            placeholder={t('scenarios:edit_aggregation.label_placeholder')}
            value={node.namedChildren.label.constant}
            onChange={(e) => {
              node.namedChildren.label.constant = e.target.value;
              onChange?.();
            }}
          />
        </div>
        <div
          className={`grid ${aggregatorHasParams(currentAggregator) ? 'grid-cols-[240px_120px_1fr]' : 'grid-cols-[240px_1fr]'} gap-2`}
        >
          <div>{t('scenarios:edit_aggregation.function_title')}</div>
          {aggregatorHasParams(currentAggregator) ? (
            <div className="flex items-center gap-1">
              <span>{t('scenarios:edit_aggregation.percentile_value')}</span>
              <Tooltip.Default
                className="max-h-none overflow-visible"
                content={
                  <div className="text-s max-w-xs whitespace-pre-wrap">
                    {t('scenarios:edit_aggregation.percentile_value_tooltip')}
                  </div>
                }
              >
                <span className="text-purple-primary">
                  <Icon icon="tip" className="size-4" />
                </span>
              </Tooltip.Default>
            </div>
          ) : null}
          <div>{t('scenarios:edit_aggregation.object_field_title')}</div>
          <div className="flex flex-col gap-2">
            <OperatorSelect
              options={aggregatorOptions}
              operator={node.namedChildren.aggregator.constant}
              onOperatorChange={(aggregator) => {
                node.namedChildren.aggregator.constant = aggregator;

                if (aggregatorHasParams(aggregator)) {
                  if (!node.namedChildren.percentile) {
                    node.namedChildren.percentile = NewConstantAstNode({ constant: 0.5 });
                  }
                } else {
                  delete node.namedChildren.percentile;
                }

                nodeSharp.actions.validate();
                onChange?.();
              }}
              featureAccess={hasValidLicense ? undefined : 'restricted'}
              isOperatorRestricted={isRestrictedAggregator}
            />
          </div>
          {aggregatorHasParams(currentAggregator) ? (
            <Input
              type="text"
              id="aggregation.percentile_value"
              defaultValue={String((node.namedChildren.percentile?.constant ?? 0.5) * 100)}
              onBlur={(e) => {
                const normalizedValue = e.target.value.replace(',', '.');
                const value = parseFloat(normalizedValue);
                if (!isNaN(value)) {
                  const clamped = Math.max(0, Math.min(100, value));
                  node.namedChildren.percentile = NewConstantAstNode({ constant: clamped / 100 });
                  e.target.value = String(clamped);
                  onChange?.();
                }
              }}
            />
          ) : null}
          <div className="flex flex-col gap-2">
            <EditDataModelField
              placeholder={t('scenarios:edit_aggregation.select_a_field')}
              value={aggregatedField.value}
              dataModel={dataModel}
              onChange={(aggregatedField) => {
                nodeSharp.update(() => {
                  node.namedChildren.tableName.constant = aggregatedField.tableName;
                  node.namedChildren.fieldName.constant = aggregatedField.fieldName;
                });
                nodeSharp.actions.validate();
                onChange?.();
              }}
            />
            <EditionEvaluationErrors direct id={node.namedChildren.fieldName.id} />
          </div>
        </div>
        {isCurrentRestricted && !hasValidLicense ? (
          <Callout icon="lock" variant="outlined" color="red">
            {t('scenarios:edit_aggregation.premium_callout')}
          </Callout>
        ) : null}
        {isCurrentPerformanceHeavy && hasValidLicense ? (
          <Callout icon="warning" variant="outlined" color="yellow">
            {t('scenarios:edit_aggregation.performance_warning')}
          </Callout>
        ) : null}
      </div>
      <EditFilters aggregatedField={aggregatedField.value} dataModel={dataModel} onChange={onChange} />
    </>
  );
}

export function EditAggregation(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as AggregationAstNode);
  const hasValidLicense = AstBuilderDataSharpFactory.select((s) => s.data.hasValidLicense);
  const isCurrentRestricted = isRestrictedAggregator(node.namedChildren.aggregator.constant);

  return (
    <OperandEditModalContainer
      {...props}
      saveDisabled={isCurrentRestricted && !hasValidLicense}
      title={
        <div className="flex flex-row items-center justify-center gap-3">
          {t('scenarios:edit_aggregation.title')}
          <div className="flex flex-row items-center justify-center gap-1">
            <Logo logo="logo" className="size-4" />
            <span className="text-grey-secondary text-xs font-light">{t('scenarios:edit_aggregation.subtitle')}</span>
          </div>
        </div>
      }
      size="large"
      className="max-h-[70dvh] gap-10 overflow-auto"
    >
      <Callout variant="outlined">
        <Modal.Description className="whitespace-pre-wrap">
          <Trans
            t={t}
            i18nKey="scenarios:edit_aggregation.description"
            components={{
              DocLink: <ExternalLink href={aggregationDocHref} />,
            }}
          />
        </Modal.Description>
      </Callout>
      <AggregationEditContent />
    </OperandEditModalContainer>
  );
}
