import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { SCORING_LEVELS_COLORS } from '@app-builder/models/scoring';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
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
import { Button, Checkbox, cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import { rootNodeId } from './graph-keys';
import {
  type ClusterRfNode,
  type GraphRfEdge,
  type PersonRfData,
  type PersonRfNode,
  type PivotRfNode,
} from './graph-rf-types';
import { ObjectTagLine, useObjectTags } from './ObjectTags';
import { resolveTitle } from './resolve-object-title';

function FourHandles() {
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
function NoCanvasEvents({ children }: { children: ReactNode }) {
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
      {children}
    </div>
  );
}

type NodeAction = { icon: IconName; label: string; onPress: () => void };

function NodeActionButton({ icon, label, onPress }: NodeAction) {
  return (
    <NoCanvasEvents>
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
    </NoCanvasEvents>
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

/** Resolved object title, falling back to the raw id while the details load. */
function usePersonTitle(data: PersonRfData): string {
  const detailsQuery = useObjectDetailsQuery(data.objectType, data.objectId);
  return detailsQuery.data?.data != null ? resolveTitle(detailsQuery.data.data, data.objectId) : data.label;
}

/**
 * Name pill with its sub-entity + risk badges. `capped` straddles it over the top
 * edge of a {@link PersonCard} instead of standing on its own.
 */
function PersonPill({ data, capped = false }: { data: PersonRfData; capped?: boolean }) {
  const { showRiskScore, selectedObject } = useCustomerGraph();
  const title = usePersonTitle(data);

  const isSelected = selectedObject?.objectType === data.objectType && selectedObject?.objectId === data.objectId;
  const isHighlighted = data.isStart || isSelected;

  const scoreQuery = useScoreLatestQuery(data.objectType, data.objectId, showRiskScore);
  const settingsQuery = useScoringSettingsQuery(showRiskScore);

  const score = scoreQuery.data?.score;
  const maxRiskLevel = settingsQuery.data?.settings?.maxRiskLevel as 3 | 4 | 5 | 6 | undefined;
  const scoreColor =
    score && maxRiskLevel ? (SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? undefined) : undefined;

  return (
    <div
      className={cn(
        'rounded-full border bg-purple-border border-purple-disabled px-md py-sm text-sm font-medium text-purple-primary shadow-sm',
        isHighlighted && 'bg-purple-primary border-white text-white',
        capped ? 'absolute left-1/2 top-0 z-10 max-w-full -translate-x-1/2 -translate-y-1/2' : 'relative',
      )}
    >
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
        {showRiskScore && score && scoreColor ? (
          <span
            className="rounded-full border p-px text-xs font-normal h-7 min-w-7 grid place-items-center text-white border-white -ml-1"
            style={{ backgroundColor: scoreColor }}
          >
            {score.risk_level}
          </span>
        ) : null}
      </div>
      <span className={cn('block truncate', !capped && 'max-w-48')} title={title}>
        {title}
      </span>
    </div>
  );
}

/** Card with the name pill straddling its top edge — the tag-card layout. */
function PersonCard({ data, children }: { data: PersonRfData; children: ReactNode }) {
  return (
    <div className="relative w-48 min-w-44">
      <PersonPill data={data} capped />
      <div className="border-grey-border bg-grey-white rounded-lg border px-sm pt-lg pb-sm shadow-sm">{children}</div>
    </div>
  );
}

/**
 * Shared node chrome: connection handles, the bulk-selection checkbox and an
 * optional trailing action. Cluster chips check their branch root, so the
 * checkbox always targets `rootNodeId(nodeId)`.
 */
function NodeShell({
  nodeId,
  label,
  action,
  children,
}: {
  nodeId: string;
  label: string;
  action?: NodeAction;
  children: ReactNode;
}) {
  const { selectionMode, toggleCheckedNode, isNodeChecked } = useCustomerGraph();
  const checkableId = rootNodeId(nodeId);

  return (
    <div className="relative flex w-fit cursor-pointer flex-col items-center pt-md">
      <FourHandles />
      <div className="flex items-center gap-sm">
        {selectionMode ? (
          <NoCanvasEvents>
            <Checkbox
              size="small"
              checked={isNodeChecked(checkableId)}
              onCheckedChange={() => toggleCheckedNode(checkableId)}
              aria-label={`Select ${label}`}
            />
          </NoCanvasEvents>
        ) : null}
        {children}
        {action ? <NodeActionButton {...action} /> : null}
      </div>
    </div>
  );
}

function PersonNode({ id, data }: NodeProps<PersonRfNode>) {
  const { nodeTagsVisible, toggleClusterExpanded } = useCustomerGraph();
  const title = usePersonTitle(data);
  const { tags } = useObjectTags(data.objectType, data.objectId, nodeTagsVisible);

  return (
    <NodeShell
      nodeId={id}
      label={title}
      action={
        data.isExpandedClusterRoot
          ? { icon: 'unfold_less', label: `Regroup branch ${title}`, onPress: () => toggleClusterExpanded(id) }
          : undefined
      }
    >
      {tags.length > 0 ? (
        <PersonCard data={data}>
          <ObjectTagLine tags={tags} className="nodrag nopan" />
        </PersonCard>
      ) : (
        <PersonPill data={data} />
      )}
    </NodeShell>
  );
}

function ClusterNode({ id, data }: NodeProps<ClusterRfNode>) {
  const { toggleClusterExpanded } = useCustomerGraph();
  const title = usePersonTitle(data.root);

  return (
    <NodeShell nodeId={id} label={title}>
      <PersonCard data={data.root}>
        <div className="text-grey-primary flex items-center justify-between gap-sm text-xs">
          <div className="min-w-0 truncate">
            <span className="font-medium">{data.nodeCount} nodes</span>
            <span className="opacity-70"> · {data.internalEdgeCount} edges</span>
          </div>
          <NodeActionButton
            icon="unfold_more"
            label={`Expand ${data.nodeCount} nodes`}
            onPress={() => toggleClusterExpanded(rootNodeId(id))}
          />
        </div>
      </PersonCard>
    </NodeShell>
  );
}

function PivotNode({ data }: NodeProps<PivotRfNode>) {
  return (
    <div className="border-orange-border bg-orange-background-light text-orange-primary relative flex w-fit max-w-52 items-center gap-xs rounded-full border px-sm py-xs text-xs shadow-sm cursor-pointer">
      <FourHandles />
      <Icon icon="tip" className="size-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs leading-none opacity-70">{data.rawType}</div>
        <div className="truncate font-medium">{data.label}</div>
      </div>
    </div>
  );
}

const EDGE_APPEARANCE = {
  link: {
    dash: undefined,
    stroke: 'stroke-2!',
    active: 'stroke-purple-primary!',
    dimmed: 'stroke-purple-border-light!',
    label: 'bg-purple-background-light text-purple-primary border border-purple-border',
  },
  match: {
    dash: '2 3',
    stroke: 'stroke-[1.5]!',
    active: 'stroke-orange-primary!',
    dimmed: 'stroke-orange-background-light!',
    label: 'bg-orange-background-light text-orange-primary border border-orange-border',
  },
} as const;

/**
 * An edge is dimmed unless it touches the hovered node, or — in selection mode —
 * joins two checked nodes. Nothing is dimmed when neither is active.
 */
function useEdgeHighlighted(source: string, target: string): boolean {
  const { selectionMode, checkedNodeIds, hoveredNodeId } = useCustomerGraph();

  if (selectionMode) {
    return checkedNodeIds.has(rootNodeId(source)) && checkedNodeIds.has(rootNodeId(target));
  }
  if (hoveredNodeId != null) {
    return source === hoveredNodeId || target === hoveredNodeId;
  }
  return true;
}

function GraphEdge({
  id,
  type,
  source,
  target,
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
}: EdgeProps<GraphRfEdge>) {
  const { showEdgeLabels } = useCustomerGraph();
  const highlighted = useEdgeHighlighted(source, target);
  const appearance = EDGE_APPEARANCE[type === 'match' ? 'match' : 'link'];

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
  const labelContent = isMerged ? mergedCount : showEdgeLabels ? label : null;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, strokeDasharray: isMerged ? '8 4' : appearance.dash }}
        className={cn(
          'transition-colors duration-200',
          appearance.stroke,
          highlighted ? appearance.active : appearance.dimmed,
        )}
      />
      {labelContent ? (
        <EdgeLabelRenderer>
          <div
            className={cn(
              'nodrag nopan absolute origin-center rounded-sm p-xs max-w-16 leading-none',
              isMerged && 'font-semibold',
              appearance.label,
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

export const graphNodeTypes = {
  person: PersonNode,
  pivot: PivotNode,
  cluster: ClusterNode,
};

export const graphEdgeTypes = {
  link: GraphEdge,
  match: GraphEdge,
};
