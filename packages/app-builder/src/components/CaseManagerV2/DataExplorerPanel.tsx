import { DataModel } from '@app-builder/models';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataModelExplorer } from '../DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '../DataModelExplorer/Provider';
import { PanelContainer, PanelContent, PanelHeader, PanelRoot } from '../Panel';

type DataExplorerPanelProps = {
  dataModel: DataModel;
  open: boolean;
  onOpenChange: (state: boolean) => void;
};

export function DataExplorerPanel({ dataModel, open, onOpenChange }: DataExplorerPanelProps) {
  const { t } = useTranslation(['cases']);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  useEffect(() => {
    if (!dataModelExplorerContext.explorerState) {
      onOpenChange(false);
    }
  }, [dataModelExplorerContext.explorerState]);

  return (
    <PanelRoot open={open} onOpenChange={onOpenChange}>
      <PanelContainer size="max" className="max-w-[80vw]!">
        <PanelHeader>{t('cases:case_detail.pivot_panel.breadcrumb_explore')}</PanelHeader>
        <PanelContent>
          <DataModelExplorer dataModel={dataModel} />
        </PanelContent>
      </PanelContainer>
    </PanelRoot>
  );
}
