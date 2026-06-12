import { DateRangeFilter } from '@app-builder/components/Filters';
import { PanelContainer, PanelContent, PanelFooter, PanelRoot } from '@app-builder/components/Panel/Panel';
import { IconDot, SEARCH_ENTITIES, SearchableSchema } from '@app-builder/constants/screening-entity';
import { type SavedScreeningSearch } from '@app-builder/models/screening';
import { useSavedFreeformSearchesQuery } from '@app-builder/queries/screening/freeform-search';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
// import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTimeWithoutPresets, formatDuration, useFormatLanguage } from '@app-builder/utils/format';
import { ScreeningConfigBodySectionDto } from 'marble-api';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
// import { Temporal } from 'temporal-polyfill';
import {
  Avatar,
  // Avatar,
  Button,
  Collapsible,
  // Collapsible,
  cn,
  // ExpandableGroupTagLine,
  Input,
  MenuCommand,
  Separator,
  Tag,
} from 'ui-design-system';
import { Icon } from 'ui-icons';

// import { FreeformMatchCard } from './FreeformMatchCard';

interface StaticDateRangeFilter {
  type: 'static';
  startDate: string;
  endDate: string;
}
interface DynamicDateRangeFilter {
  type: 'dynamic';
  fromNow: string;
}
type DateRangeFilterValue = StaticDateRangeFilter | DynamicDateRangeFilter | null;

// function toIsoRange(value: DateRangeFilterValue): { fromDate?: string; toDate?: string } {
//   if (!value) return {};
//   if (value.type === 'static') {
//     return { fromDate: value.startDate || undefined, toDate: value.endDate || undefined };
//   }
//   const now = Temporal.Now.zonedDateTimeISO();
//   return {
//     fromDate: now.add(value.fromNow).toInstant().toString(),
//     toDate: now.toInstant().toString(),
//   };
// }

const PAGE_SIZES = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZES)[number];

export const ViewSavedResults = () => {
  const { t } = useTranslation(['screenings', 'common']);
  const [open, setOpen] = useState(false);

  const [nameInput, setNameInput] = useState('');
  // const [name, setName] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>(null);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(25);

  // const applyName = useDebouncedCallbackRef((value: string) => {
  //   setName(value);
  //   setPage(1);
  // }, 300);

  // const { fromDate, toDate } = useMemo(() => toIsoRange(dateRange), [dateRange]);

  const query = useSavedFreeformSearchesQuery();

  // {
  //   name: name || undefined,
  //   fromDate,
  //   toDate,
  //   ownerId,
  //   page,
  //   limit,
  // });

  const data = query.data?.success ? query.data.data : undefined;
  const items = data?.data ?? [];
  const hasNext = data?.has_next_page ?? false;

  const rangeStart = items.length > 0 ? (page - 1) * limit + 1 : 0;
  const rangeEnd = (page - 1) * limit + items.length;
  const hasPrev = page > 1;

  return (
    <>
      <Button variant="primary" appearance="stroked" onClick={() => setOpen(true)}>
        {t('screenings:freeform_search.saved_results.button')}
      </Button>
      <PanelRoot open={open} onOpenChange={setOpen}>
        <PanelContainer size="5xl">
          <div className="flex items-center gap-v2-sm pb-v2-md">
            <button
              type="button"
              aria-label={t('common:close')}
              className="cursor-pointer text-grey-secondary hover:text-grey-primary"
              onClick={() => setOpen(false)}
            >
              <Icon icon="cross" className="size-5" />
            </button>
            <h2 className="text-l font-bold text-grey-primary">
              {t('screenings:freeform_search.saved_results.title')}
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-v2-md pb-v2-md">
            <Input
              type="search"
              startAdornment="search"
              placeholder={t('screenings:freeform_search.saved_results.search_placeholder')}
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.currentTarget.value);
                // applyName(e.currentTarget.value);
              }}
            />
            <PeriodFilter
              value={dateRange}
              onChange={(v) => {
                setDateRange(v);
                setPage(1);
              }}
            />
            <OwnerFilter
              value={ownerId}
              onChange={(v) => {
                setOwnerId(v);
                setPage(1);
              }}
            />
          </div>

          <PanelContent>
            {query.isLoading ? (
              <div className="text-s text-grey-secondary p-v2-md">
                {t('screenings:freeform_search.saved_results.loading')}
              </div>
            ) : query.data?.success === false ? (
              <div className="text-s text-red-primary p-v2-md">
                {t('screenings:freeform_search.saved_results.error')}
              </div>
            ) : items.length === 0 ? (
              <div className="text-s text-grey-secondary p-v2-md">
                {t('screenings:freeform_search.saved_results.empty')}
              </div>
            ) : (
              <ul className="flex flex-col gap-v2-sm">
                {items.map((search) => (
                  <li key={search.id}>
                    <SavedSearchRow search={search} />
                  </li>
                ))}
              </ul>
            )}
          </PanelContent>

          <PanelFooter>
            <ViewSavedResultsPaginationRow
              limit={limit}
              onLimitChange={(l) => {
                setLimit(l);
                setPage(1);
              }}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              hasPrev={hasPrev}
              hasNext={hasNext}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </PanelFooter>
        </PanelContainer>
      </PanelRoot>
    </>
  );
};

