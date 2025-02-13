import clsx from 'clsx';
import { type OpenSanctionsCatalogSection } from 'marble-api';
import { diff, toggle } from 'radash';
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, CollapsibleV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';

const FieldCategory = ({
  section,
  selectedIds,
  updateSelectedIds,
}: {
  section: OpenSanctionsCatalogSection;
  selectedIds: string[];
  updateSelectedIds: Dispatch<SetStateAction<string[]>>;
}) => {
  const { t } = useTranslation(['common']);
  const [open, setOpen] = useState(false);

  const defaultListIds = useMemo(
    () => section.datasets.map((dataset) => dataset.name),
    [section.datasets],
  );

  const isAllSelected = useMemo(
    () => diff(defaultListIds, selectedIds).length === 0,
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
          </CollapsibleV2.Title>
          <div className="flex items-center gap-4">
            <span className="text-grey-50 text-xs">
              {t('common:select_all')}
            </span>
            <Checkbox
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
        <CollapsibleV2.Content className="bg-grey-98 w-full p-4">
          <div className="border-grey-90 bg-grey-100 rounded-lg border">
            {section.datasets.map((dataset) => (
              <div key={dataset.name} className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={selectedIds.includes(dataset.name)}
                  onCheckedChange={() => {
                    updateSelectedIds((prev) => toggle(prev, dataset.name));
                  }}
                />
                <span className="text-s">{dataset.title}</span>
              </div>
            ))}
          </div>
        </CollapsibleV2.Content>
      </div>
    </CollapsibleV2.Provider>
  );
};

export const FieldSanction = ({
  name,
  onChange,
  onBlur,
  sections,
  defaultValue,
}: {
  defaultValue?: string[];
  sections: OpenSanctionsCatalogSection[];
  name?: string;
  onChange?: (value: string[]) => void;
  onBlur?: () => void;
}) => {
  const [selectedIds, updateSelectedIds] = useState<string[]>(
    defaultValue ?? [],
  );

  useEffect(() => {
    onChange?.(selectedIds);
  }, [selectedIds, onChange]);

  return (
    <div className="flex flex-col gap-4">
      <input name={name} className="sr-only" tabIndex={-1} onBlur={onBlur} />
      {sections.map((section) => (
        <FieldCategory
          key={section.name}
          section={section}
          selectedIds={selectedIds}
          updateSelectedIds={updateSelectedIds}
        />
      ))}
    </div>
  );
};
