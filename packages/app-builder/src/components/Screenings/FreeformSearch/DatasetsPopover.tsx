import {
  DatasetSelectionContent,
  getCanonicalSelectedKeys,
  getSectionLeafKeys,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
  syncSharpDatasets,
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
  global: 'global',
};

export interface DatasetsPopoverProps {
  selectedDatasets: string[];
  onApply: (datasets: string[]) => void;
  disabled: boolean;
}

export const DatasetsPopover = ({ selectedDatasets, onApply, disabled }: DatasetsPopoverProps) => {
  const { t } = useTranslation([...screeningsI18n, 'scenarios']);
  const listConfigQuery = useListConfigQuery('manual_search');
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const [open, setOpen] = useState(false);
  const tagRef = useRef<HTMLDivElement>(null);

  const handleOpenChange = (isOpen: boolean) => {
    if (disabled) return;
    if (isOpen) {
      listSharp.update((state) => {
        syncSharpDatasets(state.datasets, selectedDatasets);
      });
    }
    setOpen(isOpen);
  };

  const handleApply = () => {
    onApply(getCanonicalSelectedKeys(listSharp.value.datasets));
    setOpen(false);
  };

  const handleCancel = () => {
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
    setOpen(false);
  };

  const hasSelection = selectedDatasets.filter((d) => !d.startsWith('global')).length > 0;

  const selectionMap = useMemo(() => makeDatasetsMap(selectedDatasets), [selectedDatasets]);

  const sectionTags = useMemo(() => {
    const data = listConfigQuery.data;
    if (!data || !hasSelection) return [];
    return Object.entries(data)
      .filter(([key]) => key !== 'global')
      .flatMap(([key, section]) => {
        if (!section) return [];
        const sectionKey = key as ScreeningCategory;
        const isSectionEnabled = !!selectionMap[sectionKey];
        const count = getSectionLeafKeys(section, sectionKey).filter((k) => selectionMap[k]).length;
        if (!isSectionEnabled && count === 0) return [];
        return [{ key: sectionKey, count, isEmpty: isSectionEnabled && count === 0 }];
      });
  }, [listConfigQuery.data, selectionMap, hasSelection]);

  return (
    <div className="flex items-center gap-2 relative">
      <MenuCommand.Menu open={open} onOpenChange={handleOpenChange}>
        <MenuCommand.Trigger>
          <div className="flex items-center gap-2 flex-wrap" ref={tagRef}>
            {hasSelection ? (
              <>
                {sectionTags.map(({ key, count, isEmpty }) => (
                  <Tag
                    key={key}
                    color={disabled ? 'grey' : 'purple'}
                    className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-medium capitalize">
                      {t(`scenarios:sanction.lists.${SECTION_I18N_KEYS[key]}`)}
                      {isEmpty ? ` (${t('scenarios:sanction.lists.no_lists_selected')})` : ` (${count})`}
                    </span>
                  </Tag>
                ))}
                <Icon icon="plus" className="size-4 text-grey-secondary" />
              </>
            ) : (
              <span className="flex items-center gap-1 text-grey-placeholder cursor-pointer">
                <Icon icon="plus" className="size-4  " />
                <span>{t('screenings:freeform_search.filter_by_list')}</span>
              </span>
            )}
          </div>
        </MenuCommand.Trigger>
        <MenuCommand.Content align="start" sideOffset={4} className="w-[280px]">
          <DatasetSelectionContent useCase="manual_search" onApply={handleApply} onCancel={handleCancel} />
        </MenuCommand.Content>
      </MenuCommand.Menu>
    </div>
  );
};
