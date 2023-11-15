import { getRoute } from '@app-builder/utils/routes';
import * as Separator from '@radix-ui/react-separator';
import { Link } from '@remix-run/react';
import { forwardRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CtaClassName } from 'ui-design-system';
import { Cross, Plus } from 'ui-icons';

import { decisionsI18n } from '../decisions-i18n';
import {
  useClearFilter,
  useDecisionFiltersContext,
  useDecisionFiltersPartition,
} from './DecisionFiltersContext';
import { DecisionFiltersMenu } from './DecisionFiltersMenu';
import { FilterDetail } from './FilterDetail';
import { FilterPopover } from './FilterPopover';
import {
  type DecisionFilterName,
  getFilterIcon,
  getFilterTKey,
} from './filters';

export function DecisionFiltersBar() {
  const { t } = useTranslation(decisionsI18n);
  const { onDecisionFilterClose } = useDecisionFiltersContext();

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onDecisionFilterClose();
      }
    },
    [onDecisionFilterClose]
  );

  const { undefinedDecisionFilterNames, definedDecisionFilterNames } =
    useDecisionFiltersPartition();

  if (definedDecisionFilterNames.length === 0) {
    return null;
  }

  return (
    <>
      <Separator.Root className="bg-grey-10 h-[1px] w-full" decorative />
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex flex-row gap-2">
          {definedDecisionFilterNames.map((filterName) => {
            return (
              <FilterPopover.Root key={filterName} onOpenChange={onOpenChange}>
                <FilterPopover.Anchor asChild>
                  <FilterItem filterName={filterName} />
                </FilterPopover.Anchor>
                <FilterPopover.Content>
                  <FilterDetail filterName={filterName} />
                </FilterPopover.Content>
              </FilterPopover.Root>
            );
          })}
          <DecisionFiltersMenu filterNames={undefinedDecisionFilterNames}>
            <Button variant="tertiary">
              <Plus className="text-l" />
              <span className="capitalize">{t('decisions:filters.new')}</span>
            </Button>
          </DecisionFiltersMenu>
        </div>
        <Link
          className={CtaClassName({ variant: 'tertiary', color: 'grey' })}
          to={getRoute('/decisions')}
          replace
        >
          <Cross className="text-l" />
          <span className="capitalize">{t('decisions:filters.clear')}</span>
        </Link>
      </div>
    </>
  );
}

const FilterItem = forwardRef<
  HTMLDivElement,
  {
    filterName: DecisionFilterName;
  }
>(({ filterName }, ref) => {
  const { t } = useTranslation(decisionsI18n);
  const Icon = getFilterIcon(filterName);
  const tKey = getFilterTKey(filterName);
  const clearFilter = useClearFilter();

  return (
    <div
      className="bg-purple-05 flex h-10 flex-row items-center rounded"
      ref={ref}
    >
      <FilterPopover.Trigger className="-mr-1 flex h-full  flex-row items-center gap-1 rounded border border-solid border-transparent px-2 text-purple-100 outline-none focus:border-purple-100">
        <Icon className="text-l" />
        <span className="text-s font-semibold first-letter:capitalize">
          {t(tKey)}
        </span>
      </FilterPopover.Trigger>
      <button
        className="-ml-1 h-full rounded border border-solid border-transparent px-2 outline-none focus:border-purple-100"
        onClick={() => {
          clearFilter(filterName);
        }}
      >
        <Cross className="text-l text-purple-100" />
      </button>
    </div>
  );
});
FilterItem.displayName = 'FilterItem';
