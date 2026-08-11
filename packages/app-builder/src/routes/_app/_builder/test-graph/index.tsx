import { Page } from '@app-builder/components';
import {
  type ClusterThreshold,
  CustomerGraphProvider,
  DEFAULT_CLUSTER_THRESHOLD,
  useCustomerGraph,
} from '@app-builder/components/Graph/CustomerGraphContext';
import { GraphImpl, type GraphLayoutMode } from '@app-builder/components/Graph/GraphImpl';
import { GraphRelationsSettings } from '@app-builder/components/Graph/GraphRelationsSettings';
import { GraphSelectionToolbar } from '@app-builder/components/Graph/GraphSelectionToolbar';
import { GraphSettingsPanel } from '@app-builder/components/Graph/GraphSettingsPanel';
import { authMiddleware } from '@app-builder/middlewares/auth-middleware';
import { type GraphData } from '@app-builder/models/graph';
import { useGenerateGraphMutation } from '@app-builder/queries/graph/generate-graph';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { DataModelContextProvider } from '@app-builder/services/data/data-model';
import { dataModelFeatureAccessLoader } from '@app-builder/services/data/data-model-feature-access';
import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { ReactFlowProvider } from '@xyflow/react';
import { useEffect, useState } from 'react';
import { Button, Card, cn, Input, MenuCommand, Tabs, tabClassName } from 'ui-design-system';
import { Icon } from 'ui-icons';

const uploadLoader = createServerFn()
  .middleware([authMiddleware])
  .handler(async function testGraphLoader({ context }) {
    const { user, dataModelRepository, entitlements } = context.authInfo;
    const dataModel = await dataModelRepository.getDataModel();
    return {
      dataModel,
      dataModelFeatureAccess: dataModelFeatureAccessLoader(user, entitlements),
    };
  });

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  loader: () => uploadLoader(),
  component: RouteComponent,
});

type PageTab = 'graph' | 'settings';

function RelationsLabelSync() {
  const relationsQuery = useListGraphRelationsQuery();
  const { setRelationLabels } = useCustomerGraph();

  useEffect(() => {
    if (!relationsQuery.isSuccess) return;
    // Multiple relations can share a label; the filter UI is label-based.
    setRelationLabels([...new Set(relationsQuery.data.map((relation) => relation.label))]);
  }, [relationsQuery.data, relationsQuery.isSuccess, setRelationLabels]);

  return null;
}

function StartRecordPicker({
  tableNames,
  recordType,
  recordId,
  onRecordTypeChange,
  onRecordIdChange,
  onLoad,
  isLoading,
  errorMessage,
}: {
  tableNames: string[];
  recordType: string;
  recordId: string;
  onRecordTypeChange: (value: string) => void;
  onRecordIdChange: (value: string) => void;
  onLoad: () => void;
  isLoading: boolean;
  errorMessage: string | null;
}) {
  const [tableOpen, setTableOpen] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLoad();
      }}
      className="flex flex-col gap-sm"
    >
      <div className="flex flex-wrap items-end gap-md">
        <div className="flex flex-col gap-xs">
          <span className="text-grey-secondary text-xs">Table</span>
          <MenuCommand.Menu open={tableOpen} onOpenChange={setTableOpen}>
            <MenuCommand.Trigger>
              <MenuCommand.SelectButton className="min-w-40" size="small">
                {recordType || 'Select table'}
              </MenuCommand.SelectButton>
            </MenuCommand.Trigger>
            <MenuCommand.Content sameWidth>
              <MenuCommand.List>
                {tableNames.map((name) => (
                  <MenuCommand.Item
                    key={name}
                    value={name}
                    onSelect={() => {
                      onRecordTypeChange(name);
                      setTableOpen(false);
                    }}
                  >
                    {name}
                  </MenuCommand.Item>
                ))}
              </MenuCommand.List>
            </MenuCommand.Content>
          </MenuCommand.Menu>
        </div>
        <div className="flex flex-col gap-xs">
          <label htmlFor="graph-record-id" className="text-grey-secondary text-xs">
            Object id
          </label>
          <Input
            id="graph-record-id"
            size="small"
            value={recordId}
            onChange={(event) => onRecordIdChange(event.target.value)}
            placeholder="object id"
            className="min-w-56"
          />
        </div>
        <Button variant="primary" disabled={!recordType || !recordId.trim() || isLoading} type="submit">
          {isLoading ? (
            <>
              <Icon icon="restart-alt" className="size-4 animate-spin" />
              Loading
            </>
          ) : (
            <>
              <Icon icon="search" className="size-4" />
              Load
            </>
          )}
        </Button>
      </div>
      {errorMessage ? <p className="text-red-primary text-xs">{errorMessage}</p> : null}
    </form>
  );
}

