import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { type AvailableFeatures, type ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { UseQueryResult } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'remeda';
import { match } from 'ts-pattern';
import {
  Button,
  Checkbox,
  type CheckedState,
  Collapsible,
  cn,
  ExpandableGroupTagLine,
  Input,
  MenuCommand,
  Popover,
  ScrollAreaV2,
  Switch,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ListAndTopicDatasetConfiguration } from './context/ListAndTopicDatasetConfiguration';
import {
  clearSectionSelections,
  isDatasetKeySelected,
  isTopicKeySelected,
  setDatasetKey,
  setTopicKey,
} from './dataset-selection-provider-utils';
import {
  formatDatasetTitle,
  formatTopicLabel,
  getDatasetNames,
  getSectionLeafNames,
  getSpecialTopicLabel,
  getSpecialTopicValue,
  isGlobalTopic,
  isSpecialTopic,
  sortTopicGroupEntries,
  type TopicItem,
} from './dataset-utils';

type ListConfig = NonNullable<Awaited<ReturnType<typeof useListConfigQuery>>['data']>;
type SectionData = NonNullable<ListConfig[keyof ListConfig]>;

function groupCheckState(names: string[], datasetsMap: Record<string, boolean>): CheckedState {
  if (names.length === 0) return false;
  const selected = names.filter((n) => datasetsMap[n]).length;
  if (selected === 0) return false;
  if (selected === names.length) return true;
  return 'indeterminate';
}

type DatasetSelectionContentProps = {
  useCase: AvailableFeatures;
  onApply?: () => void;
  onCancel?: () => void;
};

export function DatasetSelectionContent({ useCase, onApply, onCancel }: DatasetSelectionContentProps) {
  const listConfigQuery = useListConfigQuery(useCase);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const { t } = useTranslation(['common', 'continuousScreening', 'screenings']);
  const [activeSectionKey, setActiveSectionKey] = useState<ScreeningCategory | null>(null);

  const renderSections = (data: ListConfig) => {
    const sections = Object.entries(data).filter(([, section]) => section?.datasets?.length || section?.topics);

    return match(variant)
      .with('default', () => (
        <div className="flex flex-col">
          {sections.map(([key, section]) =>
            section ? <Section key={key} sectionKey={key as ScreeningCategory} section={section} /> : null,
          )}
        </div>
      ))
      .with('popover', () => {
        const activeSection = activeSectionKey ? data[activeSectionKey] : null;
        return (
          <Popover.Root
            open={!!activeSectionKey}
            onOpenChange={(open) => {
              if (!open) setActiveSectionKey(null);
            }}
          >
            <Popover.Anchor asChild>
              <div className="flex flex-col">
                {sections.map(([key, section]) =>
                  section ? (
                    <Section
                      key={key}
                      sectionKey={key as ScreeningCategory}
                      section={section}
                      isActive={activeSectionKey === key}
                      onSelect={() => setActiveSectionKey(key as ScreeningCategory)}
                    />
                  ) : null,
                )}
              </div>
            </Popover.Anchor>
            {activeSectionKey && activeSection && (
              <Popover.Content
                side="right"
                align="start"
                sideOffset={24}
                alignOffset={-18}
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="w-fit min-w-[500px] max-w-[60vw] p-0 overflow-hidden flex flex-col"
              >
                <SectionPanel
                  sectionKey={activeSectionKey}
                  section={activeSection}
                  onApply={onApply}
                  onCancel={() => {
                    setActiveSectionKey(null);
                    onCancel?.();
                  }}
                />
              </Popover.Content>
            )}
          </Popover.Root>
        );
      })
      .exhaustive();
  };

  return (
    <>
      {variant === 'default' && (
        <div className="border-b border-grey-border p-v2-md flex justify-between items-center">
          <span className="text-s font-semibold">{t('continuousScreening:creation.datasetSelection.list.title')}</span>
          <SelectedListsCount listConfigQuery={listConfigQuery} />
        </div>
      )}
      <ScrollAreaV2 className="p-v2-md" orientation="vertical">
        {match(listConfigQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center h-50">
              <Spinner className="size-10" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="flex flex-col gap-v2-md items-center justify-center h-50">
              <div className="">{t('common:generic_fetch_data_error')}</div>
              <Button variant="secondary" onClick={() => listConfigQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </div>
          ))
          .with({ isSuccess: true }, ({ data }) => (data ? renderSections(data) : null))
          .exhaustive()}
      </ScrollAreaV2>
    </>
  );
}

const SelectedListsCount = ({ listConfigQuery }: { listConfigQuery: UseQueryResult<ListConfig, Error> }) => {
  const { t } = useTranslation(['continuousScreening']);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const sectionCount = Object.keys(listConfigQuery.data ?? {}).filter((k) => !!datasets[k]).length;
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: sectionCount })}</span>;
};

