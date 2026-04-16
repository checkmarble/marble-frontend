import { Link } from '@tanstack/react-router';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type IconProps } from 'packages/ui-icons/src/Icon';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

//TODO(split apps): refactor this to be translation agnostic: directly pass the translated string (it will help separate the navigation.json file per "app")
export const navigationI18n = ['navigation'] satisfies Namespace;

export interface SidebarLinkProps {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
  children?: React.ReactNode;
  className?: string;
}

export const sidebarLink = cva('text-s flex flex-row items-center gap-2 rounded-xs p-2 font-medium w-full', {
  variants: {
    isActive: {
      true: 'bg-purple-background text-purple-primary dark:bg-grey-background-light dark:text-purple-hover',
      false:
        'text-grey-primary hover:bg-purple-background hover:text-purple-primary dark:text-grey-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover',
    },
  },
  defaultVariants: {
    isActive: false,
  },
});

export function SidebarLink({ Icon, labelTKey, to, children, className }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <Link
      className={sidebarLink({ className })}
      activeProps={{ className: sidebarLink({ isActive: true, className }) }}
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
        {t(labelTKey)}
      </span>
      {children}
    </Link>
  );
}

export interface SidebarButtonProps extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
}

export const SidebarButton = React.forwardRef<HTMLButtonElement, SidebarButtonProps>(function SidebarButton(
  { Icon, labelTKey, className, ...props },
  ref,
) {
  const { t } = useTranslation(navigationI18n);

  return (
    <button ref={ref} className={sidebarLink({ className })} {...props}>
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
        {t(labelTKey)}
      </span>
    </button>
  );
});

export interface TabLinkProps {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
}

export function TabLink({ Icon, labelTKey, to }: TabLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <Link
      className={clsx(
        'text-s flex flex-row items-center gap-2 rounded-sm px-4 py-2 font-medium',
        'text-grey-primary hover:bg-purple-background hover:text-purple-primary dark:text-grey-primary dark:hover:bg-grey-background-light dark:hover:text-purple-hover',
      )}
      activeProps={{
        className: clsx(
          'text-s flex flex-row items-center gap-2 rounded-sm px-4 py-2 font-medium',
          'bg-purple-background text-purple-primary dark:bg-grey-background-light dark:text-purple-hover',
        ),
      }}
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="first-letter:capitalize">{t(labelTKey)}</span>
    </Link>
  );
}
