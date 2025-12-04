import { type ReactNode } from 'react';

import { usePanel } from './PanelProvider';

interface PanelOverlayProps {
  children: ReactNode;
}

export function PanelOverlay({ children }: PanelOverlayProps) {
  const { closePanel } = usePanel();

  return (
    <div className="fixed inset-0 z-30">
      <div className="absolute inset-0 bg-black/20" onClick={closePanel} aria-hidden="true" />
      {children}
    </div>
  );
}
