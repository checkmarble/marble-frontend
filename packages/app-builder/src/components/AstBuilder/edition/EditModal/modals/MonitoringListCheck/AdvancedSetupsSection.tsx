import { type DataModel, type TableModel } from '@app-builder/models';
import {
  type LinkedObjectCheck,
  type NavigationIndex,
  type ObjectPathSegment,
} from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type LinkedTableOption = {
  tableName: string;
  fieldPath: ObjectPathSegment[];
  direction: 'up' | 'down';
  displayLabel: string;
  linkDescription: string;
  /** For 'down' direction: available timestamp fields for ordering */
  timestampFields?: { name: string; id: string }[];
  /** If the table has navigationOptions configured */
  hasNavigationOptions: boolean;
  /** Pre-configured ordering field from navigationOptions */
  navigationOrderingField?: string;
};

type AdvancedSetupsSectionProps = {
  dataModel: DataModel;
  selectedTable: TableModel;
  screeningConfigs: ContinuousScreeningConfig[];
  linkedObjectChecks: LinkedObjectCheck[];
  onLinkedObjectChecksChange: (checks: LinkedObjectCheck[]) => void;
};

export function AdvancedSetupsSection({
  dataModel,
  selectedTable,
  screeningConfigs,
  linkedObjectChecks,
  onLinkedObjectChecksChange,
}: AdvancedSetupsSectionProps) {
  const { t } = useTranslation(['scenarios']);

  // Get tables that are under monitoring
  const monitoredTableNames = useMemo(() => {
    return new Set(screeningConfigs.flatMap((config) => config.objectTypes));
  }, [screeningConfigs]);

  // Compute linked tables (both up and down directions) that are under monitoring
  const linkedTableOptions = useMemo(() => {
    const options: LinkedTableOption[] = [];

    // "Up" direction: parent tables via linksToSingle
    for (const link of selectedTable.linksToSingle) {
      if (monitoredTableNames.has(link.parentTableName)) {
        options.push({
          tableName: link.parentTableName,
          fieldPath: [{ linkName: link.name, tableName: link.parentTableName }],
          direction: 'up',
          displayLabel: link.parentTableName,
          linkDescription: t('scenarios:monitoring_list_check.linked_up', {
            tableName: link.parentTableName,
            selectedTable: selectedTable.name,
          }),
          hasNavigationOptions: false,
        });
      }
    }

    // "Down" direction: child tables (tables that have links pointing to selectedTable)
    for (const table of dataModel) {
      if (table.name === selectedTable.name) continue;

      for (const link of table.linksToSingle) {
        if (link.parentTableName === selectedTable.name && monitoredTableNames.has(table.name)) {
          // Check if table has navigationOptions configured
          const hasNavOptions = (table.navigationOptions?.length ?? 0) > 0;
          const navOption = table.navigationOptions?.[0];

          // Get timestamp fields only for ordering
          const timestampFields = table.fields
            .filter((f) => f.dataType === 'Timestamp')
            .map((f) => ({ name: f.name, id: f.id }));

          options.push({
            tableName: table.name,
            fieldPath: [{ linkName: link.name, tableName: table.name }],
            direction: 'down',
            displayLabel: table.name,
            linkDescription: t('scenarios:monitoring_list_check.linked_down', {
              tableName: table.name,
              selectedTable: selectedTable.name,
            }),
            timestampFields,
            hasNavigationOptions: hasNavOptions,
            navigationOrderingField: navOption?.orderingFieldName,
          });
        }
      }
    }

    return options;
  }, [dataModel, selectedTable, monitoredTableNames, t]);

  // Initialize checks from linkedObjectChecks or create defaults
  const getCheckForTable = (tableName: string): LinkedObjectCheck | undefined => {
    return linkedObjectChecks.find((c) => c.tableName === tableName);
  };

  const handleToggleCheck = (option: LinkedTableOption, enabled: boolean) => {
    const existingCheck = getCheckForTable(option.tableName);

    if (enabled) {
      if (existingCheck) {
        // Update existing
        onLinkedObjectChecksChange(
          linkedObjectChecks.map((c) => (c.tableName === option.tableName ? { ...c, enabled: true } : c)),
        );
      } else {
        // Add new - if hasNavigationOptions, auto-configure and validate
        const newCheck: LinkedObjectCheck = {
          tableName: option.tableName,
          fieldPath: option.fieldPath,
          direction: option.direction,
          enabled: true,
          validated: option.direction === 'up' || option.hasNavigationOptions,
          navigationIndex:
            option.hasNavigationOptions && option.navigationOrderingField
              ? { fieldName: option.navigationOrderingField, order: 'desc' }
              : undefined,
        };
        onLinkedObjectChecksChange([...linkedObjectChecks, newCheck]);
      }
    } else {
      // Disable
      onLinkedObjectChecksChange(
        linkedObjectChecks.map((c) => (c.tableName === option.tableName ? { ...c, enabled: false } : c)),
      );
    }
  };

  const handleNavigationIndexChange = (tableName: string, fieldName: string) => {
    const navigationIndex: NavigationIndex = { fieldName, order: 'desc' };
    onLinkedObjectChecksChange(
      linkedObjectChecks.map((c) => (c.tableName === tableName ? { ...c, navigationIndex, validated: true } : c)),
    );
  };

  if (linkedTableOptions.length === 0) {
    return <div className="text-s text-grey-secondary">{t('scenarios:monitoring_list_check.no_linked_objects')}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-s font-medium text-grey-primary">
        {t('scenarios:monitoring_list_check.advanced_question', { tableName: selectedTable.name })}
      </div>

      {linkedTableOptions.map((option) => {
        const check = getCheckForTable(option.tableName);
        const isEnabled = check?.enabled ?? false;

        return (
          <LinkedObjectCheckItem
            key={option.tableName}
            option={option}
            check={check}
            isEnabled={isEnabled}
            onToggle={(enabled) => handleToggleCheck(option, enabled)}
            onNavigationIndexChange={(fieldName) => handleNavigationIndexChange(option.tableName, fieldName)}
          />
        );
      })}
    </div>
  );
}

