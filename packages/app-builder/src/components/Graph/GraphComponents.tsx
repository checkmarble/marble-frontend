import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { SCORING_LEVELS_COLORS } from '@app-builder/models/scoring';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  type NodeProps,
  Position,
  useEdges,
} from '@xyflow/react';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, cn } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import { graphI18n } from './graph-i18n';
import { rootNodeId } from './graph-keys';
import {
  type ClusterRfNode,
  type GraphRfEdge,
  type HypernodeRfNode,
  type PersonRfData,
  type PersonRfNode,
  type PivotRfNode,
} from './graph-rf-types';
import { ObjectTagLine, useTagsByIds } from './ObjectTags';
import { resolveTitle } from './resolve-object-title';

/**
 * A node stays fully opaque when nothing is hovered, when it is the hovered
 * node, or when it shares an edge with the hovered node. Everything else dims.
 */
function useNodeHighlighted(nodeId: string): boolean {
  const { selectionMode, hoveredNodeId } = useCustomerGraph();
  const edges = useEdges();

  if (selectionMode || hoveredNodeId == null) return true;
  if (nodeId === hoveredNodeId) return true;
  return edges.some(
    (edge) =>
      (edge.source === hoveredNodeId && edge.target === nodeId) ||
      (edge.target === hoveredNodeId && edge.source === nodeId),
  );
}

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
function PersonPill({
  data,
  capped = false,
  isHovered = false,
}: {
  data: PersonRfData;
  capped?: boolean;
  isHovered?: boolean;
}) {
  const { showRiskScore, selectedObject } = useCustomerGraph();
  const title = usePersonTitle(data);

  const isSelected = selectedObject?.objectType === data.objectType && selectedObject?.objectId === data.objectId;
  const isHighlighted = data.isStart || isSelected;

  // Org-level palette only — risk level itself comes from graph node metadata.
  const settingsQuery = useScoringSettingsQuery(showRiskScore);
  const maxRiskLevel = settingsQuery.data?.settings?.maxRiskLevel as 3 | 4 | 5 | 6 | undefined;
  const riskLevel = data.riskLevel;
  const scoreColor =
    riskLevel != null && maxRiskLevel ? (SCORING_LEVELS_COLORS[maxRiskLevel][riskLevel] ?? undefined) : undefined;

  return (
    <div
      className={cn(
        'rounded-full border bg-purple-border border-purple-disabled px-md py-sm text-sm font-medium text-purple-primary shadow-sm transition-shadow duration-200 isolate',
        isHighlighted && 'bg-purple-primary border-white text-white',
        (isHovered || isSelected) && 'ring-2 ring-purple-primary ring-offset-2',
        capped ? 'absolute left-1/2 top-0 z-10 max-w-full -translate-x-1/2 -translate-y-1/2' : 'relative',
      )}
    >
      <div className="absolute left-1/2 -top-1 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center">
        <div
          className={cn(
            'relative rounded-full shrink-0 border bg-purple-border border-purple-disabled p-xs',
            isHighlighted && 'bg-purple-primary border-white',
          )}
        >
          <Icon
            icon={subEntityIcon(data.subEntity)}
            className={cn('size-4 text-purple-primary', isHighlighted && 'text-white')}
          />
          {isHovered && <div className="absolute inset-0 rounded-full bg-purple-primary animate-ping" />}
        </div>
        {showRiskScore && riskLevel != null && scoreColor ? (
          <span
            className="rounded-full border p-px text-xs font-normal h-7 min-w-7 grid place-items-center text-white border-white -ml-1 z-10"
            style={{ backgroundColor: scoreColor }}
          >
            {riskLevel}
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
function PersonCard({
  data,
  children,
  isHovered = false,
}: {
  data: PersonRfData;
  children: ReactNode;
  isHovered?: boolean;
}) {
  return (
    <div className="relative w-48 min-w-44">
      <PersonPill data={data} capped />
      <div
        className={cn(
          'border-grey-border bg-surface-card rounded-lg border px-sm pt-lg pb-sm shadow-sm',
          isHovered && 'ring-2 ring-purple-primary ring-offset-2 animate-pulse',
        )}
      >
        {children}
      </div>
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
  const { t } = useTranslation(graphI18n);
  const highlighted = useNodeHighlighted(nodeId);
  const checkableId = rootNodeId(nodeId);

  return (
    <div
      className={cn(
        'relative flex w-fit cursor-pointer flex-col items-center pt-md transition-opacity duration-200',
        !highlighted && 'opacity-60',
      )}
    >
      <FourHandles />
      <div className="flex items-center gap-sm">
        {selectionMode ? (
          <NoCanvasEvents>
            <Checkbox
              size="small"
              checked={isNodeChecked(checkableId)}
              onCheckedChange={() => toggleCheckedNode(checkableId)}
              aria-label={t('graph:node.select', { label })}
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
  const { nodeTagsVisible, nodeTagIdOverrides, addedNodeTagIds, toggleClusterExpanded, selectionMode, hoveredNodeId } =
    useCustomerGraph();
  const { t } = useTranslation(graphI18n);
  // Payload metadata is static; session edits from the settings panel replace it
  // as a whole, then bulk-tag additions merge on top of whichever list won.
  const overrideTagIds = nodeTagIdOverrides.get(id);
  const addedTagIds = addedNodeTagIds.get(id);
  const baseTagIds = overrideTagIds ?? data.tagIds ?? [];
  const tagIds = addedTagIds?.length ? [...new Set([...baseTagIds, ...addedTagIds])] : baseTagIds;
  const tags = useTagsByIds(tagIds, nodeTagsVisible);
  const isHovered = !selectionMode && hoveredNodeId === id;

  return (
    <NodeShell
      nodeId={id}
      label={data.label}
      action={
        data.isExpandedClusterRoot
          ? {
              icon: 'unfold_less',
              label: t('graph:node.regroup_branch', { title: data.label }),
              onPress: () => toggleClusterExpanded(id),
            }
          : undefined
      }
    >
      {tags.length > 0 ? (
        <PersonCard data={data} isHovered={isHovered}>
          <ObjectTagLine tags={tags} className="nodrag nopan" />
        </PersonCard>
      ) : (
        <PersonPill data={data} isHovered={isHovered} />
      )}
    </NodeShell>
  );
}

function ClusterNode({ id, data }: NodeProps<ClusterRfNode>) {
  const { toggleClusterExpanded, selectionMode, hoveredNodeId } = useCustomerGraph();
  const { t } = useTranslation(graphI18n);
  const isHovered = !selectionMode && hoveredNodeId === id;

  return (
    <NodeShell nodeId={id} label={data.root.label}>
      <PersonCard data={data.root} isHovered={isHovered}>
        <div className="text-grey-primary flex items-center justify-between gap-sm text-xs">
          <div className="min-w-0 truncate">
            <span className="font-medium">{t('graph:count.nodes', { count: data.nodeCount })}</span>
            <span className="opacity-70"> · {t('graph:count.edges', { count: data.internalEdgeCount })}</span>
          </div>
          <NodeActionButton
            icon="unfold_more"
            label={t('graph:node.expand', { count: data.nodeCount })}
            onPress={() => toggleClusterExpanded(rootNodeId(id))}
          />
        </div>
      </PersonCard>
    </NodeShell>
  );
}

function PivotNode({ id, data }: NodeProps<PivotRfNode>) {
  const { selectionMode, hoveredNodeId } = useCustomerGraph();
  const highlighted = useNodeHighlighted(id);
  const isHovered = !selectionMode && hoveredNodeId === id;

  return (
    <div
      className={cn(
        'border-orange-border bg-orange-background-light dark:bg-orange-primary text-orange-primary dark:text-orange-background-light relative flex w-fit max-w-52 items-center gap-xs rounded-full border px-sm py-xs text-xs shadow-sm cursor-pointer transition-opacity duration-200',
        isHovered && 'ring-2 ring-orange-primary ring-offset-2',
        !highlighted && 'opacity-60',
      )}
    >
      <FourHandles />
      <Icon icon="tip" className="size-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs leading-none opacity-70">{data.rawType}</div>
        <div className="truncate font-medium">{data.label}</div>
      </div>
    </div>
  );
}

function HypernodeNode({ id, data }: NodeProps<HypernodeRfNode>) {
  const { selectionMode, hoveredNodeId } = useCustomerGraph();
  const { t } = useTranslation(graphI18n);
  const highlighted = useNodeHighlighted(id);
  const isHovered = !selectionMode && hoveredNodeId === id;

  return (
    <div
      className={cn(
        'border-grey-border bg-surface-card text-grey-primary relative flex w-fit max-w-96 items-center gap-xs rounded-full border px-sm py-xs text-xs shadow-sm cursor-pointer transition-opacity duration-200',
        isHovered && 'ring-2 ring-orange-primary ring-offset-2',
        !highlighted && 'opacity-60',
      )}
    >
      <FourHandles />
      <Icon icon="tip" className="size-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="text-xs leading-none opacity-70">{data.label ?? data.objectType}</div>
        <div className="truncate font-medium">{data.objectId}</div>
        <p className={cn('text-2xs flex gap-xs mr-2 mt-1')}>
          <span>
            {t('graph:node.too_many')} (≈ {data.count})
          </span>
        </p>
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
  hypernode: {
    dash: '3 2',
    stroke: 'stroke-2!',
    active: 'stroke-grey-primary!',
    dimmed: 'stroke-grey-border-light!',
    label: 'bg-surface-background text-grey-primary border border-grey-border',
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
  const { showEdgeLabels, hoveredEdgeId } = useCustomerGraph();
  const highlighted = useEdgeHighlighted(source, target);
  const appearance = EDGE_APPEARANCE[type ?? 'link'];

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
  const labelContent = isMerged ? mergedCount : showEdgeLabels || hoveredEdgeId === id ? label : null;

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
              'nodrag nopan absolute origin-center rounded-sm p-xs w-min leading-none',
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
  hypernode: HypernodeNode,
  cluster: ClusterNode,
};

export const graphEdgeTypes = {
  link: GraphEdge,
  match: GraphEdge,
  hypernode: GraphEdge,
};
