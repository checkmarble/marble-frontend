import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { formatDateRelative } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { toggle } from 'radash';
import { MouseEventHandler, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CaseStatusBadge } from '../CaseStatus';
import { AssignedContributors } from './AssignedContributors';
import { PaginationRow, SuccessCasesQuery } from './PaginationRow';

export type CasesListProps = {
  casesQuery: SuccessCasesQuery;
  sorting: 'ASC' | 'DESC';
  onSortingChange: (sort: 'ASC' | 'DESC') => void;
  limit: number;
  setLimit: (limit: number) => void;
};

const handleRowClick: MouseEventHandler = (e) => {
  const rowLink = e.currentTarget.querySelector('[data-row-link]');
  if (rowLink && rowLink !== e.target && rowLink instanceof HTMLAnchorElement) {
    rowLink.dispatchEvent(new MouseEvent(e.type, e.nativeEvent));
  }
};

export function CasesList({
  sorting,
  onSortingChange,
  casesQuery,
  limit,
  setLimit,
}: CasesListProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['cases']);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const cases = casesQuery.data?.pages[currentPage]?.items ?? [];
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);
  const lastCheckboxIndexClickedRef = useRef<number | null>(null);
  const { orgTags } = useOrganizationTags();
  const globalSelectedStatus =
    selectedRows.length === 0
      ? false
      : selectedRows.length === cases.length
        ? true
        : 'indeterminate';

  const handleGlobalCheckboxClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    setSelectedRows((rows) => (rows.length > 0 ? [] : cases.map((c) => c.id)));
  };

  const handleCheckboxClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!tableBodyRef.current) {
      return;
    }

    const tableRowsCheckboxes = [
      ...tableBodyRef.current.querySelectorAll('button[role="checkbox"]'),
    ];
    const checkboxIndex = tableRowsCheckboxes.indexOf(e.currentTarget);
    if (checkboxIndex === -1) {
      return;
    }

    // Single row selection (either if shift key is not pressed or if the table body is not available)
    if (
      !e.shiftKey ||
      lastCheckboxIndexClickedRef.current === null ||
      checkboxIndex === lastCheckboxIndexClickedRef.current
    ) {
      const rowId = e.currentTarget.getAttribute('data-row-id');
      if (!rowId) return;

      setSelectedRows((rows) => toggle(rows, rowId));
      lastCheckboxIndexClickedRef.current = checkboxIndex;
      return;
    }

    // Multi row selection with shift key
    let rowsToAppend: string[] = [];

    if (checkboxIndex > lastCheckboxIndexClickedRef.current) {
      for (let i = lastCheckboxIndexClickedRef.current + 1; i <= checkboxIndex; i++) {
        rowsToAppend.push(tableRowsCheckboxes[i]!.getAttribute('data-row-id') ?? '');
      }
    } else {
      for (let i = lastCheckboxIndexClickedRef.current - 1; i >= checkboxIndex; i--) {
        rowsToAppend.push(tableRowsCheckboxes[i]!.getAttribute('data-row-id') ?? '');
      }
    }

    setSelectedRows((rows) => [...new Set([...rows, ...rowsToAppend])]);
    lastCheckboxIndexClickedRef.current = checkboxIndex;
  };

  return (
    <>
      <div className="w-full grid grid-cols-[0px_auto_1fr_auto_auto_auto_auto] border border-grey-border rounded-v2-md">
        <div className="grid grid-cols-subgrid col-span-full items-center group/table-row not-last:border-b border-grey-border">
          <HeaderCell className="ps-v2-xl relative col-span-2">
            <Checkbox
              checked={globalSelectedStatus}
              className="absolute left-0 top-[50%] translate-[-50%] opacity-0 group-hover/table-row:opacity-100 data-[state=checked]:opacity-100 data-[state=indeterminate]:opacity-100"
              onClick={handleGlobalCheckboxClick}
            />
            Status
          </HeaderCell>
          <HeaderCell>Name</HeaderCell>
          <HeaderCell>Review status</HeaderCell>
          <HeaderCell className="flex items-center gap-v2-sm justify-between">
            Date
            <Icon
              icon="caret-down"
              className={cn('size-5', { 'rotate-180': sorting === 'ASC' })}
              onClick={() => onSortingChange(sorting === 'ASC' ? 'DESC' : 'ASC')}
            />
          </HeaderCell>
          <HeaderCell>Tags</HeaderCell>
          <HeaderCell>Assigned & Contributors</HeaderCell>
        </div>
        {cases.map((caseItem) => (
          <div
            className="grid grid-cols-subgrid col-span-full items-center group/table-row hover:bg-purple-98 cursor-pointer"
            key={caseItem.id}
            onClick={handleRowClick}
          >
            <div className="invisible">
              <Link
                data-row-link
                to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseItem.id) })}
              />
            </div>
            <div className="relative p-v2-md ps-v2-xl w-25">
              <Checkbox
                checked={selectedRows.includes(caseItem.id)}
                data-row-id={caseItem.id}
                className="absolute left-0 top-[50%] translate-[-50%] opacity-0 group-hover/table-row:opacity-100 data-[state=checked]:opacity-100"
                onClick={handleCheckboxClick}
              />
              <CaseStatusBadge status={caseItem.status} size="large" showText={false} />
            </div>
            <div className="p-v2-md group-hover/table-row:text-purple-65 group-hover/table-row:underline">
              {caseItem.name}
            </div>
            <div className="p-v2-md">
              {caseItem.outcome && caseItem.outcome !== 'unset' ? (
                <span
                  className={cn('rounded-full border px-v2-sm py-v2-xs text-small', {
                    'border-red-47 text-red-47': caseItem.outcome === 'confirmed_risk',
                    'border-green-38 text-green-38': caseItem.outcome === 'valuable_alert',
                    'border-grey-50 text-grey-50': caseItem.outcome === 'false_positive',
                  })}
                >
                  {t(`cases:case.outcome.${caseItem.outcome}`)}
                </span>
              ) : (
                '-'
              )}
            </div>
            <div className="p-v2-md">{formatDateRelative(caseItem.createdAt, { language })}</div>
            <div className="p-v2-md flex gap-v2-sm">
              {caseItem.tags.map((tagItem) => {
                const tag = orgTags.find((tag) => tag.id === tagItem.tagId);
                if (!tag) return null;
                return <TagPreview key={tag.id} name={tag.name} />;
              })}
            </div>
            <div className="p-v2-md">
              <AssignedContributors
                assignedTo={caseItem.assignedTo}
                contributors={caseItem.contributors}
              />
            </div>
          </div>
        ))}
      </div>
      <PaginationRow
        casesQuery={casesQuery}
        currentPage={currentPage}
        currentLimit={limit}
        setCurrentPage={setCurrentPage}
        setLimit={setLimit}
      />
    </>
  );
}

const HeaderCell = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div
      className={cn(
        'p-v2-md font-normal text-left not-first:border-l border-grey-border',
        className,
      )}
    >
      {children}
    </div>
  );
};

const TagPreview = ({ name }: { name: string }) => (
  <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
  </div>
);
