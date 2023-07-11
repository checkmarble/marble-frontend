import { createSimpleContext } from '@app-builder/utils/create-context';
import { type DialogTriggerProps } from '@radix-ui/react-dialog';
import { assertNever } from '@typescript-utils';
import { Variable } from '@ui-icons';
import { type ParseKeys } from 'i18next';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { createRightPanel, type RightPanelRootProps } from '../RightPanel';
import { scenarioI18n } from './scenario-i18n';

type State = {
  open: boolean;
  data?: {
    type: 'formulaAggregation';
    formulaAggregation: unknown;
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

function scenarioRightPanelReducer(prevState: State, action: Actions) {
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

const { RightPanel } = createRightPanel('ScenarioRightPanel');

const ScenarioRightPanelTriggerContext = createSimpleContext<{
  onTriggerClick: (data: Pick<State, 'data'>) => void;
}>('ScenarioRightPanelTrigger');

function ScenarioRightPanelRoot({
  children,
  ...props
}: Omit<RightPanelRootProps, 'open' | 'onClose'>) {
  const [state, dispatch] = useReducer(scenarioRightPanelReducer, initialState);

  const value = {
    onTriggerClick: (payload: Pick<State, 'data'>) => {
      dispatch({ type: 'triggerClicked', payload });
    },
  };

  return (
    <ScenarioRightPanelTriggerContext.Provider value={value}>
      <RightPanel.Root
        {...props}
        open={state.open}
        onClose={() => {
          dispatch({ type: 'close' });
        }}
      >
        <RightPanel.Viewport>{children}</RightPanel.Viewport>
        <ScenarioRightPanelContent data={state.data} />
      </RightPanel.Root>
    </ScenarioRightPanelTriggerContext.Provider>
  );
}

function ScenarioRightPanelContent({ data }: { data: State['data'] }) {
  const { t } = useTranslation(scenarioI18n);

  if (!data) return null;

  return (
    <RightPanel.Content className="max-w-xs lg:max-w-sm">
      <RightPanel.Title>
        <Variable height="24px" width="24px" />
        <span className="w-full capitalize">
          {t(titleK[data.type]) ?? data.type}
        </span>
        <RightPanel.Close />
      </RightPanel.Title>
      <ScenarioRightPanelDetail data={data} />
    </RightPanel.Content>
  );
}

const titleK: Record<
  NonNullable<State['data']>['type'],
  ParseKeys<['scenarios']>
> = {
  formulaAggregation: 'scenarios:rules.variable.title',
};

function ScenarioRightPanelDetail({
  data,
}: {
  data: NonNullable<State['data']>;
}) {
  switch (data.type) {
    case 'formulaAggregation':
      return null;
    default:
      assertNever('[ScenarioRightPanel] unknwon data case:', data.type);
  }
}

function ScenarioRightPanelTrigger({
  onClick,
  data,
  ...otherProps
}: {
  data: Pick<State, 'data'>;
} & DialogTriggerProps) {
  const { onTriggerClick } = ScenarioRightPanelTriggerContext.useValue();

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

export const ScenarioRightPanel = {
  Root: ScenarioRightPanelRoot,
  Trigger: ScenarioRightPanelTrigger,
};
