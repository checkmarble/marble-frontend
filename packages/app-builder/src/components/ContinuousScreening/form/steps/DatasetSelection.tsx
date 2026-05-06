import { Callout } from '@app-builder/components/Callout';
import { DatasetTag } from '@app-builder/components/Screenings/DatasetTag';
import { Spinner } from '@app-builder/components/Spinner';
import { type ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { AvailableFeatures } from '@app-builder/server-fns/screenings';
import { UseQueryResult } from '@tanstack/react-query';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'remeda';
import { match } from 'ts-pattern';
import { Button, Checkbox, type CheckedState, Collapsible, cn, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningConfigurationStepper } from '../../context/CreationStepper';
import { getSectionLeafNames } from '../../shared/dataset-utils';

type ListConfig = NonNullable<Awaited<ReturnType<typeof useListConfigQuery>>['data']>;
type SectionData = NonNullable<ListConfig[keyof ListConfig]>;

function groupCheckState(names: string[], datasetsMap: Record<string, boolean>): CheckedState {
  if (names.length === 0) return false;
  const selected = names.filter((n) => datasetsMap[n]).length;
  if (selected === 0) return false;
  if (selected === names.length) return true;
  return 'indeterminate';
}

export const DatasetSelection = ({ useCase }: { useCase: AvailableFeatures }) => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const listConfigQuery = useListConfigQuery(useCase);
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const tKey = mode === 'view' ? 'view' : 'creation';

  return (
    <div className="flex flex-col gap-v2-md">
      <Callout bordered className="bg-surface-card mx-v2-md">
        {t(`continuousScreening:${tKey}.datasetSelection.callout`)}
      </Callout>
      <div className="bg-surface-card rounded-v2-lg border border-grey-border">
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
      </div>
    </div>
  );
};

const SelectedListsCount = ({ listConfigQuery }: { listConfigQuery: UseQueryResult<ListConfig, Error> }) => {
  const { t } = useTranslation(['continuousScreening']);
  const datasets = ContinuousScreeningConfigurationStepper.select((state) => state.data.datasets);
  const sectionCount = Object.keys(listConfigQuery.data ?? {}).filter((k) => !!datasets[k]).length;
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: sectionCount })}</span>;
};

