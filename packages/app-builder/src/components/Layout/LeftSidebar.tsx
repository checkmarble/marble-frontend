import type * as React from 'react';

export function LeftSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="group/sidebar relative w-14 max-h-screen z-20">
      <div className="group/nav h-full w-14 bg-surface-sidebar border-e border-e-grey-border flex flex-col group-hover/sidebar:absolute group-hover/sidebar:top-0 group-hover/sidebar:left-0 group-hover/sidebar:w-58.5 transition-all delay-300 group-hover/sidebar:delay-0 motion-reduce:delay-0 motion-reduce:duration-0 group-hover/sidebar:shadow-sticky-left">
        {children}
      </div>
    </div>
  );
}
