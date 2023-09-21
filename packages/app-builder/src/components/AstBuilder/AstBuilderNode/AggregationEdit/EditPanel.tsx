import { scenarioI18n } from '@app-builder/components/Scenario';
import {
  type AstNode,
  isValidationFailure,
  newAggregatorLabelledAst,
} from '@app-builder/models';
import { Tooltip } from '@ui-design-system';
import { Edit } from '@ui-icons';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../../ErrorMessage';
import { getBorderColor } from '../../utils';
import { OperandViewer } from '../Operand/OperandViewer';
import {
  adaptAggregationAstNode,
  type AggregationViewModel,
  useEditAggregation,
} from './Modal';

export const AggregationEditPanel = ({
  aggregations,
}: {
  aggregations: {
    aggregation: AggregationViewModel;
    onSave: (astNode: AstNode) => void;
  }[];
}) => {
  const { t } = useTranslation(scenarioI18n);

  const editAggregation = useEditAggregation();

  if (aggregations.length === 0) return null;

  return (
    <div className="bg-grey-02 flex flex-col gap-2 rounded border-l-2 border-l-purple-100 p-2">
      <div className="text-grey-50 text-s flex flex-row items-center gap-2">
        <Edit className="flex-shrink-0" />
        {t('scenarios:edit_rule.aggregation_list_title')}
      </div>
      <div className="flex flex-row gap-2">
        {aggregations.map(({ aggregation, onSave }) => {
          const rootValidation = aggregation.validation.aggregation;

          const AggregationEditButton = (
            <OperandViewer
              onClick={() =>
                editAggregation({ initialAggregation: aggregation, onSave })
              }
              borderColor={getBorderColor(rootValidation)}
              operandLabelledAst={newAggregatorLabelledAst(
                adaptAggregationAstNode(aggregation)
              )}
            />
          );

          return (
            <Fragment key={aggregation.nodeId}>
              {isValidationFailure(rootValidation) ? (
                <Tooltip.Default
                  content={<ErrorMessage errors={rootValidation.errors} />}
                >
                  {AggregationEditButton}
                </Tooltip.Default>
              ) : (
                AggregationEditButton
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};
