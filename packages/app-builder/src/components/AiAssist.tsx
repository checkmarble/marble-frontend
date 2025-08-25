import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@marble/shared';
import { useState } from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiAssistContextType = {
  isOpened: boolean;
  setOpened: (open: boolean) => void;
};

const AiAssistContext = createSimpleContext<AiAssistContextType | null>('aiAssist');

export function Root({
  children,
  onOpenChange,
}: {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpened, _setOpened] = useState(false);
  const setOpened = useCallbackRef((value: boolean) => {
    _setOpened(value);
    onOpenChange?.(value);
  });

  return (
    <AiAssistContext.Provider value={{ isOpened, setOpened }}>{children}</AiAssistContext.Provider>
  );
}

function Trigger({ children }: { children: React.ReactNode }) {
  const { setOpened } = AiAssistContext.useValue();

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
  const { isOpened, setOpened } = AiAssistContext.useValue();

  if (!isOpened) return null;

  return (
    <div className="bg-grey-00/15 fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs font-normal text-s">
      <div className="bg-grey-98 relative h-[80vh] w-[80vw] flex flex-col rounded-xl shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
        <div className="p-2 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => setOpened(false)}
            className="cursor-pointer border-none bg-transparent"
          >
            <Icon icon="cross" className="size-6" />
          </Button>
        </div>
        <div className="grow min-h-0">{children}</div>
      </div>
    </div>
  );
}

export const AiAssist = {
  Root,
  Trigger,
  Content,
};
