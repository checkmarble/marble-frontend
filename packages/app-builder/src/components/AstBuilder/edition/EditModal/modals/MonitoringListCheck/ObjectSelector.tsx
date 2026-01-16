import { type DataModel, type TableModel } from '@app-builder/models';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from 'ui-design-system';

type ObjectOption = {
  tableName: string;
  path: string[];
  displayLabel: string;
};

type ObjectSelectorProps = {
  dataModel: DataModel;
  triggerObjectTable: TableModel;
  currentTableName: string;
  currentPath: string[];
  onChange: (tableName: string, path: string[]) => void;
};

export function ObjectSelector({
  dataModel,
  triggerObjectTable,
  currentTableName,
  currentPath,
  onChange,
}: ObjectSelectorProps) {
  const { t } = useTranslation(['scenarios']);

  const objectOptions = useMemo(() => {
    const options: ObjectOption[] = [];

    // Add trigger object as first option
    options.push({
      tableName: triggerObjectTable.name,
      path: [],
      displayLabel: t('scenarios:monitoring_list_check.object_trigger', {
        tableName: triggerObjectTable.name,
      }),
    });

    // Add linked tables (pivots) from trigger object
    for (const link of triggerObjectTable.linksToSingle) {
      const linkedTable = dataModel.find((t) => t.name === link.parentTableName);
      if (linkedTable) {
        options.push({
          tableName: linkedTable.name,
          path: [link.name],
          displayLabel: t('scenarios:monitoring_list_check.object_linked', {
            linkName: link.name,
            tableName: linkedTable.name,
          }),
        });

        // Add second-level links
        for (const nestedLink of linkedTable.linksToSingle) {
          const nestedTable = dataModel.find((t) => t.name === nestedLink.parentTableName);
          if (nestedTable) {
            options.push({
              tableName: nestedTable.name,
              path: [link.name, nestedLink.name],
              displayLabel: t('scenarios:monitoring_list_check.object_linked_nested', {
                path: `${link.name} → ${nestedLink.name}`,
                tableName: nestedTable.name,
              }),
            });
          }
        }
      }
    }

    return options;
  }, [dataModel, triggerObjectTable, t]);

  const currentValue = useMemo(() => {
    return objectOptions.find(
      (opt) => opt.tableName === currentTableName && JSON.stringify(opt.path) === JSON.stringify(currentPath),
    );
  }, [objectOptions, currentTableName, currentPath]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-s font-medium text-grey-primary">
        {t('scenarios:monitoring_list_check.object_label')}
      </label>
      <Select.Root
        value={currentValue ? JSON.stringify({ tableName: currentValue.tableName, path: currentValue.path }) : ''}
        onValueChange={(value) => {
          const parsed = JSON.parse(value) as { tableName: string; path: string[] };
          onChange(parsed.tableName, parsed.path);
        }}
      >
        <Select.Trigger className="w-full">
          <Select.Value placeholder={t('scenarios:monitoring_list_check.object_placeholder')} />
        </Select.Trigger>
        <Select.Content>
          <Select.Viewport>
            {objectOptions.map((option) => {
              const value = JSON.stringify({ tableName: option.tableName, path: option.path });
              return (
                <Select.Item key={value} value={value}>
                  {option.displayLabel}
                </Select.Item>
              );
            })}
          </Select.Viewport>
        </Select.Content>
      </Select.Root>
    </div>
  );
}
