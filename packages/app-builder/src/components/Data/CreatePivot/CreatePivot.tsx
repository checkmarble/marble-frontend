import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { DataModel, TableModel } from '@app-builder/models';
import { useCreatePivotMutation } from '@app-builder/queries/data/create-pivot';
import {
  CustomPivotOption,
  FieldPivotOption,
  getFieldPivotOptions,
  getLinksPivotOptions,
  LinkPivotOption,
  PivotOption,
} from '@app-builder/services/data/pivot';
import { useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Code, Modal } from 'ui-design-system';
import { SelectField } from './SelectField';
import { SelectLinkPath } from './SelectLinkPath';
import { SelectTargetEntity } from './SelectTargetEntity';
import { ValidateSelfPivot } from './ValidateSelfPivot';

type PivotCreationState =
  | { step: 'entity'; pivotOption: null }
  | { step: 'self'; pivotOption: FieldPivotOption }
  | { step: 'field'; pivotOption: null }
  | { step: 'link'; pivotOption: PivotOption };

const INITIAL_STATE: PivotCreationState = {
  step: 'entity',
  pivotOption: null,
};

export function CreatePivot({
  tableModel,
  dataModel,
  children,
}: {
  tableModel: TableModel;
  dataModel: DataModel;
  children: React.ReactElement;
}) {
  const { t } = useTranslation(['common', 'data']);
  const createPivotMutation = useCreatePivotMutation();
  const revalidate = useLoaderRevalidator();

  const [open, setOpenState] = useState(false);

  const onOpenChange = (isOpening: boolean) => {
    if (!isOpening) {
      setOpenState(false);
      setStepState(INITIAL_STATE);
      return;
    }
    setOpenState(true);
  };

  const [stepState, setStepState] = useState<PivotCreationState>(INITIAL_STATE);

  const onEntitySelected = (value: CustomPivotOption) => {
    switch (value.type) {
      case 'field':
        return setStepState({ step: 'self', pivotOption: value });
      case 'link':
        return setStepState({ step: 'link', pivotOption: value });
      case 'sameTable':
        return setStepState({ step: 'field', pivotOption: null });
      default:
        console.error('Unexpected pivot option type:', value);
        return;
    }
  };
  const onBack = () => setStepState(INITIAL_STATE);

  const [pivotOptions, fieldOptions] = useMemo(
    () => [getLinksPivotOptions(tableModel, dataModel), getFieldPivotOptions(tableModel)],
    [dataModel, tableModel],
  );

  const createPivot = (pivot: PivotOption) => {
    createPivotMutation.mutateAsync(pivot).then((result) => {
      revalidate();

      if (result.success) {
        onOpenChange(false);
      }
    });
  };
  return (
    <Modal.Root {...{ open, onOpenChange }}>
      <Modal.Trigger>{children}</Modal.Trigger>
      <Modal.Content>
        <Modal.Title>
          <Trans
            className="inline-block"
            t={t}
            i18nKey="data:create_pivot.title"
            components={{
              Code: <Code />,
            }}
            values={{ table: tableModel.name }}
          />
        </Modal.Title>

        {match(stepState)
          .with({ step: 'entity', pivotOption: null }, () => (
            <SelectTargetEntity
              {...{ pivotOptions, tableModel }}
              hasFieldOptions={fieldOptions.length > 0}
              onSelected={onEntitySelected}
            />
          ))
          .with({ step: 'link', pivotOption: {} }, ({ pivotOption }) => {
            if (!pivotOption) {
              console.error('No pivot option provided for link step');
              return null;
            }
            return (
              <SelectLinkPath
                {...{ pivotOptions, tableModel, onBack }}
                preferedPivotOption={pivotOption as LinkPivotOption}
                onSelected={(e) => createPivot(e)}
              />
            );
          })
          .with({ step: 'self', pivotOption: {} }, ({ pivotOption }) => (
            <ValidateSelfPivot {...{ pivotOption, tableModel, onBack }} onValidate={createPivot} />
          ))
          .with({ step: 'field', pivotOption: null }, () => (
            <SelectField {...{ tableModel, onSelected: createPivot, onBack }} pivotOptions={fieldOptions} />
          ))
          .otherwise(() => null)}
      </Modal.Content>
    </Modal.Root>
  );
}
