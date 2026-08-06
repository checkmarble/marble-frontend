import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { SCORING_LEVELS_COLORS } from '@app-builder/models/scoring';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  type NodeProps,
  Position,
} from '@xyflow/react';
import { type ReactNode } from 'react';
import { Button, Checkbox, cn, ExpandableGroupTagLine, Tag } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import {
  type ClusterRfNode,
  type GraphRfEdge,
  type GraphRfNode,
  type PersonRfData,
  type PersonRfNode,
  type PivotRfNode,
} from './graph-rf-types';
import { resolveTitle } from './resolve-object-title';

export type {
  ClusterRfData,
  ClusterRfNode,
  GraphRfEdge,
  GraphRfNode,
  PersonRfData,
  PersonRfNode,
  PivotRfData,
  PivotRfNode,
} from './graph-rf-types';

type HandleSide = 't' | 'r' | 'b' | 'l';

function nodeCenter(node: GraphRfNode): { x: number; y: number } {
  const w = node.measured?.width ?? node.width ?? 120;
  const h = node.measured?.height ?? node.height ?? 40;
  return { x: node.position.x + w / 2, y: node.position.y + h / 2 };
}

/** Dominant axis from source → target (avoids e.g. Top→Bottom when nodes are side-by-side). */
function sideFromDelta(dx: number, dy: number): HandleSide {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? 'r' : 'l';
  }
  return dy >= 0 ? 'b' : 't';
}

function handlesForEdge(
  source: GraphRfNode,
  target: GraphRfNode,
): {
  sourceHandle: string;
  targetHandle: string;
} {
  const from = nodeCenter(source);
  const to = nodeCenter(target);
  const sourceSide = sideFromDelta(to.x - from.x, to.y - from.y);
  const targetSide = sideFromDelta(from.x - to.x, from.y - to.y);
  return {
    sourceHandle: `s${sourceSide}`,
    targetHandle: targetSide,
  };
}

export function withBestHandles(nodes: GraphRfNode[], edges: GraphRfEdge[]): GraphRfEdge[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((edge) => {
    const source = byId.get(edge.source);
    const target = byId.get(edge.target);
    if (!source || !target) return edge;
    const { sourceHandle, targetHandle } = handlesForEdge(source, target);
    if (edge.sourceHandle === sourceHandle && edge.targetHandle === targetHandle) return edge;
    return { ...edge, sourceHandle, targetHandle };
  });
}

export function FourHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} id="t" className="bg-transparent! border-0!" />
      <Handle type="target" position={Position.Right} id="r" className="bg-transparent! border-0!" />
      <Handle type="target" position={Position.Bottom} id="b" className="bg-transparent! border-0!" />
      <Handle type="target" position={Position.Left} id="l" className="bg-transparent! border-0!" />
      <Handle type="source" position={Position.Top} id="st" className="bg-transparent! border-0!" />
      <Handle type="source" position={Position.Right} id="sr" className="bg-transparent! border-0!" />
      <Handle type="source" position={Position.Bottom} id="sb" className="bg-transparent! border-0!" />
      <Handle type="source" position={Position.Left} id="sl" className="bg-transparent! border-0!" />
    </>
  );
}

