import { createRightPanel, type RightPanelRootProps } from '@app-builder/components/RightPanel';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type ReactNode, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
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

interface DecisionRightPanelRootProps extends Omit<RightPanelRootProps, 'open' | 'onClose'> {
  content: ReactNode;
}

function DecisionRightPanelRoot({ children, content, ...props }: DecisionRightPanelRootProps) {
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
        <DecisionRightPanelContent content={content} />
      </RightPanel.Root>
    </DecisionRightPanelContext.Provider>
  );
}

function DecisionRightPanelContent({ content }: { content: ReactNode }) {
  const { t } = useTranslation(decisionsI18n);

  return (
    <RightPanel.Content className="flex max-w-md flex-col gap-4">
      <RightPanel.Title>
        <span className="w-full first-letter:capitalize">{t('decisions:add_to_case')}</span>
        <RightPanel.Close />
      </RightPanel.Title>
      {content}
    </RightPanel.Content>
  );
}

export const DecisionRightPanel = {
  Root: DecisionRightPanelRoot,
  Trigger: RightPanel.Trigger,
};
