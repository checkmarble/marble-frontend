import { AstBuilderDataSharpFactory } from '@app-builder/components/AstBuilder/Provider';
import { type NavigationOption } from '@app-builder/models';
import { useTranslation } from 'react-i18next';
import { SelectV2 } from 'ui-design-system';

type LinkedTablesSelectProps = {
  objectType: string;
  navigationOption: NavigationOption | null;
  onChange: (navigationOption: NavigationOption) => void;
};

export function LinkedTablesSelect({ objectType, navigationOption, onChange }: LinkedTablesSelectProps) {
  const { t } = useTranslation(['client360']);
  const dataModel = AstBuilderDataSharpFactory.select((state) => state.data.dataModel);
  const navigationOptions = dataModel.find((table) => table.name === objectType)?.navigationOptions ?? [];
  const linkedTableNames = [
    ...new Set(
      dataModel
        .flatMap((table) => table.linksToSingle)
        .filter((link) => link.parentTableName === objectType)
        .map((link) => link.childTableName),
    ),
  ];
  const options = navigationOptions
    .filter((option) => linkedTableNames.includes(option.targetTableName))
    .map((option) => {
      const hasMultipleOptions =
        navigationOptions.filter((candidate) => candidate.targetTableName === option.targetTableName).length > 1;

      return {
        label: hasMultipleOptions ? `${option.targetTableName} (${option.orderingFieldName})` : option.targetTableName,
        value: option.id,
      };
    });

  return (
    <SelectV2<string | undefined>
      placeholder={t('client360:customer_kpis.form.select_table')}
      options={options}
      value={navigationOption?.id}
      onChange={(selectedNavigationOptionId) => {
        const selectedNavigationOption = navigationOptions.find((option) => option.id === selectedNavigationOptionId);
        if (selectedNavigationOption) onChange(selectedNavigationOption);
      }}
      disabled={options.length === 0}
    />
  );
}
