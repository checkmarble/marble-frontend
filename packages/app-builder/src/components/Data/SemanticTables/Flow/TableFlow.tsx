import { SchemaMenuMenuItem, SchemaMenuMenuPopover, SchemaMenuRoot } from '@app-builder/components/Schema/SchemaMenu';
import { Spinner } from '@app-builder/components/Spinner';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { useResizeObserver } from '@app-builder/hooks/useResizeObserver';
import { type DataModel } from '@app-builder/models/data-model';
import { useIsomorphicLayoutEffect } from '@app-builder/utils/hooks/use-isomorphic-layout-effect';
import Dagre from '@dagrejs/dagre';
import {
  applyEdgeChanges,
  applyNodeChanges,
  Controls,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  ReactFlow,
  ReactFlowProvider,
  useNodesInitialized,
  useReactFlow,
} from '@xyflow/react';
import reactflowStyles from '@xyflow/react/dist/style.css?url';
import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import * as R from 'remeda';
import { MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  adaptLinkToSingleData,
  defaultDataModelEdgeOptions,
  getLinkToSingleDataEdge,
  getLinkToSingleDataEdgeId,
  LinkRelation,
  type LinkToSingleData,
  retargetDataModelHandles,
} from './LinkRelation';
import { TableDetails, TableDetailsProps } from './TableDetails';

const ORPHAN_COLUMN_GAP = 100;
const ORPHAN_STACK_GAP = 100;

type CommonData<T extends string, D> = D & {
  type: T;
  state: 'initialized' | 'laid_out' | 'visible';
} & Record<string, unknown>;

type DataModelNodeData = CommonData<'table_model', TableDetailsProps>;

const nodeTypes = {
  table_model: TableDetails,
};

type DataModelEdgeData = CommonData<'link_to_single_edge', LinkToSingleData>;

const edgeTypes = {
  link_to_single_edge: LinkRelation,
};

const useDataModelReactFlow = useReactFlow<Node<DataModelNodeData>, Edge<DataModelEdgeData>>;

function nodeMeasured(nd: Node<DataModelNodeData>) {
  return { width: nd.measured?.width ?? nd.width, height: nd.measured?.height ?? nd.height };
}

function runAfterTwoFrames(callback: () => void) {
  // Wait for React commit + browser paint so React Flow measurements are stable.
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      callback();
    });
  });
}

function getRelationFieldNames(tableModel: DataModel[number], dataModel: DataModel) {
  const relationFieldNames = new Set([
    ...tableModel.linksToSingle.map((link) => link.childFieldName),
    ...dataModel.flatMap((table) =>
      table.linksToSingle.filter((link) => link.parentTableId === tableModel.id).map((link) => link.parentFieldName),
    ),
  ]);

  return tableModel.fields.filter((field) => relationFieldNames.has(field.name)).map((field) => field.name);
}

interface TableFlowProps {
  dataModel: DataModel;
  children?: ReactNode;
}

export const dataModelFlowStyles = reactflowStyles;

export function TableFlow({ dataModel, children }: TableFlowProps) {
  return (
    <ReactFlowProvider>
      <DataModelFlowImpl dataModel={dataModel}>{children}</DataModelFlowImpl>
    </ReactFlowProvider>
  );
}

