import {
  DatasetSelectionContent,
  getSectionLeafNames,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
} from '@app-builder/components/ListAndTopicConfiguration';
import { type ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';

const SECTION_I18N_KEYS: Record<ScreeningCategory, string> = {
  sanctions: 'sanctions',
  peps: 'peps',
  'adverse-media': 'adverse_media',
  'third-parties': 'third_parties',
};

export interface DatasetsPopoverProps {
  selectedDatasets: string[];
  onApply: (datasets: string[]) => void;
  disabled: boolean;
}

export const DatasetsPopover = ({ selectedDatasets, onApply, disabled }: DatasetsPopoverProps) => {
  const { t } = useTranslation([...screeningsI18n, 'scenarios']);
  const listConfigQuery = useListConfigQuery('manual_search');
  const [open, setOpen] = useState(false);
  const [datasetsMap, setDatasetsMap] = useState<Record<string, boolean>>(() => makeDatasetsMap(selectedDatasets));
  const listSharp = ListAndTopicDatasetConfiguration.createSharp({
    datasets: datasetsMap,
    mode: 'edit',
    variant: 'popover',
  });
  const tagRef = useRef<HTMLDivElement>(null);

  // Reset temp selection when popover opens
  const handleOpenChange = (isOpen: boolean) => {
    if (disabled) return;
    if (isOpen) {
      setDatasetsMap(makeDatasetsMap(selectedDatasets));
    }
    setOpen(isOpen);
  };

  const selectableLeafNames = useMemo(() => {
    const data = listConfigQuery.data;
    if (!data) return undefined;
    return Object.values(data).flatMap((section) => (section ? getSectionLeafNames(section) : []));
  }, [listConfigQuery.data]);

  const handleApply = () => {
    if (!selectableLeafNames) {
      setOpen(false);
      return;
    }
    const map = listSharp.value.datasets;
    const next = selectableLeafNames?.filter((name) => !!map[name]);
    onApply(next);
    setOpen(false);
  };

  const handleCancel = () => {
    setDatasetsMap(makeDatasetsMap(selectedDatasets));
    setOpen(false);
  };

  const hasSelection = selectedDatasets.length > 0;

  const sectionTags = useMemo(() => {
    const data = listConfigQuery.data;
    if (!data || !hasSelection) return [];
    const selectedSet = new Set(selectedDatasets);
    return Object.entries(data).flatMap(([key, section]) => {
      if (!section) return [];
      const count = getSectionLeafNames(section).filter((n) => selectedSet.has(n)).length;
      if (count === 0) return [];
      return [{ key: key as ScreeningCategory, count }];
    });
  }, [listConfigQuery.data, selectedDatasets, hasSelection]);

  return (
    <div className="flex items-center gap-2 relative">
      <MenuCommand.Menu open={open} onOpenChange={handleOpenChange}>
        <MenuCommand.Trigger>
          <div className="flex items-center gap-2 flex-wrap" ref={tagRef}>
            {hasSelection ? (
              <>
                {sectionTags.map(({ key, count }) => (
                  <Tag
                    key={key}
                    color={disabled ? 'grey' : 'purple'}
                    className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium capitalize">
                      {t(`scenarios:sanction.lists.${SECTION_I18N_KEYS[key]}`)}
                      {count > 1 ? ` (${count})` : ''}
                    </span>
                  </Tag>
                ))}
                <Icon icon="plus" className="size-4 text-grey-secondary" />
              </>
            ) : (
              <Tag
                color={disabled ? 'grey' : 'purple'}
                className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium">{t('screenings:freeform_search.filter_by_list')}</span>
                <Icon icon="plus" className="size-4" />
              </Tag>
            )}
          </div>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="start" sideOffset={4} className="w-[280px]">
          <ListAndTopicDatasetConfiguration.Provider value={listSharp}>
            <DatasetSelectionContent useCase="manual_search" onApply={handleApply} onCancel={handleCancel} />
          </ListAndTopicDatasetConfiguration.Provider>
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
