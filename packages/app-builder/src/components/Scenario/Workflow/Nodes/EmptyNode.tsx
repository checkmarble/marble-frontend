import clsx from 'clsx';
import { Handle, type NodeProps, Position } from 'reactflow';
import { Icon } from 'ui-icons';

export function EmptyNode({ selected }: NodeProps<void>) {
  return (
    <div
      className={clsx(
        'border-grey-90 bg-grey-100 flex items-center justify-center rounded-md border px-4 py-2',
        selected
          ? 'border-purple-65 text-purple-65'
          : 'border-grey-90 text-grey-90',
      )}
    >
      <Handle type="target" position={Position.Top} className="invisible" />
      <Icon icon="plus" className="size-8" />
    </div>
  );
}