type LinkedObjectCheckItemProps = {
  option: LinkedTableOption;
  check: LinkedObjectCheck | undefined;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onNavigationIndexChange: (fieldName: string) => void;
};

function LinkedObjectCheckItem({
  option,
  check,
  isEnabled,
  onToggle,
  onNavigationIndexChange,
}: LinkedObjectCheckItemProps) {
  const { t } = useTranslation(['scenarios']);
  const [selectedFieldName, setSelectedFieldName] = useState(check?.navigationIndex?.fieldName ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  const needsNavigationConfig = option.direction === 'down' && !option.hasNavigationOptions;
  const hasNavigationConfig = !!check?.navigationIndex?.fieldName;

  const handleFieldChange = (fieldName: string) => {
    setSelectedFieldName(fieldName);
    onNavigationIndexChange(fieldName);
    setMenuOpen(false);
  };

  const displayValue = selectedFieldName || t('scenarios:monitoring_list_check.select_field');

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-grey-border p-4">
      {/* Main checkbox */}
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={isEnabled} onCheckedChange={onToggle} />
        <span className="text-s font-medium text-grey-primary">{option.linkDescription}</span>
        {option.direction === 'up' && <Icon icon="arrow-up" className="size-4 text-grey-secondary" />}
        {option.direction === 'down' && <Icon icon="arrow-down" className="size-4 text-grey-secondary" />}
      </label>

      {/* Navigation config for "down" direction without navigationOptions */}
      {isEnabled && needsNavigationConfig && (
        <div className="ml-6 flex flex-col gap-3 rounded-md bg-grey-background-light p-3">
          <div className="flex items-center gap-2 text-xs text-grey-primary">
            <span>{t('scenarios:monitoring_list_check.order_by_label')}</span>
          </div>

          <MenuCommand.Menu open={menuOpen} onOpenChange={setMenuOpen}>
            <MenuCommand.Trigger>
              <MenuCommand.SelectButton className="w-48">
                <span className="truncate">{displayValue}</span>
              </MenuCommand.SelectButton>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth>
              <MenuCommand.List>
                {option.timestampFields?.map((field) => (
                  <MenuCommand.Item
                    key={field.id}
                    selected={selectedFieldName === field.name}
                    onSelect={() => handleFieldChange(field.name)}
                  >
                    {field.name}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>

          {hasNavigationConfig && (
            <div className="flex items-center gap-1 text-xs text-green-primary">
              <Icon icon="tick" className="size-4" />
              {t('scenarios:monitoring_list_check.config_validated')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
