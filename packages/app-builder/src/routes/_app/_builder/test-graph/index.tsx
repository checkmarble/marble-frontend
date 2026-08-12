import { Page } from '@app-builder/components';
import { CustomerGraphProvider, useCustomerGraph } from '@app-builder/components/Graph/CustomerGraphContext';
import { GraphImpl } from '@app-builder/components/Graph/GraphImpl';
import { GraphOptionSelect } from '@app-builder/components/Graph/GraphOptionSelect';
import { GraphSelectionToolbar } from '@app-builder/components/Graph/GraphSelectionToolbar';
import { GraphSettingsPanel } from '@app-builder/components/Graph/GraphSettingsPanel';
import { useTestGraphSession } from '@app-builder/components/Graph/TestGraphSessionContext';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { useDataModel } from '@app-builder/services/data/data-model';
import { createFileRoute } from '@tanstack/react-router';
import { ReactFlowProvider } from '@xyflow/react';
import { useEffect } from 'react';
import { Button, Card, Input } from 'ui-design-system';
import { Icon } from 'ui-icons';

export const Route = createFileRoute('/_app/_builder/test-graph/')({
  component: TestGraphRoute,
});

function RelationsLabelSync() {
  const relationsQuery = useListGraphRelationsQuery();
  const { syncRelationLabels } = useCustomerGraph();

  useEffect(() => {
    if (!relationsQuery.isSuccess) return;
    // Multiple relations can share a label; the filter UI is label-based.
    syncRelationLabels(relationsQuery.data.map((relation) => relation.label));
  }, [relationsQuery.data, relationsQuery.isSuccess, syncRelationLabels]);

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
}: {
  tableNames: string[];
  recordType: string;
  recordId: string;
  onRecordTypeChange: (value: string) => void;
  onRecordIdChange: (value: string) => void;
  onLoad: () => void;
  isLoading: boolean;
}) {
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
          <GraphOptionSelect
            className="min-w-40"
            size="small"
            value={recordType}
            placeholder="Select table"
            options={tableNames.map((name) => ({ value: name, label: name }))}
            onChange={onRecordTypeChange}
          />
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
    </form>
  );
}

function TestGraphRoute() {
  const dataModel = useDataModel();
  const {
    recordType,
    setRecordType,
    recordId,
    setRecordId,
    graphData,
    graphGeneration,
    isGeneratingGraph,
    loadGraph,
    showPersons,
    setShowPersons,
    showCompanies,
    setShowCompanies,
    showRiskScore,
    setShowRiskScore,
    showTags,
    setShowTags,
    showEdgeLabels,
    setShowEdgeLabels,
    clusterThreshold,
    setClusterThreshold,
    layoutMode,
    setLayoutMode,
    relationFilter,
    setRelationFilter,
  } = useTestGraphSession();

  const tableNames = dataModel
    .filter((table) => table.semanticType === 'person')
    .map((table) => table.name)
    .sort((a, b) => a.localeCompare(b));

  return (
    <Page.Content className="min-h-0 flex-1" width="fluid">
      <div className="flex min-h-0 flex-1 flex-col gap-md">
        <StartRecordPicker
          tableNames={tableNames}
          recordType={recordType}
          recordId={recordId}
          onRecordTypeChange={setRecordType}
          onRecordIdChange={setRecordId}
          onLoad={loadGraph}
          isLoading={isGeneratingGraph}
        />
        {graphData ? (
          // Keyed on the generation so every fetch starts from a clean canvas:
          // selection, hidden nodes and expanded clusters all refer to the old data.
          // Display filters/options are lifted into the session so they survive remounts.
          <CustomerGraphProvider
            key={graphGeneration}
            showPersons={showPersons}
            onShowPersonsChange={setShowPersons}
            showCompanies={showCompanies}
            onShowCompaniesChange={setShowCompanies}
            showRiskScore={showRiskScore}
            onShowRiskScoreChange={setShowRiskScore}
            showTags={showTags}
            onShowTagsChange={setShowTags}
            showEdgeLabels={showEdgeLabels}
            onShowEdgeLabelsChange={setShowEdgeLabels}
            clusterThreshold={clusterThreshold}
            onClusterThresholdChange={setClusterThreshold}
            layoutMode={layoutMode}
            onLayoutModeChange={setLayoutMode}
            relationFilter={relationFilter}
            onRelationFilterChange={setRelationFilter}
            initialSelectedObject={{
              nodeType: 'person',
              objectType: graphData.start.type,
              objectId: graphData.start.id,
              persons: [],
            }}
          >
            <RelationsLabelSync />
            <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-sm lg:flex-row">
              <GraphSettingsPanel />
              <ReactFlowProvider>
                <div className="relative min-h-0 flex-1">
                  <GraphSelectionToolbar />
                  <GraphImpl data={graphData} dataModel={dataModel} />
                </div>
              </ReactFlowProvider>
            </Card>
          </CustomerGraphProvider>
        ) : (
          <Card className="text-grey-secondary flex min-h-0 flex-1 items-center justify-center p-lg text-sm">
            Select a table and object id, then load the graph.
          </Card>
        )}
      </div>
    </Page.Content>
  );
}
