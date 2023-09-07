import {
  adaptConstantAstNodeToString,
  type AggregationAstNode,
  aggregationAstNodeName,
  type AstNode,
  NewAstNode,
  NewConstantAstNode,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  adaptEditorNodeViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { Button, Input, Modal } from '@ui-design-system';
import { Logo } from '@ui-icons';
import { type Namespace } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AggregatorSelect } from './AggregatorSelect';
import { type DataModelField, EditDataModelField } from './EditDataModelField';
import { EditFilters } from './EditFilters';

export const handle = {
  i18n: ['scenarios', 'common'] satisfies Namespace,
};

export interface AggregationViewModel {
  nodeId: string;
  label: string;
  aggregator: string;
  aggregatedField: DataModelField | null;
  filters: FilterViewModel[];
}
export interface FilterViewModel {
  operator: string | null;
  filteredField: DataModelField | null;
  value: EditorNodeViewModel;
}

export const adaptAggregationViewModel = (
  nodeId: string,
  astNode: AstNode
): AggregationViewModel => {
  const aggregatedField: DataModelField = {
    tableName: adaptConstantAstNodeToString(astNode.namedChildren['tableName']),
    fieldName: adaptConstantAstNodeToString(astNode.namedChildren['fieldName']),
  };
  const filters: FilterViewModel[] =
    astNode.namedChildren['filters'].children.map(adaptFilterViewModel);

  return {
    nodeId,
    label: adaptConstantAstNodeToString(astNode.namedChildren['label']),
    aggregator: adaptConstantAstNodeToString(
      astNode.namedChildren['aggregator']
    ),
    aggregatedField,
    filters,
  };
};

const adaptFilterViewModel = (filterAstNode: AstNode): FilterViewModel => ({
  operator: adaptConstantAstNodeToString(
    filterAstNode.namedChildren['operator']
  ),
  filteredField: {
    tableName: adaptConstantAstNodeToString(
      filterAstNode.namedChildren['tableName']
    ),
    fieldName: adaptConstantAstNodeToString(
      filterAstNode.namedChildren['fieldName']
    ),
  },
  value: adaptEditorNodeViewModel({
    ast: filterAstNode.namedChildren['value'],
  }),
});

export const adaptAggregationAstNode = (
  aggregationViewModel: AggregationViewModel
): AggregationAstNode => {
  const filters: AstNode[] = aggregationViewModel.filters.map(
    (filter: FilterViewModel) =>
      NewAstNode({
        name: 'Filter',
        namedChildren: {
          operator: NewConstantAstNode({ constant: filter.operator }),
          tableName: NewConstantAstNode({
            constant: filter.filteredField?.tableName ?? null,
          }),
          fieldName: NewConstantAstNode({
            constant: filter.filteredField?.fieldName ?? null,
          }),
          value: adaptAstNodeFromEditorViewModel(filter.value),
        },
      })
  );
  return {
    name: aggregationAstNodeName,
    constant: undefined,
    children: [],
    namedChildren: {
      label: NewConstantAstNode({
        constant: aggregationViewModel.label,
      }),
      aggregator: NewConstantAstNode({
        constant: aggregationViewModel.aggregator,
      }),
      tableName: NewConstantAstNode({
        constant: aggregationViewModel.aggregatedField?.tableName ?? '',
      }),
      fieldName: NewConstantAstNode({
        constant: aggregationViewModel.aggregatedField?.fieldName ?? '',
      }),
      filters: NewAstNode({ name: 'List', children: filters }),
    },
  };
};

export const AggregationEditModal = ({
  builder,
  initialAggregation,
  modalOpen,
  onSave,
  setModalOpen,
}: {
  builder: AstBuilder;
  initialAggregation: AggregationViewModel;
  modalOpen: boolean;
  onSave: (astNode: AstNode) => void;
  setModalOpen: (modalOpen: boolean) => void;
}) => {
  const { t } = useTranslation(handle.i18n);

  const dataModels = builder.dataModels;
  const dataModelFieldOptions: DataModelField[] = dataModels.flatMap((table) =>
    table.fields.map((field) => ({
      tableName: table.name,
      fieldName: field.name,
    }))
  );

  const [aggregation, setAggregation] = useState<AggregationViewModel>(
    () => initialAggregation
  );

  const save = () => {
    onSave(adaptAggregationAstNode(aggregation));
    setModalOpen(false);
  };

  return (
    <Modal.Root open={modalOpen} onOpenChange={setModalOpen}>
      <Modal.Content>
        <Modal.Title>
          {t('scenarios:edit_aggregation.title')}
          <Logo
            className="m-1 ml-2 inline-block max-h-10"
            height="100%"
            preserveAspectRatio="xMinYMid meet"
          />{' '}
          <span className="text-grey-50 text-xs font-light">
            {t('scenarios:edit_aggregation.subtitle')}
          </span>
        </Modal.Title>
        <div className="bg-grey-00 flex flex-col gap-8 p-8">
          <div className="flex flex-1 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="aggregation.label">
                {t('scenarios:edit_aggregation.label_title')}
              </label>
              <Input
                type="text"
                id="aggregation.label"
                placeholder={t('scenarios:edit_aggregation.label_placeholder')}
                value={aggregation.label}
                onChange={(e) =>
                  setAggregation({
                    ...aggregation,
                    label: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              {t('scenarios:edit_aggregation.function_title')}
              <div className="flex flex-1 gap-2">
                <AggregatorSelect
                  value={aggregation.aggregator}
                  onChange={(aggregator) =>
                    setAggregation({ ...aggregation, aggregator })
                  }
                />
                <div className="grow">
                  <EditDataModelField
                    value={aggregation.aggregatedField}
                    options={dataModelFieldOptions}
                    onChange={(aggregatedField) =>
                      setAggregation({ ...aggregation, aggregatedField })
                    }
                  />
                </div>
              </div>
              <EditFilters
                aggregatedField={aggregation.aggregatedField}
                builder={builder}
                value={aggregation.filters}
                dataModelFieldOptions={dataModelFieldOptions}
                onChange={(filters) =>
                  setAggregation({ ...aggregation, filters })
                }
              />
            </div>
          </div>
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button
              className="flex-1"
              variant="primary"
              name="save"
              onClick={() => save()}
            >
              {t('common:save')}
            </Button>
          </div>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
