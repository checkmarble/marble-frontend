import { type FtmEntityPersonOption } from '@app-builder/models/data-model';
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
import { cn, Tag } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';
import { useCustomerGraph } from './CustomerGraphContext';
import { type NonPersonSemantic, semanticTypeLabel } from './data-model-map';

export type PersonRfData = {
  label: string;
  subEntity: FtmEntityPersonOption;
  isStart: boolean;
  riskLabel?: string;
  tags?: string[];
};

export type GroupRfData = {
  semanticType: NonPersonSemantic;
  label: string;
  memberCount: number;
};

export type EntityRfData = {
  label: string;
  semanticType: NonPersonSemantic;
  rawType: string;
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
  const { showRiskScore, showTags } = useCustomerGraph();

  return (
    <div
      className={cn(
        'relative flex w-fit flex-col gap-xs rounded-lg px-md py-sm text-sm font-medium text-purple-primary shadow-sm bg-purple-background-light border-purple-border',
        data.isStart && 'bg-purple-primary ring-2 ring-purple-primary ring-offset-2 text-white',
      )}
    >
      <FourHandles />
      <div
        className={cn(
          'absolute left-1/2 -top-2 -translate-x-1/2 -translate-y-1/2 rounded-full shrink-0 bg-purple-background-light border-purple-border p-xs',
          data.isStart && 'bg-purple-primary border-purple-primary',
        )}
      >
        <Icon
          icon={subEntityIcon(data.subEntity)}
          className={cn('size-4 text-purple-primary', data.isStart && 'text-white')}
        />
      </div>
      <div className="flex items-center gap-xs">
        <span>{data.label}</span>
        {showRiskScore && data.riskLabel ? (
          <span
            className={cn(
              'rounded-full border px-xs py-px text-[10px] font-normal',
              data.isStart
                ? 'border-white/40 text-white'
                : 'border-green-border text-green-primary bg-green-background-light',
            )}
          >
            {data.riskLabel}
          </span>
        ) : null}
      </div>
      {showTags && data.tags && data.tags.length > 0 ? (
        <div className="flex flex-wrap gap-xs">
          {data.tags.map((tag) => (
            <Tag
              key={tag}
              size="small"
              color={data.isStart ? 'white' : 'purple'}
              className={data.isStart ? 'bg-grey-white' : undefined}
            >
              {tag}
            </Tag>
          ))}
        </div>
      ) : null}
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
      <span className="bg-purple-primary shrink-0 rounded-sm px-xs py-px text-[10px] font-semibold text-white">
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
        <div className="text-grey-secondary text-[10px] leading-none">{semanticTypeLabel[data.semanticType]}</div>
        <div className="truncate font-medium">{data.label}</div>
      </div>
      {data.canCollapse && data.groupId ? (
        <button
          type="button"
          className="nodrag nopan border-grey-border hover:bg-grey-background flex size-5 shrink-0 items-center justify-center rounded-sm border"
          title="Collapse group"
          aria-label={`Collapse ${semanticTypeLabel[data.semanticType]} group`}
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
        <div className="text-[10px] leading-none opacity-70">{data.rawType}</div>
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
