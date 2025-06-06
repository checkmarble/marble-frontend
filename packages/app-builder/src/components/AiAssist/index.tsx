import React from 'react';
import { Button } from 'ui-design-system';
import { Icon } from 'ui-icons';

type AiAssistContextProviderProps = {
  children: React.ReactNode;
  setOpenedRef?: React.MutableRefObject<((open: boolean) => void) | null>;
};

export function AiAssistContextProvider({ children, setOpenedRef }: AiAssistContextProviderProps) {
  const [isOpened, setOpened] = React.useState(false);

  React.useEffect(() => {
    if (setOpenedRef) {
      setOpenedRef.current = setOpened;
      return () => {
        setOpenedRef.current = null;
      };
    }
  }, [setOpenedRef]);

  return (
    <>
      {isOpened ? (
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
      ) : null}
    </>
  );
}
