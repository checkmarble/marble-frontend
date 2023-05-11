import clsx from 'clsx';

import { ScenarioBox } from '../../ScenarioBox';

function ConditionContainer({
  children,
  className,
  isRoot,
}: {
  children: React.ReactNode;
  className?: string;
  isRoot?: boolean;
}) {
  if (!isRoot) return <>{children}</>;
  return (
    <div className={clsx('flex w-fit flex-row gap-2', className)}>
      {children}
    </div>
  );
}

function ConditionItem({
  children,
  className,
  isRoot,
}: {
  children: React.ReactNode;
  className?: string;
  isRoot?: boolean;
}) {
  if (!isRoot) return <>{children}</>;

  if (!children) return null;
  return (
    <ScenarioBox className={clsx('bg-grey-02 w-fit only:w-full', className)}>
      {children}
    </ScenarioBox>
  );
}

export const Condition = {
  Container: ConditionContainer,
  Item: ConditionItem,
};
