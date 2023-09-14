import {
  type AggregationAstNode,
  aggregationAstNodeName,
  type AstNode,
  type EvaluationError,
  mergeValidations,
  NewAstNode,
  NewConstantAstNode,
  NewPendingValidation,
  type Validation,
} from '@app-builder/models';
import {
  adaptAstNodeFromEditorViewModel,
  type AstBuilder,
  type EditorNodeViewModel,
  flattenViewModelErrors,
} from '@app-builder/services/editor/ast-editor';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { Button, Input, Modal } from '@ui-design-system';
import { Logo } from '@ui-icons';
import { type Namespace } from 'i18next';
import { type PropsWithChildren, useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '../../ErrorMessage';
import { getBorderColor } from '../../utils';
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
  validation: {
    aggregation: Validation;
    label: Validation;
    aggregator: Validation;
    aggregatedField: Validation;
  };
}
export interface FilterViewModel {
  operator: string | null;
  filteredField: DataModelField | null;
  value: EditorNodeViewModel;
  validation: {
    filter: Validation;
    operator: Validation;
    filteredField: Validation;
    value: Validation;
  };
}

const parentValidationForNamedChildren = (
  editorNodeViewModel: EditorNodeViewModel,
  namedArgumentKey: string
): Validation => {
  if (editorNodeViewModel.validation.state !== 'fail') {
    return { state: editorNodeViewModel.validation.state };
  }
  const namedErrors: EvaluationError[] =
    editorNodeViewModel.validation.errors.filter(
      (error) => error.argumentName === namedArgumentKey
    );
  if (namedErrors.length > 0) {
    return { state: 'fail', errors: namedErrors };
  }
  return { state: 'pending' };
};

const computeValidationForNamedChildren = (
  editorNodeViewModel: EditorNodeViewModel,
  namedArgumentKey: string
): Validation =>
  mergeValidations([
    editorNodeViewModel.namedChildren[namedArgumentKey]?.validation ??
      NewPendingValidation(),
    parentValidationForNamedChildren(editorNodeViewModel, namedArgumentKey),
  ]);

const computeAggregationValidation = (vm: EditorNodeViewModel): Validation => {
  if (!vm.validation) {
    return NewPendingValidation();
  }
  switch (vm.validation.state) {
    case 'pending':
      return flattenViewModelErrors(vm).length > 0
        ? {
            state: 'fail',
            errors: appendWithAggregationError([]),
          }
        : { state: 'pending' };
    case 'fail':
      return {
        state: 'fail',
        errors: appendWithAggregationError(vm.validation.errors),
      };
    case 'valid':
      return vm.validation;
  }
};

const appendWithAggregationError = (
  errors: EvaluationError[]
): EvaluationError[] => [
  { error: 'AGGREGATION_ERROR', message: 'aggregation has errors' },
  ...errors,
];

export type AggregationEditorNodeViewModel = {
  nodeId: string;
  funcName: string | null;
  constant: string;
  validation: Validation;
  children: AggregationEditorNodeViewModel[];
  namedChildren: Record<string, AggregationEditorNodeViewModel>;
};

export const isAggregationEditorNodeViewModel = (
  vm: EditorNodeViewModel
): vm is AggregationEditorNodeViewModel => {
  return vm.funcName === aggregationAstNodeName;
};

export const adaptAggregationViewModel = (
  vm: AggregationEditorNodeViewModel
): AggregationViewModel => {
  const aggregatedField: DataModelField = {
    tableName: vm.namedChildren['tableName']?.constant,
    fieldName: vm.namedChildren['fieldName']?.constant,
  };
  const filters = vm.namedChildren['filters']
    ? vm.namedChildren['filters'].children.map(adaptFilterViewModel)
    : [];

  return {
    nodeId: vm.nodeId,
    label: vm.namedChildren['label']?.constant,
    aggregator: vm.namedChildren['aggregator']?.constant,
    aggregatedField,
    filters,
    validation: {
      aggregation: computeAggregationValidation(vm),
      label: computeValidationForNamedChildren(vm, 'label'),
      aggregator: computeValidationForNamedChildren(vm, 'aggregator'),
      aggregatedField: mergeValidations([
        computeValidationForNamedChildren(vm, 'tableName'),
        computeValidationForNamedChildren(vm, 'fieldName'),
      ]),
    },
  };
};

