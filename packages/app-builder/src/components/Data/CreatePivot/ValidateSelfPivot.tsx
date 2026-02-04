import { type TableModel } from '@app-builder/models/data-model';
import { type FieldPivotOption } from '@app-builder/services/data/pivot';
import { Trans, useTranslation } from 'react-i18next';
import { ButtonV2, Code, Modal } from 'ui-design-system';

export function ValidateSelfPivot({
  pivotOption,
  tableModel,
  onValidate,
  onBack,
}: {
  pivotOption: FieldPivotOption;
  tableModel: TableModel;
  onValidate: (value: FieldPivotOption) => void;
  onBack: () => void;
}) {
  const { t } = useTranslation(['common', 'data']);

  return (
    <>
      <div className="bg-surface-card inline-block w-full flex-col gap-6 p-6">
        <Trans
          t={t}
          i18nKey="data:create_pivot.validate_self_link.description"
          values={{ table: tableModel.name }}
          components={{
            Code: <Code />,
          }}
        />
      </div>
      <Modal.Footer>
        <ButtonV2 className="flex-1" variant="secondary" appearance="stroked" onClick={onBack}>
          {t('common:back')}
        </ButtonV2>

        <ButtonV2 className="flex-1" variant="primary" type="submit" onClick={() => onValidate(pivotOption)}>
          {t('common:validate')}
        </ButtonV2>
      </Modal.Footer>
    </>
  );
}
