import { CursorPaginationButtons, usePaginationsButton } from '@app-builder/components/Decisions/PaginationButtons';
import { DateRangeFilter } from '@app-builder/components/Filters';
import { Panel } from '@app-builder/components/Panel';
import { IconDot } from '@app-builder/components/Screenings/MatchCard/match-card-entity-components';
import { SEARCH_ENTITIES, SearchableSchema } from '@app-builder/constants/screening-entity';
import { User } from '@app-builder/models';
import { type PaginationParams } from '@app-builder/models/pagination';
import { type SavedScreeningSearch } from '@app-builder/models/screening';
import {
  useGetFreeformSearchQuery,
  useSavedFreeformSearchesQuery,
} from '@app-builder/queries/screening/freeform-search';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTimeWithoutPresets, formatDuration, useFormatLanguage } from '@app-builder/utils/format';
import { omitUndefined } from '@app-builder/utils/omit-undefined';
import { ScreeningConfigBodySectionDto } from 'marble-api';
import { Fragment, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Avatar, Button, Collapsible, cn, MenuCommand, Separator, Switch, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import FreeformMatchCard from './FreeformMatchCard';

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

function toIsoRange(value: DateRangeFilterValue): { createdAfter?: string; createdBefore?: string } {
  if (!value) return {};
  if (value.type === 'static') {
    return { createdAfter: value.startDate || undefined, createdBefore: value.endDate || undefined };
  }
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    createdAfter: now.add(value.fromNow).toInstant().toString(),
    createdBefore: now.toInstant().toString(),
  };
}

const PAGE_SIZES = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZES)[number];

