import { useLocation } from '@remix-run/react';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface PanelContextType {
  openPanel: (content: ReactNode) => void;
  closePanel: () => void;
}

const PanelContext = createContext<PanelContextType | null>(null);

export function usePanel() {
  const context = useContext(PanelContext);
  if (!context) {
    throw new Error('usePanel must be used within a PanelProvider');
  }
  return context;
}

interface PanelProviderProps {
  children: ReactNode;
}

export function PanelProvider({ children }: PanelProviderProps) {
  const [panelContent, setPanelContent] = useState<ReactNode>(null);
  const location = useLocation();
  const isFirstRender = useRef(true);

  // Close panel on navigation (e.g., browser back button)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setPanelContent(null);
  }, [location.key]);

  const openPanel = useCallback((content: ReactNode) => {
    setPanelContent(content);
  }, []);

  const closePanel = useCallback(() => {
    setPanelContent(null);
  }, []);

  const value: PanelContextType = {
    openPanel,
    closePanel,
  };

  return (
    <PanelContext.Provider value={value}>
      {children}
      {panelContent && createPortal(panelContent, document.body)}
    </PanelContext.Provider>
  );
}
