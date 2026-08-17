import { CustomerGraphProvider, useCustomerGraph } from '@app-builder/components/Graph/CustomerGraphContext';
import { GraphImpl } from '@app-builder/components/Graph/GraphImpl';
import { GraphSelectionToolbar } from '@app-builder/components/Graph/GraphSelectionToolbar';
import { useGraphSession } from '@app-builder/components/Graph/GraphSessionContext';
import { GraphSettingsPanel } from '@app-builder/components/Graph/GraphSettingsPanel';
import { useListGraphRelationsQuery } from '@app-builder/queries/graph/list-relations';
import { useDataModel } from '@app-builder/services/data/data-model';
import { ReactFlowProvider } from '@xyflow/react';
import { type ReactNode, useEffect } from 'react';
import { Card } from 'ui-design-system';

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

export function SessionGraphCanvas({ placeholder }: { placeholder: ReactNode }) {
  const dataModel = useDataModel();
  const { graphData, graphGeneration, graphSettings } = useGraphSession();

  if (!graphData) return placeholder;

  const startNode = graphData.nodes.find(
    (node) => node.type === graphData.start.type && node.id === graphData.start.id,
  );

  return (
    <CustomerGraphProvider
      key={graphGeneration}
      {...graphSettings}
      initialSelectedObject={{
        nodeType: 'person',
        objectType: graphData.start.type,
        objectId: graphData.start.id,
        label: startNode?.metadata?.label,
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
  );
}
