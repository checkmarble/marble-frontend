import { type LinkToSingle, type TableModel } from '@app-builder/models';
import {
  BaseEdge,
  type DefaultEdgeOptions,
  type Edge,
  type EdgeProps,
  getBezierPath,
  MarkerType,
} from 'reactflow';

export interface LinkToSingleData {
  original: LinkToSingle;
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

export function adaptDataModelEdges(
  tableModel: TableModel,
  linkToSingle: LinkToSingle,
): Edge<LinkToSingleData> {
  return {
    ...defaultDataModelEdgeOptions,
    id: tableModel.id + linkToSingle.name,
    type: 'link_to_single_edge',
    source: tableModel.name,
    sourceHandle: linkToSingle.childFieldName,
    target: linkToSingle.parentTableName,
    targetHandle: linkToSingle.parentFieldName,
    data: { original: linkToSingle },
  };
}

export function LinkToSingleEdge({
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
}: EdgeProps<LinkToSingleData>) {
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
