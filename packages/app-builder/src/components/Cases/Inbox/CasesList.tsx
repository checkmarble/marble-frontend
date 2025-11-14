import { MultiSelect } from '@app-builder/components/MultiSelect';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { formatDateRelative, formatDateTimeWithoutPresets } from '@app-builder/utils/format';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { Link } from '@remix-run/react';
import { MouseEventHandler, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Checkbox, cn, Tooltip } from 'ui-design-system';
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
  isPaginationSticky: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
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
  isPaginationSticky,
  currentPage,
  setCurrentPage,
}: CasesListProps) {
  const {
    t,
    i18n: { language },
  } = useTranslation(['cases']);
  const lastPageRef = useRef<number>(0);
  const cases = casesQuery.data?.pages[currentPage]?.items ?? casesQuery.data?.pages[lastPageRef.current]?.items ?? [];
  const { orgTags } = useOrganizationTags();

  useEffect(() => {
    if (casesQuery.data?.pages[currentPage]?.items) {
      lastPageRef.current = currentPage;
    }
  }, [casesQuery.data?.pages[currentPage]?.items]);

  return (
    <div className="flex flex-col">
      <div className="w-full grid grid-cols-[0px_auto_1fr_auto_auto_auto_auto] border border-grey-border rounded-v2-md">
        <div className="grid grid-cols-subgrid col-span-full items-center group/table-row not-last:border-b border-grey-border">
          <HeaderCell className="ps-v2-xl relative col-span-2">
            <MultiSelect.Global>
              {(state, onSelect) => <SelectionCheckbox selectionState={state} onSelect={onSelect} />}
            </MultiSelect.Global>
            {t('cases:inbox.heading.status')}
          </HeaderCell>
          <HeaderCell>{t('cases:inbox.heading.name')}</HeaderCell>
          <HeaderCell>{t('cases:inbox.heading.review_status')}</HeaderCell>
          <HeaderCell className="flex items-center gap-v2-sm justify-between">
            {t('cases:inbox.heading.date')}
            <Icon
              icon="caret-down"
              className={cn('size-5 cursor-pointer', {
                'rotate-180': sorting === 'ASC',
              })}
              onClick={() => onSortingChange(sorting === 'ASC' ? 'DESC' : 'ASC')}
            />
          </HeaderCell>
          <HeaderCell>{t('cases:inbox.heading.tags')}</HeaderCell>
          <HeaderCell>
            <span className="hidden lg:inline">{t('cases:inbox.heading.assigned_and_contributors')}</span>
            <span className="lg:hidden">{t('cases:inbox.heading.assignee')}</span>
          </HeaderCell>
        </div>
        {cases.map((caseItem, index) => (
          <div
            className="grid grid-cols-subgrid col-span-full items-center group/table-row hover:bg-purple-98 cursor-pointer h-18"
            key={caseItem.id}
            onClick={handleRowClick}
          >
            <div className="invisible">
              <Link data-row-link to={getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(caseItem.id) })} />
            </div>
            <div className="relative p-v2-md ps-v2-xl w-25">
              <MultiSelect.Item index={index} id={caseItem.id} item={caseItem}>
                {(isSelected, onSelect) => <SelectionCheckbox selectionState={isSelected} onSelect={onSelect} />}
              </MultiSelect.Item>
              <CaseStatusBadge status={caseItem.status} size="large" showText={false} />
            </div>
            <div className="p-v2-md group-hover/table-row:text-purple-65 group-hover/table-row:underline">
              {caseItem.name}
            </div>
            <div className="p-v2-md">
              {caseItem.outcome && caseItem.outcome !== 'unset' ? (
                <span
                  className={cn('rounded-full border px-v2-sm py-v2-xs text-small text-nowrap', {
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
            <div className="p-v2-md">
              <Tooltip.Default
                content={formatDateTimeWithoutPresets(caseItem.createdAt, {
                  language,
                  dateStyle: 'long',
                  timeStyle: 'short',
                })}
              >
                <time dateTime={caseItem.createdAt}>{formatDateRelative(caseItem.createdAt, { language })}</time>
              </Tooltip.Default>
            </div>
            <div className="p-v2-md flex gap-v2-sm">
              {caseItem.tags.map((tagItem) => {
                const tag = orgTags.find((tag) => tag.id === tagItem.tagId);
                if (!tag) return null;
                return <TagPreview key={tag.id} name={tag.name} />;
              })}
            </div>
            <div className="p-v2-md">
              <AssignedContributors assignedTo={caseItem.assignedTo} contributors={caseItem.contributors} />
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
        className={isPaginationSticky ? 'shadow-sticky-bottom border-grey-border' : ''}
      />
    </div>
  );
}

const HeaderCell = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={cn('p-v2-md font-normal text-left not-first:border-l border-grey-border', className)}>
      {children}
    </div>
  );
};

const TagPreview = ({ name }: { name: string }) => (
  <div className="bg-purple-96 flex size-fit flex-row items-center gap-2 rounded-full px-2 py-[3px]">
    <span className="text-purple-65 text-xs font-normal">{name}</span>
  </div>
);

type SelectionCheckboxProps = {
  selectionState: boolean | 'indeterminate';
  onSelect: MouseEventHandler;
};

const SelectionCheckbox = ({ selectionState, onSelect }: SelectionCheckboxProps) => {
  return (
    <div
      className="group/checkbox-parent absolute left-0 top-[50%] translate-[-50%] p-v2-md opacity-0 group-hover/table-row:opacity-100 has-data-[state=checked]:opacity-100"
      onClick={onSelect}
    >
      <Checkbox checked={selectionState} />
    </div>
  );
};
