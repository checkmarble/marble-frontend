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
import { type CustomerGraphContextValue, type GraphAttribute, useCustomerGraph } from './CustomerGraphContext';
import { type GraphData } from './data';
import { type NonPersonSemantic, semanticTypeLabel } from './data-model-map';
import {
  BackEdge,
  EntityNode,
  type GraphRfEdge,
  type GraphRfNode,
  GroupNode,
  LinkEdge,
  MatchEdge,
  PersonNode,
  PivotNode,
  TypeBundleNode,
  withBestHandles,
} from './GraphComponents';
import {
  collectMultiMemberGroupIds,
  type ExpandedLeaf,
  type FlowGraph,
  type GroupLeaf,
  nodeKey,
  type PersonLeaf,
  projectExpandedView,
  transformDataToFlow,
} from './utils';
import '@xyflow/react/dist/style.css';

const GROUP_RADIUS = 200;
const PERSON_RADIUS = 380;
const NESTED_GROUP_RADIUS = 160;
const NESTED_PERSON_RADIUS = 300;
const ENTITY_LAYER_RADIUS = 170;
const PERSON_OUTER_EXTRA = 100;

export type GraphImplProps = {
  data: GraphData;
  /**
   * Max graph hops from the start node.
   * `0` (default) explores the full reachable graph; `N > 0` stops after N hops.
   */
  maxExplorationHops?: number;
};

function polar(cx: number, cy: number, radius: number, angle: number) {
  return { x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius };
}

function personLabel(leaf: PersonLeaf): string {
  return leaf.node.id;
}

function groupNodeId(ownerKey: string, semanticType: NonPersonSemantic): string {
  return `group:${ownerKey}:${semanticType}`;
}

function expandPerson(
  leaf: PersonLeaf,
  cx: number,
  cy: number,
  /** Angle from this person back toward its parent (undefined for root) */
  inwardAngle: number | undefined,
  expandedGroupIds: Set<string>,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  if (leaf.expanded) {
    placeExpanded(leaf, leaf.expanded, cx, cy, inwardAngle, expandedGroupIds, nodes, edges);
    return;
  }

  const groups = [...leaf.groups.entries()];
  if (groups.length === 0) return;

  const ownerKey = nodeKey(leaf.node);
  const isRoot = inwardAngle === undefined;
  const groupRadius = isRoot ? GROUP_RADIUS : NESTED_GROUP_RADIUS;
  const personRadius = isRoot ? PERSON_RADIUS : NESTED_PERSON_RADIUS;

  // Root: full circle. Nested: fan outward (away from parent).
  const outwardBase = isRoot ? -Math.PI / 2 : inwardAngle! + Math.PI;
  const spread = isRoot ? Math.PI * 2 : Math.PI * 0.9;

  groups.forEach(([semanticType, group], groupIndex) => {
    const groupAngle = isRoot
      ? -Math.PI / 2 + (Math.PI * 2 * groupIndex) / groups.length
      : groups.length === 1
        ? outwardBase
        : outwardBase - spread / 2 + (spread * groupIndex) / (groups.length - 1);

    const groupPos = polar(cx, cy, groupRadius, groupAngle);
    const gId = groupNodeId(ownerKey, semanticType);

    nodes.push({
      id: gId,
      position: groupPos,
      type: 'typeGroup',
      data: {
        semanticType,
        label: semanticTypeLabel[semanticType],
        memberCount: group.members.length,
      },
    });

    edges.push({
      id: `${ownerKey}->${gId}`,
      source: ownerKey,
      target: gId,
      type: 'link',
      data: { kind: 'link' },
    });

    placeGroupPersons(group, gId, cx, cy, groupAngle, personRadius, spread / Math.max(groups.length, 1), nodes, edges);

    for (const [personKey, child] of group.persons) {
      const childNode = nodes.find((n) => n.id === personKey);
      if (!childNode) continue;
      const childInward = Math.atan2(cy - childNode.position.y, cx - childNode.position.x);
      expandPerson(child, childNode.position.x, childNode.position.y, childInward, expandedGroupIds, nodes, edges);
    }
  });
}