type SectionProps = {
  sectionKey: ScreeningCategory;
  section: SectionData;
  isActive?: boolean;
  onSelect?: () => void;
};

const Section = ({ sectionKey, section, isActive, onSelect }: SectionProps) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const { t } = useTranslation(['common', 'continuousScreening', 'scenarios', 'screenings']);

  const datasetNames = getDatasetNames(section);
  const isEnabled = ListAndTopicDatasetConfiguration.select((state) => !!state.datasets[sectionKey]);
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => datasetNames.filter((n) => state.datasets[n]).length,
  );

  return match(variant)
    .with('default', () => (
      <Collapsible.Container className="border-none px-v2-md py-v2-sm h-fit" defaultOpen={false}>
        <Collapsible.Title iconPosition="hidden" asChild size="null">
          <div className="flex items-center justify-between">
            <div className="flex gap-v2-md items-center">
              <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                <Checkbox
                  stopPropagation
                  size="small"
                  checked={isEnabled}
                  disabled={mode === 'view'}
                  onCheckedChange={() => {
                    listConfig.update((state) => {
                      const nextValue = !state.datasets[sectionKey];
                      if (nextValue) {
                        state.datasets[sectionKey] = true;
                      } else {
                        clearSectionSelections(state.datasets, sectionKey, getSectionLeafNames(section));
                      }
                    });
                  }}
                />
              </span>
              <Icon
                icon="caret-down"
                className="size-4 shrink-0 transition-transform duration-200 group-radix-state-open:rotate-180"
              />
              <DatasetTag category={sectionKey} />
            </div>
            {datasetNames.length > 0 && (
              <span className="text-xs text-grey-50 pl-v2-md">
                {selectedCount} / {datasetNames.length}
              </span>
            )}
          </div>
        </Collapsible.Title>
        <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
          <SectionContent sectionKey={sectionKey} section={section} />
        </Collapsible.Content>
      </Collapsible.Container>
    ))
    .with('popover', () => (
      <button
        type="button"
        onClick={() => onSelect?.()}
        className={cn(
          'flex h-10 w-full flex-row items-center justify-between gap-2 rounded-xs p-2 outline-hidden',
          'hover:bg-purple-background-light cursor-pointer',
          isActive && 'bg-purple-background-light',
        )}
      >
        <DatasetTag category={sectionKey} />
        {datasetNames.length > 0 && (
          <span className="flex items-center gap-v2-md">
            <span className="text-xs text-grey-50">
              {t('continuousScreening:creation.datasetSelection.lists', { count: datasetNames.length })}
            </span>
            <Icon icon="arrow-right" className="size-4 text-grey-50" />
          </span>
        )}
      </button>
    ))
    .exhaustive();
};

type SectionPanelProps = {
  sectionKey: ScreeningCategory;
  section: SectionData;
  onApply?: () => void;
  onCancel?: () => void;
};

