import { AutoLayoutControlButton } from '@app-builder/components/ReactFlow';
import { useTheme } from '@app-builder/contexts/ThemeContext';
import { type DataModel } from '@app-builder/models/data-model';
import { type GraphData, GraphNodeData } from '@app-builder/models/graph';
import { ControlButton, Controls, EdgeMouseHandler, type NodeMouseHandler, ReactFlow } from '@xyflow/react';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import { graphEdgeTypes, graphNodeTypes } from './GraphComponents';
import { graphI18n } from './graph-i18n';
import { type GraphObjectRef, nodeKey, parseNodeKey } from './graph-keys';
import { GraphRfEdge, type GraphRfNode } from './graph-rf-types';
import {
  applyVisibilityFilters,
  GraphMeasuredLayout,
  graphFitViewOptions,
  useLaidOutGraph,
} from './use-laid-out-graph';
import '@xyflow/react/dist/style.css';

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
  return { objectType: node.data.objectType, objectId: node.data.objectId, label: node.data.label };
}

function personRefFromGraphData(nodes: GraphNodeData[], key: string): GraphObjectRef {
  const ref = parseNodeKey(key);
  const node = nodes.find((n) => n.type === ref.objectType && n.id === ref.objectId);
  return { ...ref, label: node?.metadata?.label };
}

export function GraphImpl({ data, dataModel }: GraphImplProps) {
  const { t } = useTranslation(graphI18n);
  const theme = useTheme();
  const {
    showEdgeLabels,
    setShowEdgeLabels,
    selectedObject,
    setSelectedObject,
    selectionMode,
    setHoveredNodeId,
    setHoveredEdgeId,
    hiddenNodeIds,
    checkedNodeIds,
    setGraphStats,
  } = useCustomerGraph();

  const { nodes, edges, onNodesChange, onEdgesChange, autoLayoutElements, flatGraph, typeFilters, visibleGraph } =
    useLaidOutGraph({ data, dataModel });

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

  const connectedPersonsForNode = useCallback(
    (nodeId: string): GraphObjectRef[] => {
      const neighborIds = new Set<string>();
      for (const edge of edges) {
        if (edge.source === nodeId) neighborIds.add(edge.target);
        if (edge.target === nodeId) neighborIds.add(edge.source);
      }
      return nodes
        .filter((n): n is Extract<GraphRfNode, { type: 'person' }> => n.type === 'person' && neighborIds.has(n.id))
        .map(personRefFromRfNode);
    },
    [edges, nodes],
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

  const onNodeClick = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      if (node.type === 'person') {
        setSelectedObject({
          nodeType: 'person',
          objectType: node.data.objectType,
          objectId: node.data.objectId,
          label: node.data.label,
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
          persons: node.data.memberIds.map((memberId) => personRefFromGraphData(data.nodes, memberId)),
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
        objectType: node.data.label ?? '',
        objectId: node.data.value,
        persons: connectedPersonsForNode(node.id),
      });
    },
    [connectedPersonsForNode, data.nodes, setSelectedObject],
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

  const onEdgeMouseEnter = useCallback<EdgeMouseHandler<GraphRfEdge>>(
    (_event, edge) => {
      setHoveredEdgeId(edge.id);
    },
    [setHoveredEdgeId],
  );

  const onEdgeMouseLeave = useCallback<EdgeMouseHandler<GraphRfEdge>>(() => {
    setHoveredEdgeId(null);
  }, [setHoveredEdgeId]);

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
  );
}
