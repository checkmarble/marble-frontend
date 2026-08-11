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

export type GraphNodeData = GraphNodeRef & {
  connector?: boolean;
  connector_kind?: string;
  hypernode_count?: number;
};

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

function adaptGraphNode(dto: GraphNodeDto): GraphNodeData {
  return {
    type: dto.type ?? '',
    id: dto.id ?? '',
    connector: dto.connector,
    connector_kind: dto.connector_kind,
    hypernode_count: dto.hypernode_count,
  };
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
