import { Callout } from '@app-builder/components/Callout';
import { Spinner } from '@app-builder/components/Spinner';
import { SCREENING_CATEGORY_COLORS, ScreeningCategory } from '@app-builder/models/screening';
import { useListConfigQuery } from '@app-builder/queries/screening/lists-config';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Checkbox, type CheckedState, Collapsible, cn, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { ContinuousScreeningConfigurationStepper } from '../../context/CreationStepper';

type ListConfig = NonNullable<Awaited<ReturnType<typeof useListConfigQuery>>['data']>;
type SectionData = NonNullable<ListConfig['sections'][keyof ListConfig['sections']]>;
type SanctionsSection = NonNullable<ListConfig['sections']['sanctions']>;
type PepsSection = NonNullable<ListConfig['sections']['peps']>;
type AdverseMediaSection = NonNullable<ListConfig['sections']['adverse-media']>;

function getSectionLeafNames(sectionKey: ScreeningCategory, section: SectionData): string[] {
  if (sectionKey === 'sanctions') {
    const s = section as SanctionsSection;
    return s.datasets.flatMap((g) => g.datasets.map((d) => d.name));
  }
  if (sectionKey === 'peps') {
    const s = section as PepsSection;
    return [...s.role, ...s.geography, ...s.position].map((i) => i.name);
  }
  if (sectionKey === 'adverse-media') {
    const s = section as AdverseMediaSection;
    return [...s.geography, ...s.category].map((i) => i.name);
  }
  return [];
}

function groupCheckState(names: string[], datasetsMap: Record<string, boolean>): CheckedState {
  if (names.length === 0) return false;
  const selected = names.filter((n) => datasetsMap[n]).length;
  if (selected === 0) return false;
  if (selected === names.length) return true;
  return 'indeterminate';
}

export const DatasetSelection = () => {
  const { t } = useTranslation(['common', 'continuousScreening']);
  const listConfigQuery = useListConfigQuery('continuous-screening');
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
          <SelectedListsCount />
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
                {data?.sections &&
                  Object.entries(data.sections).map(([key, section]) =>
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

const SelectedListsCount = () => {
  const { t } = useTranslation(['continuousScreening']);
  const selectedDatasetsCount = ContinuousScreeningConfigurationStepper.select(
    (state) => Object.values(state.data.datasets).filter(Boolean).length,
  );
  return <span>{t('continuousScreening:creation.datasetSelection.list.count', { count: selectedDatasetsCount })}</span>;
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
                stepper.value.data.datasets[sectionKey] = !stepper.value.data.datasets[sectionKey];
              }}
            />
            <Icon
              icon="caret-down"
              className={cn('size-4 shrink-0 rotate-0 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
            <Tag color={SCREENING_CATEGORY_COLORS[sectionKey] ?? 'grey'} size="small">
              {sectionKey}
            </Tag>
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
  if (sectionKey === 'sanctions') {
    const s = section as SanctionsSection;
    return (
      <div className="flex flex-col divide-y divide-grey-border">
        {s.datasets.map((group) => (
          <ItemGroup key={group.name} title={group.title} items={group.datasets} />
        ))}
      </div>
    );
  }

  if (sectionKey === 'peps') {
    const s = section as PepsSection;
    const groups = [
      { key: 'role', items: s.role },
      { key: 'geography', items: s.geography },
      { key: 'position', items: s.position },
    ].filter((g) => g.items.length > 0);
    return (
      <div className="flex flex-col divide-y divide-grey-border">
        {groups.map((g) => (
          <ItemGroup key={g.key} title={g.key} items={g.items} />
        ))}
      </div>
    );
  }

  if (sectionKey === 'adverse-media') {
    const s = section as AdverseMediaSection;
    const groups = [
      { key: 'geography', items: s.geography },
      { key: 'category', items: s.category },
    ].filter((g) => g.items.length > 0);
    return (
      <div className="flex flex-col divide-y divide-grey-border">
        {groups.map((g) => (
          <ItemGroup key={g.key} title={g.key} items={g.items} />
        ))}
      </div>
    );
  }

  return null;
};

const ItemGroup = ({ title, items }: { title: string; items: { name: string; title?: string }[] }) => {
  const { t } = useTranslation(['continuousScreening']);
  const stepper = ContinuousScreeningConfigurationStepper.useSharp();
  const mode = ContinuousScreeningConfigurationStepper.select((state) => state.__internals.mode);
  const [isExpanded, setIsExpanded] = useState(false);
  const names = items.map((i) => i.name);
  const checkState = ContinuousScreeningConfigurationStepper.select(
    (state): CheckedState => groupCheckState(names, state.data.datasets),
  );

  const handleSelectAll = () => {
    const datasets = stepper.value.data.datasets;
    const selected = names.filter((n) => datasets[n]).length;
    const nextValue = selected < names.length;
    for (const name of names) {
      stepper.value.data.datasets[name] = nextValue;
    }
  };

  return (
    <Collapsible.Container className="border-none px-v2-md py-v2-sm h-fit" defaultOpen={false}>
      <Collapsible.Title hideIcon asChild size="null">
        <div className="flex items-center gap-v2-md justify-between w-full" onClick={() => setIsExpanded(!isExpanded)}>
          <span className="flex items-center gap-v2-sm">
            <Icon
              icon="caret-down"
              className={cn('size-4 shrink-0 rotate-0 transition-transform duration-200', isExpanded && 'rotate-180')}
            />
            <span className="text-s font-semibold">{title}</span>
          </span>
          <span className="flex items-center gap-v2-sm font-normal">
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
            />
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content className="flex flex-col overflow-hidden border-none bg-surface-card radix-state-open:animate-slide-down radix-state-closed:animate-slide-up">
        <div className="flex flex-col gap-v2-sm pt-v2-sm">
          <div className="flex flex-col border border-grey-border rounded-v2-md overflow-hidden">
            {items.map((item) => (
              <ItemRow key={item.name} name={item.name} label={item.title ?? item.name} />
            ))}
          </div>
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
  );
};

const ItemRow = ({ name, label }: { name: string; label: string }) => {
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
        stepper.value.data.datasets[name] = !stepper.value.data.datasets[name];
      }}
    >
      <Checkbox size="small" checked={isSelected} disabled={mode === 'view'} />
      <span className="text-s">{label}</span>
    </div>
  );
};
