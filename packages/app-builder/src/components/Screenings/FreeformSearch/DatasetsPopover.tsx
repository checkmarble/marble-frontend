import { type ScreeningCategory } from '@app-builder/models/screening';
import { useScreeningDatasetsQuery } from '@app-builder/queries/screening/datasets';
import * as Collapsible from '@radix-ui/react-collapsible';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { ButtonV2, Checkbox, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DatasetTag } from '../DatasetTag';
import { screeningsI18n } from '../screenings-i18n';

export interface DatasetsPopoverProps {
  selectedDatasets: string[];
  onApply: (datasets: string[]) => void;
}

export const DatasetsPopover = ({ selectedDatasets, onApply }: DatasetsPopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const datasetsQuery = useScreeningDatasetsQuery();
  const [open, setOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState<string[]>(selectedDatasets);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset temp selection when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setTempSelected(selectedDatasets);
      setSearchQuery('');
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onApply(tempSelected);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelected(selectedDatasets);
    setOpen(false);
  };

  const toggleDataset = (datasetName: string) => {
    setTempSelected((prev) =>
      prev.includes(datasetName) ? prev.filter((d) => d !== datasetName) : [...prev, datasetName],
    );
  };

  const toggleSection = (section: OpenSanctionsCatalogSection, select: boolean) => {
    const datasetNames = section.datasets.map((d) => d.name);
    setTempSelected((prev) => {
      if (select) {
        return [...new Set([...prev, ...datasetNames])];
      } else {
        return prev.filter((d) => !datasetNames.includes(d));
      }
    });
  };

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!datasetsQuery.data?.datasets.sections) return [];
    if (!searchQuery.trim()) return datasetsQuery.data.datasets.sections;

    const query = searchQuery.toLowerCase();
    return datasetsQuery.data.datasets.sections
      .map((section) => ({
        ...section,
        datasets: section.datasets.filter(
          (dataset) => dataset.title.toLowerCase().includes(query) || dataset.name.toLowerCase().includes(query),
        ),
      }))
      .filter((section) => section.datasets.length > 0);
  }, [datasetsQuery.data?.datasets.sections, searchQuery]);

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={clsx(
            'text-s flex w-full items-center justify-between rounded px-2 py-2',
            selectedDatasets.length > 0
              ? 'bg-purple-background-light text-purple-primary'
              : 'border-grey-border text-grey-secondary bg-surface-card border',
          )}
        >
          <span className="font-medium">{t('screenings:freeform_search.datasets_label')}</span>
          <div className="flex items-center gap-1">
            {selectedDatasets.length > 0 && (
              <span className="bg-surface-card text-grey-primary border-grey-border rounded-full border px-1.5 text-xs font-semibold">
                {selectedDatasets.length}
              </span>
            )}
            <Icon icon="caret-down" className="size-4" />
          </div>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[500px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          {/* Search input */}
          <div className="border-grey-border border-b p-4">
            <Input
              type="text"
              placeholder={t('screenings:freeform_search.datasets_search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Datasets list */}
          <div className="max-h-[300px] overflow-y-auto">
            {match(datasetsQuery)
              .with({ isPending: true }, () => (
                <div className="flex items-center justify-center p-4">
                  <Icon icon="spinner" className="text-grey-placeholder size-5 animate-spin" />
                </div>
              ))
              .with({ isError: true }, () => (
                <div className="flex flex-col items-center gap-2 p-4">
                  <span className="text-s text-grey-placeholder">{t('common:generic_fetch_data_error')}</span>
                  <ButtonV2 variant="secondary" size="small" onClick={() => datasetsQuery.refetch()}>
                    {t('common:retry')}
                  </ButtonV2>
                </div>
              ))
              .otherwise(() =>
                filteredSections.length === 0 ? (
                  <div className="flex items-center justify-center p-4">
                    <span className="text-s text-grey-placeholder">
                      {t('screenings:freeform_search.datasets_no_results')}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {filteredSections.map((section) => (
                      <DatasetSectionCollapsible
                        key={section.name}
                        section={section}
                        selectedDatasets={tempSelected}
                        onToggleDataset={toggleDataset}
                        onToggleSection={toggleSection}
                      />
                    ))}
                  </div>
                ),
              )}
          </div>

          {/* Actions */}
          <div className="border-grey-border flex gap-2 border-t p-4">
            <ButtonV2
              type="button"
              variant="secondary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleCancel}
            >
              {t('common:cancel')}
            </ButtonV2>
            <ButtonV2
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleApply}
            >
              {t('screenings:freeform_search.apply')}
            </ButtonV2>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

interface DatasetSectionCollapsibleProps {
  section: OpenSanctionsCatalogSection;
  selectedDatasets: string[];
  onToggleDataset: (datasetName: string) => void;
  onToggleSection: (section: OpenSanctionsCatalogSection, select: boolean) => void;
}

const DatasetSectionCollapsible = ({
  section,
  selectedDatasets,
  onToggleDataset,
  onToggleSection,
}: DatasetSectionCollapsibleProps) => {
  const { t } = useTranslation(screeningsI18n);
  const selectedCount = section.datasets.filter((d) => selectedDatasets.includes(d.name)).length;
  const isAllSelected = selectedCount === section.datasets.length;
  const isPartiallySelected = selectedCount > 0 && selectedCount < section.datasets.length;

  return (
    <Collapsible.Root className="border-grey-border border-b last:border-b-0">
      <Collapsible.Trigger asChild>
        <button
          type="button"
          className="text-s hover:bg-grey-background-light flex w-full items-center justify-between p-3"
        >
          <div className="flex items-center gap-2">
            <Icon
              icon="caret-down"
              className="size-4 transition-transform duration-200 group-radix-state-open:rotate-180"
            />
            <span className="font-semibold">{section.title}</span>
            {selectedCount > 0 && <span className="text-grey-placeholder text-xs">({selectedCount})</span>}
          </div>
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Checkbox
              size="small"
              checked={isAllSelected ? true : isPartiallySelected ? 'indeterminate' : false}
              onCheckedChange={() => onToggleSection(section, !isAllSelected)}
            />
            <span className="text-xs" onClick={() => onToggleSection(section, !isAllSelected)}>
              {isAllSelected ? t('common:select_none') : t('common:select_all')}
            </span>
          </div>
        </button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="flex flex-col">
          {section.datasets.map((dataset) => (
            <label
              key={dataset.name}
              className={clsx(
                'text-s flex cursor-pointer items-center justify-between px-3 py-2 pl-9',
                'hover:bg-grey-background-light',
              )}
            >
              <div className="flex items-center gap-2">
                <Checkbox
                  size="small"
                  checked={selectedDatasets.includes(dataset.name)}
                  onCheckedChange={() => onToggleDataset(dataset.name)}
                />
                <span>{dataset.title}</span>
              </div>
              {dataset.tag && <DatasetTag category={dataset.tag as ScreeningCategory} />}
            </label>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