const SectionPanel = ({ sectionKey, section, onApply, onCancel }: SectionPanelProps) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const isEnabled = ListAndTopicDatasetConfiguration.select((state) => !!state.datasets[sectionKey]);
  const { t } = useTranslation(['common', 'continuousScreening', 'scenarios', 'screenings']);

  const categoryLabel = match(sectionKey)
    .with('peps', () => t('scenarios:sanction.lists.peps'))
    .with('third-parties', () => t('scenarios:sanction.lists.third_parties'))
    .with('sanctions', () => t('scenarios:sanction.lists.sanctions'))
    .with('adverse-media', () => t('scenarios:sanction.lists.adverse_media'))
    .otherwise(() => t('scenarios:sanction.lists.other'));

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-auto">
        <div className="flex items-center gap-v2-md px-v2-md py-v2-sm">
          <Switch
            id={`section-switch-${sectionKey}`}
            checked={isEnabled}
            disabled={mode === 'view'}
            onCheckedChange={(checked) => {
              listConfig.update((state) => {
                if (checked) {
                  state.datasets[sectionKey] = true;
                } else {
                  clearSectionSelections(state.datasets, sectionKey, getSectionLeafNames(section));
                }
              });
            }}
          />
          <label
            htmlFor={`section-switch-${sectionKey}`}
            className={cn('text-s font-semibold', isEnabled ? 'text-purple-primary' : 'text-grey-primary')}
          >
            {t('continuousScreening:creation.datasetSelection.section.activate', { category: categoryLabel })}
          </label>
        </div>
        {isEnabled && <SectionContent sectionKey={sectionKey} section={section} />}
      </div>
      <div className="border-t border-grey-border flex gap-2 p-4">
        <Button type="button" variant="secondary" size="default" className="flex-1 justify-center" onClick={onCancel}>
          {t('common:cancel')}
        </Button>
        <Button type="button" variant="primary" size="default" className="flex-1 justify-center" onClick={onApply}>
          {t('screenings:freeform_search.apply')}
        </Button>
      </div>
    </div>
  );
};

