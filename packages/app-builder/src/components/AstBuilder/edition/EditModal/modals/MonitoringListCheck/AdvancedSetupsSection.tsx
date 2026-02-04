import { type DataModel, type LinkToSingle, type TableModel } from '@app-builder/models';
import {
  type LinkedObjectCheck,
  type NavigationOptionRef,
  type ObjectPathSegment,
} from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

/** Data needed to create a navigation option at save time */
export type PendingNavigationOption = {
  tableName: string;
  tableId: string;
  sourceFieldId: string;
  targetTableId: string;
  filterFieldId: string;
  orderingFieldId: string;
};

type BaseNavRef = {
  targetTableName: string;
  targetFieldName: string;
  sourceTableName: string;
  sourceFieldName: string;
};

type LinkedTableOption = {
  tableName: string;
  fieldPath: ObjectPathSegment[];
  direction: 'up' | 'down';
  displayLabel: string;
  linkDescription: string;
  /** For 'up' direction: the link name to use */
  linkToSingleName?: string;
  /** For 'down' direction: the navigation option reference (complete with orderingFieldName) */
  navigationOptionRef?: NavigationOptionRef;
  /** For 'down' direction without nav options: base ref to build complete ref when user selects ordering field */
  baseNavRef?: BaseNavRef;
  /** For 'down' direction: available timestamp fields for ordering */
  timestampFields?: { name: string; id: string }[];
  /** If the table has navigationOptions configured */
  hasNavigationOptions: boolean;
  /** For 'down' direction without nav options: the link to create navigation option */
  link?: LinkToSingle;
};

type AdvancedSetupsSectionProps = {
  dataModel: DataModel;
  selectedTable: TableModel;
  screeningConfigs: ContinuousScreeningConfig[];
  linkedObjectChecks: LinkedObjectCheck[];
  onLinkedObjectChecksChange: (checks: LinkedObjectCheck[]) => void;
  onPendingNavigationOptionAdd: (pending: PendingNavigationOption) => void;
};