function SavedSearchRow({ search }: { search: SavedScreeningSearch }) {
  const { t } = useTranslation(['screenings', 'common']);
  const language = useFormatLanguage();
  const { currentUser } = useOrganizationDetails();
  const { getOrgUserById } = useOrganizationUsers();
  const owner = search.user_id ? getOrgUserById(search.user_id) : undefined;
  const isYou = currentUser.actorIdentity.userId === search.user_id;

  return (
    <Collapsible.Container defaultOpen={false} className="bg-grey-background-light">
      <Collapsible.Title size="small" iconPosition="left" className="grid">
        <div className="flex flex-1 flex-wrap items-center gap-v2-sm">
          <span className="text-grey-primary">{search.search_input.query?.['name']?.join(', ')}</span>
        </div>
        <div className="flex items-center gap-v2-xs text-s text-grey-secondary font-normal">
          {owner ? (
            <span className="inline-flex items-center gap-v2-xs">
              <Avatar size="xs" firstName={owner.firstName} lastName={owner.lastName} />
              <span className="text-grey-primary">
                {`${owner.firstName} ${owner.lastName}`.trim()}
                {isYou ? ` (${t('screenings:freeform_search.saved_results.you')})` : null}
              </span>
            </span>
          ) : (
            <span>{search.user_id}</span>
          )}
          <IconDot spaced />
          <span>{formatDateTimeWithoutPresets(search.created_at, { language, dateStyle: 'short' })}</span>
          <IconDot spaced />
          {search.is_saved ? <span></span> : <span>{t('screenings:freeform_search.saved_results.not_saved')}</span>}
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <FilterValues filter={search.search_config} />
        <QueryValues query={search.search_input} type={search.search_input.type} />
        {/* <div className="flex flex-col gap-v2-sm">
          {search.results.map((entity) => (
            <FreeformMatchCard key={entity.id} entity={entity} />
          ))}
        </div> */}
        {/* <pre>{JSON.stringify(search, null, 2)}</pre> */}
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function FilterValues({ filter }: { filter: SavedScreeningSearch['search_config'] }) {
  return (
    <div className="flex flex-wrap items-center gap-v2-xs">
      <Tag color="white" appearance="monospace" className="gap-v2-xs">
        {filter.provider}
      </Tag>

      {Object.entries(filter.filters)
        .filter(([, value]) => value.enabled)
        .map(([key, value], index) => (
          <>
            {value?.datasets?.length && (
              <Tag color="white" appearance="monospace" className="gap-v2-xs" key={`dataset-${key}-${index}`}>
                {key}:{value?.datasets?.length ?? 0}
              </Tag>
            )}
            {value?.topics && <TopicTag key={`${key}-${index}`} topics={value.topics} />}
          </>
        ))}
    </div>
  );
}

function TopicTag({ topics }: { topics: NonNullable<ScreeningConfigBodySectionDto['topics']> }) {
  const { t } = useTranslation(['screenings']);
  if (topics['livness'] && topics['livness'].length === 1)
    return (
      <Tag color="white" appearance="monospace" className="gap-v2-xs">
        {t('freeform_search.global.liveness')}
      </Tag>
    );
  return (
    <>
      {Object.entries(topics).map(([key, value]) => (
        <Tag color="white" appearance="monospace" className="gap-v2-xs" key={key}>
          {key}:{value?.length ?? 0}
        </Tag>
      ))}
    </>
  );
}

function QueryValues({ query, type }: { query: SavedScreeningSearch['search_input']; type: SearchableSchema }) {
  const { t } = useTranslation(['screenings']);
  const entityType = query.type;
  const entityTypeFields =
    entityType && entityType in SEARCH_ENTITIES
      ? SEARCH_ENTITIES[entityType].fields.filter((f: string) => f !== 'name')
      : [];

  return (
    <div className="flex flex-wrap items-center gap-v2-xs">
      {type !== 'Thing' && (
        <Tag color="white" appearance="monospace" className="gap-v2-xs">
          {t(`screenings:entity.schema.${type.toLocaleLowerCase()}`)}
        </Tag>
      )}
      {entityTypeFields.map((field) => (
        <Tag color="white" appearance="monospace" className="gap-v2-xs" key={field}>
          <span>{t(`screenings:entity.property.${field}.short`)}</span>:<span>{query.query[field]?.join(', ')}</span>
        </Tag>
      ))}
    </div>
  );
}

// const inputTagOverflowButtonClassName = 'cursor-pointer shrink-0';

// function InputTags({ input }: { input: SavedScreeningSearch['inputs'] }) {
//   const { t } = useTranslation(['screenings']);

//   const tagItems = useMemo(() => {
//     const items: ReactNode[] = [];

//     if (input.entityType) {
//       items.push(
//         <InputTag
//           key="entity"
//           label={`${t('screenings:freeform_search.saved_results.entity')}:`}
//           values={input.entityType}
//         />,
//       );
//     }

//     const datasets = input.datasets.filter((d) => d.indexOf(':') <= 0);
//     if (datasets.length > 0) {
//       items.push(<InputTag key="datasets" values={datasets} />);
//     }

//     for (const [field, value] of Object.entries(input.fields)) {
//       if (value) {
//         items.push(
//           <InputTag key={field} label={`${t(`screenings:entity.property.${field}.short`)}:`} values={value} />,
//         );
//       }
//     }

//     return items;
//   }, [input, t]);

//   if (tagItems.length === 0) return null;

//   return (
//     <ExpandableGroupTagLine
//       items={tagItems}
//       moreButton={(overflow, onExpand) => (
//         <Tag color="white" appearance="monospace" className={inputTagOverflowButtonClassName} onClick={onExpand}>
//           +{overflow}
//         </Tag>
//       )}
//       lessButton={(onCollapse) => (
//         <Tag color="white" appearance="monospace" className={inputTagOverflowButtonClassName} onClick={onCollapse}>
//           <Icon icon="minus" className="size-3" />
//         </Tag>
//       )}
//     />
//   );
// }

// function InputTag({ label, values }: { label?: string; values: string | string[] }) {
//   if (values.length === 0) return null;
//   return (
//     <Tag color="white" appearance="monospace" className="gap-v2-xs">
//       {label ? <span>{label}</span> : null}
//       {Array.isArray(values) ? (
//         <span>
//           <span>{values.slice(0, 2).join(', ')}</span>
//           {values.length > 2 ? <span>{` +${values.length - 2}`}</span> : null}
//         </span>
//       ) : (
//         <span>{values}</span>
//       )}
//     </Tag>
//   );
// }

function PeriodFilter({
  value,
  onChange,
}: {
  value: DateRangeFilterValue;
  onChange: (value: DateRangeFilterValue) => void;
}) {
  const { t } = useTranslation(['screenings', 'common']);
  const language = useFormatLanguage();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DateRangeFilterValue>(value);

  const selectedLabel = (() => {
    if (!value) return null;
    if (value.type === 'static') {
      const from = value.startDate
        ? formatDateTimeWithoutPresets(value.startDate, { language, dateStyle: 'short' })
        : '…';
      const to = value.endDate ? formatDateTimeWithoutPresets(value.endDate, { language, dateStyle: 'short' }) : '…';
      return `${from} → ${to}`;
    }
    return formatDuration(value.fromNow, language);
  })();

  if (selectedLabel)
    return (
      <FilterPill
        icon="calendar-month"
        label={selectedLabel}
        onClear={() => onChange(null)}
        clearAriaLabel={t('screenings:freeform_search.clear')}
      />
    );
  return (
    <MenuCommand.Menu
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setDraft(value);
      }}
    >
      <MenuCommand.Trigger>
        <Button variant="secondary" appearance="stroked" className="w-full justify-between h-10" size="default">
          <span className="inline-flex items-center gap-v2-xs">
            <Icon icon="calendar-month" className="size-4" />
            <span className="truncate">{t('screenings:freeform_search.saved_results.select_period')}</span>
          </span>
          <Icon
            icon="smallarrow-up"
            className={cn('size-4 transition-transform duration-200 rotate-180', open && 'rotate-0')}
          />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content className="min-w-[28rem]">
        <MenuCommand.List>
          <DateRangeFilter.Root
            dateRangeFilter={draft}
            setDateRangeFilter={(v) => setDraft(v ?? null)}
            className="grid"
          >
            <DateRangeFilter.FromNowPicker title={t('screenings:freeform_search.saved_results.select_period')} />
            <Separator className="bg-grey-border" decorative orientation="vertical" />
            <DateRangeFilter.Calendar />
            <DateRangeFilter.Summary className="col-span-3 row-span-1" />
          </DateRangeFilter.Root>
        </MenuCommand.List>
        <div className="border-grey-border flex justify-between gap-2 border-t p-2">
          <Button
            variant="secondary"
            appearance="stroked"
            size="medium"
            onClick={() => {
              setDraft(null);
              onChange(null);
              setOpen(false);
            }}
          >
            {t('screenings:freeform_search.clear')}
          </Button>
          <Button
            size="medium"
            onClick={() => {
              onChange(draft);
              setOpen(false);
            }}
          >
            {t('screenings:freeform_search.apply')}
          </Button>
        </div>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function OwnerFilter({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const { t } = useTranslation(['screenings', 'common']);
  const { orgUsers, getOrgUserById } = useOrganizationUsers();
  const [open, setOpen] = useState(false);
  const owner = value ? getOrgUserById(value) : undefined;

  const ownerLabel = owner ? `${owner.firstName} ${owner.lastName}`.trim() : null;

  if (ownerLabel)
    return (
      <FilterPill
        icon="user"
        label={ownerLabel}
        onClear={() => onChange(undefined)}
        clearAriaLabel={t('screenings:freeform_search.clear')}
      />
    );
  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        <Button variant="secondary" appearance="stroked" className="w-full justify-between h-10" size="default">
          <span className="truncate">{t('screenings:freeform_search.saved_results.select_owner')}</span>
          <Icon
            icon="smallarrow-up"
            className={cn('size-4 transition-transform duration-200 rotate-180', open && 'rotate-0')}
          />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth className="mt-2">
        <MenuCommand.Combobox placeholder={t('screenings:freeform_search.saved_results.select_owner')} />
        <MenuCommand.List>
          <MenuCommand.Item
            value=""
            onSelect={() => {
              onChange(undefined);
              setOpen(false);
            }}
          >
            {t('screenings:freeform_search.saved_results.all_owners')}
          </MenuCommand.Item>
          {orgUsers.map(({ userId, firstName, lastName }) => (
            <MenuCommand.Item
              key={userId}
              value={userId}
              onSelect={() => {
                onChange(userId === value ? undefined : userId);
                setOpen(false);
              }}
            >
              <span className="inline-flex w-full justify-between">
                <span>{`${firstName} ${lastName}`.trim()}</span>
                {userId === value ? <Icon icon="tick" className="text-purple-primary size-5" /> : null}
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function ViewSavedResultsPaginationRow({
  limit,
  onLimitChange,
  rangeStart,
  rangeEnd,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}: {
  limit: PageSize;
  onLimitChange: (limit: PageSize) => void;
  rangeStart: number;
  rangeEnd: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { t } = useTranslation(['screenings']);

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-v2-xs">
        <span className="text-s text-grey-secondary">
          {t('screenings:freeform_search.saved_results.results_per_page')}
        </span>
        {PAGE_SIZES.map((size) => {
          const active = size === limit;
          return (
            <Button
              key={size}
              variant="secondary"
              appearance="stroked"
              size="medium"
              className={cn(active && 'border-purple-primary text-purple-primary')}
              onClick={() => {
                if (!active) onLimitChange(size);
              }}
            >
              {size}
            </Button>
          );
        })}
      </div>
      <div className="flex items-center gap-v2-sm">
        <span className="text-s text-grey-secondary">
          {t('screenings:freeform_search.saved_results.range', { start: rangeStart, end: rangeEnd })}
        </span>
        <Button mode="icon" size="medium" variant="secondary" appearance="stroked" disabled={!hasPrev} onClick={onPrev}>
          <Icon icon="arrow-left" className="size-5" />
        </Button>
        <Button mode="icon" size="medium" variant="secondary" appearance="stroked" disabled={!hasNext} onClick={onNext}>
          <Icon icon="arrow-right" className="size-5" />
        </Button>
      </div>
    </div>
  );
}

function FilterPill({
  icon,
  label,
  onClear,
  clearAriaLabel,
}: {
  icon: 'calendar-month' | 'user';
  label: string;
  onClear: () => void;
  clearAriaLabel: string;
}) {
  return (
    <Tag color="purple" size="big" className="w-full justify-between bg-purple-primary/20">
      <span className="inline-flex items-center gap-v2-xs truncate">
        <Icon icon={icon} className="size-4 shrink-0" />
        <span className="truncate font-medium">{label}</span>
      </span>
      <Button
        role="button"
        appearance="link"
        aria-label={clearAriaLabel}
        className="hover:text-purple-hover shrink-0 cursor-pointer"
        onClick={onClear}
      >
        <Icon icon="cross" className="size-4" />
      </Button>
    </Tag>
  );
}
