import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
import { SCORING_LEVELS_COLORS } from '@app-builder/models/scoring';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useObjectDetailsQuery } from '@app-builder/queries/data/get-object-details';
import { useScoreLatestQuery } from '@app-builder/queries/scoring/get-score-latest';
import { useScoringSettingsQuery } from '@app-builder/queries/scoring/get-scoring-settings';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import {
  BaseEdge,
  type Edge,
  EdgeLabelRenderer,
  type EdgeProps,
  getBezierPath,
  Handle,
  type Node,
  type NodeProps,
  Position,
} from '@xyflow/react';
import { cn, ExpandableGroupTagLine, Tag } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import { type NonPersonSemantic } from './data-model-map';
import { resolveTitle } from './resolve-object-title';

export type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
  objectType: string;
  objectId: string;
};

export type GroupRfData = {
  semanticType: NonPersonSemantic;
  label: string;
  memberCount: number;
};

export type EntityRfData = {
  label: string;
  /** Table alias or name shown as the type caption */
  typeLabel: string;
  semanticType: NonPersonSemantic;
  rawType: string;
  objectType: string;
  objectId: string;
  groupId?: string;
  canCollapse?: boolean;
};

export type PivotRfData = {
  label: string;
  rawType: string;
};

export type TypeBundleRfData = {
  groupId: string;
  semanticType: NonPersonSemantic;
  label: string;
  count: number;
};

export type PersonRfNode = Node<PersonRfData, 'person'>;
/** Not named `group` — that collides with React Flow's built-in parent-group node styles. */
export type GroupRfNode = Node<GroupRfData, 'typeGroup'>;
export type EntityRfNode = Node<EntityRfData, 'entity'>;
export type PivotRfNode = Node<PivotRfData, 'pivot'>;
export type TypeBundleRfNode = Node<TypeBundleRfData, 'typeBundle'>;
export type GraphRfNode = PersonRfNode | GroupRfNode | EntityRfNode | PivotRfNode | TypeBundleRfNode;

export type GraphRfEdge = Edge<{ kind?: string }, 'link' | 'back' | 'match'>;

type HandleSide = 't' | 'r' | 'b' | 'l';

function nodeCenter(node: GraphRfNode): { x: number; y: number } {
  const w = node.measured?.width ?? 120;
  const h = node.measured?.height ?? 40;
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
      <Handle type="target" position={Position.Top} id="t" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Right} id="r" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Bottom} id="b" className="!bg-transparent !border-0" />
      <Handle type="target" position={Position.Left} id="l" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Top} id="st" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} id="sr" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Bottom} id="sb" className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Left} id="sl" className="!bg-transparent !border-0" />
    </>
  );
}

function subEntityIcon(subEntity: FtmEntityPersonOption): IconName {
  switch (subEntity) {
    case 'moral':
      return 'dns';
    case 'generic':
      return 'users';
    case 'natural':
    default:
      return 'person';
  }
}

function entityIcon(semanticType: NonPersonSemantic): IconName {
  switch (semanticType) {
    case 'account':
      return 'account-circle';
    case 'transaction':
      return 'decision';
    case 'event':
      return 'world';
    default:
      return 'tip';
  }
}

