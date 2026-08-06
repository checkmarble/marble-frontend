import { AutoLayoutControlButton, useLayoutInitializedNodes } from '@app-builder/components/ReactFlow';
import { type DataModel } from '@app-builder/models/data-model';
import {
  applyEdgeChanges,
  applyNodeChanges,
  ControlButton,
  Controls,
  type EdgeChange,
  type NodeChange,
  type NodeMouseHandler,
  ReactFlow,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from 'ui-icons';
import { type GraphData } from '../../routes/_app/_builder/test-graph/-data';
import {
  type CustomerGraphContextValue,
  type GraphAttribute,
  parsePersonBulkKey,
  useCustomerGraph,
} from './CustomerGraphContext';
import { clusterGraphElements } from './cluster-graph';
import { createGraphTypeHelpers } from './data-model-map';
import { type GraphRfEdge, type GraphRfNode, graphEdgeTypes, graphNodeTypes, withBestHandles } from './GraphComponents';
import { layoutGraphElements } from './layout-graph';
import { reachableNodeIds, toFlatFlowElements } from './utils';
import '@xyflow/react/dist/style.css';

export { layoutGraphElements };

/** Re-run layout once React Flow has measured node sizes (must be a ReactFlow child). */
function GraphMeasuredLayout({
  layoutElements,
}: {
  layoutElements: (nodes: GraphRfNode[], edges: GraphRfEdge[]) => { nodes: GraphRfNode[]; edges: GraphRfEdge[] };
}) {
  useLayoutInitializedNodes({ mode: 'onNodesInitialized', layoutElements });
  return null;
}

export type GraphImplProps = {
  data: GraphData;
  dataModel: DataModel;
  /**
   * Max graph hops from the start node.
   * `0` (default) explores the full reachable graph; `N > 0` stops after N hops.
   */
  maxExplorationHops?: number;
};

function resolveStartKey(nodes: GraphRfNode[], fallback: string): string {
  const start = nodes.find((n) => n.type === 'person' && n.data.isStart);
  return start?.id ?? fallback;
}

/** Stable for AutoLayoutControlButton — start is read from `isStart` person nodes. */
function autoLayoutElements(nodes: GraphRfNode[], edges: GraphRfEdge[]) {
  return layoutGraphElements(nodes, edges, resolveStartKey(nodes, nodes[0]?.id ?? ''));
}

type VisibilityFilters = Pick<
  CustomerGraphContextValue,
  'showPersons' | 'showCompanies' | 'attributes' | 'hiddenNodeIds'
>;

function attributeAllowsPivot(rawType: string, attributes: GraphAttribute[]): boolean {
  if (rawType === 'same_ip') return attributes.includes('ip');
  if (rawType === 'same_iban') return attributes.includes('iban');
  if (rawType === 'same_device') return attributes.includes('device');
  if (rawType === 'same_email') return attributes.includes('email');
  return true;
}

function isNodeVisible(node: GraphRfNode, filters: VisibilityFilters): boolean {
  if (node.type === 'person') {
    // The start node outranks every filter, including the hidden set.
    if (node.data.isStart) return true;
    if (filters.hiddenNodeIds.has(node.id)) return false;
    if (node.data.subEntity === 'moral') return filters.showCompanies;
    if (node.data.subEntity === 'natural') return filters.showPersons;
    return filters.showPersons || filters.showCompanies;
  }

  if (node.type === 'pivot') {
    if (filters.hiddenNodeIds.has(node.id)) return false;
    return attributeAllowsPivot(node.data.rawType, filters.attributes);
  }

  return !filters.hiddenNodeIds.has(node.id);
}

function applyVisibilityFilters(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  filters: VisibilityFilters,
  startKey: string,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  const typeVisibleNodes = nodes.filter((node) => isNodeVisible(node, filters));
  const typeVisibleIds = new Set(typeVisibleNodes.map((node) => node.id));
  const typeVisibleEdges = edges.filter((edge) => typeVisibleIds.has(edge.source) && typeVisibleIds.has(edge.target));

  // Drop nodes disconnected from the start after type/attribute filters
  // (e.g. children of a hidden company).
  const reachable = reachableNodeIds(
    typeVisibleNodes.map((node) => node.id),
    typeVisibleEdges,
    startKey,
  );
  const visibleNodes = typeVisibleNodes.filter((node) => reachable.has(node.id));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = typeVisibleEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  return { nodes: visibleNodes, edges: visibleEdges };
}

export function GraphImpl({ data, dataModel, maxExplorationHops = 0 }: GraphImplProps) {
  const {
    showPersons,
    showCompanies,
    attributes,
    showEdgeLabels,
    setShowEdgeLabels,
    setSelectedObject,
    selectionMode,
    setHoveredPersonId,
    hiddenNodeIds,
    expandedRootIds,
    checkedPersons,
    setGraphStats,
    clusterThreshold,
  } = useCustomerGraph();

  const typeHelpers = useMemo(() => createGraphTypeHelpers(dataModel), [dataModel]);

  const flatGraph = useMemo(
    () => toFlatFlowElements(data, typeHelpers, { maxExplorationHops }),
    [data, typeHelpers, maxExplorationHops],
  );

  const typeFilters = useMemo(
    () => ({ showPersons, showCompanies, attributes }),
    [showPersons, showCompanies, attributes],
  );

  const visibleGraph = useMemo(
    () =>
      applyVisibilityFilters(flatGraph.nodes, flatGraph.edges, { ...typeFilters, hiddenNodeIds }, flatGraph.startKey),
    [flatGraph, typeFilters, hiddenNodeIds],
  );

  const filteredLayout = useMemo(() => {
    const clustered = clusterGraphElements(visibleGraph.nodes, visibleGraph.edges, {
      startKey: flatGraph.startKey,
      threshold: clusterThreshold,
      expandedRootIds,
    });
    return layoutGraphElements(clustered.nodes, clustered.edges, flatGraph.startKey);
  }, [visibleGraph, flatGraph.startKey, clusterThreshold, expandedRootIds]);

  // Counts the toolbar and settings panel cannot derive: they are siblings of
  // this component and never see the node arrays.
  const graphStats = useMemo(() => {
    const countWith = (hidden: Set<string>) =>
      applyVisibilityFilters(
        flatGraph.nodes,
        flatGraph.edges,
        { ...typeFilters, hiddenNodeIds: hidden },
        flatGraph.startKey,
      ).nodes.length;

    const unhiddenCount = hiddenNodeIds.size === 0 ? visibleGraph.nodes.length : countWith(new Set());
    const hiddenCount = unhiddenCount - visibleGraph.nodes.length;

    if (checkedPersons.size === 0) return { hiddenCount, hidePreviewOrphans: 0 };
    const withChecked = countWith(new Set([...hiddenNodeIds, ...checkedPersons]));
    const removed = visibleGraph.nodes.length - withChecked;
    return { hiddenCount, hidePreviewOrphans: Math.max(0, removed - checkedPersons.size) };
  }, [flatGraph, typeFilters, hiddenNodeIds, checkedPersons, visibleGraph]);

  useEffect(() => {
    setGraphStats(graphStats);
  }, [graphStats, setGraphStats]);

  const [nodes, setNodes] = useState(filteredLayout.nodes);
  const [edges, setEdges] = useState(filteredLayout.edges);

  useEffect(() => {
    setNodes(filteredLayout.nodes);
    setEdges(filteredLayout.edges);
  }, [filteredLayout]);

  const onNodesChange = useCallback((changes: NodeChange<GraphRfNode>[]) => {
    setNodes((nds) => {
      const next = applyNodeChanges(changes, nds);
      const shouldRetarget = changes.some((c) => c.type === 'position' || c.type === 'dimensions');
      if (shouldRetarget) {
        setEdges((eds) => withBestHandles(next, eds));
      }
      return next;
    });
  }, []);

  const onEdgesChange = useCallback((changes: EdgeChange<GraphRfEdge>[]) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  }, []);

  const onNodeClick = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (node.type === 'person') {
        setSelectedObject({
          nodeType: 'person',
          objectType: node.data.objectType,
          objectId: node.data.objectId,
        });
        return;
      }

      if (node.type === 'cluster') {
        // Members are never pivots, so every id parses as a person ref.
        const { objectType, objectId } = parsePersonBulkKey(node.data.rootId);
        setSelectedObject({
          nodeType: 'cluster',
          rootId: node.data.rootId,
          nodeCount: node.data.nodeCount,
          internalEdgeCount: node.data.internalEdgeCount,
          members: node.data.memberIds.map((id) => {
            const ref = parsePersonBulkKey(id);
            return { objectType: ref.objectType, objectId: ref.objectId };
          }),
          objectType,
          objectId,
        });
        return;
      }

      const neighborIds = new Set<string>();
      for (const edge of edges) {
        if (edge.source === node.id) neighborIds.add(edge.target);
        if (edge.target === node.id) neighborIds.add(edge.source);
      }
      const connectedPersons = nodes
        .filter((n): n is Extract<GraphRfNode, { type: 'person' }> => n.type === 'person' && neighborIds.has(n.id))
        .map((n) => ({
          objectType: n.data.objectType,
          objectId: n.data.objectId,
        }));

      setSelectedObject({
        nodeType: 'pivot',
        objectType: node.data.rawType,
        objectId: node.data.label,
        connectedPersons,
      });
    },
    [edges, nodes, setSelectedObject],
  );

  const onNodeMouseEnter = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (selectionMode || (node.type !== 'person' && node.type !== 'cluster')) return;
      setHoveredPersonId(node.id);
    },
    [selectionMode, setHoveredPersonId],
  );

  const onNodeMouseLeave = useCallback<NodeMouseHandler<GraphRfNode>>(() => {
    setHoveredPersonId(null);
  }, [setHoveredPersonId]);

  return (
    <ReactFlow
      className="h-full min-h-0"
      nodeTypes={graphNodeTypes}
      edgeTypes={graphEdgeTypes}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      onNodeMouseEnter={onNodeMouseEnter}
      onNodeMouseLeave={onNodeMouseLeave}
      fitView
      maxZoom={5}
      minZoom={0.1}
      proOptions={{ hideAttribution: true }}
    >
      <GraphMeasuredLayout layoutElements={autoLayoutElements} />
      <Controls>
        <AutoLayoutControlButton layoutElements={autoLayoutElements} />
        <ControlButton
          onClick={() => setShowEdgeLabels(!showEdgeLabels)}
          title={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
          aria-label={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
        >
          <Icon icon={showEdgeLabels ? 'eye-slash' : 'eye'} className="size-4" />
        </ControlButton>
      </Controls>
    </ReactFlow>
  );
}