function DataModelFlowImpl({ dataModel, children }: TableFlowProps) {
  const [nodes, setNodes] = useState<Array<Node<DataModelNodeData>>>([]);
  const [edges, setEdges] = useState<Array<Edge<DataModelEdgeData>>>([]);
  const [isInitialLayoutSettled, setIsInitialLayoutSettled] = useState(false);
  const shouldFitRef = useRef(false);
  const hasScheduledInitialStabilizationRef = useRef(false);
  const nodesInitialized = useNodesInitialized();
  const {
    ref: containerRef,
    dimensions: { width: containerWidth, height: containerHeight },
  } = useResizeObserver();

  const onNodesChange = useCallback((changes: NodeChange<Node<DataModelNodeData>>[]) => {
    const allowedChanges = changes.filter((change) => change.type !== 'remove');
    setNodes((nds) => applyNodeChanges(allowedChanges, nds));
  }, []);
  const onEdgesChange = useCallback((changes: EdgeChange<Edge<DataModelEdgeData>>[]) => {
    const allowedChanges = changes.filter((change) => change.type !== 'remove');
    setEdges((eds) => applyEdgeChanges(allowedChanges, eds));
  }, []);

  useEffect(() => {
    setIsInitialLayoutSettled(false);
    hasScheduledInitialStabilizationRef.current = false;
    setNodes((currentNodes) =>
      R.pipe(
        dataModel,
        R.map((tableModel) => {
          const nodeId = tableModel.name;
          const existingNode = currentNodes.find((nd) => nd.id === nodeId);
          if (existingNode) {
            return {
              ...existingNode,
              data: {
                ...existingNode.data,
                tableModel,
                relationFieldNames: getRelationFieldNames(tableModel, dataModel),
              },
            };
          }
          return {
            id: nodeId,
            type: 'table_model',
            position: { x: 0, y: 0 },
            data: {
              tableModel,
              relationFieldNames: getRelationFieldNames(tableModel, dataModel),
              type: 'table_model',
              state: 'initialized',
            },
            style: { opacity: 0 },
          } satisfies Node<DataModelNodeData>;
        }),
      ),
    );
    setEdges((currentEdges) =>
      R.pipe(
        dataModel,
        R.flatMap((tableModel) => tableModel.linksToSingle),
        R.filter((link) => link.parentTableId !== link.childTableId),
        R.map(adaptLinkToSingleData),
        R.map((linkToSingleData) => {
          const edgeId = getLinkToSingleDataEdgeId(linkToSingleData);
          const existingEdge = currentEdges.find((ed) => ed.id === edgeId);
          const endpoints = getLinkToSingleDataEdge(linkToSingleData);
          if (existingEdge) {
            if (existingEdge.data === undefined) return existingEdge;
            return {
              ...existingEdge,
              sourceHandle: endpoints.sourceHandle,
              targetHandle: endpoints.targetHandle,
              data: {
                ...existingEdge.data,
                ...linkToSingleData,
              },
            };
          }
          return {
            id: edgeId,
            type: 'link_to_single_edge',
            ...endpoints,
            data: {
              ...linkToSingleData,
              type: 'link_to_single_edge',
              state: 'initialized',
            },
            hidden: true,
          } satisfies Edge<DataModelEdgeData>;
        }),
      ),
    );
  }, [dataModel]);

  const { fitView, getEdges, getNodes } = useDataModelReactFlow();

  const onNodeDragStop = useCallback(() => {
    setEdges((eds) => retargetDataModelHandles(getNodes(), eds));
  }, [getNodes]);

  const onAutoLayout = useCallback(() => {
    const layout = layoutElements(getNodes(), getEdges());
    setNodes(layout.nodes);
    setEdges(layout.edges);
  }, [getEdges, getNodes]);

  useIsomorphicLayoutEffect(() => {
    if (!nodesInitialized) return;
    if (!nodes.some((nd) => nd.data.state === 'initialized') && !edges.some((ed) => ed.data?.state === 'initialized'))
      return;

    const liveNodes = getNodes();
    const liveEdges = getEdges();

    if (liveNodes.length !== nodes.length || liveEdges.length !== edges.length) return;
    if (
      liveNodes.some((nd) => {
        const { width, height } = nodeMeasured(nd);
        return width === undefined || height === undefined;
      })
    )
      return;

    const layout = layoutElements(liveNodes, liveEdges);
    shouldFitRef.current = true;
    setNodes(
      R.pipe(
        layout.nodes,
        R.map((nd) => {
          if (nd.data.state !== 'initialized') return nd;
          return {
            ...nd,
            data: { ...nd.data, state: 'laid_out' },
          } satisfies Node<DataModelNodeData>;
        }),
      ),
    );
    setEdges(
      R.pipe(
        layout.edges,
        R.map((ed) => {
          if (ed.data?.state !== 'initialized') return ed;
          return {
            ...ed,
            data: { ...ed.data, state: 'laid_out' },
          } satisfies Edge<DataModelEdgeData>;
        }),
      ),
    );
  }, [edges, getEdges, getNodes, nodes, nodesInitialized]);

  useEffect(() => {
    const hasLaidOutNode = nodes.some((nd) => nd.data.state === 'laid_out');
    const hasLaidOutEdge = edges.some((ed) => ed.data?.state === 'laid_out');
    if (!hasLaidOutNode && !hasLaidOutEdge) return;

    if (hasLaidOutNode)
      setNodes(
        R.pipe(
          nodes,
          R.map((nd) => {
            if (nd.data.state !== 'laid_out') return nd;
            return {
              ...nd,
              data: { ...nd.data, state: 'visible' },
              style: { ...nd.style, opacity: 1 },
            } satisfies Node<DataModelNodeData>;
          }),
        ),
      );
    if (hasLaidOutEdge)
      setEdges(
        R.pipe(
          edges,
          R.map((ed) => {
            if (ed.data?.state !== 'laid_out') return ed;
            return {
              ...ed,
              data: { ...ed.data, state: 'visible' },
              hidden: false,
            } satisfies Edge<DataModelEdgeData>;
          }),
        ),
      );
  }, [edges, nodes]);

  useEffect(() => {
    if (!shouldFitRef.current || !nodesInitialized || nodes.length === 0) return;
    if (containerWidth === 0 || containerHeight === 0) return;
    const visibleNodes = nodes.filter((nd) => nd.data.state === 'visible');
    if (visibleNodes.length === 0 || visibleNodes.length !== nodes.length) return;

    shouldFitRef.current = false;
    window.requestAnimationFrame(() => {
      fitView({ nodes: visibleNodes });
    });
  }, [containerHeight, containerWidth, fitView, nodesInitialized]);

  useEffect(() => {
    if (hasScheduledInitialStabilizationRef.current) return;
    if (!nodesInitialized || nodes.length === 0) return;
    if (containerWidth === 0 || containerHeight === 0) return;
    if (nodes.some((nd) => nd.data.state !== 'visible')) return;

    hasScheduledInitialStabilizationRef.current = true;
    runAfterTwoFrames(() => {
      const liveNodes = getNodes();
      const liveEdges = getEdges();
      if (
        liveNodes.some((nd) => {
          const { width, height } = nodeMeasured(nd);
          return width === undefined || height === undefined;
        })
      ) {
        hasScheduledInitialStabilizationRef.current = false;
        return;
      }

      const layout = layoutElements(liveNodes, liveEdges);
      setNodes(layout.nodes);
      setEdges(layout.edges);
      fitView({ nodes: layout.nodes });
      setIsInitialLayoutSettled(true);
    });
  }, [containerHeight, containerWidth, fitView, getEdges, getNodes, nodes, nodesInitialized, setEdges, setNodes]);

  const theme = useTheme();

  useEffect(() => {
    if (isInitialLayoutSettled) return;
    if (containerWidth === 0 || containerHeight === 0) return;
    const visibleNodes = nodes.filter((nd) => nd.data.state === 'visible');
    if (visibleNodes.length === 0) return;

    window.requestAnimationFrame(() => {
      fitView({ nodes: visibleNodes });
    });
  }, [containerHeight, containerWidth, fitView, isInitialLayoutSettled, nodes]);

  const isLoading =
    dataModel.length > 0 &&
    (nodes.length === 0 || !isInitialLayoutSettled || nodes.some((nd) => nd.data.state !== 'visible'));

  return (
    <div ref={containerRef} className="relative h-full min-h-[min(600px,75vh)] w-full">
      {isLoading ? (
        <div className="bg-surface-page/80 absolute inset-0 z-10 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
          <Spinner className="size-8" />
        </div>
      ) : null}
      <ReactFlow<Node<DataModelNodeData>, Edge<DataModelEdgeData>>
        className="size-full"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        minZoom={0.3}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        defaultEdgeOptions={defaultDataModelEdgeOptions}
        connectionLineStyle={defaultDataModelEdgeOptions.style}
        colorMode={theme.theme}
      >
        <Controls position="bottom-left" className="z-10">
          <CustomControls onAutoLayout={onAutoLayout} />
        </Controls>
        {children}
      </ReactFlow>
    </div>
  );
}

