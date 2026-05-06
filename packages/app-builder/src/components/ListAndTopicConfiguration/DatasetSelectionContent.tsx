import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { type ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { AvailableFeatures } from '@app-builder/server-fns/screenings';
import { UseQueryResult } from '@tanstack/react-query';
import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'remeda';
import { match } from 'ts-pattern';
import { Button, Checkbox, type CheckedState, Collapsible, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ListAndTopicDatasetConfiguration } from './context/ListAndTopicDatasetConfiguration';
import { getSectionLeafNames } from './dataset-utils';

type ListConfig = NonNullable<Awaited<ReturnType<typeof useListConfigQuery>>['data']>;
type SectionData = NonNullable<ListConfig[keyof ListConfig]>;

function groupCheckState(names: string[], datasetsMap: Record<string, boolean>): CheckedState {
  if (names.length === 0) return false;
  const selected = names.filter((n) => datasetsMap[n]).length;
  if (selected === 0) return false;
  if (selected === names.length) return true;
  return 'indeterminate';
}

export function DatasetSelectionContent({ useCase }: { useCase: AvailableFeatures }) {
  const listConfigQuery = useListConfigQuery(useCase);
  const { t } = useTranslation(['common', 'continuousScreening']);

  return (
    <>
      <div className="border-b border-grey-border p-v2-md flex justify-between items-center">
        <span className="text-s font-semibold">{t('continuousScreening:creation.datasetSelection.list.title')}</span>
        <SelectedListsCount listConfigQuery={listConfigQuery} />
      </div>
      <div className="p-v2-md overflow-y-auto">
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
          .with({ isSuccess: true }, ({ data }) => (
            <div className="flex flex-col">
              {data &&
                Object.entries(data)
                  .filter(([, section]) => section.datasets?.length || section.topics)
                  .map(([key, section]) =>
                    section ? <Section key={key} sectionKey={key as ScreeningCategory} section={section} /> : null,
                  )}
            </div>
          ))
          .exhaustive()}
      </div>
    </>
  );
}

const SelectedListsCount = ({ listConfigQuery }: { listConfigQuery: UseQueryResult<ListConfig, Error> }) => {
  const { t } = useTranslation(['continuousScreening']);
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const sectionCount = Object.keys(listConfigQuery.data ?? {}).filter((k) => !!datasets[k]).length;
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: sectionCount })}</span>;
};

