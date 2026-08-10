import { type LinkToSingle } from '@app-builder/models';
import { BaseEdge, type DefaultEdgeOptions, type Edge, type EdgeProps, getBezierPath, MarkerType } from '@xyflow/react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';
import '@xyflow/react/dist/style.css';

export type LinkToSingleData = {
  original: LinkToSingle;
} & Record<string, unknown>;

export function adaptLinkToSingleData(linkToSingle: LinkToSingle): LinkToSingleData {
  return {
    original: linkToSingle,
  };
}

export const defaultDataModelEdgeOptions: DefaultEdgeOptions = {
  style: {
    strokeWidth: 3,
    stroke: 'var(--color-purple-primary)',
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
    color: 'var(--color-purple-primary)',
  },
  interactionWidth: 25,
  labelBgStyle: {
    fill: 'rgb(252, 252, 255)',
  },
};

export type DataModelHandleSide = 'l' | 'r';

export function relatedHandleId(fieldName: string, side: DataModelHandleSide) {
  return `related:${fieldName}:${side}`;
}

export function belongsToHandleId(side: DataModelHandleSide) {
  return `belongs_to:header:${side}`;
}

export function getLinkToSingleDataEdgeId(linkToSingleData: LinkToSingleData) {
  const { original } = linkToSingleData;
  return original.childTableId + original.name;
}

/** Default LR wiring (child right → parent left); geometry may retarget sides later. */
export function getLinkToSingleDataEdge(linkToSingleData: LinkToSingleData) {
  const { original } = linkToSingleData;
  const isRelated = original.relationType === 'related';
  return {
    source: original.childTableName,
    sourceHandle: isRelated ? relatedHandleId(original.childFieldName, 'r') : belongsToHandleId('r'),
    target: original.parentTableName,
    targetHandle: isRelated ? relatedHandleId(original.parentFieldName, 'l') : belongsToHandleId('l'),
  };
}

/** Pick left/right handles from node centers (Δx ≥ 0 → source right / target left). */
export function retargetDataModelHandles<
  N extends {
    id: string;
    position: { x: number; y: number };
    measured?: { width?: number | null; height?: number | null } | null;
    width?: number | null;
    height?: number | null;
  },
  E extends {
    source: string;
    target: string;
    sourceHandle?: string | null;
    targetHandle?: string | null;
    data?: LinkToSingleData | null;
  },
>(nodes: N[], edges: E[]): E[] {
  const centers = new Map<string, { x: number; y: number }>();
  for (const node of nodes) {
    const width = node.measured?.width ?? node.width ?? 0;
    const height = node.measured?.height ?? node.height ?? 0;
    centers.set(node.id, { x: node.position.x + width / 2, y: node.position.y + height / 2 });
  }

  return edges.map((edge) => {
    const from = centers.get(edge.source);
    const to = centers.get(edge.target);
    const original = edge.data?.original;
    if (!from || !to || !original) return edge;

    const sourceSide: DataModelHandleSide = to.x - from.x >= 0 ? 'r' : 'l';
    const targetSide: DataModelHandleSide = to.x - from.x >= 0 ? 'l' : 'r';
    const isRelated = original.relationType === 'related';
    const sourceHandle = isRelated
      ? relatedHandleId(original.childFieldName, sourceSide)
      : belongsToHandleId(sourceSide);
    const targetHandle = isRelated
      ? relatedHandleId(original.parentFieldName, targetSide)
      : belongsToHandleId(targetSide);

    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;
    return { ...edge, sourceHandle, targetHandle };
  });
}

export function LinkRelation({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  interactionWidth,
  data,
}: EdgeProps<Edge<LinkToSingleData>>) {
  if (!data) return null;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.75,
  });

  const isRelated = data.original.relationType === 'related';
  const angleRad = Math.atan2(targetY - sourceY, targetX - sourceX);
  const angleDeg = (angleRad * 180) / Math.PI;
  const parentToChildAngleDeg = angleDeg;
  const badgeClasses = cn(
    'flex size-6 items-center justify-center rounded-full border-2 bg-grey-white',
    isRelated ? 'border-grey-secondary text-grey-secondary' : 'border-purple-primary text-purple-primary',
  );

  const directionBadge = (
    <foreignObject x={labelX - 12} y={labelY - 12} width={24} height={24}>
      <div className={badgeClasses} style={{ transform: `rotate(${parentToChildAngleDeg}deg)` }}>
        <Icon icon="arrow-forward" className="size-4" />
      </div>
    </foreignObject>
  );

  if (isRelated) {
    return (
      <>
        <BaseEdge
          id={id}
          path={path}
          labelX={labelX}
          labelY={labelY}
          markerStart={undefined}
          markerEnd={undefined}
          style={{
            ...style,
            stroke: 'var(--color-grey-secondary)',
            strokeWidth: 2,
            strokeDasharray: '7 6',
            strokeLinecap: 'round',
          }}
          interactionWidth={interactionWidth}
          label={null}
        />
        {directionBadge}
      </>
    );
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        labelX={labelX}
        labelY={labelY}
        markerStart={undefined}
        markerEnd={undefined}
        style={{
          ...style,
          stroke: 'var(--color-purple-primary)',
          strokeWidth: 3,
        }}
        interactionWidth={interactionWidth}
        label={null}
      />
      {directionBadge}
    </>
  );
}
