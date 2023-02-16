import type { PlainMessage } from '@bufbuild/protobuf';
import type { FormulaAggregation as FormulaAggregationMessage } from '@marble-front/api/marble';
import { Cross, Variable } from '@marble-front/ui/icons';
import { useCallback, useReducer } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import { scenarioI18n } from './scenario-i18n';
import { noop } from '@marble-front/builder/utils/utility-types';
import { createSimpleContext } from '@marble-front/builder/utils/create-context';
import clsx from 'clsx';
import { FormulaAggregation } from './Formula';
import { assertNever } from '@marble-front/builder/utils/assert-never';

type State = {
  open: boolean;
  data?: {
    type: 'formulaAggregation';
    formulaAggregation: PlainMessage<FormulaAggregationMessage>;
  };
};
type Actions =
  | {
      type: 'close';
    }
  | {
      type: 'triggerClicked';
      payload: Pick<State, 'data'>;
    };

const initialState: State = {
  open: false,
};

function scenarioRightPannelReducer(prevState: State, action: Actions) {
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

const { Provider, useValue: useActions } = createSimpleContext<{
  onTriggerClick: (data: State['data']) => void;
  onClose: () => void;
}>('ScenarioRightPannel');

function ScenarioRightPannelProvider({
  children,
  ...props
}: Omit<Dialog.DialogProps, 'open' | 'onOpenChange' | 'modal'>) {
  const getTitle = useGetTitle();
  const [{ open, data }, dispatch] = useReducer(
    scenarioRightPannelReducer,
    initialState
  );

  const value = {
    onTriggerClick: (data: State['data']) => {
      dispatch({ type: 'triggerClicked', payload: { data } });
    },
    onClose: () => {
      dispatch({ type: 'close' });
    },
  };

  return (
    <Provider value={value}>
      <Dialog.Root modal={false} open={open} onOpenChange={noop} {...props}>
        <div
          onClick={() => {
            if (open) {
              value.onClose();
            }
          }}
        >
          {children}
        </div>
        <Dialog.Content
          className={clsx(
            'bg-grey-00 absolute right-0 top-0 bottom-0 flex w-full flex-col shadow',
            'max-w-xs gap-4 p-4 lg:max-w-sm lg:gap-8 lg:p-8',
            'radix-state-open:animate-slideRightAndFadeIn radix-state-closed:animate-slideRightAndFadeOut'
          )}
        >
          <Dialog.Title className="text-grey-100 text-l flex flex-row items-center gap-2 font-bold">
            <Variable height="24px" width="24px" />
            <span className="w-full capitalize">{getTitle(data)}</span>
            <Dialog.Close asChild onClick={value.onClose}>
              <button aria-label="Close">
                <Cross height="24px" width="24px" />
              </button>
            </Dialog.Close>
          </Dialog.Title>
          <Content data={data} />
        </Dialog.Content>
      </Dialog.Root>
    </Provider>
  );
}

function useGetTitle() {
  const { t } = useTranslation(scenarioI18n);

  return useCallback(
    (data: State['data']) => {
      if (!data) return null;
      switch (data.type) {
        case 'formulaAggregation':
          return t('scenarios:rules.variable.title');
        default:
          assertNever('[ScenarioRightPannel] unknwon data case:', data.type);
      }
    },
    [t]
  );
}

function Content({ data }: { data: State['data'] }) {
  if (!data) return null;

  switch (data.type) {
    case 'formulaAggregation':
      return (
        <FormulaAggregation.PannelContent
          formulaAggregation={data.formulaAggregation}
        />
      );
    default:
      assertNever('[ScenarioRightPannel] unknwon data case:', data.type);
  }
}

function ScenarioRightPannelTrigger({
  children,
  data,
}: {
  children: React.ReactNode;
  data: State['data'];
}) {
  const { onTriggerClick } = useActions();
  return (
    <Dialog.Trigger
      onClick={(e) => {
        onTriggerClick(data);
        e.stopPropagation();
      }}
    >
      {children}
    </Dialog.Trigger>
  );
}

export const ScenarioRightPannel = {
  Provider: ScenarioRightPannelProvider,
  Trigger: ScenarioRightPannelTrigger,
};
