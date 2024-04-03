import { isFuzzyMatchComparator } from '@app-builder/models';
import { type FuzzyMatchAlgorithm } from '@app-builder/models/fuzzy-match';
import { type EvaluationError } from '@app-builder/models/node-evaluation';
import {
  adaptAstNodeFromEditorViewModel,
  type EditorNodeViewModel,
} from '@app-builder/services/editor/ast-editor';

export interface FuzzyMatchComparatorEditorNodeViewModel {
  nodeId: string;
  funcName: '>';
  constant?: undefined;
  errors: EvaluationError[];
  children: [
    FuzzyMatchEditorNodeViewModel,
    {
      nodeId: string;
      funcName: null;
      constant?: number;
      errors: EvaluationError[];
      children: [];
      namedChildren: Record<string, never>;
      parent: FuzzyMatchComparatorEditorNodeViewModel;
    },
  ];
  namedChildren: Record<string, never>;
  parent: EditorNodeViewModel;
}
export interface FuzzyMatchEditorNodeViewModel {
  nodeId: string;
  funcName: 'FuzzyMatch' | 'FuzzyMatchAnyOf';
  constant?: undefined;
  errors: EvaluationError[];
  children: [EditorNodeViewModel, EditorNodeViewModel];
  namedChildren: {
    algorithm: {
      nodeId: string;
      funcName: null;
      constant?: FuzzyMatchAlgorithm;
      errors: EvaluationError[];
      children: [];
      namedChildren: Record<string, never>;
      parent: null;
    };
  };
  parent: FuzzyMatchComparatorEditorNodeViewModel;
}

export const isFuzzyMatchComparatorEditorNodeViewModel = (
  vm: EditorNodeViewModel,
): vm is FuzzyMatchComparatorEditorNodeViewModel => {
  const astNode = adaptAstNodeFromEditorViewModel(vm);
  return isFuzzyMatchComparator(astNode);
};
