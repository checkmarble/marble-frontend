import clsx from 'clsx';
import { Handle, type NodeProps, Position } from 'reactflow';
import { Icon } from 'ui-icons';

export function EmptyNode({ selected }: NodeProps<void>) {
  return (
    <div
      className={clsx(
        'border-grey-10 bg-grey-00 flex items-center justify-center rounded-md border px-4 py-2',
        selected
          ? 'border-purple-100 text-purple-100'
          : 'border-grey-10 text-grey-10',
      )}
    >
      <Handle type="target" position={Position.Top} className="invisible" />
      <Icon icon="plus" className="size-8" />
    </div>
  );
}
