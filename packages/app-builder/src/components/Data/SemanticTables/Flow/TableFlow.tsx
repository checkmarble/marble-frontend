import { AutoLayoutControlButton } from '@app-builder/components/ReactFlow';
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
} from './LinkRelation';
import { TableDetails, TableDetailsProps } from './TableDetails';

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
  const shouldFitRef = useRef(false);
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
          if (existingEdge) {
            if (existingEdge.data === undefined) return existingEdge;
            return {
              ...existingEdge,
              data: {
                ...existingEdge.data,
                ...linkToSingleData,
              },
            };
          }
          return {
            id: edgeId,
            type: 'link_to_single_edge',
            ...getLinkToSingleDataEdge(linkToSingleData),
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
  }, [containerHeight, containerWidth, fitView, nodes, nodesInitialized]);

  const theme = useTheme();

  useEffect(() => {
    if (containerWidth === 0 || containerHeight === 0) return;
    const visibleNodes = nodes.filter((nd) => nd.data.state === 'visible');
    if (visibleNodes.length === 0) return;

    window.requestAnimationFrame(() => {
      fitView({ nodes: visibleNodes });
    });
  }, [containerHeight, containerWidth, fitView, nodes]);

  const isLoading = nodes.length > 0 && nodes.some((nd) => nd.data.state !== 'visible');

  return (
    <div ref={containerRef} className="relative size-full">
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
        defaultEdgeOptions={defaultDataModelEdgeOptions}
        connectionLineStyle={defaultDataModelEdgeOptions.style}
        colorMode={theme.theme}
      >
        <Controls position="bottom-left" className="z-10">
          <CustomControls />
        </Controls>
        {children}
      </ReactFlow>
    </div>
  );
}

function CustomControls() {
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

      <AutoLayoutControlButton layoutElements={layoutElements} />
    </>
  );
}

function layoutElements(nodes: Array<Node<DataModelNodeData>>, edges: Array<Edge<DataModelEdgeData>>) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    nodesep: 100,
    ranksep: 100,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) => {
    const { width, height } = nodeMeasured(node);
    return g.setNode(node.id, {
      width,
      height,
    });
  });

  Dagre.layout(g, {
    weight: 1000,
    minlen: 3,
  });

  return {
    nodes: nodes.map((nd) => {
      const { x, y } = g.node(nd.id);
      const { width, height } = nodeMeasured(nd);
      const position = {
        x: x - (width ?? 0) / 2,
        y: y - (height ?? 0) / 2,
      };

      if (position.x === nd.position.x && position.y === nd.position.y) {
        return nd;
      }

      return {
        ...nd,
        position,
      } satisfies Node<DataModelNodeData>;
    }),
    edges: edges,
  };
}
