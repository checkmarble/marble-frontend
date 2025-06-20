import { Callout } from '@app-builder/components/Callout';
import { DatasetTag } from '@app-builder/components/Sanctions/DatasetTag';
import { type ScreeningCategory } from '@app-builder/models/sanction-check';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import clsx from 'clsx';
import Fuse from 'fuse.js';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { diff, toggle } from 'radash';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { concat, intersection, map, pipe, unique } from 'remeda';
import { Checkbox, cn, CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type DatasetFiltersForm, FieldDatasetFilters } from './FieldDatasetFilters';

const FieldCategory = memo(function FieldCategory({
  section,
  selectedIds,
  filters,
  updateSelectedIds,
}: {
  section: OpenSanctionsCatalogSection;
  selectedIds: string[];
  filters: DatasetFiltersForm;
  updateSelectedIds: Dispatch<SetStateAction<string[]>>;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);
  const editor = useEditorMode();

  const sectionDatasetIds = useMemo(
    () => section.datasets.map((dataset) => dataset.name),
    [section.datasets],
  );

  const selectedDatasetIds = useMemo(
    () => intersection(sectionDatasetIds, selectedIds),
    [sectionDatasetIds, selectedIds],
  );

  const datasetIdsToShow = useMemo(
    () =>
      pipe(
        section.datasets,
        // We filter the datasets by user search if any
        (datasets) =>
          filters.search !== ''
            ? new Fuse(datasets, {
                keys: ['title'],
                minMatchCharLength: 3,
                threshold: 0.2,
              })
                .search(filters.search)
                .map((i) => i.item)
            : datasets,
        // We filter the resulted datasets by selected tags if any
        (datasets) =>
          filters.tags.length > 0
            ? datasets.filter((d) => d.tag && filters.tags.includes(d.tag))
            : datasets,
        // We get only the ids
        map((d) => d.name),
        // We don't forget to add the selected dataset ids
        concat(selectedDatasetIds),
        // Convenience
        unique(),
      ),
    [filters, section, selectedDatasetIds],
  );

  const isAllSelected = useMemo(
    () => diff(datasetIdsToShow, selectedDatasetIds).length === 0,
    [datasetIdsToShow, selectedDatasetIds],
  );

  return datasetIdsToShow.length > 0 ? (
    <CollapsibleV2.Provider defaultOpen={open}>
      <div key={section.name} className="w-full overflow-hidden rounded-lg">
        <div className="bg-grey-98 flex w-full items-center justify-between p-4">
          <CollapsibleV2.Title
            onClick={() => setOpen(!open)}
            className="flex flex-row items-center gap-2"
          >
            <Icon
              icon="arrow-right"
              className={clsx('size-5', {
                'rotate-90': open,
              })}
            />
            <span className="text-s font-semibold">{section.title}</span>
          </CollapsibleV2.Title>
          <div className="flex items-center gap-4">
            <span className="text-grey-50 text-xs">
              {!isAllSelected && selectedDatasetIds.length > 0
                ? t('scenarios:sanction.lists.nb_selected', {
                    count: selectedDatasetIds.length,
                  })
                : t('common:select_all')}
            </span>
            <Checkbox
              disabled={editor === 'view'}
              size="small"
              checked={
                isAllSelected ? true : selectedDatasetIds.length > 0 ? 'indeterminate' : false
              }
              onCheckedChange={(state) => {
                updateSelectedIds((prev) => {
                  let result: string[] = [...prev];
                  const idsToToggle = state
                    ? diff(datasetIdsToShow, result)
                    : datasetIdsToShow.filter((id) => result.includes(id));
                  for (const id of idsToToggle) {
                    result = toggle(result, id);
                  }
                  return result;
                });
              }}
            />
          </div>
        </div>
        <CollapsibleV2.Content className="bg-grey-98 w-full p-2">
          <div
            className={cn('rounded-lg', {
              'border-grey-90 bg-grey-100 border': section.datasets.length > 0,
            })}
          >
            {section.datasets
              .filter((d) => datasetIdsToShow.includes(d.name))
              .map((dataset) => (
                <label
                  key={dataset.name}
                  className="hover:bg-grey-98 flex cursor-pointer items-center justify-between p-2 transition-colors"
                >
                  <div id={dataset.name} className="flex items-center gap-2">
                    <Checkbox
                      disabled={editor === 'view'}
                      size="small"
                      checked={selectedIds.includes(dataset.name)}
                      onCheckedChange={() => {
                        updateSelectedIds((prev) => toggle(prev, dataset.name));
                      }}
                    />
                    <span className="text-s">{dataset.title}</span>
                  </div>
                  {dataset.tag ? <DatasetTag category={dataset.tag as ScreeningCategory} /> : null}
                </label>
              ))}
          </div>
        </CollapsibleV2.Content>
      </div>
    </CollapsibleV2.Provider>
  ) : null;
});

export const FieldDataset = ({
  onChange,
  onBlur,
  sections,
  defaultValue,
}: {
  defaultValue?: string[];
  sections: OpenSanctionsCatalogSection[];
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}) => {
  const [selectedIds, updateSelectedIds] = useState<string[]>(defaultValue ?? []);
  const [filters, setFilters] = useState<DatasetFiltersForm>({ tags: [], search: '' });
  const { t } = useTranslation();

  useEffect(() => {
    onChange?.(selectedIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-s font-semibold">{t('scenarios:sanction.lists.title')}</span>
      <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded border p-4">
        <Callout variant="outlined">
          <p className="whitespace-pre text-wrap">{t('scenarios:sanction.lists.callout')}</p>
        </Callout>
        <FieldDatasetFilters sections={sections} filters={filters} setFilters={setFilters} />
        <div onBlur={onBlur} className="flex flex-col gap-4">
          {sections.map((section) => (
            <FieldCategory
              key={section.name}
              section={section}
              filters={filters}
              selectedIds={selectedIds}
              updateSelectedIds={updateSelectedIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
