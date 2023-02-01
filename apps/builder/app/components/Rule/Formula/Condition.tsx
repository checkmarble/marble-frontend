import clsx from 'clsx';

function ConditionContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex w-fit flex-row gap-2', className)}>
      {children}
    </div>
  );
}

function ConditionItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <div
      className={clsx(
        'bg-grey-02 flex h-fit min-h-[40px] w-fit min-w-[40px] flex-wrap items-center gap-1 rounded p-2 only:w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

export const Condition = {
  Container: ConditionContainer,
  Item: ConditionItem,
};
