import { createSimpleContext } from '@app-builder/utils/create-context';
import clsx from 'clsx';
import * as React from 'react';
import { Icon } from 'ui-icons';

import { SidebarButton } from '../Navigation';

const ToggleHeaderContext = createSimpleContext<[boolean, () => void]>(
  'ToggleHeaderContext',
);

export function Header({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = React.useState(true);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <header
      aria-expanded={expanded}
      className="bg-grey-00 border-r-grey-10 group/nav flex max-h-screen w-14 shrink-0 flex-col border-r transition-all aria-expanded:w-[235px]"
    >
      <ToggleHeaderContext.Provider value={[expanded, toggleExpanded]}>
        {children}
      </ToggleHeaderContext.Provider>
    </header>
  );
}

export function ToggleHeader() {
  const [expanded, toggleExpanded] = ToggleHeaderContext.useValue();

  return (
    <SidebarButton
      onClick={toggleExpanded}
      labelTKey={expanded ? 'navigation:collapsed' : 'navigation:expanded'}
      Icon={({ className, ...props }) => (
        <Icon
          icon="arrow-right"
          className={clsx(
            'transition-transform group-aria-expanded/nav:rotate-180',
            className,
          )}
          {...props}
        />
      )}
    />
  );
}
