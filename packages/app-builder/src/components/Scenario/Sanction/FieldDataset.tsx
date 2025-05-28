import { Callout } from '@app-builder/components/Callout';
import { DatasetTag } from '@app-builder/components/Sanctions/DatasetTag';
import { DatasetTagSelect } from '@app-builder/components/Sanctions/DatasetTagSelect';
import { useEditorMode } from '@app-builder/services/editor/editor-mode';
import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { diff, toggle } from 'radash';
import { type Dispatch, type SetStateAction, useEffect, useMemo, useState } from 'react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { filter, flatMap, map, pipe, unique } from 'remeda';
import { Checkbox, cn, CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

const FieldCategory = memo(function FieldCategory({
  section,
  selectedIds,
  selectedTags,
  updateSelectedIds,
}: {
  section: OpenSanctionsCatalogSection;
  selectedIds: string[];
  selectedTags: string[];
  updateSelectedIds: Dispatch<SetStateAction<string[]>>;
}) {
  const { t } = useTranslation(['common', 'scenarios']);
  const [open, setOpen] = useState(false);
  const editor = useEditorMode();

  const defaultListIds = useMemo(
    () => section.datasets.map((dataset) => dataset.name),
    [section.datasets],
  );

  const isAllSelected = useMemo(
    () => diff(defaultListIds, selectedIds).length === 0,
    [selectedIds, defaultListIds],
  );

  const nbSelected = useMemo(
    () => selectedIds.filter((id) => defaultListIds.includes(id)).length,
    [selectedIds, defaultListIds],
  );

  return (
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
            {!isAllSelected && nbSelected ? (
              <span className="text-s text-purple-65 font-semibold">
                {t('scenarios:sanction.lists.nb_selected', {
                  count: nbSelected,
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
                    ? diff(defaultListIds, result)
                    : defaultListIds.filter((id) => result.includes(id));
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
            {section.datasets.map((dataset) => {
              const shouldShow =
                selectedTags.includes(dataset.name) ||
                selectedTags.length === 0 ||
                selectedTags.includes(dataset.tag ?? '');

              return shouldShow ? (
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
              ) : null;
            })}
          </div>
        </CollapsibleV2.Content>
      </div>
    </CollapsibleV2.Provider>
  );
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
  const { t } = useTranslation();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const tags = useMemo(
    () =>
      pipe(
        sections,
        flatMap((s) => s.datasets),
        map((d) => d.tag),
        filter((t) => t !== undefined),
        unique(),
      ),
    [sections],
  );

  useEffect(() => {
    onChange?.(selectedIds);
  }, [selectedIds, onChange]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-s font-medium">{t('scenarios:sanction.lists.title')}</span>
        <DatasetTagSelect
          tags={tags}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />
      </div>
      <div className="bg-grey-100 border-grey-90 flex flex-col gap-2 rounded border p-6">
        <Callout variant="outlined" className="mb-4 lg:mb-6">
          <p className="whitespace-pre text-wrap">{t('scenarios:sanction.lists.callout')}</p>
        </Callout>
        <div onBlur={onBlur} className="flex flex-col gap-4">
          {sections.map((section) => (
            <FieldCategory
              key={section.name}
              section={section}
              selectedTags={selectedTags}
              selectedIds={selectedIds}
              updateSelectedIds={updateSelectedIds}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