export const ViewSavedResults = () => {
  const { t } = useTranslation(['screenings', 'common']);
  const [open, setOpen] = useState(false);

  const [isSaved, setIsSaved] = useState(true);
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>(null);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [paginationParams, setPaginationParams] = useState<PaginationParams>({ limit: 25 });
  const { createdAfter, createdBefore } = useMemo(() => toIsoRange(dateRange), [dateRange]);

  const filterValues = useMemo(
    () =>
      omitUndefined({
        userId: ownerId,
        isSaved,
        createdAfter,
        createdBefore,
      }),
    [ownerId, isSaved, createdAfter, createdBefore],
  );

  const resetPagination = () => {
    setPaginationParams((prev) => ({ limit: prev.limit ?? 25 }));
  };

  const query = useSavedFreeformSearchesQuery(
    omitUndefined({
      ...filterValues,
      ...paginationParams,
    }),
  );

  const data = query.data;
  const items = data?.data ?? [];
  const hasNextPage = data?.has_next_page ?? false;
  const limit = (paginationParams.limit ?? 25) as PageSize;

  const paginationItems = useMemo(() => items.map((item) => ({ id: item.id, createdAt: item.created_at })), [items]);

  const paginationState = usePaginationsButton({
    filterValues,
    items: paginationItems,
    initialOffsetId: paginationParams.offsetId,
  });

  return (
    <>
      <Button variant="primary" appearance="stroked" onClick={() => setOpen(true)}>
        {t('screenings:freeform_search.saved_results.button')}
      </Button>
      <Panel.Root open={open} onOpenChange={setOpen}>
        <Panel.Container size="medium">
          <Panel.Content>
            <Panel.Header>{t('screenings:freeform_search.saved_results.title')}</Panel.Header>

            <div className="grid grid-cols-3 gap-md pb-md">
              <PeriodFilter
                value={dateRange}
                onChange={(v) => {
                  setDateRange(v);
                  resetPagination();
                }}
              />
              <OwnerFilter
                value={ownerId}
                onChange={(v) => {
                  setOwnerId(v);
                  resetPagination();
                }}
              />
              <div className="flex h-10 items-center gap-sm">
                <Switch
                  id="saved-only"
                  checked={isSaved}
                  onCheckedChange={(value) => {
                    setIsSaved(value);
                    resetPagination();
                  }}
                />
                <label htmlFor="saved-only" className="text-s text-grey-primary">
                  {t('screenings:freeform_search.saved_results.saved_only')}
                </label>
              </div>
            </div>

            {query.isLoading ? (
              <div className="text-s text-grey-secondary p-md">
                {t('screenings:freeform_search.saved_results.loading')}
              </div>
            ) : query.isError ? (
              <div className="text-s text-red-primary p-md">{t('screenings:freeform_search.saved_results.error')}</div>
            ) : items.length === 0 ? (
              <div className="text-s text-grey-secondary p-md">
                {t('screenings:freeform_search.saved_results.empty')}
              </div>
            ) : (
              <ul className="flex flex-col gap-sm">
                {items.map((search) => (
                  <li key={search.id}>
                    <SavedSearchRow search={search} />
                  </li>
                ))}
              </ul>
            )}
            <Panel.Footer>
              <div className="flex w-full items-center justify-between">
                <SavedResultsPageSizeSelector
                  limit={limit}
                  onLimitChange={(pageSize) => setPaginationParams({ limit: pageSize })}
                />
                <CursorPaginationButtons
                  items={paginationItems}
                  onPaginationChange={(newPaginationParams) =>
                    setPaginationParams((prev) => ({
                      limit: prev.limit ?? 25,
                      ...newPaginationParams,
                    }))
                  }
                  paginationState={paginationState}
                  boundariesDisplay="dates"
                  hasNextPage={hasNextPage}
                  itemsPerPage={limit}
                />
              </div>
            </Panel.Footer>
          </Panel.Content>
        </Panel.Container>
      </Panel.Root>
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
        <div className="flex flex-1 flex-wrap items-center gap-sm">
          <span className="text-grey-primary">{search.search_input.query?.['name']?.join(', ')}</span>
        </div>
        <div className="flex items-center gap-xs text-s text-grey-secondary font-normal">
          {owner ? (
            <span className="inline-flex items-center gap-xs">
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
          <span>{t('screenings:freeform_search.saved_results.hits', { count: search.nb_hits })}</span>
          <IconDot spaced />
          {search.is_saved ? <Icon icon="star" className={'size-5 fill-none text-purple-secondary'} /> : null}
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <FilterValues filter={search.search_config} />
        <QueryValues query={search.search_input} type={search.search_input.type} />
        <SavedResults id={search.id} />
      </Collapsible.Content>
    </Collapsible.Container>
  );
}

function FilterValues({ filter }: { filter: SavedScreeningSearch['search_config'] }) {
  const { t } = useTranslation(['screenings']);

  return (
    <div className="grid gap-xs">
      <div className="flex flex-wrap items-center gap-xs">
        <Tag color="white" appearance="monospace" className="gap-xs">
          {t('screenings:freeform_search.threshold_label')}: {filter.threshold}
        </Tag>
        <Tag color="white" appearance="monospace" className="gap-xs">
          {t('screenings:freeform_search.limit_label', { limit: filter.limit })}
        </Tag>
      </div>
      <div className="flex flex-wrap items-center gap-xs">
        {Object.entries(filter.filters)
          .filter(([, value]) => value.enabled)
          .map(([key, value], index) => (
            <Fragment key={`filter-${key}-${index}`}>
              {value?.datasets?.length && (
                <Tag color="white" appearance="monospace" className="gap-xs">
                  <span>{key}:</span>
                  <span>{value?.datasets?.length ?? 0}</span>
                </Tag>
              )}
              {value?.topics && <TopicTag topics={value.topics} />}
            </Fragment>
          ))}
      </div>
    </div>
  );
}

function TopicTag({ topics }: { topics: NonNullable<ScreeningConfigBodySectionDto['topics']> }) {
  const { t } = useTranslation(['screeningTopics']);

  function getKey(v: string) {
    if (v.startsWith('filter.')) return `lexis.${v.slice(7)}`;
    return `lexis.${v}`;
  }

  return (
    <>
      {Object.entries(topics).map(([key, value]) => (
        <Tag color="white" appearance="monospace" className="gap-xs h-auto text-wrap items-start break-words" key={key}>
          <span>{key}:</span>
          <span>{value.map((v) => t(`screeningTopics:${getKey(v)}`)).join(', ')}</span>
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
    <div className="flex flex-wrap items-center gap-xs">
      {type !== 'Thing' && (
        <Tag color="white" appearance="monospace" className="gap-xs">
          {t(`screenings:entity.schema.${type.toLocaleLowerCase()}`)}
        </Tag>
      )}
      {entityTypeFields.map((field) =>
        query.query[field] ? (
          <Tag color="white" appearance="monospace" className="gap-xs" key={field}>
            <span>{t(`screenings:entity.property.${field}`)}</span>:<span>{query.query[field].join(', ')}</span>
          </Tag>
        ) : null,
      )}
    </div>
  );
}

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
        <Button variant="secondary" appearance="stroked" className="w-full justify-between h-10" size="medium">
          <span className="inline-flex items-center gap-xs">
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
        <div className="border-grey-border flex justify-end gap-sm border-t p-sm">
          <Button
            variant="secondary"
            appearance="stroked"
            size="large"
            onClick={() => {
              setDraft(null);
              onChange(null);
              setOpen(false);
            }}
          >
            {t('screenings:freeform_search.clear')}
          </Button>
          <Button
            size="large"
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

function getOwnerLabel(owner: User) {
  return `${owner.firstName} ${owner.lastName}`.trim() || owner.email;
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

  const ownerLabel = owner ? getOwnerLabel(owner) : null;

  return (
    <MenuCommand.Menu open={open} onOpenChange={setOpen}>
      <MenuCommand.Trigger>
        {ownerLabel ? (
          <button type="button" className="cursor-pointer">
            <FilterPill icon="user" label={ownerLabel} />
          </button>
        ) : (
          <Button variant="secondary" appearance="stroked" className="w-full justify-between h-10" size="medium">
            <span className="truncate">{t('screenings:freeform_search.saved_results.select_owner')}</span>
            <Icon
              icon="smallarrow-up"
              className={cn('size-4 transition-transform duration-200 rotate-180', open && 'rotate-0')}
            />
          </Button>
        )}
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth className="mt-sm">
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
          {orgUsers.map((user) => (
            <MenuCommand.Item
              key={user.userId}
              value={user.userId}
              onSelect={() => {
                onChange(user.userId === value ? undefined : user.userId);
                setOpen(false);
              }}
            >
              <span className="inline-flex w-full justify-between">
                <span>{getOwnerLabel(user)}</span>
                {user.userId === value ? <Icon icon="tick" className="text-purple-primary size-5" /> : null}
              </span>
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function SavedResultsPageSizeSelector({
  limit,
  onLimitChange,
}: {
  limit: PageSize;
  onLimitChange: (limit: PageSize) => void;
}) {
  const { t } = useTranslation(['screenings']);

  return (
    <div className="flex items-center gap-xs">
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
  onClear?: () => void;
  clearAriaLabel?: string;
}) {
  return (
    <Tag color="purple" size="big" className="w-full justify-between bg-purple-primary/20">
      <span className="inline-flex items-center gap-xs truncate">
        <Icon icon={icon} className="size-4 shrink-0" />
        <span className="truncate font-medium">{label}</span>
      </span>
      {onClear ? (
        <Button
          role="button"
          appearance="link"
          aria-label={clearAriaLabel}
          className="hover:text-purple-hover shrink-0 cursor-pointer"
          onClick={onClear}
        >
          <Icon icon="cross" className="size-4" />
        </Button>
      ) : null}
    </Tag>
  );
}

function SavedResults({ id }: { id: string }) {
  const query = useGetFreeformSearchQuery(id);
  return query.isSuccess && query.data && query.data.matches ? (
    <div className="grid gap-sm mt-sm">
      {query.data.matches?.map((match) => {
        return <FreeformMatchCard key={match.id} entity={match} background="card" />;
      })}
    </div>
  ) : null;
}
