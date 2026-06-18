import { DatasetTag, useDatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { type AvailableFeatures, type ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useEffect, useMemo, useState } from 'react';
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
  applyAliveDeceasedDefaults,
  applyUniqueLexisNexisSectionDefault,
  buildDatasetKey,
  buildTopicKey,
  isDatasetKeySelected,
  isSectionEnabled,
  // isGlobalTopicSwitchSelected,
  isTopicKeySelected,
  isUniqueLexisNexisList,
  selectAllInSection,
  setDatasetKey,
  // setGlobalTopicSwitch,
  setTopicKey,
  syncSectionEnabledFromLeaves,
} from './dataset-selection-provider-utils';
import {
  // type GlobalTopicConfig,
  // getAvailableGlobalTopicConfigs,
  getDatasetNames,
  getSpecialTopicLabel,
  getSpecialTopicValue,
  isSpecialTopic,
  sortTopicGroupEntries,
  type TopicItem,
  useDatasetTitle,
} from './dataset-utils';

type ListConfig = NonNullable<Awaited<ReturnType<typeof useListConfigQuery>>['data']>['filters'];
type SectionData = NonNullable<ListConfig[keyof ListConfig]>;

function groupCheckState(keys: string[], datasetsMap: Record<string, boolean>): CheckedState {
  if (keys.length === 0) return false;
  const selected = keys.filter((k) => datasetsMap[k]).length;
  if (selected === 0) return false;
  if (selected === keys.length) return true;
  return 'indeterminate';
}

type DatasetSelectionContentProps = {
  useCase: AvailableFeatures;
  onApply?: () => void;
  onCancel?: () => void;
};

export function DatasetSelectionContent({ useCase, onApply, onCancel }: DatasetSelectionContentProps) {
  const listConfigQuery = useListConfigQuery(useCase);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const { t } = useTranslation(['common', 'continuousScreening', 'screenings']);
  const [activeSectionKey, setActiveSectionKey] = useState<ScreeningCategory | null>(null);

  useEffect(() => {
    const data = listConfigQuery.data;
    if (!data) return;
    listConfig.update((state) => {
      applyAliveDeceasedDefaults(state.datasets, data.filters, useCase);
      applyUniqueLexisNexisSectionDefault(state.datasets, data.filters, state.provider);
    });
  }, [listConfigQuery.data, useCase, listConfig]);

  const renderSections = (data: ListConfig) => {
    const sections = Object.entries(data).filter(
      ([key, section]) => key !== 'global' && (section?.datasets?.length || section?.topics),
    );

    return match(variant)
      .with('default', () => {
        // const availableGlobalTopicConfigs = getAvailableGlobalTopicConfigs(data);
        return (
          <div className="flex flex-col">
            {/*
            TODO: uncomment when indexation is done
            availableGlobalTopicConfigs.length > 0 && (
              <div className="flex flex-col gap-sm px-md py-sm">
                {availableGlobalTopicConfigs.map((config) => (
                  <GlobalTopicSwitch key={config.groupKey} config={config} />
                ))}
              </div>
            )*/}
            {sections.map(([key, section]) =>
              section ? (
                <Section
                  key={key}
                  sectionKey={key as ScreeningCategory}
                  section={section}
                  sectionCount={sections.length}
                />
              ) : null,
            )}
          </div>
        );
      })
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
                      sectionCount={sections.length}
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
                className="w-fit min-w-[500px] max-w-[60vw] p-0"
              >
                <SectionPanel sectionKey={activeSectionKey} section={activeSection} sectionCount={sections.length} />
                <Popover.Footer className="flex gap-2 p-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="large"
                    onClick={() => {
                      setActiveSectionKey(null);
                      onCancel?.();
                    }}
                  >
                    {t('common:cancel')}
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="large"
                    onClick={() => {
                      onApply?.();
                      setActiveSectionKey(null);
                    }}
                  >
                    {t('screenings:freeform_search.apply')}
                  </Button>
                </Popover.Footer>
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
        <div className="border-b border-grey-border p-md flex justify-between items-center">
          <span className="text-s font-semibold">{t('continuousScreening:creation.datasetSelection.list.title')}</span>
          <SelectedListsCount listConfigQuery={listConfigQuery} />
        </div>
      )}
      <ScrollAreaV2 className="p-md" orientation="vertical">
        {match(listConfigQuery)
          .with({ isPending: true }, () => (
            <div className="flex items-center justify-center h-50">
              <Spinner className="size-10" />
            </div>
          ))
          .with({ isError: true }, () => (
            <div className="flex flex-col gap-md items-center justify-center h-50">
              <div className="">{t('common:generic_fetch_data_error')}</div>
              <Button variant="secondary" onClick={() => listConfigQuery.refetch()}>
                {t('common:retry')}
              </Button>
            </div>
          ))
          .with({ isSuccess: true }, ({ data }) => (data ? renderSections(data.filters) : null))
          .exhaustive()}
      </ScrollAreaV2>
    </>
  );
}

