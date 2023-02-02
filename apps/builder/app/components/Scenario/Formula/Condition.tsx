import clsx from 'clsx';
import { ScenarioBox } from '../ScenarioBox';

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
    <ScenarioBox className={clsx('bg-grey-02 w-fit only:w-full', className)}>
      {children}
    </ScenarioBox>
  );
}

export const Condition = {
  Container: ConditionContainer,
  Item: ConditionItem,
};
