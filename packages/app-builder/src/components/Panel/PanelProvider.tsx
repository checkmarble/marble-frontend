import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';
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
