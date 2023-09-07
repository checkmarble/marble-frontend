import { scenarioI18n } from '@app-builder/components/Scenario';
import { type AstNode, getAstNodeDisplayName } from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Button } from '@ui-design-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  adaptAggregationAstNode,
  adaptAggregationViewModel,
  AggregationEditModal,
  type AggregationViewModel,
} from '.';

export const AggregationEditPanel = ({
  aggregations,
  builder,
}: {
  aggregations: EditorNodeViewModel[];
  builder: AstBuilder;
}) => {
  const { t } = useTranslation(scenarioI18n);

  const aggregationViewModels = aggregations.map((aggregation) =>
    adaptAggregationViewModel(
      aggregation.nodeId,
      adaptAstNodeFromEditorViewModel(aggregation)
    )
  );
  const [selectedAggregation, setSelectedAggregation] =
    useState<AggregationViewModel>(aggregationViewModels[0]);
  const [modalOpen, setModalOpen] = useState(false);
  const editAggregation = (aggregation: AggregationViewModel) => {
    setSelectedAggregation(aggregation);
    setModalOpen(true);
  };

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
            {modalOpen && (
              <AggregationEditModal
                builder={builder}
                initialAggregation={selectedAggregation}
                modalOpen={modalOpen}
                onSave={(astNode: AstNode) =>
                  builder.setOperand(selectedAggregation.nodeId, astNode)
                }
                setModalOpen={setModalOpen}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};
