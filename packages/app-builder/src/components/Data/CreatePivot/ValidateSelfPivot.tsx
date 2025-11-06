import { type TableModel } from '@app-builder/models/data-model';
import { type FieldPivotOption } from '@app-builder/services/data/pivot';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Code } from 'ui-design-system';

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
    <div className="bg-grey-100 inline-block w-full flex-col gap-6 p-6">
      <Trans
        t={t}
        i18nKey="data:create_pivot.validate_self_link.description"
        values={{ table: tableModel.name }}
        components={{
          Code: <Code />,
        }}
      />
      <div className="flex flex-1 flex-row gap-2 pt-4">
        <Button className="flex-1" variant="secondary" onClick={onBack}>
          {t('common:back')}
        </Button>

        <Button className="flex-1" variant="primary" type="submit" onClick={() => onValidate(pivotOption)}>
          {t('common:validate')}
        </Button>
      </div>
    </div>
  );
}
