import { DataModel } from '@app-builder/models';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Panel } from 'ui-design-system';
import { DataModelExplorer, type DataModelExplorerProps } from '../DataModelExplorer/DataModelExplorer';
import { DataModelExplorerContext } from '../DataModelExplorer/Provider';

type DataExplorerPanelProps = {
  dataModel: DataModel;
  open: boolean;
  onOpenChange: (state: boolean) => void;
  /** Case the exploration was opened from: annotations made in the panel are linked to it. */
  caseId?: string;
  /** Ingested client whose KPIs are displayed above the table. */
  client?: DataModelExplorerProps['client'];
};

export function DataExplorerPanel({ dataModel, open, onOpenChange, caseId, client }: DataExplorerPanelProps) {
  const { t } = useTranslation(['client360']);
  const dataModelExplorerContext = DataModelExplorerContext.useValue();

  useEffect(() => {
    if (!dataModelExplorerContext.explorerState) {
      onOpenChange(false);
    }
  }, [dataModelExplorerContext.explorerState]);

  return (
    <Panel.Root open={open} onOpenChange={onOpenChange}>
      <Panel.Container className="max-w-[80vw]">
        {/* Bounded height: the table scrolls inside the panel, so its header stays visible. */}
        <Panel.Content className="h-screen min-h-0">
          <Panel.Header>{t('client360:client_detail.data_exploration.panel_title')}</Panel.Header>
          <div className="z-0 flex min-h-0 flex-1 flex-col">
            <DataModelExplorer caseId={caseId} client={client} dataModel={dataModel} />
          </div>
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}
