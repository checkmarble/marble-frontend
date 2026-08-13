import { CustomerGraphProvider } from '@app-builder/components/Graph/CustomerGraphContext';
import { graphEdgeTypes, graphNodeTypes } from '@app-builder/components/Graph/GraphComponents';
import { GraphMeasuredLayout, useLaidOutGraph } from '@app-builder/components/Graph/use-laid-out-graph';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData } from '@app-builder/models/graph';
import { useGenerateGraphQuery } from '@app-builder/queries/graph/generate-graph';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { Card, Typo } from 'ui-design-system';
import '@xyflow/react/dist/style.css';

const MAIN_LINKS_DEGREES = 1;

interface MainLinksGraphProps {
  objectType: string;
  objectId: string;
  dataModel: DataModel;
}

export function MainLinksGraph({ objectType, objectId, dataModel }: MainLinksGraphProps) {
  const { t } = useTranslation(['cases']);
  const query = useGenerateGraphQuery({
    recordType: objectType,
    recordId: objectId,
    degrees: MAIN_LINKS_DEGREES,
  });

  if (query.isPending) {
    return <Card className="h-96 animate-pulse bg-grey-background" />;
  }

  if (query.isError) {
    return <Card className="h-96" />;
  }

  if (!query.data || query.data.edges.length === 0) {
    return (
      <Card className="h-96 grid place-items-center">
        <Typo className="text-grey-primary">{t('cases:manager.clients.main_links_empty')}</Typo>
      </Card>
    );
  }

  return (
    <Card className="h-96 overflow-hidden p-0">
      <CustomerGraphProvider clusterThreshold={5} layoutMode="rad-dagre">
        <ReactFlowProvider>
          <div className="relative h-full min-h-0">
            <MainLinksGraphCanvas data={query.data} dataModel={dataModel} />
          </div>
        </ReactFlowProvider>
      </CustomerGraphProvider>
    </Card>
  );
}

function MainLinksGraphCanvas({ data, dataModel }: { data: GraphData; dataModel: DataModel }) {
  const { nodes, edges, onNodesChange, onEdgesChange, autoLayoutElements } = useLaidOutGraph({ data, dataModel });

  return (
    <ReactFlow
      className="h-full min-h-0"
      nodeTypes={graphNodeTypes}
      edgeTypes={graphEdgeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      maxZoom={5}
      minZoom={0.1}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnScroll={false}
      proOptions={{ hideAttribution: true }}
    >
      <GraphMeasuredLayout layoutElements={autoLayoutElements} />
    </ReactFlow>
  );
}
