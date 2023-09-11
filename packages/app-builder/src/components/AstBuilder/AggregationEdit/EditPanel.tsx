import { scenarioI18n } from '@app-builder/components/Scenario';
import { getAstNodeDisplayName } from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Button } from '@ui-design-system';
import { useTranslation } from 'react-i18next';

import {
  adaptAggregationAstNode,
  adaptAggregationViewModel,
  useEditAggregation,
} from './Modal';

export const AggregationEditPanel = ({
  aggregations,
}: {
  aggregations: EditorNodeViewModel[];
}) => {
  const { t } = useTranslation(scenarioI18n);

  const aggregationViewModels = aggregations.map((aggregation) =>
    adaptAggregationViewModel(
      aggregation.nodeId,
      adaptAstNodeFromEditorViewModel(aggregation)
    )
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
            {aggregationViewModels.map((aggregation) => (
              <Button
                onClick={() => editAggregation(aggregation)}
                key={aggregation.nodeId}
              >
                {getAstNodeDisplayName(adaptAggregationAstNode(aggregation))}
              </Button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