const Section = ({ sectionKey, section }: { sectionKey: ScreeningCategory; section: SectionData }) => {
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const [isExpanded, setIsExpanded] = useState(false);

  const leafNames = getSectionLeafNames(sectionKey, section);
  const isEnabled = ListAndTopicDatasetConfiguration.select((state) => !!state.datasets[sectionKey]);
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => leafNames.filter((n) => state.datasets[n]).length,
  );

  return (
    <Collapsible.Container className="border-none px-v2-md py-v2-sm h-fit" defaultOpen={false}>
      <Collapsible.Title hideIcon asChild size="null">
        <span className="flex items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex gap-v2-md items-center">
            <Checkbox
              stopPropagation
              size="small"
              checked={isEnabled}
              disabled={mode === 'view'}
              onCheckedChange={() => {
                const nextValue = !stepper.value.datasets[sectionKey];
                stepper.value.datasets[sectionKey] = nextValue;
                if (!nextValue) {
                  for (const name of leafNames) {
                    stepper.value.datasets[name] = false;
                  }
                }
              }}
            />
            <Icon
              icon="caret-down"
              className={cn('size-4 shrink-0 rotate-0 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
            <DatasetTag category={sectionKey} />
          </div>
          <span className="text-xs text-grey-50 pl-v2-md">
            {selectedCount} / {leafNames.length}
          </span>
        </span>
      </Collapsible.Title>
      <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <SectionContent sectionKey={sectionKey} section={section} />
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const SectionContent = ({ sectionKey, section }: { sectionKey: ScreeningCategory; section: SectionData }) => {
  const { datasets, topics, conditionalTopics } = section;
  const stepper = ListAndTopicDatasetConfiguration.useSharp();

  if (!datasets?.length && !topics && !conditionalTopics) return null;

  function makeResetHandler(dependsOnKey: string): (() => void) | undefined {
    if (!conditionalTopics) return undefined;
    const dependents = Object.values(conditionalTopics).filter((ct) => ct.dependsOn === dependsOnKey);
    const dependsOnTopics = topics?.[dependsOnKey] ?? [];
    if (dependents.length === 0) return undefined;
    return () => {
      const selectedPrefixes = dependsOnTopics.filter((t) => stepper.value.datasets[t.name]).map((t) => t.name);
      if (selectedPrefixes.length === 0) return;
      for (const ct of dependents) {
        for (const item of ct.items) {
          const prefix = item.name.split('.')[0];
          if (!selectedPrefixes.some((sel) => sel === prefix)) {
            stepper.value.datasets[item.name] = false;
          }
        }
      }
    };
  }

  return (
    <div className="flex flex-col">
      {datasets?.map((group) => (
        <ItemGroup key={group.name} title={group.title} items={group.datasets} sectionKey={sectionKey} />
      ))}
      {topics &&
        Object.entries(topics).map(([key, items]) => (
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
}: {
  title: string;
  items: { name: string; title?: string }[];
  sectionKey: ScreeningCategory;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const [isExpanded, setIsExpanded] = useState(false);
  const names = items.map((i) => i.name);
  const checkState = ListAndTopicDatasetConfiguration.select(
    (state): CheckedState => groupCheckState(names, state.datasets),
  );
  const selectedCount = ListAndTopicDatasetConfiguration.select(
    (state) => names.filter((n) => state.datasets[n]).length,
  );

  const handleSelectAll = () => {
    const datasetsMap = stepper.value.datasets;
    const selected = names.filter((n) => datasetsMap[n]).length;
    const nextValue = selected < names.length;
    for (const name of names) {
      stepper.value.datasets[name] = nextValue;
    }
    if (nextValue) {
      stepper.value.datasets[sectionKey] = true;
    }
  };

  return (
    <Collapsible.Container className="border-none px-v2-md py-v2-sm h-fit" defaultOpen={false}>
      <Collapsible.Title hideIcon asChild size="null">
        <div className="flex items-center gap-v2-md justify-between w-full" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="flex items-center gap-v2-md">
            <Icon
              icon="caret-down"
              className={cn('size-4 shrink-0 rotate-0 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
            <span className="text-s font-semibold">{capitalize(title)}</span>
            <span className="text-xs text-grey-secondary">
              {selectedCount} / {names.length}
            </span>
          </span>
          <span className="flex items-center gap-v2-md font-normal">
            <span className="text-s text-grey-50">
              {t(
                `continuousScreening:creation.datasetSelection.list.section.${checkState === true ? 'unselect_all' : 'select_all'}`,
              )}
            </span>
            <Checkbox
              size="small"
              checked={checkState}
              disabled={mode === 'view'}
              onCheckedChange={handleSelectAll}
              stopPropagation
              className="mr-6"
            />
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <div className="flex flex-col gap-v2-sm pt-v2-sm">
          <div className="flex flex-col border border-grey-border rounded-v2-md overflow-hidden">
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
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const isSelected = ListAndTopicDatasetConfiguration.select((state) => !!state.datasets[name]);

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-v2-sm p-v2-md even:bg-grey-background-light',
        mode !== 'view' && 'cursor-pointer',
      )}
      onClick={() => {
        if (mode === 'view') return;
        const nextValue = !stepper.value.datasets[name];
        stepper.value.datasets[name] = nextValue;
        if (nextValue) {
          stepper.value.datasets[sectionKey] = true;
        }
      }}
    >
      <Checkbox size="small" checked={isSelected} disabled={mode === 'view'} />
      <span className="text-s">{label}</span>
    </div>
  );
};

const OVERFLOW_TAG_WIDTH_PX = 36;

function formatItemName(name: string): string {
  const last = name.split('.').at(-1) ?? name;
  return capitalize(last);
}

const RemovableTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <Tag
    color="blue"
    size="small"
    className="group cursor-pointer hover:bg-blue-58/20 transition-colors"
    onClick={onRemove}
  >
    <span className="flex items-center">
      {/* Keep layout width stable (no flex-wrap flicker) while animating the visual centering. */}
      <span className="max-w-[20ch] truncate text-center flex-1 translate-x-[9px] group-hover:translate-x-0 transition-transform duration-150">
        {label}
      </span>
      <span className="inline-flex items-center justify-center w-4 ml-1 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-[opacity,transform] duration-150">
        <Icon icon="cross" className="size-3" />
      </span>
    </span>
  </Tag>
);

const ViewTag = ({ label }: { label: string }) => (
  <Tag color="blue" size="small" className="max-w-[150px] overflow-hidden">
    <span className="truncate block">{label}</span>
  </Tag>
);

type TopicItem = NonNullable<SectionData['topics']>[keyof NonNullable<SectionData['topics']>][number];

const ConditionalFilterGroupRow = ({
  sectionKey,
  groupKey,
  allItems,
  dependsOnItems,
}: {
  sectionKey: ScreeningCategory;
  groupKey: string;
  allItems: TopicItem[];
  dependsOnItems: string[];
}) => {
  const selectedPrefixes = ListAndTopicDatasetConfiguration.select((state) =>
    dependsOnItems.filter((t) => state.datasets[t]).map((t) => t),
  );

  const filteredItems =
    selectedPrefixes.length === 0
      ? allItems
      : allItems.filter((item) => {
          const prefix = item.name.split('.')[0];
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
  const label = capitalize(groupKey);

  return (
    <div className="flex items-start gap-v2-md px-v2-md py-v2-sm">
      <span className="text-s font-semibold shrink-0">{label}:</span>
      <div className="flex items-center gap-v2-sm flex-1 min-w-0">
        {items.length === 1 && items[0] ? (
          <SingleItemToggle item={items[0]} sectionKey={sectionKey} mode={mode} onAfterChange={onAfterChange} />
        ) : (
          <FilterGroupTags items={items} sectionKey={sectionKey} onAfterChange={onAfterChange} />
        )}
      </div>
    </div>
  );
};

const SingleItemToggle = ({
  item,
  sectionKey,
  mode,
  onAfterChange,
}: {
  item: TopicItem;
  sectionKey: ScreeningCategory;
  mode: string;
  onAfterChange?: () => void;
}) => {
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const isSelected = ListAndTopicDatasetConfiguration.select((state) => !!state.datasets[item.name]);

  if (isSelected) {
    if (mode !== 'view') {
      return (
        <RemovableTag
          label={item.title ?? formatItemName(item.name)}
          onRemove={() => {
            stepper.value.datasets[item.name] = false;
            onAfterChange?.();
          }}
        />
      );
    }
    return (
      <Tag color="blue" size="small" className="max-w-[150px] overflow-hidden">
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
        stepper.value.datasets[item.name] = true;
        stepper.value.datasets[sectionKey] = true;
        onAfterChange?.();
      }}
    >
      <Icon icon="plus" className="size-3" />
    </button>
  );
};

const MENU_BUTTON_SIZE_PX = 40; // size-6 = 1.5rem = 24px + 16px from the delete button in the tag

const FilterGroupTags = ({
  items,
  sectionKey,
  onAfterChange,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  onAfterChange?: () => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const mode = ListAndTopicDatasetConfiguration.select((state) => state.mode);
  const selectedItems = ListAndTopicDatasetConfiguration.select((state) => items.filter((i) => state.datasets[i.name]));
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [maxVisible, setMaxVisible] = useState(selectedItems.length);

  const selectedKey = selectedItems.map((i) => i.name).join(',');

  useLayoutEffect(() => {
    if (isExpanded) return;
    const container = containerRef.current;
    const ghost = ghostRef.current;
    if (!container || !ghost) return;

    const recalculate = () => {
      const gap = parseFloat(getComputedStyle(ghost).gap) || 4;
      // subtract menu button + delete button + one gap when in edit mode
      const menuReserved = mode !== 'view' ? MENU_BUTTON_SIZE_PX + gap : 0;
      const availableWidth = container.offsetWidth - menuReserved;
      const tagEls = Array.from(ghost.children) as HTMLElement[];

      let used = 0;
      let count = 0;
      for (let i = 0; i < tagEls.length; i++) {
        const tw = tagEls[i]!.offsetWidth;
        const gapBefore = i > 0 ? gap : 0;
        const isLast = i === tagEls.length - 1;
        // reserve space for overflow tag on all but the last slot
        const needed = used + gapBefore + tw + (isLast ? 0 : gap + OVERFLOW_TAG_WIDTH_PX);
        if (needed <= availableWidth) {
          used += gapBefore + tw;
          count++;
        } else {
          break;
        }
      }
      setMaxVisible(Math.max(count, 1));
    };

    const observer = new ResizeObserver(recalculate);
    observer.observe(container);
    recalculate();
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded, selectedKey, mode]);

  const isAllSelected = selectedItems.length === items.length && items.length > 1;
  const overflow = isExpanded || isAllSelected ? 0 : Math.max(0, selectedItems.length - maxVisible);
  const visible = overflow > 0 ? selectedItems.slice(0, maxVisible) : selectedItems;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      {/* Ghost: invisible clone of all selected tags used to measure their rendered widths */}
      <div
        ref={ghostRef}
        className="flex items-center gap-v2-sm invisible absolute top-0 left-0 right-0 pointer-events-none"
        aria-hidden="true"
      >
        {selectedItems.map((item) => {
          const label = item.title ?? formatItemName(item.name);
          return mode !== 'view' ? (
            // Must match `RemovableTag` layout width, otherwise maxVisible/overflow calc is wrong.
            <RemovableTag key={item.name} label={label} onRemove={() => undefined} />
          ) : (
            <Tag key={item.name} color="blue" size="small">
              <span className="max-w-[20ch] truncate">{label}</span>
            </Tag>
          );
        })}
      </div>
      <div className={cn('flex items-center gap-v2-sm', isExpanded && 'flex-wrap')}>
        {isAllSelected ? (
          <Tag color="blue" size="small">
            {t('continuousScreening:creation.datasetSelection.filter.all')}
          </Tag>
        ) : (
          <>
            {visible.map((item) =>
              mode !== 'view' ? (
                <RemovableTag
                  key={item.name}
                  label={item.title ?? formatItemName(item.name)}
                  onRemove={() => {
                    stepper.value.datasets[item.name] = false;
                    onAfterChange?.();
                  }}
                />
              ) : (
                <ViewTag key={item.name} label={item.title ?? formatItemName(item.name)} />
              ),
            )}
            {overflow > 0 && (
              <Tag
                color="blue"
                size="small"
                className="cursor-pointer shrink-0 hover:bg-blue-58/20 transition-colors"
                onClick={() => setIsExpanded(true)}
              >
                +{overflow}
              </Tag>
            )}
            {isExpanded && (
              <Tag
                color="blue"
                size="small"
                className="cursor-pointer shrink-0 hover:bg-blue-58/20 transition-colors"
                onClick={() => setIsExpanded(false)}
              >
                <Icon icon="minus" className="size-3" />
              </Tag>
            )}
          </>
        )}
        {mode !== 'view' && <FilterGroupMenu items={items} sectionKey={sectionKey} onAfterChange={onAfterChange} />}
      </div>
    </div>
  );
};

const FilterGroupMenu = ({
  items,
  sectionKey,
  onAfterChange,
}: {
  items: TopicItem[];
  sectionKey: ScreeningCategory;
  onAfterChange?: () => void;
}) => {
  const { t } = useTranslation(['continuousScreening']);
  const stepper = ListAndTopicDatasetConfiguration.useSharp();
  const datasets = ListAndTopicDatasetConfiguration.select((state) => state.datasets);
  const allSelected = items.length > 0 && items.every((i) => !!datasets[i.name]);

  return (
    <MenuCommand.Menu persistOnSelect>
      <MenuCommand.Trigger>
        <button
          type="button"
          className="flex items-center justify-center size-6 rounded-full border border-grey-border hover:bg-grey-background-light shrink-0"
        >
          <Icon icon="plus" className="size-3" />
        </button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4}>
        <MenuCommand.List>
          <MenuCommand.Item
            key="__all__"
            value="__all__"
            selected={allSelected}
            onSelect={() => {
              const nextValue = !allSelected;
              for (const item of items) {
                stepper.value.datasets[item.name] = nextValue;
              }
              if (nextValue) {
                stepper.value.datasets[sectionKey] = true;
              }
              onAfterChange?.();
            }}
            className="border-b border-purple-primary"
          >
            <span className="text-purple-primary ">
              {t(`continuousScreening:creation.datasetSelection.filter.${allSelected ? 'unselect_all' : 'select_all'}`)}
            </span>
            {allSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
          </MenuCommand.Item>
          {items.map((item) => {
            const isSelected = !!datasets[item.name];
            return (
              <MenuCommand.Item
                key={item.name}
                value={item.name}
                selected={isSelected}
                onSelect={() => {
                  const nextValue = !stepper.value.datasets[item.name];
                  stepper.value.datasets[item.name] = nextValue;
                  if (nextValue) {
                    stepper.value.datasets[sectionKey] = true;
                  }
                  onAfterChange?.();
                }}
              >
                <span>{item.title ?? formatItemName(item.name)}</span>
                {isSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
