import { type AstNode, type IsRoundedAstNode } from '@app-builder/models';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useReducer } from 'react';

type EditIsRoundedState = {
  value: {
    astNode: AstNode;
    astNodeErrors?: AstNodeErrors;
  };
  threshold: {
    value: number;
    astNodeErrors?: EvaluationError[];
  };
};

type EditIsRoundedAction =
  | { type: 'setValue'; payload: { value: AstNode } }
  | { type: 'setThreshold'; payload: { threshold: number } };

const editIsRoundedReducer = (
  prevState: EditIsRoundedState,
  action: EditIsRoundedAction,
): EditIsRoundedState => {
  switch (action.type) {
    case 'setValue':
      return {
        ...prevState,
        value: {
          astNode: action.payload.value,
          astNodeErrors: undefined,
        },
      };
    case 'setThreshold':
      return {
        ...prevState,
        threshold: {
          value: action.payload.threshold,
          astNodeErrors: [],
        },
      };
  }
};

const adaptIsRoundedState = ({
  initialState,
  initialErrors,
}: {
  initialState: IsRoundedAstNode;
  initialErrors: AstNodeErrors;
}): EditIsRoundedState => {
  const valueNode = initialState.namedChildren.value;
  const valueErrors = initialErrors.namedChildren['value'];

  const thresholdValue = initialState.namedChildren.threshold.constant ?? 1;
  const thresholdErrors =
    initialErrors.namedChildren['threshold']?.errors ?? [];

  return {
    value: {
      astNode: valueNode,
      astNodeErrors: valueErrors,
    },
    threshold: {
      value: thresholdValue,
      astNodeErrors: thresholdErrors,
    },
  };
};

export const useIsRoundedEditState = (
  initialState: IsRoundedAstNode,
  initialErrors: AstNodeErrors,
) => {
  const [state, dispatch] = useReducer(
    editIsRoundedReducer,
    { initialState, initialErrors },
    adaptIsRoundedState,
  );

  return {
    value: state.value,
    setValue: (value: AstNode) => {
      dispatch({ type: 'setValue', payload: { value } });
    },
    threshold: state.threshold,
    setThreshold: (threshold: number) => {
      dispatch({ type: 'setThreshold', payload: { threshold } });
    },
  };
};
