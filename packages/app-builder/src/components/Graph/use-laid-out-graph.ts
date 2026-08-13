import { useLayoutInitializedNodes } from '@app-builder/components/ReactFlow';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData } from '@app-builder/models/graph';
import { applyEdgeChanges, applyNodeChanges, type EdgeChange, type NodeChange } from '@xyflow/react';
import { reachableNodeIds } from 'ego-graph';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { type CustomerGraphContextValue, useCustomerGraph } from './CustomerGraphContext';
import { createGraphTypeHelpers } from './data-model-map';
import { clusterGraphElements, layoutByMode, withBestHandles } from './graph-layout';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import { allowsPivot } from './relation-filter';
import { toFlatFlowElements } from './utils';

/** Re-run layout once React Flow has measured node sizes (must be a ReactFlow child). */
export function GraphMeasuredLayout({
  layoutElements,
}: {
  layoutElements: (nodes: GraphRfNode[], edges: GraphRfEdge[]) => { nodes: GraphRfNode[]; edges: GraphRfEdge[] };
}) {
  useLayoutInitializedNodes({ mode: 'onNodesInitialized', layoutElements });
  return null;
}

function resolveStartKey(nodes: GraphRfNode[], fallback: string): string {
  const start = nodes.find((n) => n.type === 'person' && n.data.isStart);
  return start?.id ?? fallback;
}

export type VisibilityFilters = Pick<
  CustomerGraphContextValue,
  'showPersons' | 'showCompanies' | 'relationFilter' | 'hiddenNodeIds'
>;

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
    return allowsPivot(filters.relationFilter, node.data.rawType);
  }

  // Hypernodes and clusters are not relation-filtered.
  return !filters.hiddenNodeIds.has(node.id);
}

export function applyVisibilityFilters(
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

export function useLaidOutGraph({ data, dataModel }: { data: GraphData; dataModel: DataModel }) {
  const { showPersons, showCompanies, relationFilter, hiddenNodeIds, expandedRootIds, clusterThreshold, layoutMode } =
    useCustomerGraph();

  const typeHelpers = useMemo(() => createGraphTypeHelpers(dataModel), [dataModel]);

  const flatGraph = useMemo(() => toFlatFlowElements(data, typeHelpers), [data, typeHelpers]);

  const typeFilters = useMemo(
    () => ({ showPersons, showCompanies, relationFilter }),
    [showPersons, showCompanies, relationFilter],
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

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    autoLayoutElements,
    flatGraph,
    typeFilters,
    visibleGraph,
  };
}
