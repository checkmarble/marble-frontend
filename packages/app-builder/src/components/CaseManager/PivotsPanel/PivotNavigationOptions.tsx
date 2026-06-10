import { CreateNavigationOptionModal } from '@app-builder/components/Data/CreateNavigationOptionModal';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import { type CurrentUser, type DataModel, isAdmin, type TableModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button, cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type PivotNavigationOptionsProps = {
  currentUser: CurrentUser;
  pivotObject: PivotObject;
  table: TableModel;
  dataModel: DataModel;
  onExplore: () => void;
  className?: string;
  options?: {
    layout?: '1-column' | '2-columns' | '3-columns';
  };
};

export function PivotNavigationOptions({
  currentUser,
  pivotObject,
  table,
  dataModel,
  onExplore,
  options,
  className,
}: PivotNavigationOptionsProps) {
  const { t } = useTranslation(['cases']);
  const linksToTable = useMemo(() => {
    return R.pipe(
      dataModel,
      R.filter((dataModelTable) => dataModelTable.name !== table.name),
      R.flatMap((dataModelTable) => dataModelTable.linksToSingle),
      R.filter((dataModelTable) => dataModelTable.parentTableName === table.name),
    );
  }, [table, dataModel]);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  return (
    <>
      {linksToTable.length > 0 ? (
        <div
          className={cn(
            'grid auto-rows-[minmax(2rem,auto)] gap-x-4 gap-y-2 break-all items-center',
            options?.layout === '2-columns' && 'grid-cols-[repeat(2,max-content_minmax(0,1fr))]',
            options?.layout === '3-columns' && 'grid-cols-[repeat(3,max-content_minmax(0,1fr))]',
            (options?.layout === '1-column' || !options?.layout) && 'grid-cols-[max-content_minmax(0,1fr)]',
            className,
          )}
        >
          {linksToTable.map((linkToTable) => {
            const navigationOptions =
              table.navigationOptions?.filter(
                (navOption) => navOption.targetTableName === linkToTable.childTableName,
              ) ?? [];

            return navigationOptions.length > 0 ? (
              <Fragment key={linkToTable.childTableName}>
                {navigationOptions.map((navOption) => (
                  <Fragment key={`${navOption.targetTableName}_${navOption.orderingFieldName}`}>
                    <span className="text-grey-secondary">
                      {navOption.targetTableName}
                      {navigationOptions.length > 1 ? ` (${navOption.orderingFieldName})` : null}
                    </span>
                    <Button
                      disabled={navOption.status === 'pending'}
                      variant="secondary"
                      onClick={() => {
                        dataModelExplorerContext.startNavigation({
                          pivotObject,
                          sourceObject: pivotObject.pivotObjectData.data,
                          sourceTableName: table.name,
                          sourceFieldName: navOption.sourceFieldName,
                          targetTableName: navOption.targetTableName,
                          filterFieldName: navOption.filterFieldName,
                          orderingFieldName: navOption.orderingFieldName,
                        });
                        onExplore();
                      }}
                    >
                      {navOption.status === 'pending'
                        ? t('cases:case_detail.pivot_panel.explore_waiting_creation')
                        : t('cases:case_detail.pivot_panel.explore')}
                      {navOption.status === 'pending' ? (
                        <Icon icon="spinner" className="size-3.5 animate-spin" />
                      ) : (
                        <Icon icon="arrow-up-right" className="size-3.5" />
                      )}
                    </Button>
                  </Fragment>
                ))}
              </Fragment>
            ) : isAdmin(currentUser) ? (
              <Fragment key={linkToTable.childTableName}>
                <div>{linkToTable.childTableName}</div>
                <CreateNavigationOptionModal
                  label={t('cases:case_detail.pivot_panel.create_navigation_option')}
                  dataModel={dataModel}
                  link={linkToTable}
                />
              </Fragment>
            ) : null;
          })}
        </div>
      ) : null}
    </>
  );
}