const adaptFilterViewModel = (
  filterVM: AggregationEditorNodeViewModel
): FilterViewModel => ({
  operator: filterVM.namedChildren['operator']?.constant,
  filteredField: {
    tableName: filterVM.namedChildren['tableName']?.constant,
    fieldName: filterVM.namedChildren['fieldName']?.constant,
  },
  value: filterVM.namedChildren['value'],
  validation: {
    filter: filterVM.validation ?? NewPendingValidation(),
    operator: computeValidationForNamedChildren(filterVM, 'operator'),
    filteredField: mergeValidations([
      computeValidationForNamedChildren(filterVM, 'tableName'),
      computeValidationForNamedChildren(filterVM, 'fieldName'),
    ]),
    value: computeValidationForNamedChildren(filterVM, 'value'),
  },
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

export interface AggregationEditModalProps {
  initialAggregation: AggregationViewModel;
  onSave: (astNode: AstNode) => void;
}

const AggregationEditModalContext = createSimpleContext<
  (agregationProps: AggregationEditModalProps) => void
>('AggregationEditModal');

export const useEditAggregation = AggregationEditModalContext.useValue;

export const AggregationEditModal = ({
  builder,
  children,
}: PropsWithChildren<{
  builder: AstBuilder;
}>) => {
  const [open, onOpenChange] = useState<boolean>(false);
  const [aggregationEditModalProps, setAggregationEditModalProps] =
    useState<AggregationEditModalProps>();

  const editAgregation = useCallback(
    (aggregationProps: AggregationEditModalProps) => {
      setAggregationEditModalProps(aggregationProps);
      onOpenChange(true);
    },
    []
  );

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <AggregationEditModalContext.Provider value={editAgregation}>
        {children}
        <Modal.Content>
          {aggregationEditModalProps && (
            <AggregationEditModalContent
              builder={builder}
              initialAggregation={aggregationEditModalProps.initialAggregation}
              onSave={(astNode) => {
                aggregationEditModalProps.onSave(astNode);
                onOpenChange(false);
              }}
            />
          )}
        </Modal.Content>
      </AggregationEditModalContext.Provider>
    </Modal.Root>
  );
};

const AggregationEditModalContent = ({
  builder,
  initialAggregation,
  onSave,
}: {
  builder: AstBuilder;
  initialAggregation: AggregationViewModel;
  onSave: (astNode: AstNode) => void;
}) => {
  const { t } = useTranslation(handle.i18n);

  const dataModelFieldOptions = useMemo(
    () =>
      builder.dataModels.flatMap((table) =>
        table.fields.map((field) => ({
          tableName: table.name,
          fieldName: field.name,
        }))
      ),
    [builder.dataModels]
  );

  const [aggregation, setAggregation] = useState<AggregationViewModel>(
    () => initialAggregation
  );

  const handleSave = () => {
    onSave(adaptAggregationAstNode(aggregation));
  };

  return (
    <>
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
                  validation: {
                    ...aggregation.validation,
                    label: NewPendingValidation(),
                  },
                })
              }
              borderColor={getBorderColor(aggregation.validation.label)}
            />
            {aggregation.validation.label.state === 'fail' && (
              <ErrorMessage errors={aggregation.validation.label.errors} />
            )}
          </div>
          <div className="flex flex-col gap-2">
            {t('scenarios:edit_aggregation.function_title')}
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <AggregatorSelect
                value={aggregation.aggregator}
                onChange={(aggregator) =>
                  setAggregation({
                    ...aggregation,
                    aggregator,
                    validation: {
                      ...aggregation.validation,
                      aggregator: NewPendingValidation(),
                    },
                  })
                }
                validation={aggregation.validation.aggregator}
              />

              <EditDataModelField
                value={aggregation.aggregatedField}
                options={dataModelFieldOptions}
                onChange={(aggregatedField) =>
                  setAggregation({
                    ...aggregation,
                    aggregatedField,
                    validation: {
                      ...aggregation.validation,
                      aggregatedField: NewPendingValidation(),
                    },
                  })
                }
                validation={aggregation.validation.aggregatedField}
              />

              <div>
                {aggregation.validation.aggregator.state === 'fail' && (
                  <ErrorMessage
                    errors={aggregation.validation.aggregator.errors}
                  />
                )}
              </div>
              <div>
                {aggregation.validation.aggregatedField.state === 'fail' && (
                  <ErrorMessage
                    errors={aggregation.validation.aggregatedField.errors}
                  />
                )}
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
            onClick={() => handleSave()}
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </>
  );
};
