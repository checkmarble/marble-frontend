import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { NavigationTKey } from '../config/navigation';

export const navigationI18n = ['navigation'] as const;

export type SidebarLinkProps = {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: NavigationTKey;
  to: string;
};

function SidebarLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-text-s-medium text-grey-100 hover:bg-purple-10 flex flex-row items-center gap-2 rounded-sm p-2 hover:text-purple-100',
          {
            'bg-purple-10 text-purple-100': isActive,
          }
        )
      }
      to={to}
    >
      <Icon height="24px" width="24px" />
      {t(labelTKey)}
    </NavLink>
  );
}

function SidebarNav({
  children,
  ...navProps
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav {...navProps}>
      <ul className="flex flex-col gap-2">{children}</ul>
    </nav>
  );
}

export const Sidebar = {
  Nav: SidebarNav,
  Link: SidebarLink,
};

export type ScenariosLinkProps = {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: NavigationTKey;
  to: string;
};

function ScenariosLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-text-s-medium text-grey-100 hover:bg-purple-10 flex flex-row items-center gap-2 rounded py-2 px-4 hover:text-purple-100',
          {
            'bg-purple-10 text-purple-100': isActive,
          }
        )
      }
      to={to}
    >
      <Icon height="24px" width="24px" />
      {t(labelTKey)}
    </NavLink>
  );
}

function ScenariosNav({
  children,
  ...navProps
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav {...navProps}>
      <ul className="flex flex-row gap-2">{children}</ul>
    </nav>
  );
}

export const Scenarios = {
  Nav: ScenariosNav,
  Link: ScenariosLink,
};
