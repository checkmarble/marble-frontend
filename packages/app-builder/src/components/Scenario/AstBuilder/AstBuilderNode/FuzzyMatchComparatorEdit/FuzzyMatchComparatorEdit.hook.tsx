import { type AstNode } from '@app-builder/models';
import {
  adaptAstNodeViewModel,
  type AstNodeViewModel,
  type FuzzyMatchComparatorAstNodeViewModel,
} from '@app-builder/models/ast-node-view-model';
import {
  adaptFuzzyMatchComparatorLevel,
  adaptFuzzyMatchComparatorThreshold,
  defaultEditableFuzzyMatchAlgorithm,
  defaultFuzzyMatchComparatorThreshold,
  type FuzzyMatchAlgorithm,
  type FuzzyMatchComparatorLevel,
} from '@app-builder/models/fuzzy-match';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  useDataModel,
  useOperandOptions,
  useTriggerObjectTable,
} from '@app-builder/services/editor/options';
import { getAstNodeDataType } from '@app-builder/services/ast-node/getAstNodeDataType';
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
  left: AstNodeViewModel;
  right: AstNodeViewModel;
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
      payload: { left: AstNodeViewModel };
    }
  | {
      type: 'setRight';
      payload: {
        right: AstNodeViewModel;
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
        left: action.payload.left,
        errors: prevState.errors.filter((error) => error.argumentIndex !== 0),
      };
    }
    case 'setRight': {
      return {
        ...prevState,
        right: action.payload.right,
        funcName: action.payload.funcName,
        errors: prevState.errors.filter((error) => error.argumentIndex !== 1),
      };
    }
  }
}

function adaptEditFuzzyMatchComparatorState(
  initialFuzzyMatchComparatorAstNodeViewModel: FuzzyMatchComparatorAstNodeViewModel,
): EditFuzzyMatchComparatorState {
  const algorithmNode =
    initialFuzzyMatchComparatorAstNodeViewModel.children[0].namedChildren
      .algorithm;

  const thresholdNode = initialFuzzyMatchComparatorAstNodeViewModel.children[1];
  const initialThreshold =
    thresholdNode.constant ?? defaultFuzzyMatchComparatorThreshold;
  const initialLevel = adaptFuzzyMatchComparatorLevel(initialThreshold);

  const fuzzyMatchNode =
    initialFuzzyMatchComparatorAstNodeViewModel.children[0];

  return {
    algorithm: {
      value: algorithmNode.constant ?? defaultEditableFuzzyMatchAlgorithm,
      errors: algorithmNode.errors,
    },
    threshold:
      initialLevel === undefined
        ? {
            mode: 'threshold',
            value: initialThreshold,
            errors: thresholdNode.errors,
          }
        : {
            mode: 'level',
            value: initialThreshold,
            level: initialLevel,
            errors: thresholdNode.errors,
          },
    left: fuzzyMatchNode.children[0],
    right: fuzzyMatchNode.children[1],
    errors: fuzzyMatchNode.errors,
    funcName: fuzzyMatchNode.name,
  };
}

export function useFuzzyMatchComparatorEditState(
  initialFuzzyMatchComparatorAstNodeViewModel: FuzzyMatchComparatorAstNodeViewModel,
) {
  const [state, dispatch] = React.useReducer(
    editFuzzyMatchComparatorReducer,
    initialFuzzyMatchComparatorAstNodeViewModel,
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
    setLeft: (ast: AstNode) => {
      dispatch({
        type: 'setLeft',
        payload: {
          left: adaptAstNodeViewModel({
            ast,
          }),
        },
      });
    },
    right: state.right,
    setRight: (ast: AstNode) => {
      const right = adaptAstNodeViewModel({
        ast,
      });
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
    errors: [...state.errors, ...state.left.errors, ...state.right.errors],
  };
}

export function useLeftOptions(
  initialFuzzyMatchComparatorAstNodeViewModel: FuzzyMatchComparatorAstNodeViewModel,
) {
  const options = useOperandOptions({
    astNodeVM:
      initialFuzzyMatchComparatorAstNodeViewModel.children[0].children[0],
  });
  return React.useMemo(
    () => options.filter((option) => option.dataType === 'String'),
    [options],
  );
}

export function useRightOptions(
  initialFuzzyMatchComparatorAstNodeViewModel: FuzzyMatchComparatorAstNodeViewModel,
) {
  const options = useOperandOptions({
    astNodeVM:
      initialFuzzyMatchComparatorAstNodeViewModel.children[0].children[1],
  });
  return React.useMemo(
    () =>
      options.filter(
        (option) =>
          option.operandType === 'CustomList' ||
          option.dataType === 'String[]' ||
          option.dataType === 'String',
      ),
    [options],
  );
}
