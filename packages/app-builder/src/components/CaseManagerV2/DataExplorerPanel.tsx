import { Panel } from '@app-builder/components/Panel';
import { DataModel } from '@app-builder/models';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DataModelExplorer } from '../DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '../DataModelExplorer/Provider';

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
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container size="large">
        <Panel.Content>
          <Panel.Header>{t('cases:case_detail.pivot_panel.breadcrumb_explore')}</Panel.Header>
          <div>
            <DataModelExplorer dataModel={dataModel} />
          </div>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}
