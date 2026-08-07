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
  PIVOT_TYPE_ATTRIBUTES,
  useCustomerGraph,
} from './CustomerGraphContext';
import { clusterGraphElements } from './cluster-graph';
import { createGraphTypeHelpers } from './data-model-map';
import { graphEdgeTypes, graphNodeTypes } from './GraphComponents';
import { withBestHandles } from './graph-handles';
import { type GraphObjectRef, nodeKey, parseNodeKey } from './graph-keys';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import { reachableNodeIds } from './graph-traversal';
import { layoutGraphElements as layoutGraphElementsRadDagre } from './layout-graph';
import { layoutGraphElements as layoutGraphElementsBalanced } from './layout-graph-2';
import { layoutGraphElements as layoutGraphElementsRadial } from './layout-graph-3';
import { toFlatFlowElements } from './utils';
import '@xyflow/react/dist/style.css';
import { match } from 'ts-pattern';

export type GraphLayoutMode = 'rad-dagre' | 'balanced' | 'radial';

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
  /** Layout algorithm for A/B testing on the test-graph page. Defaults to rad1. */
  layoutMode?: GraphLayoutMode;
};

function resolveStartKey(nodes: GraphRfNode[], fallback: string): string {
  const start = nodes.find((n) => n.type === 'person' && n.data.isStart);
  return start?.id ?? fallback;
}

function layoutByMode(
  mode: GraphLayoutMode,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  startKey: string,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  return match(mode)
    .with('balanced', () => layoutGraphElementsBalanced(nodes, edges, startKey))
    .with('rad-dagre', () => layoutGraphElementsRadDagre(nodes, edges, startKey))
    .with('radial', () => layoutGraphElementsRadial(nodes, edges, startKey))
    .exhaustive();
}

type VisibilityFilters = Pick<
  CustomerGraphContextValue,
  'showPersons' | 'showCompanies' | 'attributes' | 'hiddenNodeIds'
>;

function attributeAllowsPivot(rawType: string, attributes: GraphAttribute[]): boolean {
  const attribute = PIVOT_TYPE_ATTRIBUTES[rawType];
  return attribute == null || attributes.includes(attribute);
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

function sameRefs(a: GraphObjectRef[], b: GraphObjectRef[]): boolean {
  return (
    a.length === b.length && a.every((ref, i) => ref.objectType === b[i]?.objectType && ref.objectId === b[i]?.objectId)
  );
}

export function GraphImpl({ data, dataModel, maxExplorationHops = 0, layoutMode = 'rad-dagre' }: GraphImplProps) {
  const {
    showPersons,
    showCompanies,
    attributes,
    showEdgeLabels,
    setShowEdgeLabels,
    selectedObject,
    setSelectedObject,
    selectionMode,
    setHoveredNodeId,
    hiddenNodeIds,
    expandedRootIds,
    checkedNodeIds,
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
    return layoutByMode(layoutMode, clustered.nodes, clustered.edges, flatGraph.startKey);
  }, [visibleGraph, flatGraph.startKey, clusterThreshold, expandedRootIds, layoutMode]);

  const autoLayoutElements = useCallback(
    (layoutNodes: GraphRfNode[], layoutEdges: GraphRfEdge[]) =>
      layoutByMode(layoutMode, layoutNodes, layoutEdges, resolveStartKey(layoutNodes, layoutNodes[0]?.id ?? '')),
    [layoutMode],
  );

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

    if (checkedNodeIds.size === 0) return { hiddenCount, hidePreviewOrphans: 0 };
    const withChecked = countWith(new Set([...hiddenNodeIds, ...checkedNodeIds]));
    const removed = visibleGraph.nodes.length - withChecked;
    return { hiddenCount, hidePreviewOrphans: Math.max(0, removed - checkedNodeIds.size) };
  }, [flatGraph, typeFilters, hiddenNodeIds, checkedNodeIds, visibleGraph]);

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

  const connectedPersonsForNode = useCallback(
    (nodeId: string): GraphObjectRef[] => {
      const neighborIds = new Set<string>();
      for (const edge of edges) {
        if (edge.source === nodeId) neighborIds.add(edge.target);
        if (edge.target === nodeId) neighborIds.add(edge.source);
      }
      return nodes
        .filter((n): n is Extract<GraphRfNode, { type: 'person' }> => n.type === 'person' && neighborIds.has(n.id))
        .map((n) => ({ objectType: n.data.objectType, objectId: n.data.objectId }));
    },
    [edges, nodes],
  );

  // Keep person/pivot neighbor lists in sync when the graph remounts or filters change
  // (e.g. initial selection before the first click).
  useEffect(() => {
    if (!selectedObject || selectedObject.nodeType === 'cluster') return;

    const nodeId = nodeKey(selectedObject.objectType, selectedObject.objectId);
    if (!nodes.some((n) => n.id === nodeId)) return;

    const persons = connectedPersonsForNode(nodeId);
    if (sameRefs(selectedObject.persons, persons)) return;

    setSelectedObject({ ...selectedObject, persons });
  }, [connectedPersonsForNode, nodes, selectedObject, setSelectedObject]);

  const onNodeClick = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (node.type === 'person') {
        setSelectedObject({
          nodeType: 'person',
          objectType: node.data.objectType,
          objectId: node.data.objectId,
          persons: connectedPersonsForNode(node.id),
        });
        return;
      }

      if (node.type === 'cluster') {
        setSelectedObject({
          nodeType: 'cluster',
          objectType: node.data.root.objectType,
          objectId: node.data.root.objectId,
          nodeCount: node.data.nodeCount,
          internalEdgeCount: node.data.internalEdgeCount,
          // Members are never pivots, so every id parses as a person ref.
          persons: node.data.memberIds.map(parseNodeKey),
        });
        return;
      }

      setSelectedObject({
        nodeType: 'pivot',
        objectType: node.data.rawType,
        objectId: node.data.label,
        persons: connectedPersonsForNode(node.id),
      });
    },
    [connectedPersonsForNode, setSelectedObject],
  );

  const onNodeMouseEnter = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (selectionMode) return;
      setHoveredNodeId(node.id);
    },
    [selectionMode, setHoveredNodeId],
  );

  const onNodeMouseLeave = useCallback<NodeMouseHandler<GraphRfNode>>(() => {
    setHoveredNodeId(null);
  }, [setHoveredNodeId]);

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
