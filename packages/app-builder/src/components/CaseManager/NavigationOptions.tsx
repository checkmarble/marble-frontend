import { CurrentUser, DataModel, isAdmin, NavigationOption, TableModel } from '@app-builder/models';
import { CaseClient } from '@app-builder/models/cases';
import { Fragment, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import * as R from 'remeda';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { CreateNavigationOptionModal } from '../Data/CreateNavigationOptionModal';
import { DataModelExplorerContext } from '../DataModelExplorer/Provider';
import { type DataModelExplorerNavigationTab } from '../DataModelExplorer/types';

export type NavigationOptionsProps = {
  currentUser: CurrentUser;
  client: CaseClient;
  table: TableModel;
  dataModel: DataModel;
  onExplore: () => void;
};

export function NavigationOptions({ currentUser, client, table, dataModel, onExplore }: NavigationOptionsProps) {
  const { t } = useTranslation(['cases']);
  const linksToTable = useMemo(() => {
    return R.pipe(
      dataModel,
      R.filter((dataModelTable) => dataModelTable.name !== table.name),
      R.flatMap((dataModelTable) => dataModelTable.linksToSingle),
      R.filter((dataModelTable) => dataModelTable.parentTableName === table.name),
      // Several links can point at the same child table; the nav options are filtered by
      // child table name below, so keep one entry per child table to avoid rendering the
      // same options twice.
      R.uniqueBy((link) => link.childTableName),
    );
  }, [table, dataModel]);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  if (linksToTable.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-sm flex-wrap">
      {linksToTable.map((linkToTable, idx) => {
        const navOptions =
          table.navigationOptions?.filter((no) => no.targetTableName === linkToTable.childTableName) ?? [];
        const hasTimestampOrderingNavigationOption = hasTimestampOrderingOption(dataModel, navOptions);

        return navOptions.length > 0 ? (
          <Fragment key={`${linkToTable.childTableName}-${idx}`}>
            {navOptions.map((navOption, idx2) => (
              <Button
                key={`${navOption.id}-${idx2}`}
                variant="primary"
                appearance="link"
                className="shrink-0"
                disabled={navOption.status === 'pending'}
                onClick={() => {
                  dataModelExplorerContext.startNavigation({
                    pivotObject: getExplorerPivotObject(client),
                    sourceObject: client.object.data,
                    navigationOptionId: navOption.id,
                    sourceTableName: table.name,
                    sourceFieldName: navOption.sourceFieldName,
                    targetTableName: navOption.targetTableName,
                    filterFieldName: navOption.filterFieldName,
                    orderingFieldName: navOption.orderingFieldName,
                  });
                  onExplore();
                }}
              >
                <span>
                  {navOption.targetTableName}
                  {navOptions.length > 1 ? ` (${navOption.orderingFieldName})` : null}
                </span>
                {navOption.status === 'pending' ? (
                  <Icon icon="spinner" className="size-4 animate-spin" />
                ) : (
                  <Icon icon="eye" className="size-4" />
                )}
              </Button>
            ))}
            {isAdmin(currentUser) && !hasTimestampOrderingNavigationOption ? (
              <CreateNavigationOptionModal dataModel={dataModel} link={linkToTable}>
                <Button
                  aria-label={t('cases:case_detail.pivot_panel.create_navigation_option')}
                  variant="primary"
                  appearance="link"
                  mode="icon"
                >
                  <Icon icon="plus" className="size-4" />
                </Button>
              </CreateNavigationOptionModal>
            ) : null}
          </Fragment>
        ) : isAdmin(currentUser) ? (
          <CreateNavigationOptionModal key={linkToTable.childTableName} dataModel={dataModel} link={linkToTable}>
            <Button variant="primary" appearance="link" className="shrink-0">
              <span>{linkToTable.childTableName}</span>
              <Icon icon="plus" className="size-4" />
            </Button>
          </CreateNavigationOptionModal>
        ) : null;
      })}
    </div>
  );
}

export function hasTimestampOrderingOption(dataModel: DataModel, navigationOptions: NavigationOption[]) {
  return navigationOptions.some((navigationOption) =>
    dataModel
      .find((table) => table.id === navigationOption.targetTableId)
      ?.fields.some((field) => field.id === navigationOption.orderingFieldId && field.dataType === 'Timestamp'),
  );
}

function getExplorerPivotObject(client: CaseClient): DataModelExplorerNavigationTab['pivotObject'] {
  if (client.kind === 'pivot') return client.pivotObject;
  return { pivotValue: client.entity.objectId, pivotObjectName: client.tableName, isIngested: client.isIngested };
}
