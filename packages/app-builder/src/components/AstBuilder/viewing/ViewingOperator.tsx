import { undefinedAstNodeName } from '@app-builder/models';

export function ViewingOperator({ operator }: { operator: string | null }) {
  const _value = operator !== undefinedAstNodeName && operator !== null ? operator : null;
  return (
    <div className="bg-grey-98 flex h-10 min-w-[40px] items-center justify-between gap-2 rounded px-2 outline-none">
      <span className="text-s text-grey-00 w-full text-center font-medium">{_value}</span>
    </div>
  );
}
