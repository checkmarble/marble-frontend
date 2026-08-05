import { CaseDueDateUrgencyTag } from '@app-builder/components/Cases/CaseDueDateUrgencyTag';
import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { MY_INBOX_ID } from '@app-builder/constants/inboxes';
import { SelectionProps } from '@app-builder/hooks/useTanstackTableListSelection';
import { Case } from '@app-builder/models/cases';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { isUnsetTimestamp } from '@app-builder/utils/datetime';
import { formatDateRelative, useFormatDateTime, useFormatLanguage } from '@app-builder/utils/format';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@tanstack/react-router';
import { createColumnHelper, getCoreRowModel, OnChangeFn, SortingState } from '@tanstack/react-table';
import { MouseEvent, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Checkbox, cn, StickyComponent, Table, Tag, TagProps, Tooltip, useTable } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseStatusBadgeV2 } from '../CaseStatus';
import { AssignedContributors } from './AssignedContributors';
import { PaginationRow, SuccessCasesQuery } from './PaginationRow';

export type CasesListProps = {
  fromInboxId: string;
  casesQuery: SuccessCasesQuery;
  sorting: 'ASC' | 'DESC';
  onSortingChange: (sort: 'ASC' | 'DESC') => void;
  limit: number;
  setLimit: (limit: number) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
} & SelectionProps<Case>;

const columnHelper = createColumnHelper<Case>();

