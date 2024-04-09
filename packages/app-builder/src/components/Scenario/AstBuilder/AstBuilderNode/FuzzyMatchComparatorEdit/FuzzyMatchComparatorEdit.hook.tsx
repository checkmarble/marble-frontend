import { type AstNode } from '@app-builder/models';
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
  useAdaptEditableAstNode,
  useOperandOptions,
} from '@app-builder/services/ast-node/options';
import {
  adaptEditorNodeViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';
import { useMemo, useReducer } from 'react';

import { type FuzzyMatchComparatorEditorNodeViewModel } from './FuzzyMatchComparatorEdit.types';

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
  left: EditorNodeViewModel;
  right: EditorNodeViewModel;
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
      payload: { left: EditorNodeViewModel };
    }
  | {
      type: 'setRight';
      payload: {
        right: EditorNodeViewModel;
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
  initialFuzzyMatchComparatorEditorNodeViewModel: FuzzyMatchComparatorEditorNodeViewModel,
): EditFuzzyMatchComparatorState {
  const algorithmNode =
    initialFuzzyMatchComparatorEditorNodeViewModel.children[0].namedChildren
      .algorithm;

  const thresholdNode =
    initialFuzzyMatchComparatorEditorNodeViewModel.children[1];
  const initialThreshold =
    thresholdNode.constant ?? defaultFuzzyMatchComparatorThreshold;
  const initialLevel = adaptFuzzyMatchComparatorLevel(initialThreshold);

  const fuzzyMatchNode =
    initialFuzzyMatchComparatorEditorNodeViewModel.children[0];

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
    funcName: fuzzyMatchNode.funcName,
  };
}

export function useFuzzyMatchComparatorEditState(
  initialFuzzyMatchComparatorEditorNodeViewModel: FuzzyMatchComparatorEditorNodeViewModel,
) {
  const [state, dispatch] = useReducer(
    editFuzzyMatchComparatorReducer,
    initialFuzzyMatchComparatorEditorNodeViewModel,
    adaptEditFuzzyMatchComparatorState,
  );

  const adaptEditableAstNode = useAdaptEditableAstNode();

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
          left: adaptEditorNodeViewModel({
            ast,
          }),
        },
      });
    },
    right: state.right,
    setRight: (ast: AstNode) => {
      const right = adaptEditorNodeViewModel({
        ast,
      });
      dispatch({
        type: 'setRight',
        payload: {
          right,
          funcName:
            adaptEditableAstNode(right)?.dataType === 'String'
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
  initialFuzzyMatchComparatorEditorNodeViewModel: FuzzyMatchComparatorEditorNodeViewModel,
) {
  const options = useOperandOptions({
    operandViewModel:
      initialFuzzyMatchComparatorEditorNodeViewModel.children[0].children[0],
  });
  return useMemo(
    () => options.filter((option) => option.dataType === 'String'),
    [options],
  );
}

export function useRightOptions(
  initialFuzzyMatchComparatorEditorNodeViewModel: FuzzyMatchComparatorEditorNodeViewModel,
) {
  const options = useOperandOptions({
    operandViewModel:
      initialFuzzyMatchComparatorEditorNodeViewModel.children[0].children[1],
  });
  return useMemo(
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
