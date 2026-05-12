import type { IconProps } from 'packages/ui-icons/src/Icon';
import { Children, Fragment, ReactNode } from 'react';
import { Icon } from 'ui-icons';
import { Button } from '../Button/Button';

type ActionBarProps = {
  children?: ReactNode;
  more?: { icon: IconProps['icon']; onClick: () => void };
};

export function ActionBar({ children, more }: ActionBarProps) {
  const childrenArray = Children.toArray(children);
  return (
    <div className="flex gap-v2-sm bg-purple-background-light border border-purple-border rounded-v2-md dark:bg-grey-background-light dark:border-grey-border p-v2-sm">
      {childrenArray.map((child, i, arr) => {
        return (
          <Fragment key={i}>
            {child}
            {i < arr.length - 1 ? <div className="self-stretch w-px bg-purple-border dark:bg-grey-border" /> : null}
          </Fragment>
        );
      })}
      {more ? (
        <Button variant="secondary" appearance="stroked" mode="icon" onClick={more.onClick}>
          <Icon icon={more.icon} className="size-4" />
        </Button>
      ) : null}
    </div>
  );
}

type ActionButtonProps = {
  icon?: IconProps['icon'];
  text: string;
  disabled?: boolean;
  onClick: () => void;
};

export function ActionButton({ icon, disabled, text, onClick }: ActionButtonProps) {
  return (
    <Button disabled={disabled} appearance="link" onClick={onClick}>
      {icon ? <Icon icon={icon} className="size-4" /> : null}
      <span>{text}</span>
    </Button>
  );
}
