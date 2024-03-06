import clsx from 'clsx';
import { MenuGroup, MenuGroupLabel } from 'ui-design-system';
import { Icon } from 'ui-icons';

export function Group({
  className,
  ...props
}: React.ComponentProps<typeof MenuGroup>) {
  return (
    <MenuGroup
      className={clsx('flex w-full flex-col gap-1', className)}
      {...props}
    />
  );
}

function GroupHeaderContainer({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={clsx(
        'flex select-none flex-row items-center gap-1 p-2',
        className,
      )}
      {...props}
    />
  );
}

function GroupHeaderIcon({
  className,
  ...props
}: React.ComponentProps<typeof Icon>) {
  return (
    <Icon
      aria-hidden="true"
      className={clsx('size-5 shrink-0', className)}
      {...props}
    />
  );
}

function GroupHeaderTitle({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      className={clsx('flex w-full items-baseline gap-1', className)}
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

export function Label({
  className,
  ...props
}: React.ComponentProps<typeof MenuGroupLabel>) {
  return (
    <MenuGroupLabel
      className={clsx('flex items-baseline whitespace-pre', className)}
      {...props}
    />
  );
}
