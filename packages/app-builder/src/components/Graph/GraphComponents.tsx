import { type FtmEntityPersonOption, type FtmEntityV2 } from '@app-builder/models/data-model';
import { SCORING_LEVELS_COLORS } from '@app-builder/models/scoring';
import { useDataModel } from '@app-builder/services/data/data-model';
import { formatNumber } from '@app-builder/utils/format';
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  type NodeProps,
  Position,
} from '@xyflow/react';
import { type ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { match } from 'ts-pattern';
import { Button, Checkbox, cn, Tag, Tooltip, useFormatLanguage } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useGraphAnnotations } from './contexts/GraphAnnotationsContext';
import { useSelectedObject } from './contexts/GraphFocusContext';
import {
  useGraphInteractionActions,
  useIsEdgeHighlighted,
  useIsEdgeHovered,
  useIsNodeChecked,
  useIsNodeHighlighted,
  useIsNodeHovered,
  useSelectionMode,
} from './contexts/GraphInteractionContext';
import { useGraphStructureActions } from './contexts/GraphStructureContext';
import { useGraphViewSettings } from './contexts/GraphViewSettingsContext';
import { graphI18n } from './lib/graph-i18n';
import { rootNodeId } from './lib/graph-keys';
import {
  type ClusterRfNode,
  type GraphRfEdge,
  type HypernodeRfNode,
  type PersonRfData,
  type PersonRfNode,
  type PivotRfNode,
} from './lib/graph-rf-types';
import { ObjectTagLine, useTagsByIds } from './ObjectTags';

const MAX_TABLE_IN_EDGE_RELATION = 3;

/** `showTags`, forced on while bulk-tagging so the canvas shows what changed. */
function useNodeTagsVisible(): boolean {
  const { showTags } = useGraphViewSettings();
  const selectionMode = useSelectionMode();

  return showTags || selectionMode;
}

/**
 * Collapsing a branch takes nodes off the canvas, the hovered one possibly
 * among them, so the hover goes with it.
 */
