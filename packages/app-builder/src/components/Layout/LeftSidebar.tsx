import { setPreferencesCookie } from '@app-builder/utils/preferences-cookies/preferences-cookies-read';
import clsx from 'clsx';
import type * as React from 'react';
import { createSharpFactory } from 'sharpstate';
import { Icon } from 'ui-icons';

import { SidebarButton } from '../Navigation';

export const LeftSidebarSharpFactory = createSharpFactory({
  name: 'LeftSidebar',
  initializer: (expanded: boolean = true) => ({ expanded }),
}).withActions({
  toggleExpanded(api) {
    api.value.expanded = !api.value.expanded;
  },
  setExpanded(api, value: boolean) {
    api.value.expanded = value;
  },
});

export function LeftSidebar({ children }: { children: React.ReactNode }) {
  const isExpanded = LeftSidebarSharpFactory.select((s) => s.expanded);

  return (
    <div
      aria-expanded={isExpanded}
      className="bg-grey-100 group/nav border-e-grey-90 flex max-h-screen w-14 shrink-0 flex-col border-e transition-all aria-expanded:w-[235px]"
    >
      {children}
    </div>
  );
}

export function ToggleSidebar() {
  const leftSidebarSharp = LeftSidebarSharpFactory.useSharp();
  const isExpanded = leftSidebarSharp.select((s) => s.expanded);

  const toggleExpanded = async () => {
    leftSidebarSharp.actions.toggleExpanded();
    setPreferencesCookie('menuExpanded', leftSidebarSharp.value.expanded);
  };

  return (
    <SidebarButton
      onClick={toggleExpanded}
      labelTKey={isExpanded ? 'navigation:collapse' : 'navigation:expand'}
      Icon={({ className, ...props }) => (
        <Icon
          className={clsx('rtl:rotate-180', className)}
          icon={isExpanded ? 'left-panel-close' : 'left-panel-open'}
          {...props}
        />
      )}
    />
  );
}