function placeExpanded(
  leaf: PersonLeaf,
  expanded: ExpandedLeaf,
  cx: number,
  cy: number,
  inwardAngle: number | undefined,
  expandedGroupIds: Set<string>,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  const ownerKey = nodeKey(leaf.node);
  if (expanded.nodes.size === 0 && expanded.persons.size === 0) return;

  const projected = projectExpandedView(expanded, ownerKey, expandedGroupIds);

  // Adjacency on the projected graph for layout
  const localAdj = new Map<string, string[]>();
  const addAdj = (a: string, b: string) => {
    const list = localAdj.get(a) ?? [];
    list.push(b);
    localAdj.set(a, list);
  };
  for (const link of projected.links) {
    const aLocal = link.from === ownerKey || projected.nodes.some((n) => n.id === link.from);
    const bLocal = link.to === ownerKey || projected.nodes.some((n) => n.id === link.to);
    if (aLocal && bLocal) {
      addAdj(link.from, link.to);
      addAdj(link.to, link.from);
    }
  }
  // Include person attachments in spanning tree for angle assignment
  for (const link of projected.links) {
    if (expanded.persons.has(link.from) || expanded.persons.has(link.to)) {
      addAdj(link.from, link.to);
      addAdj(link.to, link.from);
    }
  }

  const dist = new Map<string, number>([[ownerKey, 0]]);
  const parent = new Map<string, string>();
  const queue = [ownerKey];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    for (const nxt of localAdj.get(cur) ?? []) {
      if (dist.has(nxt)) continue;
      dist.set(nxt, (dist.get(cur) ?? 0) + 1);
      parent.set(nxt, cur);
      queue.push(nxt);
    }
  }

  const children = new Map<string, string[]>();
  for (const [child, p] of parent) {
    const list = children.get(p) ?? [];
    list.push(child);
    children.set(p, list);
  }

  const sectorStart = inwardAngle === undefined ? -Math.PI : inwardAngle + Math.PI - Math.PI * 0.45;
  const sectorWidth = inwardAngle === undefined ? Math.PI * 2 : Math.PI * 0.9;

  let leafCursor = 0;
  const leafCount = countSpanningLeaves(ownerKey, children);
  const angles = new Map<string, number>();

  function assignAngles(key: string): { min: number; max: number } {
    const kids = children.get(key) ?? [];
    if (kids.length === 0) {
      const t = leafCount <= 1 ? 0.5 : (leafCursor + 0.5) / leafCount;
      leafCursor += 1;
      const angle = sectorStart + sectorWidth * t;
      angles.set(key, angle);
      return { min: angle, max: angle };
    }
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const kid of kids) {
      const range = assignAngles(kid);
      min = Math.min(min, range.min);
      max = Math.max(max, range.max);
    }
    angles.set(key, (min + max) / 2);
    return { min, max };
  }
  assignAngles(ownerKey);

  for (const viewNode of projected.nodes) {
    const depth = dist.get(viewNode.id) ?? viewNode.depth;
    const angle = angles.get(viewNode.id) ?? sectorStart + sectorWidth / 2;
    const pos = polar(cx, cy, depth * ENTITY_LAYER_RADIUS, angle);

    if (viewNode.kind === 'bundle') {
      nodes.push({
        id: viewNode.id,
        position: pos,
        type: 'typeBundle',
        data: {
          groupId: viewNode.groupId,
          semanticType: viewNode.semanticType,
          label: semanticTypeLabel[viewNode.semanticType],
          count: viewNode.count,
        },
      });
    } else if (viewNode.kind === 'pivot') {
      nodes.push({
        id: viewNode.id,
        position: pos,
        type: 'pivot',
        data: { label: viewNode.node.id, rawType: viewNode.node.type },
      });
    } else {
      nodes.push({
        id: viewNode.id,
        position: pos,
        type: 'entity',
        data: {
          label: viewNode.node.id,
          semanticType: viewNode.semanticType,
          rawType: viewNode.node.type,
          groupId: viewNode.groupId,
          canCollapse: viewNode.canCollapse,
        },
      });
    }
  }

  const maxLocalDist = projected.nodes.reduce((max, n) => Math.max(max, dist.get(n.id) ?? n.depth), 0);
  const personRadius = Math.max(1, maxLocalDist + 1) * ENTITY_LAYER_RADIUS + PERSON_OUTER_EXTRA;

  for (const [personKey, child] of expanded.persons) {
    const attachmentAngles: number[] = [];
    for (const link of projected.links) {
      const other = link.from === personKey ? link.to : link.to === personKey ? link.from : null;
      if (!other) continue;
      const angle = angles.get(other);
      if (angle !== undefined) attachmentAngles.push(angle);
    }
    const angle =
      attachmentAngles.length > 0
        ? attachmentAngles.reduce((sum, a) => sum + a, 0) / attachmentAngles.length
        : sectorStart + sectorWidth / 2;
    const pos = polar(cx, cy, personRadius, angle);

    nodes.push({
      id: personKey,
      position: pos,
      type: 'person',
      data: {
        label: personLabel(child),
        subEntity: child.subEntity,
        isStart: false,
        riskLabel: 'Risque faible',
        tags: ['Custom lorem'],
      },
    });
  }

  const placedIds = new Set(nodes.map((n) => n.id));

  for (const link of projected.links) {
    if (!placedIds.has(link.from) || !placedIds.has(link.to)) continue;
    const touchesBackLink = expanded.backLinks.includes(link.from) || expanded.backLinks.includes(link.to);
    const isMatch = link.edge.kind === 'match';
    edges.push({
      id: `${link.from}->${link.to}:${link.edge.label}`,
      source: link.from,
      target: link.to,
      type: touchesBackLink ? 'back' : isMatch ? 'match' : 'link',
      label: link.edge.label,
      data: { kind: link.edge.kind },
    });
  }

  for (const key of expanded.backLinks) {
    if (!placedIds.has(key)) continue;
    for (const link of projected.links) {
      if (link.from !== key && link.to !== key) continue;
      const other = link.from === key ? link.to : link.from;
      if (!placedIds.has(other)) continue;
      const edgeId = `${link.from}->${link.to}:${link.edge.label}`;
      if (edges.some((e) => e.id === edgeId)) continue;
      edges.push({
        id: `${edgeId}:back`,
        source: link.from,
        target: link.to,
        type: 'back',
        label: link.edge.label,
        data: { kind: 'back' },
      });
    }
  }

  for (const [personKey, child] of expanded.persons) {
    const childNode = nodes.find((n) => n.id === personKey);
    if (!childNode) continue;
    const childInward = Math.atan2(cy - childNode.position.y, cx - childNode.position.x);
    expandPerson(child, childNode.position.x, childNode.position.y, childInward, expandedGroupIds, nodes, edges);
  }
}

