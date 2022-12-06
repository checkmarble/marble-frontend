import * as Popover from '@radix-ui/react-popover';
import {
  Analytics,
  Arrow2Down,
  Helpcenter,
  History,
  Home,
  Lists,
  MarbleLogo,
  Scenarios,
  Settings,
} from '@marble-front/ui/icons';
import { NavLink } from '@remix-run/react';
import clsx from 'clsx';

interface SidebarLinkProps {
  Icon: typeof Home;
  label: string;
  to: string;
}

const LINKS: SidebarLinkProps[] = [
  { label: 'Home', to: 'home', Icon: Home },
  { label: 'Scenarios', to: 'scenarios', Icon: Scenarios },
  { label: 'Lists', to: 'lists', Icon: Lists },
  { label: 'Analytics', to: 'analytics', Icon: Analytics },
  { label: 'History', to: 'history', Icon: History },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  { label: 'Settings', to: 'settings', Icon: Settings },
  { label: 'Help center', to: 'help-center', Icon: Helpcenter },
];

function SidebarLink({ Icon, label, to }: SidebarLinkProps) {
  return (
    <NavLink
      className={({ isActive }) =>
        clsx(
          'text-text-s-medium text-grey-100 flex flex-row items-center gap-2 rounded-sm p-2',
          {
            'bg-purple-10 text-purple-100': isActive,
          }
        )
      }
      to={to}
    >
      <Icon height="24px" width="24px" />
      {label}
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

export function Sidebar() {
  /**
   * TODO(data): get the real user data
   */
  const user = {
    companyName: 'Acme.',
    name: 'D. Brown',
  };

  return (
    <header className="bg-grey-02 sticky top-0 flex max-h-screen w-full max-w-[210px] flex-col px-2">
      <div className="pb-9 pt-3">
        <Popover.Root>
          <Popover.Trigger asChild>
            <button className="hover:bg-grey-05 active:bg-grey-10 group flex w-full flex-row items-center gap-2 rounded-md p-2">
              <MarbleLogo width="48px" height="48px" />
              <div className="flex min-w-0 flex-1 items-start">
                <p className="truncate text-start">
                  <span className="text-text-s-bold text-grey-100">
                    {user.companyName}
                  </span>
                  <br />
                  <span className="text-text-s-regular text-purple-100">
                    {user.name}
                  </span>
                </p>
              </div>
              <Arrow2Down className="group-radix-state-open:rotate-180" />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            {/* TODO(component): implement the user feature dedicated modal (Logout...) */}
            <Popover.Content
              className="bg-grey-02 border-grey-10 animate-slideUpAndFade w-full max-w-xs rounded-md border border-solid p-5 drop-shadow-md will-change-auto"
              side="bottom"
              align="start"
              sideOffset={4}
            >
              <div className="flex flex-col gap-3">
                <p className="text-text-m-regular">TODO</p>
              </div>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>
      <SidebarNav className="flex flex-1 flex-col overflow-y-auto">
        {LINKS.map((linkProps) => (
          <li key={linkProps.label}>
            <SidebarLink {...linkProps} />
          </li>
        ))}
      </SidebarNav>
      <SidebarNav className="pb-4">
        {BOTTOM_LINKS.map((linkProps) => (
          <li key={linkProps.label}>
            <SidebarLink {...linkProps} />
          </li>
        ))}
      </SidebarNav>
    </header>
  );
}
