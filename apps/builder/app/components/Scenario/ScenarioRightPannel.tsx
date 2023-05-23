import { createSimpleContext } from '@marble-front/builder/utils/create-context';
import { assertNever } from '@marble-front/typescript-utils';
import { Variable } from '@marble-front/ui/icons';
import { type DialogTriggerProps } from '@radix-ui/react-dialog';
import { type TFuncKey } from 'i18next';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { createRightPannel, type RightPannelRootProps } from '../RightPannel';
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

const { RightPannel } = createRightPannel('ScenarioRightPannel');

const ScenarioRightPannelTriggerContext = createSimpleContext<{
  onTriggerClick: (data: Pick<State, 'data'>) => void;
}>('ScenarioRightPannelTrigger');

function ScenarioRightPannelRoot({
  children,
  ...props
}: Omit<RightPannelRootProps, 'value'>) {
  const [state, dispatch] = useReducer(
    scenarioRightPannelReducer,
    initialState
  );

  const value = {
    onTriggerClick: (payload: Pick<State, 'data'>) => {
      dispatch({ type: 'triggerClicked', payload });
    },
  };

  return (
    <ScenarioRightPannelTriggerContext.Provider value={value}>
      <RightPannel.Root
        {...props}
        open={state.open}
        onClose={() => {
          dispatch({ type: 'close' });
        }}
      >
        <RightPannel.Viewport>{children}</RightPannel.Viewport>
        <ScenarioRightPannelContent data={state.data} />
      </RightPannel.Root>
    </ScenarioRightPannelTriggerContext.Provider>
  );
}

function ScenarioRightPannelContent({ data }: { data: State['data'] }) {
  const { t } = useTranslation(scenarioI18n);

  if (!data) return null;

  return (
    <RightPannel.Content className="max-w-xs lg:max-w-sm">
      <RightPannel.Title>
        <Variable height="24px" width="24px" />
        <span className="w-full capitalize">
          {t(titleK[data.type]) ?? data.type}
        </span>
        <RightPannel.Close />
      </RightPannel.Title>
      <ScenarioRightPannelDetail data={data} />
    </RightPannel.Content>
  );
}

const titleK: Record<
  NonNullable<State['data']>['type'],
  TFuncKey<['scenarios']>
> = {
  formulaAggregation: 'scenarios:rules.variable.title',
};

function ScenarioRightPannelDetail({
  data,
}: {
  data: NonNullable<State['data']>;
}) {
  switch (data.type) {
    case 'formulaAggregation':
      return null;
    default:
      assertNever('[ScenarioRightPannel] unknwon data case:', data.type);
  }
}

function ScenarioRightPannelTrigger({
  onClick,
  data,
  ...otherProps
}: {
  data: Pick<State, 'data'>;
} & DialogTriggerProps) {
  const { onTriggerClick } = ScenarioRightPannelTriggerContext.useValue();

  return (
    <RightPannel.Trigger
      onClick={(e) => {
        onTriggerClick(data);
        onClick?.(e);
        e.stopPropagation();
      }}
      {...otherProps}
    />
  );
}

export const ScenarioRightPannel = {
  Root: ScenarioRightPannelRoot,
  Trigger: ScenarioRightPannelTrigger,
};