export const AdvancedSetupsSection = ({
  dataModel,
  selectedTable,
  screeningConfigs,
  linkedObjectChecks,
  onLinkedObjectChecksChange,
  onPendingNavigationOptionAdd,
}: AdvancedSetupsSectionProps) => {
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
          linkToSingleName: link.name,
          hasNavigationOptions: false,
        });
      }
    }

    // "Down" direction: child tables (tables that have links pointing to selectedTable)
    for (const table of dataModel) {
      if (table.name === selectedTable.name) {
        continue;
      }

      for (const link of table.linksToSingle) {
        if (link.parentTableName === selectedTable.name && monitoredTableNames.has(table.name)) {
          // Check if selectedTable (source/parent) has navigationOptions configured for this relationship
          // NavigationOptions are stored on the SOURCE table, not the TARGET table
          const navOption = selectedTable.navigationOptions?.find(
            (nav) => nav.sourceTableName === selectedTable.name && nav.targetTableName === table.name,
          );
          const hasNavOptions = !!navOption;

          // Get timestamp fields for manual ordering selection
          const timestampFields = table.fields
            .filter((f) => f.dataType === 'Timestamp')
            .map((f) => ({ name: f.name, id: f.id }));

          // Build the navigation option reference
          // For "down" direction: target is child table, source is parent (selectedTable)
          const navigationOptionRef: NavigationOptionRef | undefined = navOption
            ? {
                targetTableName: navOption.targetTableName,
                targetFieldName: navOption.filterFieldName,
                sourceTableName: navOption.sourceTableName,
                sourceFieldName: navOption.sourceFieldName,
                orderingFieldName: navOption.orderingFieldName,
              }
            : undefined; // Will be built when user selects ordering field

          // Base ref info for building navigationOptionRef later
          const baseNavRef = {
            targetTableName: table.name,
            targetFieldName: link.childFieldName,
            sourceTableName: selectedTable.name,
            sourceFieldName: link.parentFieldName,
          };

          options.push({
            tableName: table.name,
            fieldPath: [{ linkName: link.name, tableName: table.name }],
            direction: 'down',
            displayLabel: table.name,
            linkDescription: t('scenarios:monitoring_list_check.linked_down', {
              tableName: table.name,
              selectedTable: selectedTable.name,
            }),
            navigationOptionRef,
            baseNavRef: hasNavOptions ? undefined : baseNavRef,
            timestampFields,
            hasNavigationOptions: hasNavOptions,
            link: hasNavOptions ? undefined : link,
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
        // Add new check
        const newCheck: LinkedObjectCheck = {
          tableName: option.tableName,
          fieldPath: option.fieldPath,
          direction: option.direction,
          enabled: true,
          // "up" direction is always validated, "down" with pre-configured navOptions is also validated
          validated: option.direction === 'up' || option.hasNavigationOptions,
          // Store the navigation option ref for "down" direction
          navigationOptionRef: option.direction === 'down' ? option.navigationOptionRef : undefined,
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

  const handleNavigationFieldChange = (tableName: string, orderingFieldName: string, option: LinkedTableOption) => {
    // Build complete NavigationOptionRef with the selected ordering field
    const navigationOptionRef: NavigationOptionRef | undefined = option.baseNavRef
      ? { ...option.baseNavRef, orderingFieldName }
      : option.navigationOptionRef;

    onLinkedObjectChecksChange(
      linkedObjectChecks.map((check) => {
        if (check.tableName !== tableName) {
          return check;
        }

        return {
          ...check,
          validated: true,
          navigationOptionRef,
          orderingFieldName,
        };
      }),
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
            onNavigationFieldChange={(fieldName) => handleNavigationFieldChange(option.tableName, fieldName, option)}
            onPendingNavigationOptionAdd={onPendingNavigationOptionAdd}
          />
        );
      })}
    </div>
  );
};

type LinkedObjectCheckItemProps = {
  option: LinkedTableOption;
  check: LinkedObjectCheck | undefined;
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
  onNavigationFieldChange: (fieldName: string) => void;
  onPendingNavigationOptionAdd: (pending: PendingNavigationOption) => void;
};

const LinkedObjectCheckItem = ({
  option,
  check,
  isEnabled,
  onToggle,
  onNavigationFieldChange,
  onPendingNavigationOptionAdd,
}: LinkedObjectCheckItemProps) => {
  const { t } = useTranslation(['scenarios']);
  const [selectedFieldName, setSelectedFieldName] = useState(check?.orderingFieldName ?? '');
  const [menuOpen, setMenuOpen] = useState(false);

  const needsNavigationConfig = option.direction === 'down' && !option.hasNavigationOptions;

  const handleFieldChange = (fieldId: string, fieldName: string) => {
    setSelectedFieldName(fieldName);
    setMenuOpen(false);

    // Track pending navigation option to create at save time
    if (option.link) {
      onPendingNavigationOptionAdd({
        tableName: option.tableName,
        tableId: option.link.parentTableId,
        sourceFieldId: option.link.parentFieldId,
        targetTableId: option.link.childTableId,
        filterFieldId: option.link.childFieldId,
        orderingFieldId: fieldId,
      });
    }

    onNavigationFieldChange(fieldName);
  };

  const displayValue = selectedFieldName || t('scenarios:monitoring_list_check.select_field');

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-grey-border p-4">
      {/* Main checkbox */}
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={isEnabled} onCheckedChange={onToggle} />
        <span className="text-s font-medium text-grey-primary">{option.linkDescription}</span>
        <Icon icon={option.direction === 'up' ? 'arrow-up' : 'arrow-down'} className="size-4 text-grey-secondary" />
      </label>

      {/* Navigation config for "down" direction without pre-configured navigationOptions */}
      {isEnabled && needsNavigationConfig && (
        <div className="ml-6 flex items-center gap-2 rounded-md bg-grey-background-light p-3">
          <span className="text-xs text-grey-primary">{t('scenarios:monitoring_list_check.order_by_label')}</span>

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
                    onSelect={() => handleFieldChange(field.id, field.name)}
                  >
                    {field.name}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
      )}
    </div>
  );
};
