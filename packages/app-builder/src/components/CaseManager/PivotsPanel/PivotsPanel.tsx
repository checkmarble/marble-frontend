import { DataModelExplorer } from '@app-builder/components/DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '@app-builder/components/DataModelExplorer/Provider';
import useIntersection from '@app-builder/hooks/useIntersection';
import { type CurrentUser, DataModelObject, type DataModelWithTableOptions } from '@app-builder/models';
import { type CaseDetail, type PivotObject } from '@app-builder/models/cases';
import clsx from 'clsx';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { CaseManagerDrawerButtons, DrawerBreadcrumb, DrawerContext } from '../Drawer/Drawer';
import { PivotsPanelContent } from './PivotsPanelContent';

type PivotsPanelProps = {
  currentUser: CurrentUser;
  case: CaseDetail;
  pivotObjects: PivotObject[];
  dataModel: DataModelWithTableOptions;
  reviewProofs: { type: string; object: DataModelObject }[];
  isKycEnrichmentEnabled: boolean;
};

export function PivotsPanel(props: PivotsPanelProps) {
  const { t } = useTranslation(['common', 'cases']);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();
  const drawerContext = DrawerContext.useValue();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const intersection = useIntersection(sentinelRef, {
    root: drawerContext.container.current,
    rootMargin: '1px',
    threshold: 1,
  });

  useEffect(() => {
    if (!dataModelExplorerContext.explorerState && drawerContext.isExpanded) {
      drawerContext.setExpanded(false);
    }
  }, [dataModelExplorerContext.explorerState, drawerContext]);

  return (
    <>
      <div ref={sentinelRef} />
      <div
        className={clsx('bg-grey-100 sticky top-0 z-10 flex items-center', {
          'shadow-sticky-top': !intersection?.isIntersecting,
        })}
      >
        <CaseManagerDrawerButtons expandable={!!dataModelExplorerContext.explorerState} />
        {drawerContext.isExpanded && dataModelExplorerContext.explorerState ? (
          <DrawerBreadcrumb
            items={[
              t('cases:case_detail.pivot_panel.breadcrumb_client', {
                clientName: dataModelExplorerContext.explorerState.currentTab.pivotObject.pivotValue,
              }),
              t('cases:case_detail.pivot_panel.breadcrumb_explore'),
            ]}
          />
        ) : null}
      </div>
      {drawerContext.isExpanded ? (
        <DataModelExplorer caseId={props.case.id} dataModel={props.dataModel} />
      ) : (
        <div className="w-[519px] p-v2-lg pt-0">
          <PivotsPanelContent
            currentUser={props.currentUser}
            case={props.case}
            pivotObjects={props.pivotObjects}
            reviewProofs={props.reviewProofs}
            dataModel={props.dataModel}
            isKycEnrichmentEnabled={props.isKycEnrichmentEnabled}
            onExplore={() => {
              drawerContext.setExpanded(true);
            }}
          />
        </div>
      )}
    </>
  );
}
