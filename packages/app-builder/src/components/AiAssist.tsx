import { createContext, useContext, useState } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiAssistContextType = {
  isOpened: boolean;
  setOpened: (open: boolean) => void;
};

const AiAssistContext = createContext<AiAssistContextType | null>(null);

function useAiAssistContext() {
  const ctx = useContext(AiAssistContext);
  if (!ctx) throw new Error('AiAssist components must be used within <AiAssist.Root>');
  return ctx;
}

export function Root({ children }: { children: React.ReactNode }) {
  const [isOpened, setOpened] = useState(false);

  return (
    <AiAssistContext.Provider value={{ isOpened, setOpened }}>{children}</AiAssistContext.Provider>
  );
}

function Trigger({ children }: { children: React.ReactNode }) {
  const { setOpened } = useAiAssistContext();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setOpened(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpened(true);
        }
      }}
      style={{ display: 'inline-block', cursor: 'pointer' }}
      aria-pressed="false"
    >
      {children}
    </div>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  const { isOpened, setOpened } = useAiAssistContext();

  if (!isOpened) return null;

  return (
    <div className="bg-grey-00/15 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-grey-98 relative flex h-[80vh] w-[80vw] items-center justify-center rounded-xl shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
        <Button
          variant="secondary"
          onClick={() => setOpened(false)}
          className="absolute right-2 top-2 cursor-pointer border-none bg-transparent"
        >
          <Icon icon="cross" className="size-6" />
        </Button>
        {children}
      </div>
    </div>
  );
}

export const AiAssist = {
  Root,
  Trigger,
  Content,
};