function RouteComponent() {
  const { dataModel, dataModelFeatureAccess } = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState<PageTab>('graph');
  const [clusterThreshold, setClusterThreshold] = useState<ClusterThreshold>(DEFAULT_CLUSTER_THRESHOLD);
  const [layoutMode, setLayoutMode] = useState<GraphLayoutMode>('rad-dagre');
  const [recordType, setRecordType] = useState('');
  const [recordId, setRecordId] = useState('');
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [graphKey, setGraphKey] = useState(0);
  const generateMutation = useGenerateGraphMutation();

  const tableNames = dataModel
    .filter((table) => table.semanticType === 'person')
    .map((table) => table.name)
    .sort((a, b) => a.localeCompare(b));

  const onLoad = () => {
    generateMutation.mutate(
      { recordType, recordId: recordId.trim() },
      {
        onSuccess: (data) => {
          setGraphData(data);
          setGraphKey((key) => key + 1);
        },
      },
    );
  };

  return (
    <DataModelContextProvider dataModel={dataModel} dataModelFeatureAccess={dataModelFeatureAccess}>
      <CustomerGraphProvider
        key={graphKey}
        clusterThreshold={clusterThreshold}
        onClusterThresholdChange={setClusterThreshold}
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        initialSelectedObject={
          graphData
            ? {
                nodeType: 'person',
                objectType: graphData.start.type,
                objectId: graphData.start.id,
                persons: [],
              }
            : null
        }
      >
        <RelationsLabelSync />
        <Page.Main className="min-h-0 overflow-hidden">
          <Page.Header className="justify-between gap-md">
            <div className="flex items-center gap-lg">
              <span>Test graph</span>
              <Tabs>
                <button
                  type="button"
                  className={tabClassName}
                  data-status={activeTab === 'graph' ? 'active' : undefined}
                  onClick={() => setActiveTab('graph')}
                >
                  Graph
                </button>
                <button
                  type="button"
                  className={tabClassName}
                  data-status={activeTab === 'settings' ? 'active' : undefined}
                  onClick={() => setActiveTab('settings')}
                >
                  Settings
                </button>
              </Tabs>
            </div>
          </Page.Header>
          <Page.Container className="min-h-0">
            <Page.Content className="min-h-0 flex-1" width="fluid">
              {activeTab === 'settings' ? (
                <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-w-150">
                  <GraphRelationsSettings dataModel={dataModel} />
                </Card>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-md">
                  <StartRecordPicker
                    tableNames={tableNames}
                    recordType={recordType}
                    recordId={recordId}
                    onRecordTypeChange={setRecordType}
                    onRecordIdChange={setRecordId}
                    onLoad={onLoad}
                    isLoading={generateMutation.isPending}
                    errorMessage={generateMutation.isError ? 'Failed to load graph.' : null}
                  />
                  {graphData ? (
                    <Card className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row overflow-hidden p-sm">
                      <GraphSettingsPanel />
                      <ReactFlowProvider key={graphKey}>
                        <div className="relative min-h-0 flex-1">
                          <GraphSelectionToolbar />
                          <GraphImpl key={graphKey} data={graphData} dataModel={dataModel} layoutMode={layoutMode} />
                        </div>
                      </ReactFlowProvider>
                    </Card>
                  ) : (
                    <Card
                      className={cn('text-grey-secondary flex min-h-0 flex-1 items-center justify-center p-lg text-sm')}
                    >
                      Select a table and object id, then load the graph.
                    </Card>
                  )}
                </div>
              )}
            </Page.Content>
          </Page.Container>
        </Page.Main>
      </CustomerGraphProvider>
    </DataModelContextProvider>
  );
}
