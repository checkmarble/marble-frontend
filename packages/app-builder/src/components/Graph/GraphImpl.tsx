import { AutoLayoutControlButton } from '@app-builder/components/ReactFlow';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData } from '@app-builder/models/graph';
import { ControlButton, Controls, EdgeMouseHandler, type NodeMouseHandler, ReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { useSelectedObject, useSetSelectedObject } from './contexts/GraphFocusContext';
import { GraphIndexProvider } from './contexts/GraphIndexContext';
import { useCheckedNodeIds, useGraphInteractionActions, useSelectionMode } from './contexts/GraphInteractionContext';
import { useSetGraphStats } from './contexts/GraphStatsContext';
import { useGraphStructure } from './contexts/GraphStructureContext';
import { useGraphViewSettings } from './contexts/GraphViewSettingsContext';
import { graphEdgeTypes, graphNodeTypes } from './GraphComponents';
import { graphI18n } from './lib/graph-i18n';
import { type GraphObjectRef, nodeKey, parseNodeKey } from './lib/graph-keys';
import { GraphRfEdge, type GraphRfNode } from './lib/graph-rf-types';
import { EMPTY_HOVER_TRAIL, shortestPathUnion } from './lib/hover-trail';
import {
  applyVisibilityFilters,
  GraphMeasuredLayout,
  graphFitViewOptions,
  useLaidOutGraph,
} from './lib/use-laid-out-graph';
import '@xyflow/react/dist/style.css';
import './GraphImpl.css';

export type GraphImplProps = {
  data: GraphData;
  dataModel: DataModel;
};

function sameRefs(a: GraphObjectRef[], b: GraphObjectRef[]): boolean {
  return (
    a.length === b.length && a.every((ref, i) => ref.objectType === b[i]?.objectType && ref.objectId === b[i]?.objectId)
  );
}

function personRefFromRfNode(node: Extract<GraphRfNode, { type: 'person' }>): GraphObjectRef {
  return {
    objectType: node.data.objectType,
    objectId: node.data.objectId,
    label: node.data.label,
    riskLevel: node.data.riskLevel,
    semanticType: node.data.semanticType,
    subEntity: node.data.subEntity,
  };
}

function personRefFromNodeId(nodes: GraphRfNode[], key: string): GraphObjectRef {
  const node = nodes.find((n): n is Extract<GraphRfNode, { type: 'person' }> => n.type === 'person' && n.id === key);
  return node ? personRefFromRfNode(node) : parseNodeKey(key);
}

export function GraphImpl({ data, dataModel }: GraphImplProps) {
  const { t } = useTranslation(graphI18n);
  const theme = useTheme();
  const { showEdgeLabels, setShowEdgeLabels, hideHypernodes } = useGraphViewSettings();
  const selectedObject = useSelectedObject();
  const setSelectedObject = useSetSelectedObject();
  const { hiddenNodeIds } = useGraphStructure();
  const setGraphStats = useSetGraphStats();
  const { hoverNode, hoverEdge } = useGraphInteractionActions();
  const selectionMode = useSelectionMode();
  const checkedNodeIds = useCheckedNodeIds();

  const { nodes, edges, onNodesChange, onEdgesChange, autoLayoutElements, flatGraph, visibleGraph, graphIndex } =
    useLaidOutGraph({
      data,
      dataModel,
    });

  // Counts the toolbar and settings panel cannot derive: they are siblings of
  // this component and never see the node arrays.
  const graphStats = useMemo(() => {
    const countWith = (hidden: Set<string>) =>
      applyVisibilityFilters(flatGraph.nodes, flatGraph.edges, hidden, flatGraph.startKey, hideHypernodes).nodes.length;

    const unhiddenCount = hiddenNodeIds.size === 0 ? visibleGraph.nodes.length : countWith(new Set());
    const hiddenCount = unhiddenCount - visibleGraph.nodes.length;

    if (checkedNodeIds.size === 0) return { hiddenCount, hidePreviewOrphans: 0 };
    const withChecked = countWith(new Set([...hiddenNodeIds, ...checkedNodeIds]));
    const removed = visibleGraph.nodes.length - withChecked;
    return { hiddenCount, hidePreviewOrphans: Math.max(0, removed - checkedNodeIds.size) };
  }, [flatGraph, hiddenNodeIds, checkedNodeIds, visibleGraph, hideHypernodes]);

  useEffect(() => {
    setGraphStats(graphStats);
  }, [graphStats, setGraphStats]);

  const connectedPersonsForNode = useCallback(
    (nodeId: string): GraphObjectRef[] => {
      const neighborIds = graphIndex.neighbors.get(nodeId);
      if (!neighborIds) return [];
      return nodes
        .filter((n): n is Extract<GraphRfNode, { type: 'person' }> => n.type === 'person' && neighborIds.has(n.id))
        .map(personRefFromRfNode);
    },
    [graphIndex, nodes],
  );

  // Keep person/pivot neighbor lists in sync when the graph remounts or filters change
  // (e.g. initial selection before the first click).
  useEffect(() => {
    if (!selectedObject || selectedObject.nodeType === 'cluster' || selectedObject.nodeType === 'hypernode') return;

    const nodeId = nodeKey(selectedObject.objectType, selectedObject.objectId);
    if (!nodes.some((n) => n.id === nodeId)) return;

    const persons = connectedPersonsForNode(nodeId);
    if (sameRefs(selectedObject.persons, persons)) return;

    setSelectedObject({ ...selectedObject, persons });
  }, [connectedPersonsForNode, nodes, selectedObject, setSelectedObject]);

  useEffect(() => {
    if (!hideHypernodes || selectedObject?.nodeType !== 'hypernode') return;

    const startNode = flatGraph.nodes.find(
      (n): n is Extract<GraphRfNode, { type: 'person' }> => n.id === flatGraph.startKey && n.type === 'person',
    );
    if (!startNode) return;

    setSelectedObject({
      nodeType: 'person',
      ...personRefFromRfNode(startNode),
      persons: connectedPersonsForNode(startNode.id),
    });
  }, [hideHypernodes, selectedObject, flatGraph, connectedPersonsForNode, setSelectedObject]);

  const onNodeClick = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (node.type === 'person') {
        setSelectedObject({
          nodeType: 'person',
          ...personRefFromRfNode(node),
          persons: connectedPersonsForNode(node.id),
        });
        return;
      }

      if (node.type === 'cluster') {
        setSelectedObject({
          nodeType: 'cluster',
          objectType: node.data.root.objectType,
          objectId: node.data.root.objectId,
          label: node.data.root.label,
          nodeCount: node.data.nodeCount,
          internalEdgeCount: node.data.internalEdgeCount,
          persons: node.data.memberIds.map((memberId) => personRefFromNodeId(flatGraph.nodes, memberId)),
        });
        return;
      }

      if (node.type === 'hypernode') {
        setSelectedObject({
          nodeType: 'hypernode',
          objectType: node.data.objectType,
          objectId: node.data.objectId,
          hypernodeCount: node.data.count,
          persons: [],
        });
        return;
      }

      setSelectedObject({
        nodeType: 'pivot',
        objectType: node.data.objectType,
        objectId: node.data.value,
        persons: connectedPersonsForNode(node.id),
      });
    },
    [connectedPersonsForNode, flatGraph.nodes, setSelectedObject],
  );

  const onNodeMouseEnter = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (selectionMode) return;
      // Only a person hover traces a path back to start; both trail readers ignore
      // the trail unless a node is hovered outside selection mode.
      hoverNode(
        node.id,
        node.type === 'person' ? shortestPathUnion(graphIndex, flatGraph.startKey, node.id) : EMPTY_HOVER_TRAIL,
      );
    },
    [selectionMode, hoverNode, graphIndex, flatGraph.startKey],
  );

  const onNodeMouseLeave = useCallback<NodeMouseHandler<GraphRfNode>>(() => {
    hoverNode(null);
  }, [hoverNode]);

  const onEdgeMouseEnter = useCallback<EdgeMouseHandler<GraphRfEdge>>(
    (_event, edge) => {
      hoverEdge(edge.id);
    },
    [hoverEdge],
  );

  const onEdgeMouseLeave = useCallback<EdgeMouseHandler<GraphRfEdge>>(
    (event) => {
      // The HTML label sits on top of the SVG edge. Leaving the stroke for the
      // label must not clear hover, or the popover trigger unmounts on click.
      const next = event.relatedTarget;
      if (next instanceof Element && next.closest('[data-graph-edge-label]')) return;
      hoverEdge(null);
    },
    [hoverEdge],
  );

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
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        fitView
        fitViewOptions={graphFitViewOptions}
        maxZoom={5}
        minZoom={0.1}
        proOptions={{ hideAttribution: true }}
        colorMode={theme.theme}
      >
        <GraphMeasuredLayout layoutElements={autoLayoutElements} />
        <Controls position="bottom-left" className="z-10" fitViewOptions={graphFitViewOptions}>
          <AutoLayoutControlButton layoutElements={autoLayoutElements} />
          <ControlButton
            onClick={() => setShowEdgeLabels(!showEdgeLabels)}
            title={showEdgeLabels ? t('graph:controls.hide_edge_labels') : t('graph:controls.show_edge_labels')}
            aria-label={showEdgeLabels ? t('graph:controls.hide_edge_labels') : t('graph:controls.show_edge_labels')}
          >
            <Icon icon={showEdgeLabels ? 'eye-slash' : 'eye'} className="size-4" />
          </ControlButton>
        </Controls>
      </ReactFlow>
    </GraphIndexProvider>
  );
}