function countSpanningLeaves(key: string, children: Map<string, string[]>): number {
  const kids = children.get(key) ?? [];
  if (kids.length === 0) return 1;
  return kids.reduce((sum, kid) => sum + countSpanningLeaves(kid, children), 0);
}

function placeGroupPersons(
  group: GroupLeaf,
  groupId: string,
  originX: number,
  originY: number,
  groupAngle: number,
  personRadius: number,
  sectorWidth: number,
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
) {
  const persons = [...group.persons.entries()];

  persons.forEach(([key, leaf], index) => {
    const t = persons.length === 1 ? 0.5 : (index + 0.5) / persons.length;
    const angle = groupAngle - sectorWidth / 2 + sectorWidth * t;
    const pos = polar(originX, originY, personRadius, angle);

    nodes.push({
      id: key,
      position: pos,
      type: 'person',
      data: {
        label: personLabel(leaf),
        subEntity: leaf.subEntity,
        isStart: false,
        riskLabel: 'Risque faible',
        tags: ['Custom lorem'],
      },
    });

    edges.push({
      id: `${groupId}->${key}`,
      source: groupId,
      target: key,
      type: 'link',
      data: { kind: 'link' },
    });
  });

  for (const key of group.backLinks) {
    if (!nodes.some((n) => n.id === key)) continue;
    edges.push({
      id: `${groupId}->${key}:back`,
      source: groupId,
      target: key,
      type: 'back',
      data: { kind: 'back' },
    });
  }
}

function buildRadialGraph(
  data: FlowGraph,
  expandedGroupIds: Set<string>,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  const startId = nodeKey(data.root.node);
  const nodes: GraphRfNode[] = [
    {
      id: startId,
      position: { x: 0, y: 0 },
      type: 'person',
      data: {
        label: personLabel(data.root),
        subEntity: data.root.subEntity,
        isStart: true,
        riskLabel: 'Risque faible',
        tags: ['Custom lorem'],
      },
    },
  ];
  const edges: GraphRfEdge[] = [];
  expandPerson(data.root, 0, 0, undefined, expandedGroupIds, nodes, edges);
  return { nodes, edges: withBestHandles(nodes, edges) };
}