const Section = ({ sectionKey, section }: { sectionKey: ScreeningCategory; section: SectionData }) => {
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const [isExpanded, setIsExpanded] = useState(false);

  const leafNames = getSectionLeafNames(sectionKey, section);
  const isEnabled = ContinuousScreeningConfigurationStepper.select((state) => !!state.data.datasets[sectionKey]);
  const selectedCount = ContinuousScreeningConfigurationStepper.select(
    (state) => leafNames.filter((n) => state.data.datasets[n]).length,
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
                const nextValue = !stepper.value.data.datasets[sectionKey];
                stepper.value.data.datasets[sectionKey] = nextValue;
                if (!nextValue) {
                  for (const name of leafNames) {
                    stepper.value.data.datasets[name] = false;
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
  const { datasets, topics } = section;

  if (!datasets?.length && !topics) return null;

  return (
    <div className="flex flex-col">
      {datasets?.map((group) => (
        <ItemGroup key={group.name} title={group.title} items={group.datasets} sectionKey={sectionKey} />
      ))}
      {topics &&
        Object.entries(topics).map(([key, items]) => (
          <FilterGroupRow key={key} sectionKey={sectionKey} groupKey={key} items={items} />
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
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const [isExpanded, setIsExpanded] = useState(false);
  const names = items.map((i) => i.name);
  const checkState = ContinuousScreeningConfigurationStepper.select(
    (state): CheckedState => groupCheckState(names, state.data.datasets),
  );
  const selectedCount = ContinuousScreeningConfigurationStepper.select(
    (state) => names.filter((n) => state.data.datasets[n]).length,
  );

  const handleSelectAll = () => {
    const datasets = stepper.value.data.datasets;
    const selected = names.filter((n) => datasets[n]).length;
    const nextValue = selected < names.length;
    for (const name of names) {
      stepper.value.data.datasets[name] = nextValue;
    }
    if (nextValue) {
      stepper.value.data.datasets[sectionKey] = true;
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
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const isSelected = ContinuousScreeningConfigurationStepper.select((state) => !!state.data.datasets[name]);

  return (
    <div
      className={cn(
        'flex flex-row items-center gap-v2-sm p-v2-md even:bg-grey-background-light',
        mode !== 'view' && 'cursor-pointer',
      )}
      onClick={() => {
        if (mode === 'view') return;
        const nextValue = !stepper.value.data.datasets[name];
        stepper.value.data.datasets[name] = nextValue;
        if (nextValue) {
          stepper.value.data.datasets[sectionKey] = true;
        }
      }}
    >
      <Checkbox size="small" checked={isSelected} disabled={mode === 'view'} />
      <span className="text-s">{label}</span>
    </div>
  );
};

const MAX_VISIBLE_TAGS = 5;

function formatItemName(name: string): string {
  const last = name.split('.').at(-1) ?? name;
  return capitalize(last);
}

const RemovableTag = ({ name, onRemove }: { name: string; onRemove: () => void }) => (
  <Tag
    color="blue"
    size="small"
    className="group cursor-pointer hover:bg-blue-58/20 transition-colors"
    onClick={onRemove}
  >
    <span className="max-w-[30ch] truncate">{formatItemName(name)}</span>
    <span className="grid grid-cols-[0fr] group-hover:grid-cols-[1fr] transition-[grid-template-columns] duration-150">
      <span className="overflow-hidden flex items-center">
        <Icon icon="cross" className="size-3 ml-1" />
      </span>
    </span>
  </Tag>
);

const FilterGroupRow = ({
  sectionKey,
  groupKey,
  items,
}: {
  sectionKey: ScreeningCategory;
  groupKey: string;
  items: { name: string }[];
}) => {
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const label = capitalize(groupKey);

  return (
    <div className="flex items-center gap-v2-md px-v2-md py-v2-sm">
      <span className="text-s font-semibold shrink-0">{label}:</span>
      <div className="flex items-center gap-v2-sm overflow-hidden">
        {items.length === 1 && items[0] ? (
          <SingleItemToggle item={items[0]} sectionKey={sectionKey} mode={mode} />
        ) : (
          <>
            <FilterGroupTags items={items} />
            {mode !== 'view' && <FilterGroupMenu items={items} sectionKey={sectionKey} />}
          </>
        )}
      </div>
    </div>
  );
};

const SingleItemToggle = ({
  item,
  sectionKey,
  mode,
}: {
  item: { name: string };
  sectionKey: ScreeningCategory;
  mode: string;
}) => {
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const isSelected = ContinuousScreeningConfigurationStepper.select((state) => !!state.data.datasets[item.name]);

  if (isSelected) {
    if (mode !== 'view') {
      return (
        <RemovableTag
          name={item.name}
          onRemove={() => {
            stepper.value.data.datasets[item.name] = false;
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
        stepper.value.data.datasets[item.name] = true;
        stepper.value.data.datasets[sectionKey] = true;
      }}
    >
      <Icon icon="plus" className="size-3" />
    </button>
  );
};

const FilterGroupTags = ({ items }: { items: { name: string }[] }) => {
  const { t } = useTranslation(['continuousScreening']);
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const selectedNames = ContinuousScreeningConfigurationStepper.select((state) =>
    items.filter((i) => state.data.datasets[i.name]).map((i) => i.name),
  );
  const [isExpanded, setIsExpanded] = useState(false);

  if (selectedNames.length === 0) return null;

  if (selectedNames.length === items.length && items.length > 1) {
    return (
      <Tag color="blue" size="small">
        {t('continuousScreening:creation.datasetSelection.filter.all')}
      </Tag>
    );
  }

  const overflow = selectedNames.length - MAX_VISIBLE_TAGS;
  const visible = isExpanded || overflow <= 0 ? selectedNames : selectedNames.slice(0, MAX_VISIBLE_TAGS);

  return (
    <>
      {visible.map((name) =>
        mode !== 'view' ? (
          <RemovableTag
            key={name}
            name={name}
            onRemove={() => {
              stepper.value.data.datasets[name] = false;
            }}
          />
        ) : (
          <Tag key={name} color="blue" size="small" className="max-w-[150px] overflow-hidden">
            <span className="truncate block">{formatItemName(name)}</span>
          </Tag>
        ),
      )}
      {overflow > 0 && (
        <Tag
          color="blue"
          size="small"
          className="cursor-pointer shrink-0 hover:bg-blue-58/20 transition-colors"
          onClick={() => setIsExpanded((v) => !v)}
        >
          {isExpanded ? <Icon icon="minus" className="size-3" /> : `+${overflow}`}
        </Tag>
      )}
    </>
  );
};

const FilterGroupMenu = ({ items, sectionKey }: { items: { name: string }[]; sectionKey: ScreeningCategory }) => {
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const datasets = ContinuousScreeningConfigurationStepper.select((state) => state.data.datasets);

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
          {items.map((item) => {
            const isSelected = !!datasets[item.name];
            return (
              <MenuCommand.Item
                key={item.name}
                value={item.name}
                selected={isSelected}
                onSelect={() => {
                  const nextValue = !stepper.value.data.datasets[item.name];
                  stepper.value.data.datasets[item.name] = nextValue;
                  if (nextValue) {
                    stepper.value.data.datasets[sectionKey] = true;
                  }
                }}
              >
                <span>{formatItemName(item.name)}</span>
                {isSelected && <Icon icon="tick" className="size-4 text-purple-primary" />}
              </MenuCommand.Item>
            );
          })}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
