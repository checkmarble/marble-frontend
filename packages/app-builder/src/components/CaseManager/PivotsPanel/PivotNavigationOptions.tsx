import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import { type DataModel, isAdmin, type TableModel } from '@app-builder/models';
import { type PivotObject } from '@app-builder/models/cases';
import { CreateNavigationOptionModal } from '@app-builder/routes/ressources+/data+/$tableId.createNavigationOption';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

export type PivotNavigationOptionsProps = {
  currentUser: CurrentUser;
  pivotObject: PivotObject;
  table: TableModel;
  dataModel: DataModel;
  onExplore: () => void;
};

export function PivotNavigationOptions({
  currentUser,
  pivotObject,
  table,
  dataModel,
  onExplore,
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
        <div className="grid grid-cols-[160px,_1fr] gap-3">
          {linksToTable.map((linkToTable) => {
            const navigationOptions =
              table.navigationOptions?.filter(
                (navOption) => navOption.targetTableName === linkToTable.childTableName,
              ) ?? [];

            return navigationOptions.length > 0 ? (
              <Fragment key={linkToTable.childTableName}>
                {navigationOptions.map((navOption) => (
                  <Fragment key={`${navOption.targetTableName}_${navOption.orderingFieldName}`}>
                    <div>
                      {navOption.targetTableName}
                      {navigationOptions.length > 1 ? ` (${navOption.orderingFieldName})` : null}
                    </div>
                    <Button
                      size="small"
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
                      className="flex items-center gap-1"
                    >
                      {t('cases:case_detail.pivot_panel.explore')}
                      <Icon icon="arrow-up-right" className="size-4" />
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
