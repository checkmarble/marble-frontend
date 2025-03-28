import { NavLink } from '@remix-run/react';
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
}

export const sidebarLink = cva(
  'text-s flex flex-row items-center gap-2 rounded-sm p-2 font-medium w-full',
  {
    variants: {
      isActive: {
        true: 'bg-purple-96 text-purple-65',
        false: 'text-grey-00 hover:bg-purple-96 hover:text-purple-65',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function SidebarLink({ Icon, labelTKey, to, children }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink className={({ isActive }) => sidebarLink({ isActive })} to={to}>
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-start opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
        {t(labelTKey)}
      </span>
      {children}
    </NavLink>
  );
}

export interface SidebarButtonProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
}

export const SidebarButton = React.forwardRef<HTMLButtonElement, SidebarButtonProps>(
  function SidebarButton({ Icon, labelTKey, className, ...props }, ref) {
    const { t } = useTranslation(navigationI18n);

    return (
      <button ref={ref} className={sidebarLink({ className })} {...props}>
        <Icon className="size-6 shrink-0" />
        <span className="line-clamp-1 text-start opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
          {t(labelTKey)}
        </span>
      </button>
    );
  },
);

export interface TabLinkProps {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
}

export function TabLink({ Icon, labelTKey, to }: TabLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-s flex flex-row items-center gap-2 rounded px-4 py-2 font-medium',
          isActive
            ? 'bg-purple-96 text-purple-65'
            : 'text-grey-00 hover:bg-purple-96 hover:text-purple-65',
        )
      }
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="first-letter:capitalize">{t(labelTKey)}</span>
    </NavLink>
  );
}
