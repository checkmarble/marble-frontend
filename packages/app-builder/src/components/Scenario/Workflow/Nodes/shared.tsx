import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { Handle, NodeToolbar, Position, useReactFlow } from 'reactflow';
import { Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { type ActionData, type TriggerData, useTitleInfo } from '../models/nodes';
import { useIsSourceConnectable, useWorkflowActions } from '../WorkflowProvider';
import { workflowI18n } from '../workflow-i18n';

export function NodeRoot({ children }: { children: React.ReactNode }) {
  return <div className="group relative min-w-72 max-w-96">{children}</div>;
}

export function AddNodeButton({
  onClick,
  nodeSelected,
}: {
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  nodeSelected: boolean;
}) {
  return (
    <div
      className={clsx(
        'absolute bottom-0 -z-10 flex w-full flex-col items-center justify-center transition-transform group-hover:translate-y-10',
        nodeSelected && 'translate-y-10',
      )}
    >
      <div className="bg-grey-80 h-4 w-px" />
      <button
        onClick={onClick}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className="nodrag hover:bg-purple-60 active:bg-purple-60 bg-purple-65 rounded-full"
      >
        <Icon icon="plus" className="text-grey-100 size-6" />
      </button>
    </div>
  );
}

export function QuickAddEmptyNodeButton({
  nodeId,
  nodeSelected,
}: {
  nodeId: string;
  nodeSelected: boolean;
}) {
  const { addEmptyNode } = useWorkflowActions();
  const isSourceConnectable = useIsSourceConnectable({ nodeId });

  return isSourceConnectable ? (
    <AddNodeButton
      onClick={() => {
        addEmptyNode(nodeId);
      }}
      nodeSelected={nodeSelected}
    />
  ) : null;
}

export function TriggerNodeContainer({
  children,
  id,
  selected,
}: {
  children: React.ReactNode;
  id: string;
  selected: boolean;
}) {
  const { t } = useTranslation(workflowI18n);
  return (
    <NodeRoot>
      <NodeToolbar position={Position.Right} align="center" className="flex flex-col pt-8">
        <DeleteNode nodeId={id} />
      </NodeToolbar>
      <p
        className={clsx(
          'text-s bg-grey-98 border-grey-90 flex h-8 w-fit flex-row items-center gap-1 rounded-t-md border border-b-0 px-2 capitalize',
          selected ? 'border-purple-65 text-purple-65' : 'border-grey-90 text-grey-50',
        )}
      >
        <Icon icon="trigger" className="size-4" />
        {t('workflows:trigger')}
      </p>
      <div
        className={clsx(
          'border-grey-90 bg-grey-100 flex flex-col gap-4 rounded-e-md rounded-bl-md border p-4',
          selected ? 'border-purple-65' : 'border-grey-90',
        )}
      >
        {children}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <QuickAddEmptyNodeButton nodeId={id} nodeSelected={selected} />
    </NodeRoot>
  );
}

export function NodeContainer({
  children,
  id,
  selected,
}: {
  children: React.ReactNode;
  id: string;
  selected: boolean;
}) {
  return (
    <NodeRoot>
      <NodeToolbar position={Position.Right} align="center" className="flex flex-col">
        <DeleteNode nodeId={id} />
      </NodeToolbar>
      <Handle type="target" position={Position.Top} />
      <div
        className={clsx(
          'bg-grey-100 flex flex-col gap-4 rounded-md border p-4',
          selected ? 'border-purple-65' : 'border-grey-90',
        )}
      >
        {children}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <QuickAddEmptyNodeButton nodeId={id} nodeSelected={selected} />
    </NodeRoot>
  );
}

export function NodeTitle({ data }: { data: TriggerData | ActionData }) {
  const { icon, title, entity } = useTitleInfo(data);

  return (
    <div className="flex flex-row items-center gap-2">
      <div className="text-grey-00 bg-purple-96 rounded-md p-1">
        <Icon icon={icon} className="text-purple-65 size-5 rounded-md" />
      </div>
      <span className="text-grey-00 flex-1 font-semibold">{title}</span>
      <Tag color="grey">{entity}</Tag>
    </div>
  );
}

function DeleteNode({ nodeId }: { nodeId: string }) {
  const { t } = useTranslation(workflowI18n);
  const { deleteElements } = useReactFlow();
  return (
    <button
      className="hover:bg-red-43 active:bg-red-43 bg-red-47 rounded-full p-1"
      onClick={() => {
        deleteElements({ nodes: [{ id: nodeId }] });
      }}
    >
      <Icon icon="delete" className="text-grey-100 size-4 shrink-0" />
      <span className="sr-only">{t('common:delete')}</span>
    </button>
  );
}
