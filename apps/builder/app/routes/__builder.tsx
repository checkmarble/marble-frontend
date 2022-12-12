import * as Popover from '@radix-ui/react-popover';
import {
  Analytics,
  Arrow2Down,
  Helpcenter,
  History,
  Home,
  Lists,
  LogoStandard,
  Logout,
  Scenarios,
  Settings,
} from '@marble-front/ui/icons';
import { Button } from '@marble-front/ui/design-system';
import { NavLink } from '@remix-run/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { NavigationTKey } from '../config/navigation';
import { Outlet } from '@remix-run/react';

type SidebarLinkProps = {
  Icon: typeof Home;
  labelTKey: NavigationTKey;
  to: string;
};

const LINKS: SidebarLinkProps[] = [
  { labelTKey: 'home', to: 'home', Icon: Home },
  { labelTKey: 'scenarios', to: 'scenarios', Icon: Scenarios },
  { labelTKey: 'lists', to: 'lists', Icon: Lists },
  { labelTKey: 'analytics', to: 'analytics', Icon: Analytics },
  { labelTKey: 'history', to: 'history', Icon: History },
];

const BOTTOM_LINKS: SidebarLinkProps[] = [
  { labelTKey: 'settings', to: 'settings', Icon: Settings },
  { labelTKey: 'help-center', to: 'help-center', Icon: Helpcenter },
];

function SidebarLink({ Icon, labelTKey, to }: SidebarLinkProps) {
  const { t } = useTranslation('navigation');

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

export const handle = {
  i18n: ['common', 'navigation'],
};

export default function Builder() {
  const { t } = useTranslation('common');

  /**
   * TODO(auth): get the real user data
   */
  const user = {
    firstName: 'pierre',
    lastName: 'lemaire',
    email: 'plemaire@logicfounders.com',
  };

  return (
    <div className="flex flex-1 flex-row">
      <header className="bg-grey-02 sticky top-0 flex max-h-screen w-full max-w-[235px] flex-col px-2">
        <div className="pb-9 pt-3">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="hover:bg-grey-05 active:bg-grey-10 group flex w-full flex-row items-center justify-between gap-2 rounded-md p-2">
                <LogoStandard
                  className="max-h-12"
                  width="100%"
                  height="100%"
                  preserveAspectRatio="xMinYMid meet"
                />
                <Arrow2Down
                  className="group-radix-state-open:rotate-180"
                  height="24px"
                  width="24px"
                />
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content
                className="bg-grey-00 border-grey-10 animate-slideUpAndFade w-full max-w-xs rounded-md border border-solid p-6 drop-shadow-md will-change-auto"
                side="bottom"
                align="start"
                sideOffset={4}
              >
                <div className="flex flex-col items-center">
                  <div className="bg-grey-10 mb-2 flex h-16 w-16 items-center justify-center rounded-[64px] text-center">
                    <p className="text-display-l-semibold text-center uppercase">{`${user.firstName?.[0]}${user.lastName?.[0]}`}</p>
                  </div>
                  <p className="text-text-m-semibold mb-1 capitalize">{`${user.firstName} ${user.lastName}`}</p>
                  <p className="text-text-s-regular">{user.email}</p>
                </div>

                <div className="mt-6 flex flex-col items-center">
                  {/* TODO(auth): implement the user logout feature */}
                  <Button variant="secondary">
                    <Logout height="24px" width="24px" />
                    {t('auth.logout')}
                  </Button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>
        <SidebarNav className="flex flex-1 flex-col overflow-y-auto">
          {LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <SidebarLink {...linkProps} />
            </li>
          ))}
        </SidebarNav>
        <SidebarNav className="pb-4">
          {BOTTOM_LINKS.map((linkProps) => (
            <li key={linkProps.labelTKey}>
              <SidebarLink {...linkProps} />
            </li>
          ))}
        </SidebarNav>
      </header>

      <main className="flex flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}
