import {
  createRightPanel,
  type RightPanelRootProps,
} from '@app-builder/components/RightPanel';
import { AddToCase } from '@app-builder/routes/ressources/cases/add-to-case';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type DialogTriggerProps } from '@radix-ui/react-dialog';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from 'ui-design-system';

import { decisionsI18n } from './decisions-i18n';

type Data = {
  decisionIds: string[];
};
type State =
  | {
      open: false;
    }
  | {
      open: true;
      data: Data;
    };
type Actions =
  | {
      type: 'close';
    }
  | {
      type: 'triggerClicked';
      payload: { data: Data };
    };

const initialState: State = {
  open: false,
};

function decisionRightPanelReducer(prevState: State, action: Actions): State {
  switch (action.type) {
    case 'triggerClicked': {
      return {
        open: true,
        ...action.payload,
      };
    }
    case 'close':
      return {
        ...prevState,
        open: false,
      };
  }
}

const { RightPanel } = createRightPanel('DecisionRightPanel');

const DecisionRightPanelContext = createSimpleContext<{
  data?: Data;
  onTriggerClick: (data: Data) => void;
  closePanel: () => void;
}>('DecisionRightPanelContext');
export const useDecisionRightPanelContext = DecisionRightPanelContext.useValue;

function DecisionRightPanelRoot({
  children,
  ...props
}: Omit<RightPanelRootProps, 'open' | 'onClose'>) {
  const [state, dispatch] = useReducer(decisionRightPanelReducer, initialState);

  const value = {
    data: state.open ? state.data : undefined,
    onTriggerClick: (data: Data) => {
      dispatch({ type: 'triggerClicked', payload: { data } });
    },
    closePanel: () => {
      dispatch({ type: 'close' });
    },
  };

  return (
    <DecisionRightPanelContext.Provider value={value}>
      <RightPanel.Root
        {...props}
        open={state.open}
        onClose={() => {
          dispatch({ type: 'close' });
        }}
      >
        <RightPanel.Viewport>{children}</RightPanel.Viewport>
        <ScenarioRightPanelContent />
      </RightPanel.Root>
    </DecisionRightPanelContext.Provider>
  );
}

function ScenarioRightPanelContent() {
  const { t } = useTranslation(decisionsI18n);

  return (
    <RightPanel.Content className="max-w-md">
      <ScrollArea.Root className="flex h-full w-full flex-col gap-4 p-4 lg:gap-8 lg:p-8">
        <RightPanel.Title>
          <span className="w-full first-letter:capitalize">
            {t('decisions:add_to_case')}
          </span>
          <RightPanel.Close />
        </RightPanel.Title>
        <ScrollArea.Viewport className="h-full">
          <AddToCase />
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </RightPanel.Content>
  );
}

function DecisionRightPanelTrigger({
  onClick,
  data,
  ...otherProps
}: {
  data: Data;
} & DialogTriggerProps) {
  const { onTriggerClick } = useDecisionRightPanelContext();

  return (
    <RightPanel.Trigger
      onClick={(e) => {
        onTriggerClick(data);
        onClick?.(e);
        e.stopPropagation();
      }}
      {...otherProps}
    />
  );
}

export const DecisionRightPanel = {
  Root: DecisionRightPanelRoot,
  Trigger: DecisionRightPanelTrigger,
};
