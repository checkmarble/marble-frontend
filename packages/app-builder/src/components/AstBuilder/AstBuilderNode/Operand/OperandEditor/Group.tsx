import { createSimpleContext } from '@app-builder/utils/create-context';
import clsx from 'clsx';
import { useId, useMemo } from 'react';

const GroupContext = createSimpleContext<{ labelId: string }>('GroupContext');

export function Group({ className, ...props }: React.ComponentProps<'div'>) {
  const labelId = useId();
  const value = useMemo(() => ({ labelId }), [labelId]);

  return (
    <GroupContext.Provider value={value}>
      <div
        role="presentation"
        aria-labelledby={labelId}
        className={clsx('flex w-full flex-col gap-1', className)}
        {...props}
      />
    </GroupContext.Provider>
  );
}

function GroupHeaderContainer({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        'flex select-none flex-row items-center gap-1 p-2',
        className
      )}
      {...props}
    />
  );
}

function GroupHeaderIcon({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={clsx('text-l shrink-0', className)} {...props} />;
}

function GroupHeaderTitle({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={clsx(
        'not-last:pr-1 inline-block w-full align-baseline',
        className
      )}
      {...props}
    />
  );
}

export const GroupHeader = {
  Container: GroupHeaderContainer,
  Icon: GroupHeaderIcon,
  Title: GroupHeaderTitle,
};

export function Count({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      className={clsx('text-grey-25 text-xs font-medium', className)}
      {...props}
    />
  );
}

export function Label({ className, ...props }: React.ComponentProps<'span'>) {
  const { labelId } = GroupContext.useValue();
  return (
    <span
      id={labelId}
      className={clsx(
        'text-grey-100 text-m inline-block whitespace-pre align-baseline font-semibold',
        className
      )}
      {...props}
    />
  );
}
