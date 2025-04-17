import { DataModelExplorer } from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import { type DataModel } from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import { useTranslation } from 'react-i18next';

import { CaseManagerDrawerButtons, DrawerBreadcrumb, DrawerContext } from '../Drawer/Drawer';
import { PivotsPanelContent } from './PivotsPanelContent';

type PivotsPanelProps = {
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
      <CaseManagerDrawerButtons expandable={!!dataModelExplorerContext.explorerState}>
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
      </CaseManagerDrawerButtons>
      {drawerContext.isExpanded ? (
        <DataModelExplorer dataModel={props.dataModel} />
      ) : (
        <div className="w-[519px] p-8">
          <PivotsPanelContent
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