export function CasesList({
  sorting,
  onSortingChange,
  casesQuery,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  fromInboxId,
  selectable,
  selectionProps,
  tableProps,
}: CasesListProps) {
  const { t } = useTranslation(['cases']);
  const language = useFormatLanguage();
  const formatDateTime = useFormatDateTime();
  const lastPageRef = useRef(0);
  const lastActionRef = useRef<null | [string, 'select' | 'unselect']>(null);
  const cases = casesQuery.data?.pages[currentPage]?.items ?? casesQuery.data?.pages[lastPageRef.current]?.items ?? [];
  const { orgTags } = useOrganizationTags();

  useEffect(() => {
    if (casesQuery.data?.pages[currentPage]?.items) {
      lastPageRef.current = currentPage;
    }
  }, [casesQuery.data?.pages[currentPage]?.items, currentPage]);

  const sortingState = useMemo<SortingState>(() => [{ id: 'created_at', desc: sorting === 'DESC' }], [sorting]);

  const handleSortingChange: OnChangeFn<SortingState> = (updater) => {
    const next = typeof updater === 'function' ? updater(sortingState) : updater;
    const sort = next.find((entry) => entry.id === 'created_at') ?? next[0];
    if (!sort) return;
    onSortingChange(sort.desc ? 'DESC' : 'ASC');
  };

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'status',
        header: ({ table }) => (
          <div className="relative flex items-center gap-sm ps-md">
            {selectable ? (
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 p-md"
                onClick={(e) => {
                  e.stopPropagation();
                  table.getToggleAllPageRowsSelectedHandler()(e);
                  lastActionRef.current = null;
                }}
              >
                <Checkbox
                  aria-label={t('cases:inbox.select_all_cases')}
                  checked={
                    table.getIsAllPageRowsSelected()
                      ? true
                      : table.getIsSomePageRowsSelected()
                        ? 'indeterminate'
                        : false
                  }
                />
              </div>
            ) : null}
            {t('cases:inbox.heading.status')}
          </div>
        ),
        size: 100,
        minSize: 80,
        enableSorting: false,
        enableResizing: false,
        cell: ({ row, table }) => {
          const isSelected = row.getIsSelected();

          const handleSelect = (e: MouseEvent) => {
            e.stopPropagation();

            const id = row.id;
            const lastAction = lastActionRef.current;
            const isIntendingMultiSelection = e.shiftKey;
            const isMultiSelectionPossible = lastAction !== null && lastAction[1] === 'select' && !isSelected;

            if (isIntendingMultiSelection && isMultiSelectionPossible) {
              const rows = table.getRowModel().rows;
              const lastClickedIdIndex = rows.findIndex((r) => r.id === lastAction[0]);

              // The anchor row is no longer displayed (filtered out, other page…): start a new range from here.
              if (lastClickedIdIndex >= 0) {
                const currentIndex = row.index;
                const [start, end] =
                  currentIndex > lastClickedIdIndex
                    ? [lastClickedIdIndex, currentIndex]
                    : [currentIndex, lastClickedIdIndex];

                table.setRowSelection((prev) => {
                  const next = { ...prev };
                  for (let i = start; i <= end; i++) {
                    const rangeRow = rows[i];
                    if (rangeRow) next[rangeRow.id] = true;
                  }
                  return next;
                });
                lastActionRef.current = [id, 'select'];
                return;
              }
            }

            row.toggleSelected(!isSelected);
            lastActionRef.current = [id, isSelected ? 'unselect' : 'select'];
          };

          return (
            <div className="relative flex items-center ps-md">
              {selectable ? (
                <div
                  className={cn(
                    'absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 p-md opacity-0 focus-within:opacity-100 group-hover/row:opacity-100',
                    isSelected && 'opacity-100',
                  )}
                  onClick={handleSelect}
                >
                  <Checkbox
                    aria-label={t('cases:inbox.select_case', { name: row.original.name })}
                    checked={isSelected}
                  />
                </div>
              ) : null}
              <CaseStatusBadgeV2 status={row.original.status} variant="icon-only" />
            </div>
          );
        },
      }),
      columnHelper.accessor('name', {
        id: 'name',
        header: t('cases:inbox.heading.name'),
        size: 280,
        minSize: 160,
        enableSorting: false,
        cell: ({ getValue }) => (
          <span className="group-hover/row-link:text-purple-primary group-hover/row-link:underline">{getValue()}</span>
        ),
      }),
      columnHelper.accessor('type', {
        id: 'type',
        header: t('cases:inbox.heading.type'),
        size: 64,
        minSize: 64,
        enableSorting: false,
        enableResizing: false,
        cell: ({ getValue }) => {
          const type = getValue();
          return (
            <Tooltip.Default content={t(`cases:inbox.tooltip.${type}`)}>
              <Icon
                icon={type === 'continuous_screening' ? 'scan-eye' : 'case-manager'}
                className={cn('size-5', {
                  'text-blue-58': type === 'decision',
                  'text-grey-secondary': type === 'continuous_screening',
                })}
              />
            </Tooltip.Default>
          );
        },
      }),
      columnHelper.display({
        id: 'review_status',
        header: t('cases:inbox.heading.review_status'),
        size: 180,
        minSize: 140,
        enableSorting: false,
        cell: ({ row }) => {
          const { outcome, reviewLevel } = row.original;
          const renderStatus = (icon: 'user' | 'wand', color: TagProps['color'], label: string) => (
            <div className="flex items-center gap-xs">
              <div className="flex items-center justify-center size-6 rounded-full border border-grey-placeholder">
                <Icon icon={icon} className="size-4 text-grey-placeholder" />
              </div>
              <Tag color={color}>
                <span>{label}</span>
              </Tag>
            </div>
          );

          return match({ outcome, reviewLevel })
            .with({ outcome: 'confirmed_risk' }, ({ outcome }) =>
              renderStatus('user', 'red', t(`cases:case.outcome.${outcome}`)),
            )
            .with({ outcome: 'valuable_alert' }, ({ outcome }) =>
              renderStatus('user', 'yellow', t(`cases:case.outcome.${outcome}`)),
            )
            .with({ outcome: 'false_positive' }, ({ outcome }) =>
              renderStatus('user', 'green', t(`cases:case.outcome.${outcome}`)),
            )
            .with({ reviewLevel: 'escalate' }, ({ reviewLevel }) =>
              renderStatus('wand', 'red', t(`cases:case.review_level.${reviewLevel}`)),
            )
            .with({ reviewLevel: 'investigate' }, ({ reviewLevel }) =>
              renderStatus('wand', 'yellow', t(`cases:case.review_level.${reviewLevel}`)),
            )
            .with({ reviewLevel: 'probable_false_positive' }, ({ reviewLevel }) =>
              renderStatus('wand', 'green', t(`cases:case.review_level.${reviewLevel}`)),
            )
            .otherwise(() => '-');
        },
      }),
      columnHelper.accessor('createdAt', {
        id: 'created_at',
        header: t('cases:inbox.heading.date'),
        size: 200,
        minSize: 160,
        enableSorting: true,
        cell: ({ getValue, row }) => {
          const createdAt = getValue();
          const dueAt = row.original.dueAt;
          const hasDueAt = !isUnsetTimestamp(dueAt);
          const formattedCreatedAt = formatDateTime(createdAt, {
            dateStyle: 'long',
            timeStyle: 'short',
          });

          return (
            <Tooltip.Default
              content={
                hasDueAt && dueAt ? (
                  <div className="flex flex-col gap-xs">
                    <span>{t('cases:inbox.tooltip.created', { date: formattedCreatedAt })}</span>
                    <span>
                      {t('cases:inbox.tooltip.due', {
                        date: formatDateTime(dueAt, {
                          dateStyle: 'long',
                          timeStyle: 'short',
                        }),
                      })}
                    </span>
                  </div>
                ) : (
                  formattedCreatedAt
                )
              }
            >
              <div className="flex items-center gap-sm">
                <time dateTime={createdAt}>{formatDateRelative(createdAt, { language })}</time>
                <CaseDueDateUrgencyTag dueAt={dueAt} status={row.original.status} />
              </div>
            </Tooltip.Default>
          );
        },
      }),
      columnHelper.accessor('tags', {
        id: 'tags',
        header: t('cases:inbox.heading.tags'),
        size: 160,
        minSize: 100,
        enableSorting: false,
        cell: ({ getValue }) => (
          <div className="flex gap-sm">
            {getValue().map((tagItem) => {
              const tag = orgTags.find((orgTag) => orgTag.id === tagItem.tagId);
              if (!tag) return null;
              return <TagPreview key={tag.id} name={tag.name} />;
            })}
          </div>
        ),
      }),
      columnHelper.display({
        id: 'assigned',
        header: () => (
          <>
            <span className="hidden lg:inline">{t('cases:inbox.heading.assigned_and_contributors')}</span>
            <span className="lg:hidden">{t('cases:inbox.heading.assignee')}</span>
          </>
        ),
        size: 140,
        minSize: 100,
        enableSorting: false,
        cell: ({ row }) => (
          <AssignedContributors assignedTo={row.original.assignedTo} contributors={row.original.contributors} />
        ),
      }),
    ],
    [t, selectable, formatDateTime, language, orgTags],
  );

  const { table, getBodyProps, rows, getContainerProps } = useTable({
    data: cases,
    columns,
    state: {
      sorting: sortingState,
      rowSelection: selectionProps?.rowSelection,
    },
    columnResizeMode: 'onChange',
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: selectable,
    enableSorting: true,
    enableSortingRemoval: false,
    manualSorting: true,
    onSortingChange: handleSortingChange,
    ...tableProps,
    rowLink: (caseItem) => (
      <Link
        to="/cases/$caseId"
        params={{ caseId: fromUUIDtoSUUID(caseItem.id) }}
        search={{
          fromInbox: fromInboxId === MY_INBOX_ID ? undefined : fromUUIDtoSUUID(fromInboxId),
        }}
      />
    ),
  });

  return (
    <div className="flex flex-col text-small bg-surface-card">
      <Table.Container {...getContainerProps()} className="bg-surface-card">
        <Table.Header headerGroups={table.getHeaderGroups()} />
        <Table.Body {...getBodyProps()}>
          {rows.map((row) => (
            <Table.Row key={row.id} row={row} />
          ))}
        </Table.Body>
      </Table.Container>
      <StickyComponent sentinelClassName="bottom-0 h-px">
        <PaginationRow
          casesQuery={casesQuery}
          currentPage={currentPage}
          currentLimit={limit}
          setCurrentPage={setCurrentPage}
          setLimit={setLimit}
          className="sentinel-intersect:shadow-sticky-bottom sentinel-intersect:border-grey-border"
        />
      </StickyComponent>
    </div>
  );
}
