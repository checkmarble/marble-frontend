import { CustomerGraphProvider } from '@app-builder/components/Graph/contexts/CustomerGraphProvider';
import { useGraphSession } from '@app-builder/components/Graph/contexts/GraphSessionContext';
import { GraphImpl } from '@app-builder/components/Graph/GraphImpl';
import { GraphSelectionToolbar } from '@app-builder/components/Graph/GraphSelectionToolbar';
import { GraphSettingsPanel } from '@app-builder/components/Graph/GraphSettingsPanel';
import { useDataModel } from '@app-builder/services/data/data-model';
import { ReactFlowProvider } from '@xyflow/react';
import { type ReactNode } from 'react';
import { Card } from 'ui-design-system';

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
        riskLevel: startNode?.metadata?.riskLevel,
        persons: [],
      }}
    >
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
