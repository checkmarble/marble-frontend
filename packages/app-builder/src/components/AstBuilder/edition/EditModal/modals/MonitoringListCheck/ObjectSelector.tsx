import { type DataModel, type TableModel } from '@app-builder/models';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { Radio, RadioGroup, RadioProvider } from '@ariakit/react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ObjectOption = {
  tableName: string;
  path: string[];
  displayLabel: string;
  pathDisplay: string;
  activeMonitorings: ContinuousScreeningConfig[];
};

type ObjectSelectorProps = {
  dataModel: DataModel;
  triggerObjectTable: TableModel;
  screeningConfigs: ContinuousScreeningConfig[];
  currentTableName: string;
  currentPath: string[];
  onChange: (tableName: string, path: string[]) => void;
};

const radioOption = cva(
  'flex cursor-pointer flex-col gap-0.5 rounded-lg border p-3 transition-colors hover:border-purple-primary',
  {
    variants: {
      checked: {
        true: 'border-purple-primary bg-surface-elevated',
        false: 'border-grey-border bg-surface-card',
      },
    },
  },
);

export function ObjectSelector({
  dataModel,
  triggerObjectTable,
  screeningConfigs,
  currentTableName,
  currentPath,
  onChange,
}: ObjectSelectorProps) {
  const { t } = useTranslation(['scenarios']);

  const objectOptions = useMemo(() => {
    const options: ObjectOption[] = [];

    // Helper to get active monitorings for a table
    const getActiveMonitorings = (tableName: string) =>
      screeningConfigs.filter((config) => config.objectTypes.includes(tableName));

    // Add trigger object as first option
    options.push({
      tableName: triggerObjectTable.name,
      path: [],
      displayLabel: triggerObjectTable.name,
      pathDisplay: t('scenarios:monitoring_list_check.path_trigger'),
      activeMonitorings: getActiveMonitorings(triggerObjectTable.name),
    });

    // Add linked tables (pivots) from trigger object
    for (const link of triggerObjectTable.linksToSingle) {
      const linkedTable = dataModel.find((tbl) => tbl.name === link.parentTableName);
      if (linkedTable) {
        options.push({
          tableName: linkedTable.name,
          path: [link.name],
          displayLabel: linkedTable.name,
          pathDisplay: `${triggerObjectTable.name} → ${linkedTable.name}`,
          activeMonitorings: getActiveMonitorings(linkedTable.name),
        });

        // Add second-level links
        for (const nestedLink of linkedTable.linksToSingle) {
          const nestedTable = dataModel.find((tbl) => tbl.name === nestedLink.parentTableName);
          if (nestedTable) {
            options.push({
              tableName: nestedTable.name,
              path: [link.name, nestedLink.name],
              displayLabel: nestedTable.name,
              pathDisplay: `${triggerObjectTable.name} → ${linkedTable.name} → ${nestedTable.name}`,
              activeMonitorings: getActiveMonitorings(nestedTable.name),
            });
          }
        }
      }
    }

    return options;
  }, [dataModel, triggerObjectTable, screeningConfigs, t]);

  const currentValue = useMemo(() => {
    const found = objectOptions.find(
      (opt) => opt.tableName === currentTableName && JSON.stringify(opt.path) === JSON.stringify(currentPath),
    );
    return found ? JSON.stringify({ tableName: found.tableName, path: found.path }) : '';
  }, [objectOptions, currentTableName, currentPath]);

  const handleChange = (value: string | number | null) => {
    if (typeof value !== 'string' || !value) return;
    const parsed = JSON.parse(value) as { tableName: string; path: string[] };
    onChange(parsed.tableName, parsed.path);
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="text-s font-medium text-grey-primary">
        {t('scenarios:monitoring_list_check.object_label')}
      </label>

      <RadioProvider value={currentValue} setValue={handleChange}>
        <RadioGroup className="flex flex-col gap-2">
          {objectOptions.map((option) => {
            const value = JSON.stringify({ tableName: option.tableName, path: option.path });
            const isChecked = currentValue === value;

            return (
              <label key={value} className={clsx(radioOption({ checked: isChecked }))}>
                <Radio name="object" className="hidden" value={value} />
                <div className="flex items-center gap-2">
                  <Icon
                    icon={isChecked ? 'radio-selected' : 'radio-unselected'}
                    className="size-5 text-purple-primary"
                  />
                  <span className="text-s font-medium text-grey-primary">{option.displayLabel}</span>
                  <ActiveMonitoringsTooltip monitorings={option.activeMonitorings} />
                </div>
                <span className="text-xs text-grey-secondary ml-7">{option.pathDisplay}</span>
              </label>
            );
          })}
        </RadioGroup>
      </RadioProvider>
    </div>
  );
}

type ActiveMonitoringsTooltipProps = {
  monitorings: ContinuousScreeningConfig[];
};

function ActiveMonitoringsTooltip({ monitorings }: ActiveMonitoringsTooltipProps) {
  const { t } = useTranslation(['scenarios']);

  if (monitorings.length === 0) {
    return (
      <Tooltip.Default content={t('scenarios:monitoring_list_check.no_active_monitoring')}>
        <Icon icon="tip" className="size-4 text-grey-disabled" />
      </Tooltip.Default>
    );
  }

  const content = (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium">{t('scenarios:monitoring_list_check.active_monitorings')}</span>
      <ul className="list-disc pl-4">
        {monitorings.map((config) => (
          <li key={config.id} className="text-xs">
            {config.name}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <Tooltip.Default content={content}>
      <Icon icon="tip" className="size-4 text-purple-primary" />
    </Tooltip.Default>
  );
}
