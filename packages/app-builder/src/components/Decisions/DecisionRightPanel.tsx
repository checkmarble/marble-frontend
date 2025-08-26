import { createRightPanel, type RightPanelRootProps } from '@app-builder/components/RightPanel';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { AddToCase } from './AddToCase';
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
        <DecisionRightPanelContent />
      </RightPanel.Root>
    </DecisionRightPanelContext.Provider>
  );
}

function DecisionRightPanelContent() {
  const { t } = useTranslation(decisionsI18n);

  return (
    <RightPanel.Content className="flex max-w-md flex-col gap-4">
      <RightPanel.Title>
        <span className="w-full first-letter:capitalize">{t('decisions:add_to_case')}</span>
        <RightPanel.Close />
      </RightPanel.Title>
      <AddToCase />
    </RightPanel.Content>
  );
}

export const DecisionRightPanel = {
  Root: DecisionRightPanelRoot,
  Trigger: RightPanel.Trigger,
};
