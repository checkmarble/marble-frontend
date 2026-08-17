import {
  type CreateGraphRelation as CreateGraphRelationDto,
  type Graph as GraphDto,
  type GraphEdge as GraphEdgeDto,
  type GraphNode as GraphNodeDto,
  type GraphNodeRef as GraphNodeRefDto,
  type GraphRelation as GraphRelationDto,
} from 'marble-api';

export type GraphNodeRef = {
  type: string;
  id: string;
};

/** Per-node annotations returned with the graph payload (structural/record nodes). */
export type GraphNodeMetadata = {
  label?: string;
  riskLevel?: number;
  tagIds: string[];
};

/**
 * A node is one of three things: an entity record, a connector the API matched
 * records on, or a hypernode standing in for `hypernodeCount` collapsed records.
 */
export type GraphNodeData = GraphNodeRef &
  (
    | { kind: 'record'; metadata?: GraphNodeMetadata }
    | { kind: 'connector'; metadata?: GraphNodeMetadata }
    | { kind: 'hypernode'; hypernodeCount: number; metadata?: GraphNodeMetadata }
  );

export type GraphEdgeData = {
  from: GraphNodeRef;
  to: GraphNodeRef;
  kind: string;
  label: string;
  field?: string;
  value?: string;
};

export type GraphData = {
  start: GraphNodeRef;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
};

export type GraphRelation = {
  id: string;
  label: string;
  leftType: string;
  leftField: string;
  rightType: string;
  rightField: string;
  createdAt: string;
};

export type CreateGraphRelationBody = {
  label: string;
  leftType: string;
  leftField: string;
  rightType: string;
  rightField: string;
};

function adaptGraphNodeRef(dto: GraphNodeRefDto): GraphNodeRef {
  return { type: dto.type, id: dto.id };
}

function adaptGraphNodeMetadata(dto: GraphNodeDto): GraphNodeMetadata {
  const rawTags = dto.metadata?.tags;
  return {
    label: dto.metadata?.label,
    riskLevel: dto.metadata?.risk_level,
    tagIds: Array.isArray(rawTags) ? rawTags.map(String).filter(Boolean) : [],
  };
}

function adaptGraphNode(dto: GraphNodeDto): GraphNodeData {
  const ref = adaptGraphNodeRef(dto);
  if (dto.hypernode_count != null) {
    return { ...ref, kind: 'hypernode', hypernodeCount: dto.hypernode_count, metadata: adaptGraphNodeMetadata(dto) };
  }
  if (dto.connector === true) {
    return { ...ref, kind: 'connector', metadata: adaptGraphNodeMetadata(dto) };
  }
  return { ...ref, kind: 'record', metadata: adaptGraphNodeMetadata(dto) };
}

function adaptGraphEdge(dto: GraphEdgeDto): GraphEdgeData {
  return {
    from: adaptGraphNodeRef(dto.from),
    to: adaptGraphNodeRef(dto.to),
    kind: dto.kind,
    label: dto.label,
    field: dto.field,
    value: dto.value,
  };
}

export function adaptGraphData(dto: GraphDto): GraphData {
  return {
    start: adaptGraphNodeRef(dto.start),
    nodes: dto.nodes.map(adaptGraphNode),
    edges: dto.edges.map(adaptGraphEdge),
  };
}

export function adaptGraphRelation(dto: GraphRelationDto): GraphRelation {
  return {
    id: dto.id,
    label: dto.label,
    leftType: dto.left_type,
    leftField: dto.left_field,
    rightType: dto.right_type,
    rightField: dto.right_field,
    createdAt: dto.created_at,
  };
}

export function adaptCreateGraphRelationDto(body: CreateGraphRelationBody): CreateGraphRelationDto {
  return {
    label: body.label,
    left_type: body.leftType,
    left_field: body.leftField,
    right_type: body.rightType,
    right_field: body.rightField,
  };
}
