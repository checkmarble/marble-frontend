import { GraphIndexProvider } from '@app-builder/components/Graph/contexts/GraphIndexContext';
import { useGraphInteractionActions } from '@app-builder/components/Graph/contexts/GraphInteractionContext';
import { graphEdgeTypes, graphNodeTypes } from '@app-builder/components/Graph/GraphComponents';
import { graphFitViewOptions } from '@app-builder/components/Graph/lib/graph-fit-view';
import { GraphRfEdge, GraphRfNode } from '@app-builder/components/Graph/lib/graph-rf-types';
import { EMPTY_HOVER_TRAIL, shortestPathUnion } from '@app-builder/components/Graph/lib/hover-trail';
import { GraphMeasuredLayout, useLaidOutGraph } from '@app-builder/components/Graph/lib/use-laid-out-graph';
import { DataModel } from '@app-builder/models';
import {
  type GraphData,
  type GraphEdgeData,
  type GraphNodeData,
  type GraphNodeRef,
  type GraphRelation,
} from '@app-builder/models/graph';
import { EdgeMouseHandler, NodeMouseHandler, ReactFlow } from '@xyflow/react';
import { useCallback, useMemo, useRef } from 'react';

function personTableName(dataModel: DataModel) {
  return (
    dataModel.find((table) => table.semanticType === 'person' && table.subEntity === 'natural')?.name ??
    dataModel.find((table) => table.semanticType === 'person')?.name ??
    'users'
  );
}

export function useDefaultGraph(dataModel: DataModel): GraphData {
  const personTable = personTableName(dataModel);
  return useMemo<GraphData>(
    () => ({
      start: { type: personTable, id: 'jd' },
      nodes: [
        {
          type: personTable,
          id: 'jd',
          kind: 'record',
          metadata: {
            label: 'John Doe',
            riskLevel: 3,
            tagIds: [],
          },
        },
        {
          type: personTable,
          id: 'jsd',
          kind: 'record',
          metadata: {
            label: 'Jane Smith Doe',
            riskLevel: 1,
            tagIds: [],
          },
        },
        {
          type: personTable,
          id: 'js',
          kind: 'record',
          metadata: {
            label: 'Julian Smith',
            riskLevel: 2,
            tagIds: [],
          },
        },
        {
          type: personTable,
          id: 'jhs',
          kind: 'record',
          metadata: {
            label: 'John Smith',
            riskLevel: 2,
            tagIds: [],
          },
        },
        {
          type: 'iban',
          id: 'IT4761510285733272204979028',
          kind: 'connector',
          metadata: {
            label: 'IBAN',
            tagIds: [],
          },
        },
      ],
      edges: [
        {
          from: { type: personTable, id: 'jd' },
          to: { type: personTable, id: 'jsd' },
          kind: 'link',
          label: 'iban',
          through: ['transaction'],
          field: 'person_id',
          value: 'jd',
        },
        {
          from: { type: personTable, id: 'jd' },
          to: { type: personTable, id: 'jhs' },
          kind: 'link',
          label: 'iban',
          through: ['account'],
          field: 'account_id',
          value: 'account_1',
        },
        {
          from: { type: personTable, id: 'js' },
          to: { type: personTable, id: 'jhs' },
          kind: 'link',
          label: 'iban',
          through: ['account'],
          field: 'account_id',
          value: 'account_1',
        },
        {
          from: { type: personTable, id: 'jd' },
          to: { type: personTable, id: 'js' },
          kind: 'link',
          label: 'iban',
          through: ['transaction'],
          field: 'person_id',
          value: 'jd',
        },
        {
          from: { type: personTable, id: 'jd' },
          to: { type: 'iban', id: 'IT4761510285733272204979028' },
          kind: 'match',
          label: 'iban',
          through: ['transaction', 'account', 'transaction'],
          field: 'transaction_iban',
          value: 'IT4761510285733272204979028',
        },
        {
          from: { type: personTable, id: 'jsd' },
          to: { type: 'iban', id: 'IT4761510285733272204979028' },
          kind: 'match',
          label: 'iban',
          through: ['transaction', 'account', 'transaction'],
          field: 'transaction_iban',
          value: 'IT4761510285733272204979028',
        },
        {
          from: { type: personTable, id: 'jhs' },
          to: { type: 'iban', id: 'IT4761510285733272204979028' },
          kind: 'match',
          label: 'iban',
          through: ['transaction', 'account', 'transaction'],
          field: 'transaction_iban',
          value: 'IT4761510285733272204979028',
        },
      ],
    }),
    [dataModel],
  );
}

const SAMPLE_START_ID = 'jd';