type VisibilityFilters = Pick<
  CustomerGraphContextValue,
  'showPersons' | 'showCompanies' | 'eventFilter' | 'attributes'
>;

function attributeAllowsPivot(rawType: string, attributes: GraphAttribute[]): boolean {
  if (rawType === 'same_ip') return attributes.includes('ip');
  if (rawType === 'same_iban') return attributes.includes('iban');
  return true;
}

function isNodeVisible(node: GraphRfNode, filters: VisibilityFilters): boolean {
  if (node.type === 'person') {
    if (node.data.isStart) return true;
    if (node.data.subEntity === 'moral') return filters.showCompanies;
    if (node.data.subEntity === 'natural') return filters.showPersons;
    return filters.showPersons || filters.showCompanies;
  }

  if (node.type === 'entity') {
    if (node.data.semanticType === 'event') {
      return filters.eventFilter === 'all' && filters.attributes.includes('device');
    }
    return true;
  }

  if (node.type === 'typeBundle') {
    if (node.data.semanticType === 'event') {
      return filters.eventFilter === 'all' && filters.attributes.includes('device');
    }
    return true;
  }

  if (node.type === 'pivot') {
    return attributeAllowsPivot(node.data.rawType, filters.attributes);
  }

  return true;
}

function applyVisibilityFilters(
  nodes: GraphRfNode[],
  edges: GraphRfEdge[],
  filters: VisibilityFilters,
): { nodes: GraphRfNode[]; edges: GraphRfEdge[] } {
  const visibleNodes = nodes.filter((node) => isNodeVisible(node, filters));
  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const visibleEdges = edges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  return { nodes: visibleNodes, edges: visibleEdges };
}

export function GraphImpl({ data, maxExplorationHops = 0 }: GraphImplProps) {
  const {
    showPersons,
    showCompanies,
    eventFilter,
    attributes,
    showEdgeLabels,
    setShowEdgeLabels,
    expandedGroupIds,
    expandAllGroups,
    collapseAllGroups,
    resetExpandedGroups,
    setSelectedNodeId,
  } = useCustomerGraph();

  const flowGraph = useMemo(
    () =>
      transformDataToFlow(data, {
        maxDepth: 2,
        expandLevels: 1,
        maxExplorationHops,
      }),
    [data, maxExplorationHops],
  );

  const allGroupIds = useMemo(() => collectMultiMemberGroupIds(flowGraph.root), [flowGraph]);

  useEffect(() => {
    resetExpandedGroups();
  }, [flowGraph, resetExpandedGroups]);

  const layout = useMemo(() => buildRadialGraph(flowGraph, expandedGroupIds), [flowGraph, expandedGroupIds]);

  const filteredLayout = useMemo(
    () =>
      applyVisibilityFilters(layout.nodes, layout.edges, {
        showPersons,
        showCompanies,
        eventFilter,
        attributes,
      }),
    [layout, showPersons, showCompanies, eventFilter, attributes],
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

  const onNodeClick = useCallback<NodeMouseHandler<GraphRfNode>>(
    (_event, node) => {
      setSelectedNodeId(node.id);
    },
    [setSelectedNodeId],
  );

  const allExpanded = allGroupIds.length > 0 && allGroupIds.every((id) => expandedGroupIds.has(id));

  return (
    <ReactFlow
      className="h-full min-h-0"
      nodeTypes={{
        person: PersonNode,
        typeGroup: GroupNode,
        entity: EntityNode,
        pivot: PivotNode,
        typeBundle: TypeBundleNode,
      }}
      edgeTypes={{
        link: LinkEdge,
        back: BackEdge,
        match: MatchEdge,
      }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Controls>
        <ControlButton
          onClick={() => setShowEdgeLabels(!showEdgeLabels)}
          title={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
          aria-label={showEdgeLabels ? 'Hide edge labels' : 'Show edge labels'}
        >
          <Icon icon={showEdgeLabels ? 'tip' : 'eye-slash'} className="size-4" />
        </ControlButton>
        <ControlButton
          onClick={() => (allExpanded ? collapseAllGroups() : expandAllGroups(allGroupIds))}
          title={allExpanded ? 'Collapse all groups' : 'Expand all groups'}
          aria-label={allExpanded ? 'Collapse all groups' : 'Expand all groups'}
        >
          <Icon icon={allExpanded ? 'minus' : 'plus'} className="size-4" />
        </ControlButton>
      </Controls>
    </ReactFlow>
  );
}