const SelectedListsCount = ({ listConfigQuery }: { listConfigQuery: ReturnType<typeof useListConfigQuery> }) => {
  const { t } = useTranslation(['continuousScreening']);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const sectionCount = Object.keys(listConfigQuery.data?.filters ?? {}).filter((k) => !!datasets[k]).length;
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: sectionCount })}</span>;
};

type SectionProps = {
  sectionKey: ScreeningCategory;
  section: SectionData;
  isActive?: boolean;
  onSelect?: () => void;
  sectionCount: number;
};

const Section = ({ sectionKey, section, isActive, onSelect, sectionCount }: SectionProps) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);

  const { t } = useTranslation(['common', 'continuousScreening', 'scenarios', 'screenings']);

  const datasetNames = getDatasetNames(section);
  const isEnabled = ListAndTopicDatasetConfiguration.select((state) =>
    isSectionEnabled(state.datasets, sectionKey, state.provider, sectionCount),
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => datasetNames.filter((n) => state.datasets[buildDatasetKey(sectionKey, n)]).length,
  );
  const isUniqueListForLN = isUniqueLexisNexisList(provider, sectionCount);

  return match(variant)
    .with('default', () => (
      <Collapsible.Container className="border-none px-md py-sm h-fit" defaultOpen={false}>
        <Collapsible.Title iconPosition="hidden" asChild size="null">
          <div className="flex items-center justify-between">
            <div className="flex gap-md items-center">
              <span onClick={(e) => e.stopPropagation()} className="inline-flex">
                <Checkbox
                  stopPropagation
                  size="small"
                  checked={isEnabled}
                  disabled={mode === 'view' || isUniqueListForLN}
                  onCheckedChange={() => {
                    listConfig.update((state) => {
                      const nextValue = !state.datasets[sectionKey];
                      state.datasets[sectionKey] = nextValue;
                      if (provider === 'opensanctions' || sectionKey === 'custom')
                        selectAllInSection(state.datasets, sectionKey, section, nextValue);
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
              <span className="text-xs text-grey-50 pl-md">
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
          'flex h-10 w-full flex-row items-center justify-between gap-sm rounded-xs p-sm outline-hidden',
          'hover:bg-purple-background-light cursor-pointer',
          isActive && 'bg-purple-background-light',
        )}
      >
        <DatasetTag category={sectionKey} />
        {datasetNames.length > 0 && (
          <span className="flex items-center gap-md">
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
  sectionCount: number;
};

const SectionPanel = ({ sectionKey, section, sectionCount }: SectionPanelProps) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isEnabled = ListAndTopicDatasetConfiguration.select((state) =>
    isSectionEnabled(state.datasets, sectionKey, state.provider, sectionCount),
  );
  const isUniqueListForLN = isUniqueLexisNexisList(provider, sectionCount);
  const { t } = useTranslation(['common', 'continuousScreening', 'scenarios', 'screenings']);
  const { getLaTagLabel } = useDatasetTag();

  return (
    <>
      <div className="flex items-center gap-md px-md py-sm">
        <Switch
          id={`section-switch-${sectionKey}`}
          checked={isEnabled}
          disabled={mode === 'view' || isUniqueListForLN}
          onCheckedChange={(checked) => {
            listConfig.update((state) => {
              state.datasets[sectionKey] = checked;
              if (provider === 'opensanctions' || sectionKey === 'custom')
                selectAllInSection(state.datasets, sectionKey, section, checked);
            });
          }}
        />
        <label
          htmlFor={`section-switch-${sectionKey}`}
          className={cn('text-s font-semibold', isEnabled ? 'text-purple-primary' : 'text-grey-primary')}
        >
          {t('continuousScreening:creation.datasetSelection.section.activate', {
            category: getLaTagLabel(sectionKey),
          })}
        </label>
      </div>
      {isEnabled && <SectionContent sectionKey={sectionKey} section={section} />}
    </>
  );
};

type SectionContentProps = { sectionKey: ScreeningCategory; section: SectionData };

const SectionContent = ({ sectionKey, section }: SectionContentProps) => {
  const { datasets, topics, conditionalTopics } = section;
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const [searchTerm, setSearchTerm] = useState('');
  const { formatDatasetTitle, t } = useDatasetTitle();

  if (!datasets?.length && !topics && !conditionalTopics) return null;

  function makeResetHandler(dependsOnKey: string): (() => void) | undefined {
    if (!conditionalTopics) return undefined;
    const dependents = Object.entries(conditionalTopics).filter(([, ct]) => ct.dependsOn === dependsOnKey);
    const dependsOnTopics = topics?.[dependsOnKey] ?? [];
    if (dependents.length === 0) return undefined;
    return () => {
      const selectedPrefixes = dependsOnTopics
        .filter((t) => listConfig.value.datasets[buildTopicKey(sectionKey, dependsOnKey, t.name)])
        .map((t) => t.name);
      if (selectedPrefixes.length === 0) return;
      listConfig.update((state) => {
        for (const [conditionalGroup, ct] of dependents) {
          for (const item of ct.items) {
            const prefix = item.key.split('.')[0];
            if (!selectedPrefixes.some((sel) => sel === prefix)) {
              state.datasets[buildTopicKey(sectionKey, conditionalGroup, item.name)] = false;
            }
          }
        }
        if (provider === 'opensanctions' || sectionKey === 'custom')
          syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
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
        <div className="px-md py-sm">
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
        <div className="text-s text-grey-50 px-md py-md">
          {t('continuousScreening:creation.datasetSelection.search_empty')}
        </div>
      ) : (
        filteredDatasets?.map((group) => (
          <ItemGroup
            key={group.name}
            title={group.title}
            items={group.datasets}
            sectionKey={sectionKey}
            section={section}
            forceOpen={hasSearch}
          />
        ))
      )}
      {topics &&
        sortTopicGroupEntries(sectionKey, Object.entries(topics)).map(([key, items]) => (
          <FilterGroupRow
            key={key}
            sectionKey={sectionKey}
            section={section}
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
            section={section}
            groupKey={name}
            allItems={items}
            dependsOnGroup={dependsOn}
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
  section,
  forceOpen = false,
}: {
  title: string;
  items: { name: string; title?: string }[];
  sectionKey: ScreeningCategory;
  section: SectionData;
  forceOpen?: boolean;
}) => {
  const { formatDatasetTitle, t } = useDatasetTitle();
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const names = items.map((i) => i.name);
  const keys = names.map((n) => buildDatasetKey(sectionKey, n));
  const checkState = ListAndTopicDatasetConfiguration.select(
    (state): CheckedState => groupCheckState(keys, state.datasets),
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => keys.filter((k) => state.datasets[k]).length,
  );

  const handleSelectAll = () => {
    const datasetsMap = listConfig.value.datasets;
    const selected = keys.filter((k) => datasetsMap[k]).length;
    const nextValue = selected < keys.length;
    listConfig.update((state) => {
      for (const name of names) {
        setDatasetKey(state.datasets, sectionKey, name, nextValue);
      }
      if (provider === 'opensanctions' || sectionKey === 'custom')
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
  };

  return (
    <Collapsible.Container
      key={forceOpen ? 'open' : 'closed'}
      className="border-none px-md py-sm h-fit"
      defaultOpen={forceOpen}
    >
      <Collapsible.Title iconPosition="left" asChild size="null">
        <div className="flex items-center gap-md justify-between w-full">
          <span className="flex items-center gap-md">
            <span className="text-s font-semibold">{formatDatasetTitle(title)}</span>
            <span className="text-xs text-grey-secondary">
              {selectedCount} / {names.length}
            </span>
          </span>
          <span onClick={(e) => e.stopPropagation()} className="flex items-center gap-md font-normal">
            <label htmlFor={`select-all-checkbox-${title}`} className="text-s text-grey-50">
              {t(
                `continuousScreening:creation.datasetSelection.list.section.${checkState === true ? 'unselect_all' : 'select_all'}`,
              )}
            </label>
            <Checkbox
              id={`select-all-checkbox-${title}`}
              size="small"
              checked={checkState}
              disabled={mode === 'view'}
              onCheckedChange={handleSelectAll}
              stopPropagation
            />
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <div className="flex flex-col gap-sm">
          <div className="flex flex-col overflow-hidden border border-grey-border rounded-md ">
            {items.map((item) => (
              <ItemRow
                key={item.name}
                name={item.name}
                label={item.title ?? item.name}
                sectionKey={sectionKey}
                section={section}
              />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const ItemRow = ({
  name,
  label,
  sectionKey,
  section,
}: {
  name: string;
  label: string;
  sectionKey: ScreeningCategory;
  section: SectionData;
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isDatasetKeySelected(state.datasets, sectionKey, name),
  );

  const onClickItem = () => {
    if (mode === 'view') return;
    listConfig.update((state) => {
      const nextValue = !isDatasetKeySelected(state.datasets, sectionKey, name);
      setDatasetKey(state.datasets, sectionKey, name, nextValue);
      if (provider === 'opensanctions' || sectionKey === 'custom')
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
  };

  return (
    <label
      htmlFor={`item-checkbox-${name}`}
      className={cn(
        'flex flex-row items-center gap-sm p-md even:bg-grey-background-light text-s',
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

const RemovableTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => {
  const { formatTopicLabel } = useDatasetTitle();
  return (
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
        <span className="inline-flex items-center justify-center w-4 ms-xs opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150">
          <Icon icon="cross" className="size-3" />
        </span>
      </span>
    </Tag>
  );
};

const ViewTag = ({ label }: { label: string }) => {
  const { formatTopicLabel } = useDatasetTitle();
  return (
    <Tag color="purple" size="small" className="max-w-[150px] overflow-hidden">
      <span className="truncate block">{formatTopicLabel(label)}</span>
    </Tag>
  );
};

type ConditionalTopicItem = NonNullable<SectionData['conditionalTopics']>[keyof NonNullable<
  SectionData['conditionalTopics']
>]['items'][number];

const ConditionalFilterGroupRow = ({
  sectionKey,
  section,
  groupKey,
  allItems,
  dependsOnGroup,
  dependsOnItems,
}: {
  sectionKey: ScreeningCategory;
  section: SectionData;
  groupKey: string;
  allItems: ConditionalTopicItem[];
  dependsOnGroup: string;
  dependsOnItems: string[];
}) => {
  const selectedPrefixes = ListAndTopicDatasetConfiguration.select((state) =>
    dependsOnItems.filter((t) => state.datasets[buildTopicKey(sectionKey, dependsOnGroup, t)]),
  );

  const filteredItems =
    selectedPrefixes.length === 0
      ? allItems
      : allItems.filter((item) => {
          const prefix = item.key.split('.')[0];
          return selectedPrefixes.some((sel) => sel === prefix);
        });

  if (filteredItems.length === 0) return null;

  return <FilterGroupRow sectionKey={sectionKey} section={section} groupKey={groupKey} items={filteredItems} />;
};

const FilterGroupRow = ({
  sectionKey,
  section,
  groupKey,
  items,
  onAfterChange,
}: {
  sectionKey: ScreeningCategory;
  section: SectionData;
  groupKey: string;
  items: TopicItem[];
  onAfterChange?: () => void;
}) => {
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const label = capitalize(groupKey);
  const singleItem = items.length === 1 ? items[0] : undefined;
  const { formatDatasetTitle } = useDatasetTitle();

  if (sectionKey === 'global') return null;

  return (
    <>
      {isSpecialTopic(sectionKey, groupKey) ? (
        <div className="px-md py-sm">
          <SpecialTopicSwitch
            sectionKey={sectionKey}
            section={section}
            topicGroup={groupKey}
            mode={mode}
            onAfterChange={onAfterChange}
          />
        </div>
      ) : (
        <div className="flex items-start gap-md px-md py-sm">
          <span className="text-s font-semibold shrink-0">{formatDatasetTitle(label)}:</span>
          <div className="flex min-w-0 flex-1 items-center gap-sm">
            {singleItem ? (
              <SingleItemToggle
                item={singleItem}
                sectionKey={sectionKey}
                section={section}
                topicGroup={groupKey}
                mode={mode}
                onAfterChange={onAfterChange}
              />
            ) : (
              <FilterGroupTags
                items={items}
                sectionKey={sectionKey}
                section={section}
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
  section,
  topicGroup,
  mode,
  onAfterChange,
}: {
  sectionKey: ScreeningCategory;
  section: SectionData;
  topicGroup: string;
  mode: string;
  onAfterChange?: () => void;
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const topicValue = getSpecialTopicValue(sectionKey, topicGroup);
  const labelKey = getSpecialTopicLabel(sectionKey, topicGroup);
  const switchId = `special-topic-${sectionKey}-${topicGroup}-${topicValue}`;
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isTopicKeySelected(state.datasets, sectionKey, topicGroup, topicValue),
  );
  const { t } = useTranslation(['continuousScreening']);

  return (
    <div className="flex items-center gap-sm">
      <Switch
        id={switchId}
        checked={isSelected}
        disabled={mode === 'view'}
        onCheckedChange={(checked) => {
          listConfig.update((state) => {
            setTopicKey(state.datasets, sectionKey, topicGroup, topicValue, checked);
            if (provider === 'opensanctions' || sectionKey === 'custom')
              syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
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
  section,
  topicGroup,
  mode,
  onAfterChange,
}: {
  item: TopicItem;
  sectionKey: ScreeningCategory;
  section: SectionData;
  topicGroup: string;
  mode: string;
  onAfterChange?: () => void;
}) => {
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
    isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name),
  );
  const { formatItemName, t } = useDatasetTitle();

  if (isSelected) {
    if (mode !== 'view') {
      return (
        <RemovableTag
          label={formatItemName(item)}
          onRemove={() => {
            listConfig.update((state) => {
              setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
              if (provider === 'opensanctions' || sectionKey === 'custom')
                syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
            });
            onAfterChange?.();
          }}
        />
      );
    }
    return (
      <Tag color="purple" size="small" className="max-w-[150px] overflow-hidden">
        <span className="truncate block">{formatItemName(item)}</span>
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
          if (provider === 'opensanctions' || sectionKey === 'custom')
            syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
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
  section,
  topicGroup,
  onAfterChange,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  section: SectionData;
  topicGroup: string;
  onAfterChange?: () => void;
}) => {
  const { formatItemName, t } = useDatasetTitle();
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const selectedItems = ListAndTopicDatasetConfiguration.select((state) =>
    items.filter((i) => isTopicKeySelected(state.datasets, sectionKey, topicGroup, i.name)),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const useAnchoredMenu = mode !== 'view' && variant !== 'popover';
  const selectedKey = selectedItems.map((i) => i.name).join(',');

  const tagItems = useMemo(
    () =>
      selectedItems.map((item) => {
        const label = formatItemName(item);
        return mode !== 'view' ? (
          <RemovableTag
            key={item.name}
            label={label}
            onRemove={() => {
              listConfig.update((state) => {
                setTopicKey(state.datasets, sectionKey, topicGroup, item.name, false);
                if (provider === 'opensanctions' || sectionKey === 'custom')
                  syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
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

  const trailingTrigger =
    mode !== 'view' &&
    (variant === 'popover' ? (
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
    ) : (
      <FilterGroupMenu
        anchored
        items={items}
        sectionKey={sectionKey}
        section={section}
        topicGroup={topicGroup}
        onAfterChange={onAfterChange}
      />
    ));

  const tagsContent = (
    <div className={cn('flex min-w-0 w-full flex-1', variant === 'popover' && 'flex-col gap-sm overflow-x-hidden')}>
      <div className="flex min-w-0 w-full items-center gap-xs flex-1">
        {isAllSelected ? (
          <>
            <Tag color="purple" size="small">
              {t('continuousScreening:creation.datasetSelection.filter.all')}
            </Tag>
            {trailingTrigger}
          </>
        ) : (
          <ExpandableGroupTagLine items={tagItems} trailing={trailingTrigger} />
        )}
      </div>
      {mode !== 'view' && variant === 'popover' && isMenuOpen && (
        <FilterGroupMenu
          items={items}
          sectionKey={sectionKey}
          section={section}
          topicGroup={topicGroup}
          onAfterChange={onAfterChange}
        />
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
  section,
  topicGroup,
  onAfterChange,
  anchored = false,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  section: SectionData;
  topicGroup: string;
  onAfterChange?: () => void;
  anchored?: boolean;
}) => {
  const { formatItemName, t } = useDatasetTitle();
  const variant = ListAndTopicDatasetConfiguration.select((state) => state.variant);
  const listConfig = ListAndTopicDatasetConfiguration.useSharp();
  const provider = ListAndTopicDatasetConfiguration.select((state) => state.provider);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const allSelected =
    items.length > 0 && items.every((i) => isTopicKeySelected(datasets, sectionKey, topicGroup, i.name));

  function handleClickItem(item: TopicItem) {
    if (mode === 'view') return;
    listConfig.update((state) => {
      const nextValue = !isTopicKeySelected(state.datasets, sectionKey, topicGroup, item.name);
      setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      if (provider === 'opensanctions' || sectionKey === 'custom')
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
    onAfterChange?.();
  }

  const toggleAll = () => {
    const nextValue = !allSelected;
    listConfig.update((state) => {
      for (const item of items) {
        setTopicKey(state.datasets, sectionKey, topicGroup, item.name, nextValue);
      }
      if (provider === 'opensanctions' || sectionKey === 'custom')
        syncSectionEnabledFromLeaves(state.datasets, sectionKey, section);
    });
    onAfterChange?.();
  };

  if (variant === 'popover') {
    return (
      <div className="rounded-md border border-grey-border bg-grey-background-light p-sm flex flex-col gap-xs">
        <button
          type="button"
          onClick={toggleAll}
          className="flex h-10 items-center justify-between gap-sm rounded-xs p-sm hover:bg-purple-background-light cursor-pointer"
        >
          <span className="text-purple-primary">
            {t(`continuousScreening:creation.datasetSelection.filter.${allSelected ? 'unselect_all' : 'select_all'}`)}
          </span>
          {allSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
        </button>
        {items.map((item) => {
          const isSelected = isTopicKeySelected(datasets, sectionKey, topicGroup, item.name);
          return (
            <label
              key={item.name}
              htmlFor={`filter-group-menu-item-${item.name}`}
              className={cn(
                'flex h-10 flex-row items-center gap-sm rounded-xs p-sm cursor-pointer text-s hover:bg-purple-background-light',
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
              {formatItemName(item)}
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
        const isSelected = isTopicKeySelected(datasets, sectionKey, topicGroup, item.name);
        return (
          <MenuCommand.Item
            key={item.name}
            value={item.name}
            selected={isSelected}
            onSelect={() => handleClickItem(item)}
            disabled={mode === 'view'}
          >
            <span>{formatItemName(item)}</span>
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

// const GlobalTopicSwitch = ({ config }: { config: GlobalTopicConfig }) => {
//   const listSharp = ListAndTopicDatasetConfiguration.useSharp();
//   const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
//   const { t } = useTranslation(['screenings']);
//   const switchId = `global-topic-${config.groupKey}`;
//   const isSelected = ListAndTopicDatasetConfiguration.select((state) =>
//     isGlobalTopicSwitchSelected(state.datasets, config),
//   );

//   return (
//     <div className="flex items-center gap-sm">
//       <Switch
//         id={switchId}
//         checked={isSelected}
//         disabled={mode === 'view'}
//         onCheckedChange={(checked) => {
//           listSharp.update((state) => {
//             setGlobalTopicSwitch(state.datasets, config, checked);
//           });
//         }}
//       />
//       <label htmlFor={switchId} className="text-s text-grey-primary cursor-pointer">
//         {t(config.label)}
//       </label>
//     </div>
//   );
// };