export function PersonNode({ data }: NodeProps<PersonRfNode>) {
  const { showRiskScore, showTags, selectedObject } = useCustomerGraph();
  const { orgObjectTags } = useOrganizationObjectTags();

  const isSelected = selectedObject?.objectType === data.objectType && selectedObject?.objectId === data.objectId;
  const isHighlighted = data.isStart || isSelected;

  const detailsQuery = useObjectDetailsQuery(data.objectType, data.objectId);
  const displayLabel =
    detailsQuery.data?.data != null ? resolveTitle(detailsQuery.data.data, data.objectId) : data.label;

  const scoreQuery = useScoreLatestQuery(data.objectType, data.objectId);
  const settingsQuery = useScoringSettingsQuery();
  const annotationsQuery = useGetAnnotationsQuery(data.objectType, data.objectId);

  const score = scoreQuery.data?.score;
  const settings = settingsQuery.data?.settings;
  const maxRiskLevel = settings?.maxRiskLevel as 3 | 4 | 5 | 6 | undefined;
  const scoreColor =
    score && maxRiskLevel ? (SCORING_LEVELS_COLORS[maxRiskLevel][score.risk_level] ?? undefined) : undefined;
  const scoreLabel =
    score && maxRiskLevel
      ? // ? t(SCORING_LEVELS_LABEL_KEYS[maxRiskLevel][score.risk_level] ?? score.risk_level.toString())
        score.risk_level.toString()
      : undefined;

  const tagIds = annotationsQuery.data?.annotations.tags.map((annotation) => annotation.payload.tag_id) ?? [];
  const tags = tagIds
    .map((tagId) => orgObjectTags.find((tag) => tag.id === tagId))
    .filter((tag): tag is NonNullable<typeof tag> => tag != null);
  const hasTags = showTags && tags.length > 0;

  const namePillClassName = cn(
    'rounded-full border bg-purple-border border-purple-disabled px-md py-sm text-sm font-medium text-purple-primary shadow-sm',
    isHighlighted && 'bg-purple-primary border-white text-white',
  );

  const tagItems = tags.map((tag) => (
    <Tag key={tag.id} size="small" color="purple">
      <div className="size-3 shrink-0 rounded-full me-xs" style={{ backgroundColor: tag.color }} />
      {tag.name}
    </Tag>
  ));

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

  return (
    <div className="relative flex w-fit cursor-pointer flex-col items-center pt-md">
      <FourHandles />
      {hasTags ? (
        <div className="relative w-48 min-w-44">
          <div
            className={cn(
              'absolute left-1/2 top-0 z-10 max-w-full -translate-x-1/2 -translate-y-1/2',
              namePillClassName,
            )}
          >
            {badges}
            <span className="block truncate" title={displayLabel}>
              {displayLabel}
            </span>
          </div>
          <div className="nodrag nopan border-grey-border bg-grey-white rounded-lg border px-sm pt-lg pb-sm shadow-sm">
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
        </div>
      ) : (
        <div className={cn('relative', namePillClassName)}>
          {badges}
          <span className="block max-w-48 truncate" title={displayLabel}>
            {displayLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export function GroupNode({ data }: NodeProps<GroupRfNode>) {
  return (
    <div className="border-purple-border bg-grey-white text-grey-primary relative w-fit rounded-md border px-md py-sm text-sm shadow-sm">
      <FourHandles />
      <span>
        {data.label}
        {data.memberCount > 0 ? ` (${data.memberCount})` : ''}
      </span>
    </div>
  );
}

export function TypeBundleNode({ data }: NodeProps<TypeBundleRfNode>) {
  const { expandGroup } = useCustomerGraph();

  return (
    <div className="border-purple-border bg-purple-background-light text-purple-primary relative flex w-fit max-w-52 items-center gap-xs rounded-md border px-sm py-xs text-xs shadow-sm">
      <FourHandles />
      <Icon icon={entityIcon(data.semanticType)} className="size-3.5 shrink-0" />
      <div className="min-w-0">
        <div className="font-medium">{data.label}</div>
      </div>
      <span className="bg-purple-primary shrink-0 rounded-sm px-1 py-px text-xs leading-tight font-semibold text-white">
        {data.count}
      </span>
      <button
        type="button"
        className="nodrag nopan border-purple-border hover:bg-purple-background flex size-5 shrink-0 items-center justify-center rounded-sm border bg-white"
        title="Expand group"
        aria-label={`Expand ${data.label} group`}
        onClick={(e) => {
          e.stopPropagation();
          expandGroup(data.groupId);
        }}
      >
        <Icon icon="plus" className="size-3" />
      </button>
    </div>
  );
}

export function EntityNode({ data }: NodeProps<EntityRfNode>) {
  const { collapseGroup } = useCustomerGraph();

  return (
    <div className="border-grey-border bg-grey-white text-grey-primary relative flex w-fit max-w-48 items-center gap-xs rounded-md border px-sm py-xs text-xs shadow-sm">
      <FourHandles />
      <Icon icon={entityIcon(data.semanticType)} className="size-3.5 shrink-0 text-grey-secondary" />
      <div className="min-w-0">
        <div className="text-grey-secondary text-xs leading-none">{data.typeLabel}</div>
        <div className="truncate font-medium">{data.label}</div>
      </div>
      {data.canCollapse && data.groupId ? (
        <button
          type="button"
          className="nodrag nopan border-grey-border hover:bg-grey-background flex size-5 shrink-0 items-center justify-center rounded-sm border"
          title="Collapse group"
          aria-label={`Collapse ${data.typeLabel} group`}
          onClick={(e) => {
            e.stopPropagation();
            collapseGroup(data.groupId!);
          }}
        >
          <Icon icon="minus" className="size-3" />
        </button>
      ) : null}
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
  strokeClassName,
  labelClassName,
}: EdgeProps & {
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

  return (
    <>
      <BaseEdge id={id} path={path} markerEnd={markerEnd} style={style} className={strokeClassName} />
      {showEdgeLabels && label ? (
        <EdgeLabelRenderer>
          <div
            className={cn('nodrag nopan absolute origin-center rounded-sm', labelClassName)}
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              fontSize: '6px',
              padding: '2px 4px',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export function LinkEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      strokeClassName="!stroke-purple-primary !stroke-[2]"
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}

export function BackEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      style={{ ...props.style, strokeDasharray: '6 4' }}
      strokeClassName="!stroke-purple-primary/40 !stroke-[1.5]"
      labelClassName="bg-purple-background-light text-purple-primary border border-purple-border"
    />
  );
}

export function MatchEdge(props: EdgeProps<GraphRfEdge>) {
  return (
    <GraphEdge
      {...props}
      style={{ ...props.style, strokeDasharray: '2 3' }}
      strokeClassName="!stroke-orange-primary !stroke-[1.5]"
      labelClassName="bg-orange-background-light text-orange-primary border border-orange-border"
    />
  );
}

export const graphNodeTypes = {
  person: PersonNode,
  typeGroup: GroupNode,
  entity: EntityNode,
  pivot: PivotNode,
  typeBundle: TypeBundleNode,
};

export const graphEdgeTypes = {
  link: LinkEdge,
  back: BackEdge,
  match: MatchEdge,
};
