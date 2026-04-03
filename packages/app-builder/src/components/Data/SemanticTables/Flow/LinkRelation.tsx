import { type LinkToSingle } from '@app-builder/models';
import { BaseEdge, type DefaultEdgeOptions, type Edge, type EdgeProps, getBezierPath, MarkerType } from '@xyflow/react';

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
  },
  markerEnd: {
    type: MarkerType.ArrowClosed,
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
  return {
    source: original.childTableName,
    sourceHandle: original.childFieldName,
    target: original.parentTableName,
    targetHandle: original.parentFieldName,
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
  markerEnd,
  markerStart,
  interactionWidth,
  label,
  labelStyle,
  labelShowBg,
  labelBgStyle,
  labelBgPadding,
  labelBgBorderRadius,
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

  return (
    <BaseEdge
      id={id}
      path={path}
      labelX={labelX}
      labelY={labelY}
      markerStart={markerStart}
      markerEnd={markerEnd}
      style={style}
      interactionWidth={interactionWidth}
      label={label ?? data?.original.name}
      labelStyle={labelStyle}
      labelShowBg={labelShowBg}
      labelBgStyle={labelBgStyle}
      labelBgPadding={labelBgPadding}
      labelBgBorderRadius={labelBgBorderRadius}
    />
  );
}