function useCollapseCluster(): (rootId: string) => void {
  const { toggleClusterExpanded } = useGraphStructureActions();
  const { hoverNode } = useGraphInteractionActions();

  return useCallback(
    (rootId: string) => {
      hoverNode(null);
      toggleClusterExpanded(rootId);
    },
    [hoverNode, toggleClusterExpanded],
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
  const stop = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
  };
  return (
    <div className="nodrag nopan shrink-0" onClick={stop} onMouseDown={stop} onPointerDown={stop}>
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

export function subEntityIcon({
  semanticType,
  subEntity,
}: {
  semanticType?: FtmEntityV2 | null;
  subEntity?: FtmEntityPersonOption | null;
}): IconName {
  return match({ semanticType, subEntity })
    .with({ semanticType: 'account' }, () => 'lists' as const)
    .with({ semanticType: 'transaction' }, () => 'swap' as const)
    .with({ semanticType: 'event' }, () => 'lightbulb' as const)
    .with({ semanticType: 'other' }, () => 'draft' as const)
    .with({ subEntity: 'moral' }, () => 'building' as const)
    .with({ subEntity: 'generic' }, () => 'users' as const)
    .otherwise(() => 'person' as const);
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
  const { showRiskScore, maxRiskLevel } = useGraphViewSettings();
  const selectedObject = useSelectedObject();

  const isSelected = selectedObject?.objectType === data.objectType && selectedObject?.objectId === data.objectId;
  const isHighlighted = data.isStart || isSelected;

  // Org-level palette only — risk level itself comes from graph node metadata.
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
            icon={subEntityIcon(data)}
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
      <span className={cn('block truncate', !capped && 'max-w-48')} title={data.label}>
        {data.label}
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
  const selectionMode = useSelectionMode();
  const { toggleCheckedNode } = useGraphInteractionActions();
  const { t } = useTranslation(graphI18n);
  const highlighted = useIsNodeHighlighted(nodeId);
  const checkableId = rootNodeId(nodeId);
  const checked = useIsNodeChecked(checkableId);

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
              checked={checked}
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
  const { nodeTagIdOverrides, addedNodeTagIds } = useGraphAnnotations();
  const nodeTagsVisible = useNodeTagsVisible();
  const collapseCluster = useCollapseCluster();
  const { t } = useTranslation(graphI18n);
  // Payload metadata is static; session edits from the settings panel replace it
  // as a whole, then bulk-tag additions merge on top of whichever list won.
  const overrideTagIds = nodeTagIdOverrides.get(id);
  const addedTagIds = addedNodeTagIds.get(id);
  const baseTagIds = overrideTagIds ?? data.tagIds ?? [];
  const tagIds = addedTagIds?.length ? [...new Set([...baseTagIds, ...addedTagIds])] : baseTagIds;
  const tags = useTagsByIds(tagIds, nodeTagsVisible);
  const isHovered = useIsNodeHovered(id);

  return (
    <NodeShell
      nodeId={id}
      label={data.label}
      action={
        data.isExpandedClusterRoot
          ? {
              icon: 'unfold_less',
              label: t('graph:node.regroup_branch', { title: data.label }),
              onPress: () => collapseCluster(id),
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
  const collapseCluster = useCollapseCluster();
  const { t } = useTranslation(graphI18n);
  const isHovered = useIsNodeHovered(id);

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
            onPress={() => collapseCluster(rootNodeId(id))}
          />
        </div>
      </PersonCard>
    </NodeShell>
  );
}

function PivotNode({ id, data }: NodeProps<PivotRfNode>) {
  const highlighted = useIsNodeHighlighted(id);
  const isHovered = useIsNodeHovered(id);

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
        <div className="text-xs leading-none opacity-70">{data.label}</div>
        <div className="truncate font-medium">{data.value}</div>
      </div>
    </div>
  );
}

function HypernodeNode({ id, data }: NodeProps<HypernodeRfNode>) {
  const { t } = useTranslation(graphI18n);
  const highlighted = useIsNodeHighlighted(id);
  const isHovered = useIsNodeHovered(id);
  const locale = useFormatLanguage();

  return (
    <div
      className={cn(
        'border-grey-border bg-surface-page text-grey-placeholder relative flex w-fit max-w-96 items-center gap-xs rounded-md border p-sm text-xs shadow-sm cursor-pointer transition-opacity duration-200',
        isHovered && 'ring-2 ring-orange-primary ring-offset-2',
        !highlighted && 'opacity-60',
      )}
    >
      <FourHandles />
      <div className="min-w-0 flex gap-sm items-center">
        <div>
          <p className="text-xs leading-none">{data.label ?? data.objectType}</p>
          <p className="truncate font-medium">{data.objectId}</p>
        </div>
        <Tooltip.Default content={t('graph:node.too_many', { count: data.count })}>
          <div className="text-xs h-10 min-w-10 rounded-full grid place-items-center border border-grey-border p-xs leading-none">
            {formatNumber(data.count, { language: locale, notation: 'compact' })}
          </div>
        </Tooltip.Default>
      </div>
    </div>
  );
}

type EdgeAppearance = {
  dash: string | undefined;
  stroke: string;
  active: string;
  dimmed: string;
  label: string;
};

const EDGE_APPEARANCE: Record<NonNullable<GraphRfEdge['type']>, EdgeAppearance> = {
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
    active: 'stroke-grey-disabled!',
    dimmed: 'stroke-grey-disabled/50!',
    label: 'bg-surface-page text-grey-primary border border-grey-border',
  },
};

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
  data,
}: EdgeProps<GraphRfEdge>) {
  const { showEdgeLabels } = useGraphViewSettings();
  const { hoverEdge } = useGraphInteractionActions();
  const isHovered = useIsEdgeHovered(id);
  const highlighted = useIsEdgeHighlighted(id, source, target);
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
  const [menuOpen, setMenuOpen] = useState(false);
  // Mirrors the threshold in `EdgeLabel`, which only renders a menu past it.
  const isMultiTableMenu = !isMerged && (data?.through?.length ?? 0) > MAX_TABLE_IN_EDGE_RELATION;
  const showLabel =
    (isMerged || showEdgeLabels || isHovered || menuOpen) && (mergedCount || data?.through?.length || data?.field);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ ...style, strokeDasharray: isMerged ? '8 4' : appearance.dash }}
        className={cn(
          'transition-colors duration-200',
          highlighted ? appearance.active : appearance.dimmed,
          showLabel ? 'stroke-4!' : appearance.stroke,
        )}
      />
      {showLabel ? (
        <EdgeLabelRenderer>
          <div
            data-graph-edge-label=""
            className={cn(
              'nodrag nopan pointer-events-auto absolute origin-center w-min leading-none',
              !isMultiTableMenu && 'rounded-sm p-xs',
              isMerged && 'rounded-sm p-xs font-semibold',
              isMerged && appearance.label,
            )}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: isMerged ? '9px' : '6px',
            }}
            onMouseEnter={() => hoverEdge(id)}
            onMouseLeave={() => {
              hoverEdge(null);
            }}
          >
            {isMerged ? mergedCount : null}
            <EdgeLabel
              through={data?.through}
              field={data?.field}
              appearance={appearance}
              menuOpen={menuOpen}
              onMenuOpenChange={setMenuOpen}
            />
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