type SectionContentProps = { sectionKey: ScreeningCategory; section: SectionData };
const SectionContent = ({ sectionKey, section }: SectionContentProps) => {
  const { datasets, topics, conditionalTopics } = section;
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const { t } = useTranslation(['continuousScreening']);
  const [searchTerm, setSearchTerm] = useState('');

  if (!datasets?.length && !topics && !conditionalTopics) return null;

  function makeResetHandler(dependsOnKey: string): (() => void) | undefined {
    if (!conditionalTopics) return undefined;
    const dependents = Object.values(conditionalTopics).filter((ct) => ct.dependsOn === dependsOnKey);
    const dependsOnTopics = topics?.[dependsOnKey] ?? [];
    if (dependents.length === 0) return undefined;
    return () => {
      const selectedPrefixes = dependsOnTopics.filter((t) => listConfig.value.datasets[t.name]).map((t) => t.name);
      if (selectedPrefixes.length === 0) return;
      listConfig.update((state) => {
        for (const ct of dependents) {
          for (const item of ct.items) {
            const prefix = item.key.split('.')[0];
            if (!selectedPrefixes.some((sel) => sel === prefix)) {
              state.datasets[item.name] = false;
            }
          }
        }
      });
    };
  }

  const hasDatasets = !!datasets?.length;
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const hasSearch = normalizedSearch.length > 0;
  const itemMatches = (name: string, title?: string) =>
    (title ? formatDatasetTitle(title) : name).toLowerCase().includes(normalizedSearch) ||
    name.toLowerCase().includes(normalizedSearch);

  const filteredDatasets = !hasSearch
    ? datasets
    : datasets
        ?.map((group) => ({
          ...group,
          datasets: group.datasets.filter((item) => itemMatches(item.name, item.title)),
        }))
        .filter((group) => group.datasets.length > 0);

  const isDatasetsEmpty = hasSearch && (!filteredDatasets || filteredDatasets.length === 0);

  return (
    <div className="flex flex-col h-full">
      {hasDatasets && (
        <div className="px-v2-md py-v2-sm">
          <Input
            placeholder={t('continuousScreening:creation.datasetSelection.search_placeholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            endAdornment={hasSearch ? 'cross' : undefined}
            adornmentClassName="size-5"
            onAdornmentClick={hasSearch ? () => setSearchTerm('') : undefined}
          />
        </div>
      )}
      {isDatasetsEmpty ? (
        <div className="text-s text-grey-50 px-v2-md py-v2-md">
          {t('continuousScreening:creation.datasetSelection.search_empty')}
        </div>
      ) : (
        filteredDatasets?.map((group) => (
          <ItemGroup
            key={group.name}
            title={group.title}
            items={group.datasets}
            sectionKey={sectionKey}
            forceOpen={hasSearch}
          />
        ))
      )}
      {topics &&
        sortTopicGroupEntries(Object.entries(topics)).map(([key, items]) => (
          <FilterGroupRow
            key={key}
            sectionKey={sectionKey}
            groupKey={key}
            items={items}
            onAfterChange={makeResetHandler(key)}
          />
        ))}
      {conditionalTopics &&
        Object.entries(conditionalTopics).map(([name, { items, dependsOn }]) => (
          <ConditionalFilterGroupRow
            key={name}
            sectionKey={sectionKey}
            groupKey={name}
            allItems={items}
            dependsOnItems={section.topics?.[dependsOn]?.map((t) => t.name) ?? []}
          />
        ))}
    </div>
  );
};

const ItemGroup = ({
  title,
  items,
  sectionKey,
  forceOpen = false,
}: {
  title: string;
  items: { name: string; title?: string }[];
  sectionKey: ScreeningCategory;
  forceOpen?: boolean;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const names = items.map((i) => i.name);
  const checkState = ListAndTopicDatasetConfiguration.select(
    (state): CheckedState => groupCheckState(names, state.datasets),
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => names.filter((n) => state.datasets[n]).length,
  );
  const handleSelectAll = () => {
    const datasetsMap = listConfig.value.datasets;
    const selected = names.filter((n) => datasetsMap[n]).length;
    const nextValue = selected < names.length;
    listConfig.update((state) => {
      for (const name of names) {
        setDatasetKey(state.datasets, sectionKey, name, nextValue);
      }
      if (nextValue) {
        state.datasets[sectionKey] = true;
      }
    });
  };

  return (
    <Collapsible.Container
      key={forceOpen ? 'open' : 'closed'}
      className="border-none px-v2-md py-v2-sm h-fit"
      defaultOpen={forceOpen}
    >
      <Collapsible.Title iconPosition="left" asChild size="null">
        <div className="flex items-center gap-v2-md justify-between w-full">
          <span className="flex items-center gap-v2-md">
            <span className="text-s font-semibold">{formatDatasetTitle(title)}</span>
            <span className="text-xs text-grey-secondary">
              {selectedCount} / {names.length}
            </span>
          </span>
          <span className="flex items-center gap-v2-md font-normal">
            <label htmlFor="select-all-checkbox" className="text-s text-grey-50">
              {t(
                `continuousScreening:creation.datasetSelection.list.section.${checkState === true ? 'unselect_all' : 'select_all'}`,
              )}
            </label>
            <span onClick={(e) => e.stopPropagation()} className="inline-flex mr-6">
              <Checkbox
                id="select-all-checkbox"
                size="small"
                checked={checkState}
                disabled={mode === 'view'}
                onCheckedChange={handleSelectAll}
                stopPropagation
              />
            </span>
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <div className="flex flex-col gap-v2-sm">
          <div className="flex flex-col overflow-hidden border border-grey-border rounded-v2-md ">
            {items.map((item) => (
              <ItemRow key={item.name} name={item.name} label={item.title ?? item.name} sectionKey={sectionKey} />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const ItemRow = ({ name, label, sectionKey }: { name: string; label: string; sectionKey: ScreeningCategory }) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isDatasetKeySelected(state.datasets, sectionKey, name),
  );

  const onClickItem = () => {
    if (mode === 'view') return;
    listConfig.update((state) => {
      const nextValue = !isDatasetKeySelected(state.datasets, sectionKey, name);
      setDatasetKey(state.datasets, sectionKey, name, nextValue);
      if (nextValue) {
        state.datasets[sectionKey] = true;
      }
    });
  };

  return (
    <label
      htmlFor={`item-checkbox-${name}`}
      className={cn(
        'flex flex-row items-center gap-v2-sm p-v2-md even:bg-grey-background-light text-s',
        mode !== 'view' && 'cursor-pointer',
      )}
    >
      <Checkbox
        id={`item-checkbox-${name}`}
        size="small"
        checked={isSelected}
        disabled={mode === 'view'}
        onClick={onClickItem}
        className="cursor-pointer"
        stopPropagation
      />
      {label}
    </label>
  );
};

function formatItemName(name: string): string {
  const last = name.split('.').at(-1) ?? name;
  return capitalize(last);
}

const RemovableTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Tag
    color="purple"
    size="small"
    className="group cursor-pointer hover:bg-purple-primary/20 transition-colors"
    onClick={onRemove}
  >
    <span className="flex items-center">
      {/* Keep layout width stable (no flex-wrap flicker) while animating the visual centering. */}
      <span className="max-w-[20ch] truncate text-center flex-1 translate-x-[9px] group-hover:translate-x-0 transition-transform duration-150">
        {formatTopicLabel(label)}
      </span>
      <span className="inline-flex items-center justify-center w-4 ml-1 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150">
        <Icon icon="cross" className="size-3" />
      </span>
    </span>
  </Tag>
);

const ViewTag = ({ label }: { label: string }) => (
  <Tag color="purple" size="small" className="max-w-[150px] overflow-hidden">
    <span className="truncate block">{formatTopicLabel(label)}</span>
  </Tag>
);

type ConditionalTopicItem = NonNullable<SectionData['conditionalTopics']>[keyof NonNullable<
  SectionData['conditionalTopics']
>]['items'][number];

const ConditionalFilterGroupRow = ({
  sectionKey,
  groupKey,
  allItems,
  dependsOnItems,
}: {
  sectionKey: ScreeningCategory;
  groupKey: string;
  allItems: ConditionalTopicItem[];
  dependsOnItems: string[];
}) => {
  const selectedPrefixes = ListAndTopicDatasetConfiguration.select((state) =>
    dependsOnItems.filter((t) => state.datasets[t]).map((t) => t),
  );

  const filteredItems =
    selectedPrefixes.length === 0
      ? allItems
      : allItems.filter((item) => {
          const prefix = item.key.split('.')[0];
          return selectedPrefixes.some((sel) => sel === prefix);
        });

  if (filteredItems.length === 0) return null;

  return <FilterGroupRow sectionKey={sectionKey} groupKey={groupKey} items={filteredItems} />;
};

const FilterGroupRow = ({
  sectionKey,
  groupKey,
  items,
  onAfterChange,
}: {
  sectionKey: ScreeningCategory;
  groupKey: string;
  items: TopicItem[];
  onAfterChange?: () => void;
}) => {
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const withGlobalTopics = ListAndTopicDatasetConfiguration.select((state) => state.withGlobalTopics);
  const label = capitalize(groupKey);
  const singleItem = items.length === 1 ? items[0] : undefined;

  if (isGlobalTopic(groupKey) && !withGlobalTopics) return null;

  return (
    <>
      {isSpecialTopic(groupKey) ? (
        <div className="px-v2-md py-v2-sm">
          <SpecialTopicSwitch sectionKey={sectionKey} topicGroup={groupKey} mode={mode} onAfterChange={onAfterChange} />
        </div>
      ) : (
        <div className="flex items-start gap-v2-md px-v2-md py-v2-sm">
          <span className="text-s font-semibold shrink-0">{formatDatasetTitle(label)}:</span>
          <div className="flex items-center gap-v2-sm flex-1 min-w-0">
            {singleItem ? (
              <SingleItemToggle
                item={singleItem}
                sectionKey={sectionKey}
                topicGroup={groupKey}
                mode={mode}
                onAfterChange={onAfterChange}
              />
            ) : (
              <FilterGroupTags
                items={items}
                sectionKey={sectionKey}
                topicGroup={groupKey}
                onAfterChange={onAfterChange}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

const SpecialTopicSwitch = ({
  sectionKey,
  topicGroup,
  mode,
  onAfterChange,
}: {
  sectionKey: ScreeningCategory;
  topicGroup: string;
  mode: string;
  onAfterChange?: () => void;
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const topicValue = getSpecialTopicValue(topicGroup);
  const labelKey = getSpecialTopicLabel(topicGroup);
  const switchId = `special-topic-${sectionKey}-${topicGroup}-${topicValue}`;
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isTopicKeySelected(state.datasets, sectionKey, topicGroup, topicValue),
  );
  const { t } = useTranslation(['continuousScreening']);

  if (mode === 'view' && !isSelected) return null;

  return (
    <div className="flex items-center gap-v2-sm">
      <Switch
        id={switchId}
        checked={isSelected}
        disabled={mode === 'view'}
        onCheckedChange={(checked) => {
          listConfig.update((state) => {
            setTopicKey(state.datasets, sectionKey, topicGroup, topicValue, checked);
            if (checked) {
              state.datasets[sectionKey] = true;
            }
          });
          onAfterChange?.();
        }}
      />
      {labelKey ? (
        <label htmlFor={switchId} className="text-s text-grey-primary cursor-pointer">
          {t(labelKey)}
        </label>
      ) : null}
    </div>
  );
};

const SingleItemToggle = ({
  item,
  sectionKey,
  topicGroup,
  mode,
  onAfterChange,
}: {
  item: TopicItem;
  sectionKey: ScreeningCategory;
  topicGroup: string;
  mode: string;
  onAfterChange?: () => void;
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name),
  );
  const { t } = useTranslation(['continuousScreening']);

  if (isSelected) {
    if (mode !== 'view') {
      return (
        <RemovableTag
          label={item.title ?? formatItemName(item.name)}
          onRemove={() => {
            listConfig.update((state) => {
              setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
            });
            onAfterChange?.();
          }}
        />
      );
    }
    return (
      <Tag color="purple" size="small" className="max-w-[150px] overflow-hidden">
        <span className="truncate block">{formatItemName(item.name)}</span>
      </Tag>
    );
  }

  if (mode === 'view') return null;

  return (
    <button
      type="button"
      className="flex items-center justify-center size-6 rounded-full border border-grey-border hover:bg-grey-background-light shrink-0"
      onClick={() => {
        listConfig.update((state) => {
          setTopicKey(state.datasets, sectionKey, topicGroup, item.name, true);
          state.datasets[sectionKey] = true;
        });
        onAfterChange?.();
      }}
      aria-label={t('continuousScreening:creation.datasetSelection.filter.add')}
    >
      <Icon icon="plus" className="size-3" />
    </button>
  );
};

const FilterGroupTags = ({
  items,
  sectionKey,
  topicGroup,
  onAfterChange,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  topicGroup: string;
  onAfterChange?: () => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const selectedItems = ListAndTopicDatasetConfiguration.select((state) =>
    items.filter((i) => isTopicKeySelected(state.datasets, sectionKey, topicGroup, i.name)),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const useAnchoredMenu = variant === 'popover';

  const selectedKey = selectedItems.map((i) => i.name).join(',');

  const tagItems = useMemo(
    () =>
      selectedItems.map((item) => {
        const label = item.title ?? formatItemName(item.name);
        return mode !== 'view' ? (
          <RemovableTag
            key={item.name}
            label={label}
            onRemove={() => {
              listConfig.update((state) => {
                setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
              });
              onAfterChange?.();
            }}
          />
        ) : (
          <ViewTag key={item.name} label={label} />
        );
      }),
    [selectedItems, selectedKey, mode, listConfig, sectionKey, topicGroup, onAfterChange],
  );

  const isAllSelected = selectedItems.length === items.length && items.length > 1;

  const tagsContent = (
    <div className={cn('flex min-w-0 w-full flex-1', variant === 'popover' && 'flex-col gap-v2-sm overflow-x-hidden')}>
      <div className="flex min-w-0 w-full items-center gap-v2-xs overflow-hidden">
        {isAllSelected ? (
          <Tag color="purple" size="small">
            {t('continuousScreening:creation.datasetSelection.filter.all')}
          </Tag>
        ) : (
          <ExpandableGroupTagLine items={tagItems} />
        )}

        {mode !== 'view' && variant === 'popover' && (
          <button
            type="button"
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-grey-background-light',
              isMenuOpen && 'bg-purple-background-light text-purple-primary',
            )}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-expanded={isMenuOpen}
          >
            <Icon icon={isMenuOpen ? 'minus' : 'plus'} className="size-3" />
          </button>
        )}
      </div>
      {mode !== 'view' && variant === 'popover' && isMenuOpen && (
        <FilterGroupMenu items={items} sectionKey={sectionKey} topicGroup={topicGroup} onAfterChange={onAfterChange} />
      )}
    </div>
  );

  if (useAnchoredMenu) {
    return (
      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Anchor asChild>{tagsContent}</MenuCommand.Anchor>
      </MenuCommand.Menu>
    );
  }

  return tagsContent;
};

const FilterGroupMenu = ({
  items,
  sectionKey,
  topicGroup,
  onAfterChange,
  anchored = false,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  topicGroup: string;
  onAfterChange?: () => void;
  anchored?: boolean;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const allSelected =
    items.length > 0 && items.every((i) => isTopicKeySelected(datasets, sectionKey, topicGroup, i.name));

  function handleClickItem(item: TopicItem) {
    if (mode === 'view') return;
    listConfig.update((state) => {
      const nextValue = !isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name);
      setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      if (nextValue) {
        state.datasets[sectionKey] = true;
      }
    });
    onAfterChange?.();
  }

  const toggleAll = () => {
    const nextValue = !allSelected;
    listConfig.update((state) => {
      for (const item of items) {
        setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      }
      if (nextValue) {
        state.datasets[sectionKey] = true;
      }
    });
    onAfterChange?.();
  };

  if (variant === 'popover') {
    return (
      <div className="rounded-v2-md border border-grey-border bg-grey-background-light p-v2-sm flex flex-col gap-v2-xs">
        <button
          type="button"
          onClick={toggleAll}
          className="flex h-10 items-center justify-between gap-2 rounded-xs p-2 hover:bg-purple-background-light cursor-pointer"
        >
          <span className="text-purple-primary">
            {t(`continuousScreening:creation.datasetSelection.filter.${allSelected ? 'unselect_all' : 'select_all'}`)}
          </span>
          {allSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
        </button>
        {items.map((item) => {
          const isSelected = !!datasets[item.name];
          const itemName = item.title ?? formatItemName(item.name);
          return (
            <label
              key={item.name}
              htmlFor={`filter-group-menu-item-${item.name}`}
              className={cn(
                'flex h-10 flex-row items-center gap-v2-sm rounded-xs p-2 cursor-pointer text-s hover:bg-purple-background-light',
                mode === 'view' && 'cursor-not-allowed',
                isSelected && 'bg-purple-background-light',
              )}
            >
              <Checkbox
                id={`filter-group-menu-item-${item.name}`}
                checked={isSelected}
                size="small"
                onClick={() => handleClickItem(item)}
                disabled={mode === 'view'}
                stopPropagation
              />
              {formatItemName(itemName)}
            </label>
          );
        })}
      </div>
    );
  }

  const itemsList = (
    <MenuCommand.List>
      <MenuCommand.Item
        key="__all__"
        value="__all__"
        selected={allSelected}
        onSelect={toggleAll}
        className="border-b border-purple-primary"
      >
        <span className="text-purple-primary ">
          {t(`continuousScreening:creation.datasetSelection.filter.${allSelected ? 'unselect_all' : 'select_all'}`)}
        </span>
        {allSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
      </MenuCommand.Item>
      {items.map((item) => {
        const isSelected = !!datasets[item.name];
        const itemName = item.title ?? formatItemName(item.name);
        return (
          <MenuCommand.Item
            key={item.name}
            value={item.name}
            selected={isSelected}
            onSelect={() => handleClickItem(item)}
            disabled={mode === 'view'}
          >
            <span>{formatTopicLabel(itemName)}</span>
            {isSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
          </MenuCommand.Item>
        );
      })}
    </MenuCommand.List>
  );

  const menuTriggerAndContent = (
    <>
      <MenuCommand.Trigger>
        <button
          type="button"
          className="flex items-center justify-center size-6 rounded-full hover:bg-grey-background-light shrink-0"
        >
          <Icon icon="plus" className="size-3" />
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="start" sideOffset={4}>
        {itemsList}
      </MenuCommand.Content>
    </>
  );

  if (anchored) {
    return menuTriggerAndContent;
  }

  return <MenuCommand.Menu persistOnSelect>{menuTriggerAndContent}</MenuCommand.Menu>;
};
