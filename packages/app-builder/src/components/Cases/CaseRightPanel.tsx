import { createRightPanel, type RightPanelRootProps } from '@app-builder/components/RightPanel';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { type DialogTriggerProps } from '@radix-ui/react-dialog';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateCase } from './CreateCase';
import { casesI18n } from './cases-i18n';

type Data = {
  inboxId: string | null;
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

function caseRightPanelReducer(prevState: State, action: Actions): State {
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
const { RightPanel } = createRightPanel('CaseRightPanel');

const CaseRightPanelContext = createSimpleContext<{
  data?: Data;
  onTriggerClick: (data: Data) => void;
}>('CaseRightPanelContext');
export const useCaseRightPanelContext = CaseRightPanelContext.useValue;

function CaseRightPanelRoot({ children, ...props }: Omit<RightPanelRootProps, 'open' | 'onClose'>) {
  const [state, dispatch] = useReducer(caseRightPanelReducer, initialState);

  return (
    <CaseRightPanelContext.Provider
      value={{
        data: state.open ? state.data : undefined,
        onTriggerClick: (data: Data) => dispatch({ type: 'triggerClicked', payload: { data } }),
      }}
    >
      <RightPanel.Root open={state.open} onClose={() => dispatch({ type: 'close' })} {...props}>
        <RightPanel.Viewport>{children}</RightPanel.Viewport>
        <CaseRightPanelContent />
      </RightPanel.Root>
    </CaseRightPanelContext.Provider>
  );
}

const CaseRightPanelContent = () => {
  const { t } = useTranslation(casesI18n);
  return (
    <RightPanel.Content className="flex max-w-md flex-col gap-4 z-10">
      <RightPanel.Title>
        <span className="w-full first-letter:capitalize">{t('cases:case.new_case')}</span>
        <RightPanel.Close />
      </RightPanel.Title>
      <CreateCase />
    </RightPanel.Content>
  );
};

function CaseRightPanelTrigger({
  onClick,
  data,
  ...otherProps
}: {
  data: Data;
} & DialogTriggerProps) {
  const { onTriggerClick } = useCaseRightPanelContext();

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

export const CaseRightPanel = {
  Root: CaseRightPanelRoot,
  Trigger: CaseRightPanelTrigger,
};
