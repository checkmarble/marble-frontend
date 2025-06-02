import { Callout } from '@app-builder/components/Callout';
import { DatasetTag } from '@app-builder/components/Sanctions/DatasetTag';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { matchSorter } from 'match-sorter';
import { diff, toggle, unique } from 'radash';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { concat, intersection } from 'remeda';
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

  // This is the list of all section's dataset ids
  const sectionDatasetIds = useMemo(
    () => section.datasets.map((dataset) => dataset.name),
    [section.datasets],
  );

  // This is the list of all selected section's dataset ids
  const selectedDatasetIds = useMemo(
    () => intersection(sectionDatasetIds, selectedIds),
    [sectionDatasetIds, selectedIds],
  );

  // This is the list of all section's dataset ids that should be shown
  const datasetIdsToShow = useMemo(() => {
    let result: string[] = [];

    if (filters.search === '' && filters.tags.length === 0) {
      return sectionDatasetIds;
    }

    if (filters.search !== '') {
      result = matchSorter(section.datasets, filters.search, {
        keys: ['title'],
      }).map((d) => d.name);
    }

    if (filters.tags.length > 0) {
      result = concat(
        result,
        section.datasets.filter((d) => d.tag && filters.tags.includes(d.tag)).map((d) => d.name),
      );
    }

    return unique(concat(result, selectedDatasetIds));
  }, [filters, section, selectedDatasetIds, sectionDatasetIds]);

  const isAllSelected = useMemo(
    () => selectedDatasetIds.length === sectionDatasetIds.length,
    [selectedDatasetIds, sectionDatasetIds],
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
            {!isAllSelected && selectedDatasetIds.length > 0 ? (
              <span className="text-s text-grey-50 font-semibold">
                {t('scenarios:sanction.lists.nb_selected', {
                  count: selectedDatasetIds.length,
                })}
              </span>
            ) : null}
          </CollapsibleV2.Title>
          <div className="flex items-center gap-4">
            <span className="text-grey-50 text-xs">{t('common:select_all')}</span>
            <Checkbox
              disabled={editor === 'view'}
              size="small"
              checked={isAllSelected}
              onCheckedChange={(state) => {
                updateSelectedIds((prev) => {
                  let result: string[] = [...prev];
                  const idsToToggle = state
                    ? diff(sectionDatasetIds, result)
                    : sectionDatasetIds.filter((id) => result.includes(id));
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
                  {dataset.tag ? <DatasetTag tag={dataset.tag} /> : null}
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
      <span className="text-s font-medium">{t('scenarios:sanction.lists.title')}</span>
      <div className="bg-grey-100 border-grey-90 flex flex-col gap-4 rounded border p-6">
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
