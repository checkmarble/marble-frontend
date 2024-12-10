import { createSimpleContext } from '@app-builder/utils/create-context';
import clsx from 'clsx';
import * as React from 'react';
import { Tooltip } from 'ui-design-system';
import { Icon, type IconName } from 'ui-icons';

type State = {
  open: boolean;
  activeId: string | null;
};
type Actions = {
  type: 'triggerClicked';
  payload: { activeId: string };
};

const initialState: State = {
  open: false,
  activeId: null,
};

function rightSidebarReducer(prevState: State, action: Actions): State {
  switch (action.type) {
    case 'triggerClicked': {
      return {
        ...prevState,
        open:
          prevState.activeId === action.payload.activeId
            ? !prevState.open
            : true,
        activeId: action.payload.activeId,
      };
    }
    default: {
      return prevState;
    }
  }
}
const RightSidebarContext = createSimpleContext<{
  state: State;
  dispatch: React.Dispatch<Actions>;
}>('RightSidebar');

export function RightSidebarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(rightSidebarReducer, initialState);

  return (
    <RightSidebarContext.Provider value={{ state, dispatch }}>
      <div className="relative isolate">{children}</div>
    </RightSidebarContext.Provider>
  );
}

export function RightSidebar({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-grey-00 border-s-grey-10 relative z-10 flex h-full w-10 flex-col gap-1 border-s p-1">
      {children}
    </div>
  );
}

interface RightSidebarButtonProps
  extends Omit<React.HTMLAttributes<HTMLButtonElement>, 'children'> {
  activeId: string;
  icon: IconName;
  label: string;
}

export const RightSidebarTab = React.forwardRef<
  HTMLButtonElement,
  RightSidebarButtonProps
>(function RightSidebarButton(
  { activeId, icon, label, className, ...props },
  ref,
) {
  const { state, dispatch } = RightSidebarContext.useValue();

  const isExpanded = state.activeId === activeId && state.open;

  return (
    <Tooltip.Default content={label}>
      <button
        ref={ref}
        aria-expanded={isExpanded}
        aria-controls={activeId}
        onClick={() => {
          dispatch({
            type: 'triggerClicked',
            payload: { activeId },
          });
        }}
        className={clsx(
          'hover:bg-purple-10 active:bg-purple-10 flex size-8 items-center justify-center rounded-sm hover:text-purple-100 active:text-purple-100',
          isExpanded && 'bg-purple-10 text-purple-100',
          className,
        )}
        {...props}
      >
        <Icon className="size-6" icon={icon} />
        <span className="sr-only">{label}</span>
      </button>
    </Tooltip.Default>
  );
});

export function RightSidebarDisclosureContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { state } = RightSidebarContext.useValue();

  return (
    <div
      className={clsx(
        'bg-grey-00 border-s-grey-10 absolute inset-y-0 left-0 w-[460px] shrink-0 border-s transition-all',
        'scrollbar-gutter-stable flex flex-col overflow-y-scroll p-4 pr-[calc(1rem-var(--scrollbar-width))] lg:p-6 lg:pr-[calc(1.5rem-var(--scrollbar-width))]',
        state.open && 'translate-x-[-460px]',
      )}
    >
      {children}
    </div>
  );
}

export function RightSidebarTabContent({
  children,
  activeId,
}: {
  children: React.ReactNode;
  activeId: string;
}) {
  const { state } = RightSidebarContext.useValue();

  return (
    <div id={activeId} hidden={state.activeId !== activeId}>
      {children}
    </div>
  );
}