/** Keeps clicks off the canvas: no node drag, no pan, no node-click selection. */
function NodeActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  return (
    <div
      className="nodrag nopan shrink-0"
      onClick={(e) => {
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <Button
        type="button"
        variant="secondary"
        appearance="stroked"
        size="small"
        mode="icon"
        aria-label={label}
        title={label}
        onClick={onPress}
      >
        <Icon icon={icon} className="size-4" />
      </Button>
    </div>
  );
}

function subEntityIcon(subEntity: FtmEntityPersonOption): IconName {
  switch (subEntity) {
    case 'moral':
      return 'building';
    case 'generic':
      return 'users';
    case 'natural':
    default:
      return 'person';
  }
}

/**
 * Resolved title + badge cluster for a person, shared by `PersonNode` and the
 * entry point a `ClusterNode` renders on top of its card.
 */
function usePersonPresentation(data: PersonRfData) {
  const { showRiskScore, selectedObject } = useCustomerGraph();

  const isSelected = selectedObject?.objectType === data.objectType && selectedObject?.objectId === data.objectId;
  const isHighlighted = data.isStart || isSelected;

  const detailsQuery = useObjectDetailsQuery(data.objectType, data.objectId);
  const displayLabel =
    detailsQuery.data?.data != null ? resolveTitle(detailsQuery.data.data, data.objectId) : data.label;

  const scoreQuery = useScoreLatestQuery(data.objectType, data.objectId, showRiskScore);
  const settingsQuery = useScoringSettingsQuery(showRiskScore);

  const score = scoreQuery.data?.score;
  const settings = settingsQuery.data?.settings;
  const maxRiskLevel = settings?.maxRiskLevel as 3 | 4 | 5 | 6 | undefined;
  const scoreColor =
    score && maxRiskLevel ? (SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? undefined) : undefined;
  const scoreLabel = score && maxRiskLevel ? score.risk_level.toString() : undefined;

  const pillClassName = cn(
    'rounded-full border bg-purple-border border-purple-disabled px-md py-sm text-sm font-medium text-purple-primary shadow-sm',
    isHighlighted && 'bg-purple-primary border-white text-white',
  );

  const badges = (
    <div className="absolute left-1/2 -top-1 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center">
      <div
        className={cn(
          'rounded-full shrink-0 border bg-purple-border border-purple-disabled p-xs',
          isHighlighted && 'bg-purple-primary border-white',
        )}
      >
        <Icon
          icon={subEntityIcon(data.subEntity)}
          className={cn('size-4 text-purple-primary', isHighlighted && 'text-white')}
        />
      </div>
      {showRiskScore && scoreLabel && scoreColor ? (
        <span
          className="rounded-full border p-px text-xs font-normal h-7 min-w-7 grid place-items-center text-white border-white -ml-1"
          style={{
            backgroundColor: scoreColor,
          }}
        >
          {scoreLabel}
        </span>
      ) : null}
    </div>
  );

  return { displayLabel, pillClassName, badges };
}

/** Card with the name pill straddling its top edge — the tag-card layout. */
function PillCappedCard({
  displayLabel,
  pillClassName,
  badges,
  children,
}: {
  displayLabel: string;
  pillClassName: string;
  badges: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative w-48 min-w-44">
      <div className={cn('absolute left-1/2 top-0 z-10 max-w-full -translate-x-1/2 -translate-y-1/2', pillClassName)}>
        {badges}
        <span className="block truncate" title={displayLabel}>
          {displayLabel}
        </span>
      </div>
      <div className="border-grey-border bg-grey-white rounded-lg border px-sm pt-lg pb-sm shadow-sm">{children}</div>
    </div>
  );
}

export function PersonNode({ id, data }: NodeProps<PersonRfNode>) {
  const { showTags, selectionMode, toggleCheckedPerson, isPersonChecked, toggleClusterExpanded } = useCustomerGraph();
  const { orgObjectTags } = useOrganizationObjectTags();
  const { displayLabel, pillClassName, badges } = usePersonPresentation(data);

  const personRef = { objectType: data.objectType, objectId: data.objectId };
  const isChecked = isPersonChecked(personRef);

  const annotationsQuery = useGetAnnotationsQuery(data.objectType, data.objectId, false, showTags);

  const tagIds = annotationsQuery.data?.annotations.tags.map((annotation) => annotation.payload.tag_id) ?? [];
  const tags = tagIds
    .map((tagId) => orgObjectTags.find((tag) => tag.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => tag != null);
  const hasTags = showTags && tags.length > 0;

  const tagItems = tags.map((tag) => (
    <Tag key={tag.id} size="small" color="purple">
      <div className="size-3 shrink-0 rounded-full me-xs" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </Tag>
  ));

  const nameContent = hasTags ? (
    <PillCappedCard displayLabel={displayLabel} pillClassName={pillClassName} badges={badges}>
      <div className="nodrag nopan">
        <ExpandableGroupTagLine
          items={tagItems}
          classname="gap-xs"
          overflowBehavior="popover"
          moreButton={(overflow, onExpand) => (
            <Tag
              color="purple"
              size="small"
              className="nodrag nopan cursor-pointer shrink-0 transition-colors hover:bg-purple-primary/20"
              onClick={onExpand}
            >
              +{overflow}
            </Tag>
          )}
        />
      </div>
    </PillCappedCard>
  ) : (
    <div className={cn('relative', pillClassName)}>
      {badges}
      <span className="block max-w-48 truncate" title={displayLabel}>
        {displayLabel}
      </span>
    </div>
  );

  return (
    <div className="relative flex w-fit cursor-pointer flex-col items-center pt-md">
      <FourHandles />
      <div className="flex items-center gap-sm">
        {selectionMode ? (
          <div
            className="nodrag nopan shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              size="small"
              checked={isChecked}
              onCheckedChange={() => toggleCheckedPerson(personRef)}
              aria-label={`Select ${displayLabel}`}
            />
          </div>
        ) : null}
        {nameContent}
        {data.isExpandedClusterRoot ? (
          <NodeActionButton
            icon="unfold_less"
            label={`Regroup branch ${displayLabel}`}
            onPress={() => toggleClusterExpanded(id)}
          />
        ) : null}
      </div>
    </div>
  );
}

export function ClusterNode({ data }: NodeProps<ClusterRfNode>) {
  const { selectionMode, toggleCheckedPerson, isPersonChecked, toggleClusterExpanded } = useCustomerGraph();
  const { displayLabel, pillClassName, badges } = usePersonPresentation(data.root);

  const rootRef = { objectType: data.root.objectType, objectId: data.root.objectId };
  const isChecked = isPersonChecked(rootRef);

  return (
    <div className="relative flex w-fit cursor-pointer flex-col items-center pt-md">
      <FourHandles />
      <div className="flex items-center gap-sm">
        {selectionMode ? (
          <div
            className="nodrag nopan shrink-0"
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              size="small"
              checked={isChecked}
              onCheckedChange={() => toggleCheckedPerson(rootRef)}
              aria-label={`Select ${displayLabel}`}
            />
          </div>
        ) : null}
        <PillCappedCard displayLabel={displayLabel} pillClassName={pillClassName} badges={badges}>
          <div className="text-grey-primary flex items-center justify-between gap-sm text-xs">
            <div className="min-w-0 truncate">
              <span className="font-medium">{data.nodeCount} nodes</span>
              <span className="opacity-70"> · {data.internalEdgeCount} edges</span>
            </div>
            <NodeActionButton
              icon="unfold_more"
              label={`Expand ${data.nodeCount} nodes`}
              onPress={() => toggleClusterExpanded(data.rootId)}
            />
          </div>
        </PillCappedCard>
      </div>
    </div>
  );
}

export function PivotNode({ data }: NodeProps<PivotRfNode>) {
  return (
    <div className="border-orange-border bg-orange-background-light text-orange-primary relative flex w-fit max-w-52 items-center gap-xs rounded-full border px-sm py-xs text-xs shadow-sm">
      <FourHandles />
      <Icon icon="tip" className="size-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs leading-none opacity-70">{data.rawType}</div>
        <div className="truncate font-medium">{data.label}</div>
      </div>
    </div>
  );
}

function GraphEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  label,
  data,
  strokeClassName,
  labelClassName,
}: EdgeProps<GraphRfEdge> & {
  strokeClassName: string;
  labelClassName: string;
}) {
  const { showEdgeLabels } = useCustomerGraph();
  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Merged edges stand in for N collapsed member edges: a wider dash than the
  // match edge's `2 3`, and the member count always shown since it is
  // structural rather than a label.
  const mergedCount = data?.mergedCount;
  const isMerged = mergedCount != null;
  const edgeStyle = isMerged ? { ...style, strokeDasharray: '8 4' } : style;
  const labelContent = isMerged ? mergedCount : showEdgeLabels ? label : null;

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={edgeStyle} className={strokeClassName} />
      {labelContent ? (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'nodrag nopan absolute origin-center rounded-sm p-xs max-w-16 leading-none',
              isMerged && 'font-semibold',
              labelClassName,
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: isMerged ? '9px' : '6px',
            }}
          >
            {labelContent}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

/** Cluster chips use `__cluster__:${rootId}`; selection stores the root person key. */
function endpointPersonKey(endpointId: string): string {
  const prefix = '__cluster__:';
  return endpointId.startsWith(prefix) ? endpointId.slice(prefix.length) : endpointId;
}

export function LinkEdge(props: EdgeProps<GraphRfEdge>) {
  const { selectionMode, checkedPersons, hoveredPersonId } = useCustomerGraph();

  const highlightEdge = (() => {
    if (selectionMode) {
      return checkedPersons.has(endpointPersonKey(props.source)) && checkedPersons.has(endpointPersonKey(props.target));
    }
    if (hoveredPersonId != null) {
      return props.source === hoveredPersonId || props.target === hoveredPersonId;
    }
    return true;
  })();

  return (
    <GraphEdge
      {...props}
      strokeClassName={cn(
        'transition-colors duration-200 stroke-2!',
        highlightEdge ? 'stroke-purple-primary!' : 'stroke-purple-border-light!',
      )}
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}

export function MatchEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      animated
      style={{ ...props.style, strokeDasharray: '2 3' }}
      strokeClassName={'stroke-orange-primary! stroke-[1.5]!'}
      labelClassName="bg-orange-background-light text-orange-primary border border-orange-border"
    />
  );
}

export const graphNodeTypes = {
  person: PersonNode,
  pivot: PivotNode,
  cluster: ClusterNode,
};

export const graphEdgeTypes = {
  link: LinkEdge,
  match: MatchEdge,
};
