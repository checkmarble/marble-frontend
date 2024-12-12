import { type AstNode, type IsMultipleOfAstNode } from '@app-builder/models';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useReducer } from 'react';

type EditIsMultipleOfState = {
  value: {
    astNode: AstNode;
    astNodeErrors?: AstNodeErrors;
  };
  threshold: {
    value: number;
    astNodeErrors?: EvaluationError[];
  };
};

type EditIsMultipleOfAction =
  | { type: 'setValue'; payload: { value: AstNode } }
  | { type: 'setThreshold'; payload: { threshold: number } };

const editIsMultipleOfReducer = (
  prevState: EditIsMultipleOfState,
  action: EditIsMultipleOfAction,
): EditIsMultipleOfState => {
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

const adaptIsMultipleOfState = ({
  initialState,
  initialErrors,
}: {
  initialState: IsMultipleOfAstNode;
  initialErrors: AstNodeErrors;
}): EditIsMultipleOfState => {
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

export const useIsMultipleOfEditState = (
  initialState: IsMultipleOfAstNode,
  initialErrors: AstNodeErrors,
) => {
  const [state, dispatch] = useReducer(
    editIsMultipleOfReducer,
    { initialState, initialErrors },
    adaptIsMultipleOfState,
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
