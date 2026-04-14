import { type LinkToSingle } from '@app-builder/models';
import { BaseEdge, type DefaultEdgeOptions, type Edge, type EdgeProps, getBezierPath, MarkerType } from '@xyflow/react';
import { cn } from 'ui-design-system';
import { Icon } from 'ui-icons';

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

export function getLinkToSingleDataEdgeId(linkToSingleData: LinkToSingleData) {
  const { original } = linkToSingleData;
  return original.childTableId + original.name;
}

export function getLinkToSingleDataEdge(linkToSingleData: LinkToSingleData) {
  const { original } = linkToSingleData;
  const isRelated = original.relationType === 'related';
  return {
    source: original.childTableName,
    sourceHandle: isRelated ? `related:${original.childFieldName}` : 'belongs_to:header',
    target: original.parentTableName,
    targetHandle: isRelated ? `related:${original.parentFieldName}` : 'belongs_to:header',
  };
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
