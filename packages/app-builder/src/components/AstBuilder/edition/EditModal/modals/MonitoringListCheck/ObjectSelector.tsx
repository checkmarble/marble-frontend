import { type DataModel, type TableModel } from '@app-builder/models';
import { type ObjectPathSegment } from '@app-builder/models/astNode/monitoring-list-check';
import { type ContinuousScreeningConfig } from '@app-builder/models/continuous-screening';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Radio, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';

type ObjectOption = {
  tableName: string;
  path: ObjectPathSegment[];
  displayLabel: string;
  pathSegments: string[];
  activeMonitorings: ContinuousScreeningConfig[];
};

type ObjectSelectorProps = {
  dataModel: DataModel;
  triggerObjectTable: TableModel;
  screeningConfigs: ContinuousScreeningConfig[];
  currentTableName: string;
  currentPath: ObjectPathSegment[];
  onChange: (tableName: string, path: ObjectPathSegment[]) => void;
};

export const ObjectSelector = ({
  dataModel,
  triggerObjectTable,
  screeningConfigs,
  currentTableName,
  currentPath,
  onChange,
}: ObjectSelectorProps) => {
  const { t } = useTranslation(['scenarios']);

  const objectOptions = useMemo(() => {
    const options: ObjectOption[] = [];
    const visited = new Set<string>();

    const getActiveMonitorings = (tableName: string) =>
      screeningConfigs.filter((config) => config.objectTypes.includes(tableName));

    // BFS to traverse all reachable tables via linksToSingle
    const queue: { table: TableModel; path: ObjectPathSegment[]; pathSegments: string[] }[] = [
      { table: triggerObjectTable, path: [], pathSegments: [triggerObjectTable.name] },
    ];

    while (queue.length > 0) {
      const { table, path, pathSegments } = queue.shift()!;

      // Add this table as an option
      options.push({
        tableName: table.name,
        path,
        displayLabel: table.name,
        pathSegments,
        activeMonitorings: getActiveMonitorings(table.name),
      });

      // Add all linked parent tables to the queue
      for (const link of table.linksToSingle) {
        // Track by tableName + linkName to allow different paths to the same table
        // while preventing cycles through the same link
        const visitKey = `${table.name}→${link.name}`;
        if (visited.has(visitKey)) continue;
        visited.add(visitKey);

        const linkedTable = dataModel.find((tbl) => tbl.name === link.parentTableName);
        if (linkedTable) {
          queue.push({
            table: linkedTable,
            path: [...path, { linkName: link.name, tableName: linkedTable.name }],
            pathSegments: [...pathSegments, linkedTable.name],
          });
        }
      }
    }

    // Only return options that have active monitoring
    return options.filter((option) => option.activeMonitorings.length > 0);
  }, [dataModel, triggerObjectTable, screeningConfigs]);

  const currentValue = useMemo(() => {
    const index = objectOptions.findIndex(
      (opt) =>
        opt.tableName === currentTableName &&
        opt.path.length === currentPath.length &&
        opt.path.every((seg, i) => seg.linkName === currentPath[i]?.linkName),
    );
    return index >= 0 ? String(index) : '';
  }, [objectOptions, currentTableName, currentPath]);

  const handleChange = (value: string) => {
    const option = objectOptions[Number(value)];
    if (!option) return;
    onChange(option.tableName, option.path);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-s text-grey-primary">{t('scenarios:monitoring_list_check.object_label')}</label>

      <Radio.Root value={currentValue} onValueChange={handleChange} className="flex flex-col gap-4">
        {objectOptions.map((option, index) => {
          const value = String(index);

          return (
            <label key={value} className="flex cursor-pointer items-center gap-4">
              <Radio.Item value={value} />

              <div className="flex flex-col gap-0.5">
                {/* Table name + info icon */}
                <div className="flex items-center gap-1">
                  <span className="text-s font-medium text-grey-primary">{option.displayLabel}</span>
                  <ActiveMonitoringsTooltip monitorings={option.activeMonitorings} />
                </div>

                {/* Path breadcrumb */}
                <PathBreadcrumb segments={option.pathSegments} />
              </div>
            </label>
          );
        })}
      </Radio.Root>
    </div>
  );
};

type PathBreadcrumbProps = {
  segments: string[];
};

const PathBreadcrumb = ({ segments }: PathBreadcrumbProps) => {
  if (segments.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {segments.map((segment, index) => (
        <span key={index} className="flex items-center gap-1">
          <span className="text-xs text-grey-secondary">{segment}</span>
          {index < segments.length - 1 && <Icon icon="arrow-right" className="size-4 text-grey-secondary" />}
        </span>
      ))}
    </div>
  );
};

type ActiveMonitoringsTooltipProps = {
  monitorings: ContinuousScreeningConfig[];
};

const ActiveMonitoringsTooltip = ({ monitorings }: ActiveMonitoringsTooltipProps) => {
  const { t } = useTranslation(['scenarios']);

  if (monitorings.length === 0) {
    return (
      <Tooltip.Default
        content={t('scenarios:monitoring_list_check.no_active_monitoring')}
        className="border border-grey-border"
      >
        <Icon icon="tip" className="size-5 text-grey-disabled" />
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
    <Tooltip.Default content={content} className="border border-grey-border">
      <Icon icon="tip" className="size-5 text-purple-primary" />
    </Tooltip.Default>
  );
};
