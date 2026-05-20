import { DateRangeFilter } from '@app-builder/components/Filters';
import { PanelContainer, PanelContent, PanelFooter, PanelRoot } from '@app-builder/components/Panel/Panel';
import { type SavedScreeningSearch } from '@app-builder/models/screening';
import { useSavedFreeformSearchesQuery } from '@app-builder/queries/screening/freeform-search';
import { useOrganizationDetails } from '@app-builder/services/organization/organization-detail';
import { useOrganizationUsers } from '@app-builder/services/organization/organization-users';
import { formatDateTimeWithoutPresets, formatDuration, useFormatLanguage } from '@app-builder/utils/format';
import { useDebouncedCallbackRef } from '@marble/shared';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Temporal } from 'temporal-polyfill';
import { Avatar, Button, Collapsible, cn, Input, MenuCommand, Separator, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { FreeformMatchCard } from './FreeformMatchCard';

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

function toIsoRange(value: DateRangeFilterValue): { fromDate?: string; toDate?: string } {
  if (!value) return {};
  if (value.type === 'static') {
    return { fromDate: value.startDate || undefined, toDate: value.endDate || undefined };
  }
  const now = Temporal.Now.zonedDateTimeISO();
  return {
    fromDate: now.add(value.fromNow).toInstant().toString(),
    toDate: now.toInstant().toString(),
  };
}

const PAGE_SIZES = [25, 50, 100] as const;
type PageSize = (typeof PAGE_SIZES)[number];

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
    <Tag color="purple" size="big" className="w-full justify-between">
      <span className="inline-flex items-center gap-v2-xs truncate">
        <Icon icon={icon} className="size-4 shrink-0" />
        <span className="truncate font-medium">{label}</span>
      </span>
      <Button
        role="button"
        aria-label={clearAriaLabel}
        className="hover:text-purple-hover shrink-0 cursor-pointer"
        onClick={onClear}
      >
        <Icon icon="cross" className="size-4" />
      </Button>
    </Tag>
  );
}

export const ViewSavedResults = () => {
  const { t } = useTranslation(['screenings', 'common']);
  const [open, setOpen] = useState(false);

  const [nameInput, setNameInput] = useState('');
  const [name, setName] = useState('');
  const [dateRange, setDateRange] = useState<DateRangeFilterValue>(null);
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<PageSize>(25);

  const applyName = useDebouncedCallbackRef((value: string) => {
    setName(value);
    setPage(1);
  }, 300);

  const { fromDate, toDate } = useMemo(() => toIsoRange(dateRange), [dateRange]);

  const query = useSavedFreeformSearchesQuery({
    name: name || undefined,
    fromDate,
    toDate,
    ownerId,
    page,
    limit,
  });

  const data = query.data?.success ? query.data.data : undefined;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const rangeStart = items.length > 0 ? (page - 1) * limit + 1 : 0;
  const rangeEnd = (page - 1) * limit + items.length;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  return (
    <>
      <Button variant="primary" appearance="stroked" onClick={() => setOpen(true)}>
        {t('screenings:freeform_search.saved_results.button')}
      </Button>
      <PanelRoot open={open} onOpenChange={setOpen}>
        <PanelContainer size="5xl">
          <div className="flex items-center gap-v2-sm pb-v2-md">
            <Icon
              icon="cross"
              className="size-5 cursor-pointer text-grey-secondary hover:text-grey-primary"
              onClick={() => setOpen(false)}
              aria-label={t('common:close')}
            />
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
                applyName(e.currentTarget.value);
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
  const owner = getOrgUserById(search.ownerId);
  const isYou = currentUser.actorIdentity.userId === search.ownerId;

  return (
    <Collapsible.Container defaultOpen={false} className="bg-surface-card">
      <Collapsible.Title size="small">
        <div className="flex flex-1 items-center gap-v2-sm">
          <span className="font-semibold text-grey-primary">{search.name}</span>
          {owner ? (
            <span className="inline-flex items-center gap-v2-xs">
              <Avatar size="xs" firstName={owner.firstName} lastName={owner.lastName} />
              <span className="text-s text-grey-secondary">
                {`${owner.firstName} ${owner.lastName}`.trim()}
                {isYou ? ` (${t('screenings:freeform_search.saved_results.you')})` : null}
              </span>
            </span>
          ) : (
            <span className="text-s text-grey-secondary">{search.ownerId}</span>
          )}
          <span className="text-grey-placeholder">•</span>
          <span className="text-s text-grey-secondary">
            {formatDateTimeWithoutPresets(search.createdAt, { language, dateStyle: 'short' })}
          </span>
          <span className="text-grey-placeholder">•</span>
          <span className="text-s text-grey-secondary">
            {t('screenings:freeform_search.results_count', { count: search.results.length })}
          </span>
        </div>
      </Collapsible.Title>
      <Collapsible.Content>
        <div className="flex flex-col gap-v2-sm">
          {search.results.map((entity) => (
            <FreeformMatchCard key={entity.id} entity={entity} />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Container>
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
        <Button variant="secondary" appearance="stroked" className="w-full justify-between">
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
            size="default"
            onClick={() => {
              setDraft(null);
              onChange(null);
              setOpen(false);
            }}
          >
            {t('screenings:freeform_search.clear')}
          </Button>
          <Button
            size="default"
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
        <Button variant="secondary" appearance="stroked" className="w-full justify-between">
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
              size="default"
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
        <Button
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={!hasPrev}
          onClick={onPrev}
        >
          <Icon icon="arrow-left" className="size-5" />
        </Button>
        <Button
          mode="icon"
          size="default"
          variant="secondary"
          appearance="stroked"
          disabled={!hasNext}
          onClick={onNext}
        >
          <Icon icon="arrow-right" className="size-5" />
        </Button>
      </div>
    </div>
  );
}
