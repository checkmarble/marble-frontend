import {
  DatasetSelectionContent,
  getSectionLeafNames,
  ListAndTopicDatasetConfiguration,
  makeDatasetsMap,
  useListAndTopicDatasetConfigurationSharp,
} from '@app-builder/components/ListAndTopicConfiguration';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import * as Popover from '@radix-ui/react-popover';
import clsx from 'clsx';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';

export interface DatasetsPopoverProps {
  selectedDatasets: string[];
  onApply: (datasets: string[]) => void;
}

export const DatasetsPopover = ({ selectedDatasets, onApply }: DatasetsPopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const listConfigQuery = useListConfigQuery('manual_search');
  const [open, setOpen] = useState(false);
  const [datasetsMap, setDatasetsMap] = useState<Record<string, boolean>>(() => makeDatasetsMap(selectedDatasets));
  const listSharp = useListAndTopicDatasetConfigurationSharp({ datasets: datasetsMap, mode: 'edit' });

  // Reset temp selection when popover opens
  const handleOpenChange = (isOpen: boolean) => {
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
          className="bg-surface-card border-grey-border z-50 flex w-[min(50vw,700px)] flex-col rounded-lg border shadow-lg max-h-[60vh]"
          sideOffset={4}
          align="start"
        >
          <ListAndTopicDatasetConfiguration.Provider value={listSharp}>
            <DatasetSelectionContent useCase="manual_search" />
          </ListAndTopicDatasetConfiguration.Provider>

          <div className="border-grey-border flex gap-2 border-t p-4">
            <Button
              type="button"
              variant="secondary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleCancel}
            >
              {t('common:cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="default"
              className="flex-1 justify-center"
              onClick={handleApply}
              disabled={!selectableLeafNames}
            >
              {t('screenings:freeform_search.apply')}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
