import { NavLink } from '@remix-run/react';
import { cva } from 'class-variance-authority';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { type IconProps } from 'packages/ui-icons/src/Icon';
import type React from 'react';
import { useTranslation } from 'react-i18next';

export const navigationI18n = ['navigation'] satisfies Namespace;

export interface SidebarLinkProps {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
}

export const sidebarLink = cva(
  'text-s flex flex-row items-center gap-2 rounded-sm p-2 font-medium w-full',
  {
    variants: {
      isActive: {
        true: 'bg-purple-10 text-purple-100',
        false: 'text-grey-100 hover:bg-purple-10 hover:text-purple-100',
      },
    },
    defaultVariants: {
      isActive: false,
    },
  },
);

export function SidebarLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink className={({ isActive }) => sidebarLink({ isActive })} to={to}>
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-left opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
        {t(labelTKey)}
      </span>
    </NavLink>
  );
}

export interface SidebarButtonProps
  extends Omit<React.ComponentPropsWithoutRef<'button'>, 'children'> {
  Icon: (props: Omit<IconProps, 'icon'>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
}

export function SidebarButton({
  Icon,
  labelTKey,
  className,
  ...props
}: SidebarButtonProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <button className={sidebarLink({ className })} {...props}>
      <Icon className="size-6 shrink-0" />
      <span className="line-clamp-1 text-left opacity-0 transition-opacity group-aria-expanded/nav:opacity-100">
        {t(labelTKey)}
      </span>
    </button>
  );
}

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
            ? 'bg-purple-10 text-purple-100'
            : 'text-grey-100 hover:bg-purple-10 hover:text-purple-100',
        )
      }
      to={to}
    >
      <Icon className="size-6 shrink-0" />
      <span className="capitalize">{t(labelTKey)}</span>
    </NavLink>
  );
}