function CustomControls({ onAutoLayout }: { onAutoLayout: () => void }) {
  const { getNodes, fitView } = useDataModelReactFlow();

  return (
    <>
      <SchemaMenuRoot>
        <MenuButton render={<button className="react-flow__controls-button" title="Focus table" type="button" />}>
          <Icon icon="center-focus" />
        </MenuButton>
        <SchemaMenuMenuPopover>
          {getNodes().map((node) => (
            <SchemaMenuMenuItem
              key={node.id}
              onClick={() => {
                fitView({ nodes: [node], duration: 1000 });
              }}
            >
              {node.data?.tableModel.name ?? node.id}
            </SchemaMenuMenuItem>
          ))}
        </SchemaMenuMenuPopover>
      </SchemaMenuRoot>

      <button className="react-flow__controls-button" title="Automatic layout" type="button" onClick={onAutoLayout}>
        <Icon icon="tree-schema" />
      </button>
    </>
  );
}

function withPosition(nd: Node<DataModelNodeData>, position: { x: number; y: number }): Node<DataModelNodeData> {
  if (position.x === nd.position.x && position.y === nd.position.y) return nd;
  return { ...nd, position } satisfies Node<DataModelNodeData>;
}

function stackOrphans(
  orphans: Array<Node<DataModelNodeData>>,
  origin: { x: number; y: number },
): Array<Node<DataModelNodeData>> {
  let y = origin.y;
  return orphans.map((nd) => {
    const { height } = nodeMeasured(nd);
    const positioned = withPosition(nd, { x: origin.x, y });
    y += (height ?? 0) + ORPHAN_STACK_GAP;
    return positioned;
  });
}

