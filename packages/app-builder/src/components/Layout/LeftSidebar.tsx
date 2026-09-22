import type * as React from 'react';

interface LeftSidebarProps {
  children: React.ReactNode;
}

export function LeftSidebar({ children }: LeftSidebarProps) {
  return (
    <div className="group/sidebar sticky top-0 start-0 z-20 h-screen max-h-screen w-14 shrink-0">
      <div className="group/nav flex h-full w-14 flex-col border-e border-e-grey-border bg-surface-sidebar transition-all delay-400 group-sidebar-open:absolute group-sidebar-open:top-0 group-sidebar-open:start-0 group-sidebar-open:w-58.5 group-sidebar-open:shadow-sticky-left rtl:group-sidebar-open:shadow-sticky-right group-sidebar-open:delay-200 motion-reduce:delay-0 motion-reduce:duration-0">
        {children}
      </div>
    </div>
  );
}
