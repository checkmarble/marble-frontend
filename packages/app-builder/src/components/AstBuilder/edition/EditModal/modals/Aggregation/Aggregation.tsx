import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { Callout } from '@app-builder/components/Callout';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { type AggregationAstNode } from '@app-builder/models/astNode/aggregation';
import { aggregatorOperators } from '@app-builder/models/modale-operators';
import { aggregationDocHref } from '@app-builder/services/documentation-href';
import { computed } from '@preact/signals-react';
import { Trans, useTranslation } from 'react-i18next';
import { Input, Modal } from 'ui-design-system';
import { Logo } from 'ui-icons';

import { EditionEvaluationErrors } from '../../../EvaluationErrors';
import { AstBuilderNodeSharpFactory } from '../../../node-store';
import { OperatorSelect } from '../../../OperatorSelect';
import { OperandEditModalContainer } from '../../Container';
import { type OperandEditModalProps } from '../../EditModal';
import { type DataModelFieldOption, EditDataModelField } from './EditDataModelField';
import { EditFilters } from './EditFilters';

export function EditAggregation(props: Omit<OperandEditModalProps, 'node'>) {
  const { t } = useTranslation(['scenarios']);
  const dataModel = AstBuilderDataSharpFactory.select((s) => s.data.dataModel);
  const nodeSharp = AstBuilderNodeSharpFactory.useSharp();
  const node = nodeSharp.select((s) => s.node as AggregationAstNode);
  const aggregatedField = computed(() => {
    const tableName = node.namedChildren.tableName.constant;
    const fieldName = node.namedChildren.fieldName.constant;
    const dataModelField = dataModel
      .find((t) => t.name === tableName)
      ?.fields.find((f) => f.name === fieldName);

    return dataModelField
      ? ({
          tableName: tableName,
          fieldName: fieldName,
          field: dataModelField,
        } satisfies DataModelFieldOption)
      : null;
  });

  return (
    <OperandEditModalContainer
      {...props}
      title={
        <div className="flex flex-row items-center justify-center gap-3">
          {t('scenarios:edit_aggregation.title')}
          <div className="flex flex-row items-center justify-center gap-1">
            <Logo logo="logo" className="size-4" />
            <span className="text-grey-50 text-xs font-light">
              {t('scenarios:edit_aggregation.subtitle')}
            </span>
          </div>
        </div>
      }
      size="large"
      className="max-h-[70dvh] gap-10 overflow-auto"
    >
      <div className="flex flex-1 flex-col gap-4">
        <Callout variant="outlined">
          <Modal.Description className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="scenarios:edit_aggregation.description"
              components={{
                DocLink: <ExternalLink href={aggregationDocHref} />,
              }}
            />
          </Modal.Description>
        </Callout>
        <div className="flex flex-col gap-2">
          <label htmlFor="aggregation.label">{t('scenarios:edit_aggregation.label_title')}</label>
          <Input
            type="text"
            id="aggregation.label"
            placeholder={t('scenarios:edit_aggregation.label_placeholder')}
            value={node.namedChildren.label.constant}
            onChange={(e) => {
              node.namedChildren.label.constant = e.target.value;
            }}
            // borderColor={aggregation.errors.label.length > 0 ? 'redfigma-47' : 'greyfigma-90'}
          />
          {/* <EvaluationErrors
            errors={adaptEvaluationErrorViewModels(aggregation.errors.label).map(
              getNodeEvaluationErrorMessage,
            )}
          /> */}
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-2">
          <div>{t('scenarios:edit_aggregation.function_title')}</div>
          <div>{t('scenarios:edit_aggregation.object_field_title')}</div>
          <div className="flex flex-col gap-2">
            <OperatorSelect
              options={aggregatorOperators}
              operator={node.namedChildren.aggregator.constant}
              onOperatorChange={(aggregator) => {
                node.namedChildren.aggregator.constant = aggregator;
                nodeSharp.actions.validate();
              }}
              // validationStatus={aggregation.errors.aggregator.length > 0 ? 'error' : 'valid'}
            />
            {/* <EvaluationErrors
              errors={adaptEvaluationErrorViewModels(aggregation.errors.aggregator).map(
                getNodeEvaluationErrorMessage,
              )}
            /> */}
          </div>
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
              }}
            />
            <EditionEvaluationErrors direct id={node.namedChildren.fieldName.id} />
          </div>
        </div>
      </div>
      <EditFilters aggregatedField={aggregatedField.value} dataModel={dataModel} />
    </OperandEditModalContainer>
  );
}
