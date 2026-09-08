import { type NavigationOption } from '@app-builder/models';
import { useDataModelQuery } from '@app-builder/queries/data/get-data-model';
import { SelectV2 } from 'ui-design-system';

type LinkedTablesSelectProps = {
  objectType: string;
  value: string | null;
  onChange: (tableName: string, navigationOption: NavigationOption) => void;
};

export function LinkedTablesSelect({ objectType, value, onChange }: LinkedTablesSelectProps) {
  const dataModelQuery = useDataModelQuery();
  const dataModel = dataModelQuery.data?.dataModel ?? [];
  const navigationOptions = dataModel.find((table) => table.name === objectType)?.navigationOptions ?? [];
  const linkedTableNames = [
    ...new Set(
      dataModel
        .flatMap((table) => table.linksToSingle)
        .filter((link) => link.parentTableName === objectType)
        .map((link) => link.childTableName),
    ),
  ];
  const options = linkedTableNames.map((tableName) => ({
    label: tableName,
    value: tableName,
    disabled: !navigationOptions.some((option) => option.targetTableName === tableName),
  }));

  return (
    <SelectV2<string | undefined>
      placeholder="Select table..."
      options={options}
      value={value ?? undefined}
      onChange={(selectedTable) => {
        if (!selectedTable) return;
        const navigationOption = navigationOptions.find((option) => option.targetTableName === selectedTable);
        if (navigationOption) onChange(selectedTable, navigationOption);
      }}
      disabled={dataModelQuery.isPending || options.length === 0}
    />
  );
}
