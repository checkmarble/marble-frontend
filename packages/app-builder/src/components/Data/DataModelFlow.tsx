import { type DataModel } from '@app-builder/models/data-model';
import { CreateTable } from '@app-builder/routes/ressources+/data+/createTable';
import Dagre from '@dagrejs/dagre';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import ReactFlow, {
  applyEdgeChanges,
  applyNodeChanges,
  ControlButton,
  Controls,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import reactflowStyles from 'reactflow/dist/style.css';
import * as R from 'remeda';
import { Button, MenuButton } from 'ui-design-system';
import { Icon } from 'ui-icons';

import {
  SchemaMenuMenuItem,
  SchemaMenuMenuPopover,
  SchemaMenuRoot,
} from '../Schema/SchemaMenu';
import { dataI18n } from './data-i18n';
import {
  adaptLinkToSingleData,
  defaultDataModelEdgeOptions,
  getLinkToSingleDataEdge,
  getLinkToSingleDataEdgeId,
  type LinkToSingleData,
  LinkToSingleEdge,
} from './LinkToSingleEdge';
import {
  adaptTableModelNodeData,
  getTableModelNodeDataId,
  TableModelNode,
  type TableModelNodeData,
} from './TableModelNode';

type CommonData<T extends string, D> = D & {
  type: T;
  state: 'initialized' | 'layouted' | 'visible';
};

type DataModelNodeData = CommonData<'table_model', TableModelNodeData>;

const nodeTypes = {
  table_model: TableModelNode,
};

type DataModelEdgeData = CommonData<'link_to_single_edge', LinkToSingleData>;

const edgeTypes = {
  link_to_single_edge: LinkToSingleEdge,
};

const useDataModelReactFlow = useReactFlow<
  DataModelNodeData,
  DataModelEdgeData
>;

interface DataModelFlowProps {
  dataModel: DataModel;
  children?: React.ReactNode;
}

export const dataModelFlowStyles = reactflowStyles;

export function DataModelFlow({ dataModel, children }: DataModelFlowProps) {
  return (
    <ReactFlowProvider>
      <DataModelFlowImpl dataModel={dataModel}>{children}</DataModelFlowImpl>
    </ReactFlowProvider>
  );
}

function DataModelFlowImpl({ dataModel, children }: DataModelFlowProps) {
  const { t } = useTranslation(dataI18n);
  const [nodes, setNodes] = React.useState<Array<Node<DataModelNodeData>>>([]);
  const [edges, setEdges] = React.useState<Array<Edge<DataModelEdgeData>>>([]);

  const onNodesChange = React.useCallback((changes: NodeChange[]) => {
    const allowedChanges = changes.filter((change) => change.type !== 'remove');
    setNodes((nds) => applyNodeChanges(allowedChanges, nds));
  }, []);
  const onEdgesChange = React.useCallback((changes: EdgeChange[]) => {
    const allowedChanges = changes.filter((change) => change.type !== 'remove');
    setEdges((eds) => applyEdgeChanges(allowedChanges, eds));
  }, []);

  // Update nodes and edges when dataModel changes
  React.useEffect(() => {
    setNodes((currentNodes) =>
      R.pipe(
        dataModel,
        R.map((tableModel) => adaptTableModelNodeData(tableModel, dataModel)),
        R.map((tableModelNodeData) => {
          const nodeId = getTableModelNodeDataId(tableModelNodeData);
          const existingNode = currentNodes.find((nd) => nd.id === nodeId);
          if (existingNode) {
            existingNode.data = { ...existingNode.data, ...tableModelNodeData };
            return existingNode;
          }
          return {
            id: nodeId,
            type: 'table_model',
            position: { x: 0, y: 0 },
            data: {
              ...tableModelNodeData,
              type: 'table_model',
              state: 'initialized',
            },
            style: { opacity: 0 },
          };
        }),
      ),
    );
    setEdges((currentEdges) =>
      R.pipe(
        dataModel,
        R.flatMap((tableModel) => tableModel.linksToSingle),
        R.map(adaptLinkToSingleData),
        R.map((linkToSingleData) => {
          const edgeId = getLinkToSingleDataEdgeId(linkToSingleData);
          const existingEdge = currentEdges.find((ed) => ed.id === edgeId);
          if (existingEdge) {
            if (existingEdge.data === undefined) return existingEdge;
            existingEdge.data = {
              ...existingEdge.data,
              ...linkToSingleData,
            };
            return existingEdge;
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
          };
        }),
      ),
    );
  }, [dataModel]);

  React.useEffect(() => {
    // Wait first render of each node to have dynamic width before layouting
    if (nodes.some((nd) => nd.width === undefined)) return;

    if (
      nodes.some((nd) => nd.data.state === 'initialized') ||
      edges.some((ed) => ed.data?.state === 'initialized')
    ) {
      const layouted = getLayoutedElements(nodes, edges);
      setNodes(
        R.pipe(
          layouted.nodes,
          R.map((nd) => {
            if (nd.data.state !== 'initialized') return nd;
            return {
              ...nd,
              data: { ...nd.data, state: 'layouted' },
            };
          }),
        ),
      );
      setEdges(
        R.pipe(
          layouted.edges,
          R.map((ed) => {
            if (ed.data?.state !== 'initialized') return ed;
            return {
              ...ed,
              data: { ...ed.data, state: 'layouted' },
            };
          }),
        ),
      );
    }
  }, [edges, nodes]);

  const { fitView } = useDataModelReactFlow();
  React.useEffect(() => {
    const hasLayoutedNode = nodes.some((nd) => nd.data.state === 'layouted');
    const hasLayoutedEdge = edges.some((ed) => ed.data?.state === 'layouted');
    if (!hasLayoutedNode && !hasLayoutedEdge) return;

    if (hasLayoutedNode)
      setNodes(
        R.pipe(
          nodes,
          R.map((nd) => {
            if (nd.data.state !== 'layouted') return nd;
            return {
              ...nd,
              data: { ...nd.data, state: 'visible' },
              style: { ...nd.style, opacity: 1 },
            };
          }),
        ),
      );
    if (hasLayoutedEdge)
      setEdges(
        R.pipe(
          edges,
          R.map((ed) => {
            if (ed.data?.state !== 'layouted') return ed;
            return {
              ...ed,
              data: { ...ed.data, state: 'visible' },
              hidden: false,
            };
          }),
        ),
      );

    window.requestAnimationFrame(() => {
      fitView();
    });
  }, [edges, fitView, nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      minZoom={0.3}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      defaultEdgeOptions={defaultDataModelEdgeOptions}
      connectionLineStyle={defaultDataModelEdgeOptions.style}
    >
      <Controls position="bottom-left">
        <CustomControls />
      </Controls>
      <Panel position="bottom-right">
        <CreateTable>
          <Button className="w-fit">
            <Icon icon="plus" className="size-6" />
            {t('data:create_table.title')}
          </Button>
        </CreateTable>
      </Panel>
      {children}
    </ReactFlow>
  );
}

function CustomControls() {
  const { getNodes, getEdges, setNodes, fitView } = useDataModelReactFlow();

  return (
    <>
      <SchemaMenuRoot>
        <MenuButton
          render={
            <button
              // eslint-disable-next-line tailwindcss/no-custom-classname
              className="react-flow__controls-button"
              title="Focus table"
            />
          }
        >
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
              {node.data?.original.name ?? node.id}
            </SchemaMenuMenuItem>
          ))}
        </SchemaMenuMenuPopover>
      </SchemaMenuRoot>

      <ControlButton
        title="Automatic layout"
        onClick={() => {
          // Layout without fitting view
          const layouted = getLayoutedElements(getNodes(), getEdges());
          setNodes(layouted.nodes);
        }}
      >
        <Icon icon="tree-schema" />
      </ControlButton>
    </>
  );
}

function getLayoutedElements(
  nodes: Array<Node<DataModelNodeData>>,
  edges: Array<Edge<DataModelEdgeData>>,
) {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'LR',
    nodesep: 150,
    ranksep: 150,
  });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      width: node.width ?? undefined,
      height: node.height ?? undefined,
    }),
  );

  Dagre.layout(g, {
    weight: 1000,
    minlen: 3,
  });

  return {
    nodes: nodes.map((nd) => {
      const { x, y } = g.node(nd.id);
      const position = {
        x: x - (nd.width ?? 0) / 2,
        y: y - (nd.height ?? 0) / 2,
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
