import {
  type AstNode,
  type FuzzyMatchComparatorAstNode,
} from '@app-builder/models';
import {
  adaptFuzzyMatchComparatorLevel,
  adaptFuzzyMatchComparatorThreshold,
  defaultEditableFuzzyMatchAlgorithm,
  defaultFuzzyMatchComparatorThreshold,
  type FuzzyMatchAlgorithm,
  type FuzzyMatchComparatorLevel,
} from '@app-builder/models/fuzzy-match';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
import {
  useDataModel,
  useTriggerObjectTable,
} from '@app-builder/services/editor/options';
import { type AstNodeErrors } from '@app-builder/services/validation/ast-node-validation';
import * as React from 'react';

type EditFuzzyMatchComparatorState = {
  algorithm: { value: FuzzyMatchAlgorithm; errors: EvaluationError[] };
  threshold:
    | {
        mode: 'threshold';
        value: number;
        errors: EvaluationError[];
      }
    | {
        mode: 'level';
        value: number;
        level: FuzzyMatchComparatorLevel;
        errors: EvaluationError[];
      };
  left: {
    astNode: AstNode;
    astNodeErrors?: AstNodeErrors;
  };
  right: {
    astNode: AstNode;
    astNodeErrors?: AstNodeErrors;
  };
  errors: EvaluationError[];
  funcName: 'FuzzyMatch' | 'FuzzyMatchAnyOf';
};
type EditFuzzyMatchComparatorAction =
  | {
      type: 'setAlgorithm';
      payload: { algorithm: FuzzyMatchAlgorithm };
    }
  | {
      type: 'setThreshold';
      payload: { threshold: number };
    }
  | {
      type: 'setLevel';
      payload: { level: FuzzyMatchComparatorLevel };
    }
  | {
      type: 'setLeft';
      payload: { left: AstNode };
    }
  | {
      type: 'setRight';
      payload: {
        right: AstNode;
        funcName: 'FuzzyMatch' | 'FuzzyMatchAnyOf';
      };
    };

function editFuzzyMatchComparatorReducer(
  prevState: EditFuzzyMatchComparatorState,
  action: EditFuzzyMatchComparatorAction,
): EditFuzzyMatchComparatorState {
  switch (action.type) {
    case 'setAlgorithm': {
      return {
        ...prevState,
        algorithm: {
          value: action.payload.algorithm,
          errors: [],
        },
      };
    }
    case 'setThreshold': {
      return {
        ...prevState,
        threshold: {
          mode: 'threshold',
          value: action.payload.threshold,
          errors: [],
        },
      };
    }
    case 'setLevel': {
      return {
        ...prevState,
        threshold: {
          mode: 'level',
          value: adaptFuzzyMatchComparatorThreshold(action.payload.level),
          level: action.payload.level,
          errors: [],
        },
      };
    }
    case 'setLeft': {
      return {
        ...prevState,
        left: { astNode: action.payload.left },
        errors: prevState.errors.filter((error) => error.argumentIndex !== 0),
      };
    }
    case 'setRight': {
      return {
        ...prevState,
        right: { astNode: action.payload.right },
        funcName: action.payload.funcName,
        errors: prevState.errors.filter((error) => error.argumentIndex !== 1),
      };
    }
  }
}

function adaptEditFuzzyMatchComparatorState({
  initialFuzzyMatchComparatorAstNode,
  initialAstNodeErrors,
}: {
  initialFuzzyMatchComparatorAstNode: FuzzyMatchComparatorAstNode;
  initialAstNodeErrors: AstNodeErrors;
}): EditFuzzyMatchComparatorState {
  const algorithmNode =
    initialFuzzyMatchComparatorAstNode.children[0].namedChildren.algorithm;
  const algorithmErrors =
    initialAstNodeErrors.children[0]?.namedChildren['algorithm']?.errors ?? [];

  const thresholdNode = initialFuzzyMatchComparatorAstNode.children[1];
  const initialThreshold =
    thresholdNode.constant ?? defaultFuzzyMatchComparatorThreshold;
  const initialLevel = adaptFuzzyMatchComparatorLevel(initialThreshold);
  const thresholdErrors = initialAstNodeErrors.children[1]?.errors ?? [];

  const fuzzyMatchNode = initialFuzzyMatchComparatorAstNode.children[0];
  const fuzzyMatchNodeErrors = initialAstNodeErrors.children[0];

  return {
    algorithm: {
      value: algorithmNode.constant ?? defaultEditableFuzzyMatchAlgorithm,
      errors: algorithmErrors,
    },
    threshold:
      initialLevel === undefined
        ? {
            mode: 'threshold',
            value: initialThreshold,
            errors: thresholdErrors,
          }
        : {
            mode: 'level',
            value: initialThreshold,
            level: initialLevel,
            errors: thresholdErrors,
          },
    left: {
      astNode: fuzzyMatchNode.children[0],
      astNodeErrors: fuzzyMatchNodeErrors?.children[0],
    },
    right: {
      astNode: fuzzyMatchNode.children[1],
      astNodeErrors: fuzzyMatchNodeErrors?.children[1],
    },
    errors: fuzzyMatchNodeErrors?.errors ?? [],
    funcName: fuzzyMatchNode.name,
  };
}

export function useFuzzyMatchComparatorEditState(
  initialFuzzyMatchComparatorAstNode: FuzzyMatchComparatorAstNode,
  initialAstNodeErrors: AstNodeErrors,
) {
  const [state, dispatch] = React.useReducer(
    editFuzzyMatchComparatorReducer,
    { initialFuzzyMatchComparatorAstNode, initialAstNodeErrors },
    adaptEditFuzzyMatchComparatorState,
  );
  const dataModel = useDataModel();
  const triggerObjectTable = useTriggerObjectTable();

  return {
    algorithm: state.algorithm,
    setAlgorithm: (algorithm: FuzzyMatchAlgorithm) => {
      dispatch({ type: 'setAlgorithm', payload: { algorithm } });
    },
    threshold: state.threshold,
    setThreshold: (threshold: number) => {
      dispatch({ type: 'setThreshold', payload: { threshold } });
    },
    setLevel: (level: FuzzyMatchComparatorLevel) => {
      dispatch({ type: 'setLevel', payload: { level } });
    },
    left: state.left,
    setLeft: (left: AstNode) => {
      dispatch({
        type: 'setLeft',
        payload: {
          left,
        },
      });
    },
    right: state.right,
    setRight: (right: AstNode) => {
      dispatch({
        type: 'setRight',
        payload: {
          right,
          funcName:
            getAstNodeDataType(right, {
              dataModel,
              triggerObjectTable,
            }) === 'String'
              ? 'FuzzyMatch'
              : 'FuzzyMatchAnyOf',
        },
      });
    },
    funcName: state.funcName,
    errors: [
      ...state.errors,
      ...(state.left.astNodeErrors?.errors ?? []),
      ...(state.right.astNodeErrors?.errors ?? []),
    ],
  };
}