const SAMPLE_FIRST_NAMES = ['Jane', 'Julian', 'Alice', 'Robert', 'Maria', 'James', 'Sofia', 'David'] as const;
const SAMPLE_LAST_NAMES = ['Smith', 'Martin', 'Chen', 'Garcia', 'Patel', 'Nguyen', 'Cohen', 'Berg'] as const;

function pickRandomName(names: readonly string[]) {
  return names[Math.floor(Math.random() * names.length)] ?? names[0] ?? '';
}

function relatedPersonLabel() {
  return `${pickRandomName(SAMPLE_FIRST_NAMES)} ${pickRandomName(SAMPLE_LAST_NAMES)}`;
}

function labelForRelation(labels: Map<string, string>, relationId: string) {
  const existing = labels.get(relationId);
  if (existing) return existing;
  const label = relatedPersonLabel();
  labels.set(relationId, label);
  return label;
}

function relationThrough(relation: GraphRelation) {
  return relation.leftType === relation.rightType ? [relation.leftType] : [relation.leftType, relation.rightType];
}

function matchEdges(
  relation: GraphRelation,
  from: GraphNodeRef,
  to: GraphNodeRef,
  connector: GraphNodeRef,
): GraphEdgeData[] {
  const through = relationThrough(relation);
  return [
    {
      from,
      to: connector,
      kind: 'match',
      label: relation.label,
      through,
      field: relation.leftField,
      value: connector.id,
    },
    {
      from: to,
      to: connector,
      kind: 'match',
      label: relation.label,
      through,
      field: relation.rightField,
      value: connector.id,
    },
  ];
}

export function useRelationGraph(dataModel: DataModel, relations: GraphRelation[]): GraphData {
  const personTable = personTableName(dataModel);
  const labelsByRelationId = useRef(new Map<string, string>());

  return useMemo<GraphData>(() => {
    const labels = labelsByRelationId.current;
    const activeIds = new Set(relations.map((relation) => relation.id));
    for (const id of labels.keys()) {
      if (!activeIds.has(id)) labels.delete(id);
    }

    const start: GraphNodeRef = { type: personTable, id: SAMPLE_START_ID };
    const nodes: GraphNodeData[] = [
      {
        type: personTable,
        id: SAMPLE_START_ID,
        kind: 'record',
        metadata: {
          label: 'John Doe',
          tagIds: [],
        },
      },
    ];
    const edges: GraphEdgeData[] = [];

    for (const [index, relation] of relations.entries()) {
      const related: GraphNodeRef = { type: personTable, id: relation.id };
      nodes.push({
        ...related,
        kind: 'record',
        metadata: { label: labelForRelation(labels, relation.id), tagIds: [] },
      });

      const connector: GraphNodeRef = { type: relation.label, id: `${relation.label}-${index + 1}` };
      nodes.push({
        ...connector,
        kind: 'connector',
        metadata: {
          label: relation.label,
          tagIds: [],
        },
      });
      edges.push(...matchEdges(relation, start, related, connector));
    }

    return { start, nodes, edges };
  }, [personTable, relations]);
}

export function SampleGraph({ data, dataModel }: { data: GraphData; dataModel: DataModel }) {
  const { nodes, edges, onNodesChange, onEdgesChange, autoLayoutElements, graphIndex, flatGraph } = useLaidOutGraph({
    data,
    dataModel,
  });
  const { hoverNode, hoverEdge } = useGraphInteractionActions();

  const onNodeMouseEnter = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      hoverNode(
        node.id,
        node.type === 'person' ? shortestPathUnion(graphIndex, flatGraph.startKey, node.id) : EMPTY_HOVER_TRAIL,
      );
    },
    [hoverNode, graphIndex, flatGraph.startKey],
  );

  const onNodeMouseLeave = useCallback<NodeMouseHandler<GraphRfNode>>(() => {
    hoverNode(null);
  }, [hoverNode]);

  const onEdgeMouseEnter = useCallback<EdgeMouseHandler<GraphRfEdge>>(
    (_event, edge) => hoverEdge(edge.id),
    [hoverEdge],
  );

  const onEdgeMouseLeave = useCallback<EdgeMouseHandler<GraphRfEdge>>(
    (event) => {
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
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        onEdgeMouseEnter={onEdgeMouseEnter}
        onEdgeMouseLeave={onEdgeMouseLeave}
        fitView
        fitViewOptions={graphFitViewOptions}
        maxZoom={5}
        minZoom={0.1}
        nodesConnectable={false}
        zoomOnScroll={false}
        proOptions={{ hideAttribution: true }}
      >
        <GraphMeasuredLayout layoutElements={autoLayoutElements} />
      </ReactFlow>
    </GraphIndexProvider>
  );
}
