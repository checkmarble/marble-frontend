import { type AstNode } from '@app-builder/models';
import { type IsMultipleOfAstNode } from '@app-builder/models/astNode/multiple-of';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import { useReducer } from 'react';

type EditIsMultipleOfState = {
  value: {
    astNode: AstNode;
    astNodeErrors?: AstNodeErrors;
  };
  divider: {
    value: number;
    astNodeErrors?: EvaluationError[];
  };
};

type EditIsMultipleOfAction =
  | { type: 'setValue'; payload: { value: AstNode } }
  | { type: 'setDivider'; payload: { divider: number } };

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
    case 'setDivider':
      return {
        ...prevState,
        divider: {
          value: action.payload.divider,
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

  const dividerValue = initialState.namedChildren.divider.constant ?? 1;
  const dividerErrors = initialErrors.namedChildren['divider']?.errors ?? [];

  return {
    value: {
      astNode: valueNode,
      astNodeErrors: valueErrors,
    },
    divider: {
      value: dividerValue,
      astNodeErrors: dividerErrors,
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
    divider: state.divider,
    setDivider: (divider: number) => {
      dispatch({ type: 'setDivider', payload: { divider } });
    },
  };
};
