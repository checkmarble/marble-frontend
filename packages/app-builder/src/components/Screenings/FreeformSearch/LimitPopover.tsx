import {
  completeGlobalTopicSelections,
  type GlobalTopicConfig,
  getAvailableGlobalTopicConfigs,
  getCanonicalSelectedKeys,
  isGlobalTopicSwitchSelected,
  ListAndTopicDatasetConfiguration,
  setGlobalTopicSwitch,
  syncSharpDatasets,
} from '@app-builder/components/ListAndTopicConfiguration';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import * as Popover from '@radix-ui/react-popover';
import { useStore } from '@tanstack/react-form';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Switch, Tag, ThresholdRange } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { screeningsI18n } from '../screenings-i18n';
import { useFormManuallSearch } from './FreeformSearchForm';

const LIMIT_OPTIONS = [10, 20, 30, 40, 50] as const;

export const DEFAULT_LIMIT = 10;

export interface LimitPopoverProps {
  selectedDatasets: string[];
  disabled: boolean;
  originalValue: number;
  onApply: (value: number) => void;
  onApplyDatasets: (datasets: string[]) => void;
}

export const LimitPopover = ({
  disabled,
  originalValue,
  onApply,
  onApplyDatasets,
  selectedDatasets,
}: LimitPopoverProps) => {
  const { t } = useTranslation(screeningsI18n);
  const listConfigQuery = useListConfigQuery('manual_search');
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const [open, setOpen] = useState(false);
  const [draftLimit, setDraftLimit] = useState<number | undefined>(undefined);
  const form = useFormManuallSearch();
  const committedLimit = useStore(form.store, (state) => state.values.limit);
  const value = draftLimit ?? committedLimit;
  const tagRef = useRef<HTMLDivElement>(null);

  const listConfig = listConfigQuery.data;
  const availableGlobalTopicConfigs = listConfig ? getAvailableGlobalTopicConfigs(listConfig) : [];
  const includeDeceasedSelected =
    listConfig != null &&
    availableGlobalTopicConfigs.some((config) =>
      isGlobalTopicSwitchSelected(listSharp.value.datasets, config, listConfig),
    );

  const hasCustomValue =
    (committedLimit !== undefined && committedLimit !== DEFAULT_LIMIT) || !!includeDeceasedSelected;

  const handleOpenChange = (isOpen: boolean) => {
    if (disabled) return;
    if (isOpen) {
      setDraftLimit(committedLimit ?? DEFAULT_LIMIT);
      listSharp.update((state) => {
        syncSharpDatasets(state.datasets, selectedDatasets);
        if (listConfig) {
          completeGlobalTopicSelections(state.datasets, listConfig);
        }
      });
    } else {
      setDraftLimit(undefined);
    }
    setOpen(isOpen);
  };

  const handleCancel = () => {
    form.setFieldValue('limit', originalValue);
    listSharp.update((state) => {
      syncSharpDatasets(state.datasets, selectedDatasets);
    });
    setDraftLimit(undefined);
    setOpen(false);
  };

  const handleApply = () => {
    const nextLimit = value ?? DEFAULT_LIMIT;

    if (listConfig) {
      listSharp.update((state) => {
        completeGlobalTopicSelections(state.datasets, listConfig);
      });
      onApplyDatasets(getCanonicalSelectedKeys(listSharp.value.datasets));
    }

    form.setFieldValue('limit', nextLimit);
    onApply(nextLimit);
    setDraftLimit(undefined);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <div className="flex items-center gap-v2-sm cursor-pointer">
          {includeDeceasedSelected && (
            <Tag color={disabled ? 'grey' : 'purple'}>
              <span className="font-medium">{t('screenings:freeform_search.global.liveness')}</span>
            </Tag>
          )}
          {committedLimit !== DEFAULT_LIMIT && (
            <Tag
              color={disabled ? 'grey' : 'purple'}
              className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              ref={tagRef}
            >
              <span className="font-medium">
                {t('screenings:freeform_search.limit_label', { limit: committedLimit })}
              </span>
            </Tag>
          )}
          <span className="flex items-center gap-1 text-grey-placeholder">
            <Icon icon="plus" className="size-4  " />
            {!hasCustomValue && <span>{t('screenings:freeform_search.advanced_filters')}</span>}
          </span>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-surface-card border-grey-border z-50 flex w-[300px] flex-col rounded-lg border shadow-lg"
          sideOffset={4}
          align="start"
        >
          <div className="flex flex-col gap-2 p-4">
            {listConfig &&
              availableGlobalTopicConfigs.map((config) => (
                <GlobalTopicSwitch key={config.groupKey} config={config} listConfig={listConfig} />
              ))}
            <ThresholdRange
              defaultDescription={t('screenings:freeform_search.limit_description')}
              value={value}
              onChange={(nextValue) => setDraftLimit(nextValue)}
              values={LIMIT_OPTIONS.map((option) => ({
                value: option,
                color: 'var(--color-purple-primary)',
              }))}
              initialColor="var(--color-purple-primary)"
              max={LIMIT_OPTIONS.at(-1)}
            />
          </div>
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
            >
              {t('screenings:freeform_search.apply')}
            </Button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

function GlobalTopicSwitch({
  config,
  listConfig,
}: {
  config: GlobalTopicConfig;
  listConfig: NonNullable<ReturnType<typeof useListConfigQuery>['data']>;
}) {
  const listSharp = ListAndTopicDatasetConfiguration.useSharp();
  const { t } = useTranslation(screeningsI18n);
  const switchId = `global-topic-${config.groupKey}`;
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isGlobalTopicSwitchSelected(state.datasets, config, listConfig),
  );

  return (
    <div className="flex items-center gap-v2-sm">
      <Switch
        id={switchId}
        checked={isSelected}
        onCheckedChange={(checked) => {
          listSharp.update((state) => {
            setGlobalTopicSwitch(state.datasets, config, checked, listConfig);
          });
        }}
      />
      <label htmlFor={switchId} className="text-s text-grey-primary cursor-pointer">
        {t(config.label)}
      </label>
    </div>
  );
}
