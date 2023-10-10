import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace, type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';

export const navigationI18n = ['navigation'] satisfies Namespace;

export type SidebarLinkProps = {
  Icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
  labelTKey: ParseKeys<['navigation']>;
  to: string;
};

function SidebarLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-s text-grey-100 hover:bg-purple-10 flex flex-row items-center gap-2 rounded-sm p-2 font-medium hover:text-purple-100',
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
  labelTKey: ParseKeys<['navigation']>;
  to: string;
};

function ScenariosLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation(navigationI18n);

  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-s text-grey-100 hover:bg-purple-10 flex flex-row items-center gap-2 rounded px-4 py-2 font-medium hover:text-purple-100',
          {
            'bg-purple-10 text-purple-100': isActive,
          }
        )
      }
      to={to}
    >
      <Icon className="text-[24px]" />
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

export const Decisions = Scenarios;
export type DecisionsLinkProps = ScenariosLinkProps;
