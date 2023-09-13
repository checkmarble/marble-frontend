import { scenarioI18n } from '@app-builder/components/Scenario';
import {
  getAstNodeDisplayName,
  isValidationFailure,
} from '@app-builder/models';
import { Button, Tooltip } from '@ui-design-system';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../ErrorMessage';
import {
  adaptAggregationAstNode,
  adaptAggregationViewModel,
  type AggregationEditorNodeViewModel,
  useEditAggregation,
} from './Modal';

export const AggregationEditPanel = ({
  aggregations,
}: {
  aggregations: AggregationEditorNodeViewModel[];
}) => {
  const { t } = useTranslation(scenarioI18n);

  const aggregationViewModels = aggregations.map((aggregation) =>
    adaptAggregationViewModel(aggregation)
  );
  const editAggregation = useEditAggregation();

  return (
    <>
      {aggregationViewModels.length > 0 && (
        <div className="bg-grey-05 flex flex-col gap-2 rounded-md p-4">
          <span className="text-grey-50 text-s">
            {t('scenarios:edit_rule.aggregation_list_title')}
          </span>
          <div className="flex flex-row gap-2">
            {aggregationViewModels.map((aggregation) => {
              const isFail = isValidationFailure(
                aggregation.validation.aggregation
              );
              const aggregationDisplayName = getAstNodeDisplayName(
                adaptAggregationAstNode(aggregation)
              );

              const AggregationEditButton = (
                <Button
                  onClick={() => editAggregation(aggregation)}
                  color={isFail ? 'red' : 'purple'}
                >
                  {aggregationDisplayName}
                </Button>
              );

              return (
                <Fragment key={aggregation.nodeId}>
                  {isValidationFailure(aggregation.validation.aggregation) ? (
                    <Tooltip.Default
                      content={
                        <ErrorMessage
                          errors={aggregation.validation.aggregation.errors}
                        />
                      }
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
      )}
    </>
  );
};
