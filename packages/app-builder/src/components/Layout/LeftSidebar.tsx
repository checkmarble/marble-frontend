import { createSimpleContext } from '@app-builder/utils/create-context';
import * as React from 'react';
import { Icon } from 'ui-icons';

import { SidebarButton } from '../Navigation';

const ToggleSidebarContext = createSimpleContext<[boolean, () => void]>(
  'ToggleSidebarContext',
);

export function LeftSidebar({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <div
      aria-expanded={expanded}
      className="bg-grey-00 group/nav border-e-grey-10 flex max-h-screen w-14 shrink-0 flex-col border-e transition-all aria-expanded:w-[235px]"
    >
      <ToggleSidebarContext.Provider value={[expanded, toggleExpanded]}>
        {children}
      </ToggleSidebarContext.Provider>
    </div>
  );
}

export function ToggleSidebar() {
  const [expanded, toggleExpanded] = ToggleSidebarContext.useValue();

  return (
    <SidebarButton
      onClick={toggleExpanded}
      labelTKey={expanded ? 'navigation:collapse' : 'navigation:expand'}
      Icon={(props) => (
        <Icon
          icon={expanded ? 'left-panel-close' : 'left-panel-open'}
          {...props}
        />
      )}
    />
  );
}