function layoutElements(nodes: Array<Node<DataModelNodeData>>, edges: Array<Edge<DataModelEdgeData>>) {
  const linkedIds = new Set<string>();
  for (const edge of edges) {
    linkedIds.add(edge.source);
    linkedIds.add(edge.target);
  }

  const orphans = nodes.filter((nd) => !linkedIds.has(nd.id)).sort((a, b) => a.id.localeCompare(b.id));
  const linked = nodes.filter((nd) => linkedIds.has(nd.id));

  // Orphan rail always occupies the top-left of the layout coordinate space.
  const maxOrphanWidth = orphans.reduce((max, nd) => Math.max(max, nodeMeasured(nd).width ?? 0), 0);
  const laidOrphans = stackOrphans(orphans, { x: 0, y: 0 });
  const linkedOriginX = orphans.length > 0 ? maxOrphanWidth + ORPHAN_COLUMN_GAP : 0;

  let laidLinked: Array<Node<DataModelNodeData>> = [];

  if (linked.length > 0) {
    const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
    g.setGraph({
      rankdir: 'LR',
      nodesep: 100,
      ranksep: 100,
    });

    edges.forEach((edge) => g.setEdge(edge.source, edge.target));
    linked.forEach((node) => {
      const { width, height } = nodeMeasured(node);
      g.setNode(node.id, { width, height });
    });

    Dagre.layout(g, {
      weight: 1000,
      minlen: 3,
    });

    const dagreLinked = linked.map((nd) => {
      const { x, y } = g.node(nd.id);
      const { width, height } = nodeMeasured(nd);
      return withPosition(nd, {
        x: x - (width ?? 0) / 2,
        y: y - (height ?? 0) / 2,
      });
    });

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    for (const nd of dagreLinked) {
      minX = Math.min(minX, nd.position.x);
      minY = Math.min(minY, nd.position.y);
    }

    const shiftX = linkedOriginX - minX;
    const shiftY = -minY;
    laidLinked = dagreLinked.map((nd) =>
      withPosition(nd, {
        x: nd.position.x + shiftX,
        y: nd.position.y + shiftY,
      }),
    );
  }

  const byId = new Map([...laidLinked, ...laidOrphans].map((nd) => [nd.id, nd]));
  const laidOutNodes = nodes.map((nd) => byId.get(nd.id) ?? nd);

  return {
    nodes: laidOutNodes,
    edges: retargetDataModelHandles(laidOutNodes, edges),
  };
}
