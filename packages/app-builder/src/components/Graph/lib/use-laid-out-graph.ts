import { useLayoutInitializedNodes } from '@app-builder/components/ReactFlow';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData } from '@app-builder/models/graph';
import { applyEdgeChanges, applyNodeChanges, type EdgeChange, type NodeChange } from '@xyflow/react';
import { reachableNodeIds } from 'ego-graph';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGraphStructure } from '../contexts/GraphStructureContext';
import { useGraphViewSettings } from '../contexts/GraphViewSettingsContext';
import { createGraphTypeHelpers } from './data-model-map';
import { buildGraphIndex } from './graph-index';
import { clusterGraphElements, layoutByMode, withBestHandles } from './graph-layout';
import { type GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import { toFlatFlowElements } from './utils';

/** Caps auto-fit at native node size so sparse graphs don't fill the pane. */
export const graphFitViewOptions = { maxZoom: 1 } as const;

/** Re-run layout once React Flow has measured node sizes (must be a ReactFlow child). */
export function GraphMeasuredLayout({
  layoutElements,
}: {
  layoutElements: (nodes: GraphRfNode[], edges: GraphRfEdge[]) => { nodes: GraphRfNode[]; edges: GraphRfEdge[] };
}) {
  useLayoutInitializedNodes({ mode: 'onNodesInitialized', layoutElements, fitViewOptions: graphFitViewOptions });
  return null;
}

function resolveStartKey(nodes: GraphRfNode[], fallback: string): string {
  const start = nodes.find((n) => n.type === 'person' && n.data.isStart);
  return start?.id ?? fallback;
}

function isNodeVisible(node: GraphRfNode, hiddenNodeIds: Set<string>, hideHypernodes: boolean) {
  if (node.type === 'person' && node.data.isStart) return true;
  if (hideHypernodes && node.type === 'hypernode') return false;
  return !hiddenNodeIds.has(node.id);
}

export function applyVisibilityFilters(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  hiddenNodeIds: Set<string>,
  startKey: string,
  hideHypernodes = false,
) {
  const typeVisibleNodes = nodes.filter((node) => isNodeVisible(node, hiddenNodeIds, hideHypernodes));
  const typeVisibleIds = new Set(typeVisibleNodes.map((node) => node.id));
  const typeVisibleEdges = edges.filter((edge) => typeVisibleIds.has(edge.source) && typeVisibleIds.has(edge.target));

  // Drop nodes disconnected from the start after manual hide
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
  const { hiddenNodeIds, expandedRootIds } = useGraphStructure();
  const { clusterThreshold, layoutMode, hideHypernodes } = useGraphViewSettings();

  const typeHelpers = useMemo(() => createGraphTypeHelpers(dataModel), [dataModel]);

  const flatGraph = useMemo(() => toFlatFlowElements(data, typeHelpers), [data, typeHelpers]);

  const visibleGraph = useMemo(
    () => applyVisibilityFilters(flatGraph.nodes, flatGraph.edges, hiddenNodeIds, flatGraph.startKey, hideHypernodes),
    [flatGraph, hiddenNodeIds, hideHypernodes],
  );

  const filteredLayout = useMemo(() => {
    const clustered = clusterGraphElements(visibleGraph.nodes, visibleGraph.edges, {
      startKey: flatGraph.startKey,
      threshold: clusterThreshold,
      expandedRootIds,
    });
    return layoutByMode(layoutMode, clustered.nodes, clustered.edges, flatGraph.startKey);
  }, [visibleGraph, flatGraph.startKey, clusterThreshold, expandedRootIds, layoutMode]);

  // Keyed on the layout rather than on the `edges` state below: dragging a node
  // rewrites every edge's handles, but never the topology this indexes.
  const graphIndex = useMemo(() => buildGraphIndex(filteredLayout.edges), [filteredLayout.edges]);

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
    visibleGraph,
    graphIndex,
  };
}
