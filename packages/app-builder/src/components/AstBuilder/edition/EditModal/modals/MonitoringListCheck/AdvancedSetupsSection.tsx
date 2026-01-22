import { type DataModel, type TableModel } from '@app-builder/models';
import { type LinkedObjectCheck, type NavigationIndex } from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';

type LinkedTableOption = {
  tableName: string;
  fieldPath: string[];
  direction: 'up' | 'down';
  displayLabel: string;
  linkDescription: string;
  /** For 'down' direction: available fields for ordering */
  orderableFields?: { name: string; id: string }[];
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
          fieldPath: [link.name],
          direction: 'up',
          displayLabel: link.parentTableName,
          linkDescription: t('scenarios:monitoring_list_check.linked_up', {
            tableName: link.parentTableName,
            selectedTable: selectedTable.name,
          }),
        });
      }
    }

    // "Down" direction: child tables (tables that have links pointing to selectedTable)
    for (const table of dataModel) {
      if (table.name === selectedTable.name) continue;

      for (const link of table.linksToSingle) {
        if (link.parentTableName === selectedTable.name && monitoredTableNames.has(table.name)) {
          // Get orderable fields for this table (timestamp/numeric fields)
          const orderableFields = table.fields
            .filter((f) => f.dataType === 'Timestamp' || f.dataType === 'Int' || f.dataType === 'Float')
            .map((f) => ({ name: f.name, id: f.id }));

          options.push({
            tableName: table.name,
            fieldPath: [link.name],
            direction: 'down',
            displayLabel: table.name,
            linkDescription: t('scenarios:monitoring_list_check.linked_down', {
              tableName: table.name,
              selectedTable: selectedTable.name,
            }),
            orderableFields,
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
        // Add new
        const newCheck: LinkedObjectCheck = {
          tableName: option.tableName,
          fieldPath: option.fieldPath,
          direction: option.direction,
          enabled: true,
          validated: option.direction === 'up', // Up direction doesn't need validation
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

  const handleNavigationIndexChange = (tableName: string, navigationIndex: NavigationIndex) => {
    onLinkedObjectChecksChange(
      linkedObjectChecks.map((c) => (c.tableName === tableName ? { ...c, navigationIndex, validated: false } : c)),
    );
  };

  const handleValidateConfig = (tableName: string) => {
    onLinkedObjectChecksChange(
      linkedObjectChecks.map((c) => (c.tableName === tableName ? { ...c, validated: true } : c)),
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
            onNavigationIndexChange={(navIndex) => handleNavigationIndexChange(option.tableName, navIndex)}
            onValidate={() => handleValidateConfig(option.tableName)}
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
  onNavigationIndexChange: (navigationIndex: NavigationIndex) => void;
  onValidate: () => void;
};

function LinkedObjectCheckItem({
  option,
  check,
  isEnabled,
  onToggle,
  onNavigationIndexChange,
  onValidate,
}: LinkedObjectCheckItemProps) {
  const { t } = useTranslation(['scenarios']);
  const [selectedFieldName, setSelectedFieldName] = useState(check?.navigationIndex?.fieldName ?? '');
  const [selectedOrder, setSelectedOrder] = useState<'asc' | 'desc'>(check?.navigationIndex?.order ?? 'desc');

  const needsNavigationConfig = option.direction === 'down';
  const isValidated = check?.validated ?? false;
  const hasNavigationConfig = !!check?.navigationIndex?.fieldName;

  const handleFieldChange = (fieldName: string) => {
    setSelectedFieldName(fieldName);
    onNavigationIndexChange({ fieldName, order: selectedOrder });
  };

  const handleOrderChange = (order: 'asc' | 'desc') => {
    setSelectedOrder(order);
    if (selectedFieldName) {
      onNavigationIndexChange({ fieldName: selectedFieldName, order });
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-grey-border p-4">
      {/* Main checkbox */}
      <label className="flex cursor-pointer items-center gap-2">
        <Checkbox checked={isEnabled} onCheckedChange={onToggle} />
        <span className="text-s font-medium text-grey-primary">{option.linkDescription}</span>
        {option.direction === 'up' && <Icon icon="arrow-up" className="size-4 text-grey-secondary" />}
        {option.direction === 'down' && <Icon icon="arrow-down" className="size-4 text-grey-secondary" />}
      </label>

      {/* Navigation config for "down" direction */}
      {isEnabled && needsNavigationConfig && (
        <div className="ml-6 flex flex-col gap-3 rounded-md bg-grey-background-light p-3">
          <div className="text-xs font-medium text-grey-secondary">
            {t('scenarios:monitoring_list_check.preliminary_config')}
          </div>

          <div className="flex items-center gap-2 text-xs text-grey-primary">
            <span>{t('scenarios:monitoring_list_check.allow_explore_prefix')}</span>
            <span className="rounded bg-purple-background-light px-1 py-0.5 text-purple-primary">
              {option.tableName}
            </span>
            <span>{t('scenarios:monitoring_list_check.allow_explore_suffix')}</span>
          </div>

          <div className="flex items-center gap-2">
            <Select.Root value={selectedFieldName} onValueChange={handleFieldChange}>
              <Select.Trigger className="w-48">
                <Select.Value placeholder={t('scenarios:monitoring_list_check.select_field')} />
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport>
                  {option.orderableFields?.map((field) => (
                    <Select.Item key={field.id} value={field.name}>
                      {field.name}
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>

            <Select.Root value={selectedOrder} onValueChange={(v) => handleOrderChange(v as 'asc' | 'desc')}>
              <Select.Trigger className="w-32">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Viewport>
                  <Select.Item value="desc">{t('scenarios:monitoring_list_check.order_desc')}</Select.Item>
                  <Select.Item value="asc">{t('scenarios:monitoring_list_check.order_asc')}</Select.Item>
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>

          <div className="flex items-center justify-between">
            {isValidated ? (
              <div className="flex items-center gap-1 text-xs text-green-primary">
                <Icon icon="tick" className="size-4" />
                {t('scenarios:monitoring_list_check.config_validated')}
              </div>
            ) : (
              <div className="text-xs text-grey-secondary">
                {hasNavigationConfig
                  ? t('scenarios:monitoring_list_check.config_not_validated')
                  : t('scenarios:monitoring_list_check.config_required')}
              </div>
            )}

            <Button variant="secondary" size="small" disabled={!hasNavigationConfig} onClick={onValidate}>
              {t('scenarios:monitoring_list_check.validate_config')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
