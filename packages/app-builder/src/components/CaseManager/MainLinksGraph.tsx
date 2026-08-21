import { CustomerGraphProvider } from '@app-builder/components/Graph/contexts/CustomerGraphProvider';
import { GraphIndexProvider } from '@app-builder/components/Graph/contexts/GraphIndexContext';
import { graphEdgeTypes, graphNodeTypes } from '@app-builder/components/Graph/GraphComponents';
import {
  GraphMeasuredLayout,
  graphFitViewOptions,
  useLaidOutGraph,
} from '@app-builder/components/Graph/lib/use-laid-out-graph';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData } from '@app-builder/models/graph';
import { useGetGenerateGraphQuery } from '@app-builder/queries/graph/generate-graph';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import { Card, cn, Typo } from 'ui-design-system';
import '@xyflow/react/dist/style.css';

const MAIN_LINKS_DEGREES = 1;
/** Floor for the embedded graph, so it stays readable however short its column is. */
export const mainLinksGraphMinHeight = 'min-h-[450px]';
const graphFrameClassName = cn('flex flex-1 flex-col overflow-hidden', mainLinksGraphMinHeight);

interface MainLinksGraphProps {
  objectType: string;
  objectId: string;
  dataModel: DataModel;
}

export function MainLinksGraph({ objectType, objectId, dataModel }: MainLinksGraphProps) {
  const { t } = useTranslation(['cases']);
  const query = useGetGenerateGraphQuery({
    recordType: objectType,
    recordId: objectId,
    degrees: MAIN_LINKS_DEGREES,
    skip_same_field_relations: true,
  });

  if (query.isPending) {
    return <Card className={cn(graphFrameClassName, 'animate-pulse bg-grey-background')} />;
  }

  if (query.isError) {
    return <Card className={graphFrameClassName} />;
  }

  if (!query.data || query.data.edges.length === 0) {
    return (
      <Card className={cn(graphFrameClassName, 'items-center justify-center')}>
        <Typo className="text-grey-primary">{t('cases:manager.clients.main_links_empty')}</Typo>
      </Card>
    );
  }

  return (
    <Card className={cn(graphFrameClassName, 'p-0')}>
      <CustomerGraphProvider clusterThreshold={5} layoutMode="polarPetal">
        <ReactFlowProvider>
          <div className="relative min-h-0 flex-1">
            <MainLinksGraphCanvas data={query.data} dataModel={dataModel} />
          </div>
        </ReactFlowProvider>
      </CustomerGraphProvider>
    </Card>
  );
}

function MainLinksGraphCanvas({ data, dataModel }: { data: GraphData; dataModel: DataModel }) {
  const { nodes, edges, onNodesChange, onEdgesChange, autoLayoutElements, graphIndex } = useLaidOutGraph({
    data,
    dataModel,
  });

  return (
    <GraphIndexProvider index={graphIndex}>
      <ReactFlow
        className="h-full min-h-0"
        nodeTypes={graphNodeTypes}
        edgeTypes={graphEdgeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={graphFitViewOptions}
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
    </GraphIndexProvider>
  );
}
