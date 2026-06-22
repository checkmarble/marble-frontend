import type * as React from 'react';

export function LeftSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="group/sidebar sticky top-0 left-0 z-20 h-screen max-h-screen w-14 shrink-0">
      <div className="group/nav flex h-full w-14 flex-col border-e border-e-grey-border bg-surface-sidebar transition-all delay-300 group-hover/sidebar:absolute group-hover/sidebar:top-0 group-hover/sidebar:left-0 group-hover/sidebar:w-58.5 group-hover/sidebar:shadow-sticky-left group-hover/sidebar:delay-0 motion-reduce:delay-0 motion-reduce:duration-0">
        {children}
      </div>
    </div>
  );
}
