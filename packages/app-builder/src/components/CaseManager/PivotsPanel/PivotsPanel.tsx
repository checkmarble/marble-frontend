import { DataModelExplorer } from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import { type CurrentUser, type DataModel } from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';

import { CaseManagerDrawerButtons, DrawerBreadcrumb, DrawerContext } from '../Drawer/Drawer';
import { PivotsPanelContent } from './PivotsPanelContent';

type PivotsPanelProps = {
  currentUser: CurrentUser;
  case: CaseDetail;
  pivotObjects: PivotObject[];
  dataModel: DataModel;
};

export function PivotsPanel(props: PivotsPanelProps) {
  const { t } = useTranslation(['common', 'cases']);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  const drawerContext = DrawerContext.useValue();

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center">
        <CaseManagerDrawerButtons expandable={!!dataModelExplorerContext.explorerState} />
        {drawerContext.isExpanded && dataModelExplorerContext.explorerState ? (
          <DrawerBreadcrumb
            items={[
              t('cases:case_detail.pivot_panel.breadcrumb_client', {
                clientName:
                  dataModelExplorerContext.explorerState.currentTab.pivotObject.pivotValue,
              }),
              t('cases:case_detail.pivot_panel.breadcrumb_explore'),
            ]}
          />
        ) : null}
      </div>
      {drawerContext.isExpanded ? (
        <DataModelExplorer dataModel={props.dataModel} />
      ) : (
        <div className="w-[519px] p-8">
          <PivotsPanelContent
            currentUser={props.currentUser}
            case={props.case}
            pivotObjects={props.pivotObjects}
            dataModel={props.dataModel}
            onExplore={() => {
              drawerContext.setExpanded(true);
            }}
          />
        </div>
      )}
    </>
  );
}