/**
 * These read hover and selection state, so a `ReactFlow` rendering them must sit
 * under both a `CustomerGraphProvider` (which supplies the interaction store)
 * and a `GraphIndexProvider` holding the index for the graph on screen.
 */
export const graphNodeTypes = {
  person: PersonNode,
  pivot: PivotNode,
  hypernode: HypernodeNode,
  cluster: ClusterNode,
};

/** Same provider requirements as {@link graphNodeTypes}. */
export const graphEdgeTypes = {
  link: GraphEdge,
  match: GraphEdge,
  hypernode: GraphEdge,
};

export function EdgeLabel({
  through,
  field,
  appearance,
  menuOpen,
  onMenuOpenChange,
}: {
  through?: string[];
  field?: string;
  appearance: EdgeAppearance;
  menuOpen?: boolean;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const { t } = useTranslation(graphI18n);

  if (!through || through.length === 0) return <FieldTag field={field} small />;

  if (through.length <= MAX_TABLE_IN_EDGE_RELATION) return <EdgeTags through={through} field={field} />;

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          'nodrag nopan cursor-pointer shrink-0 flex items-center gap-xs rounded-sm p-xs leading-none',
          appearance.label,
        )}
        onClick={() => onMenuOpenChange?.(!menuOpen)}
      >
        <span className="break-keep whitespace-nowrap">{t('graph:edge.tables', { count: through.length })}</span>
        <Icon icon="arrow-right" className="size-4" />
      </button>
      {menuOpen ? (
        <div
          className={cn(
            'nodrag nopan absolute left-full top-1/2 z-10 ml-xs -translate-y-1/2 shrink-0 p-xs leading-none flex',
          )}
        >
          <EdgeTags through={through} field={field} />
        </div>
      ) : null}
    </div>
  );
}

function EdgeTags({ through, field }: { through: string[]; field?: string }) {
  const dataModel = useDataModel();
  const tableLabel = (tableName: string) => dataModel.find((table) => table.name === tableName)?.alias || tableName;

  return (
    <div className="flex items-center">
      {through.map((item, index) => (
        <div className="flex items-center" key={`${item}-${index}`}>
          <Tag color="purple" size="small" className="whitespace-nowrap bg-surface-card">
            {tableLabel(item)}
            {index === through.length - 1 && <FieldTag field={field} />}
          </Tag>
          {index < through.length - 1 && <Icon icon="arrow-forward" className="size-4 text-purple-primary" />}
        </div>
      ))}
    </div>
  );
}

function FieldTag({ field, small = false }: { field?: string; small?: boolean }) {
  return field ? (
    <div className="flex items-center">
      <Tag color="orange" size={small ? 'small' : 'xs'} className="whitespace-nowrap bg-surface-card">
        {field}
      </Tag>
    </div>
  ) : null;
}
