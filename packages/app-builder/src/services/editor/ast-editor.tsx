import { type AstNode } from '@app-builder/models';
import {
  NewNodeEvaluation,
  type NodeEvaluation,
  type ReturnValue,
} from '@app-builder/models/node-evaluation';
import { createSimpleContext } from '@app-builder/utils/create-context';
import { useCallbackRef } from '@app-builder/utils/hooks';
import {
  getAtPath,
  getParentPath,
  type ParentPath,
  parsePath,
  type Path,
  removeAtPath,
  setAtPath,
  type Tree,
} from '@app-builder/utils/tree';
import * as React from 'react';
import { createStore, type StoreApi, useStore } from 'zustand';

import {
  adaptEvaluationErrorViewModels,
  useGetNodeEvaluationErrorMessage,
  useGetOrAndNodeEvaluationErrorMessage,
} from '../validation';
import {
  computeLineErrors,
  findArgumentErrorsFromParent,
  getAstNodeEvaluationErrors,
  getValidationStatus,
  separateChildrenErrors,
} from '../validation/ast-node-validation';
import { useGetEnumValuesFromNeighbour } from './options';

type AstNodeEditorState = {
  rootAstNode: AstNode;
  rootEvaluation: NodeEvaluation;
};

interface AstNodeEditorActions {
  setAstNodeAtPath: (stringPath: string, astNode: AstNode) => void;
  setOperatorAtPath: (stringPath: string, name: string) => void;
  appendChild: (stringPath: string, childAst: AstNode) => void;
  remove: (stringPath: string) => void;
}

type AstNodeEditorStore = AstNodeEditorState & {
  actions: AstNodeEditorActions;
};

export type AstEditorStore = StoreApi<AstNodeEditorStore>;

const AstNodeEditorContext = createSimpleContext<AstEditorStore>(
  'AstNodeEditorContext',
);

export function useAstNodeEditor({
  initialAstNode,
  initialEvaluation,
}: {
  initialAstNode: AstNode;
  initialEvaluation?: NodeEvaluation;
}) {
  const [store] = React.useState(() =>
    createStore<AstNodeEditorStore>((set, get) => ({
      ...createInitialState({ initialAstNode, initialEvaluation }),
      actions: {
        setAstNodeAtPath: (stringPath, newAstNode) => {
          const { rootAstNode } = get();
          const path = parsePath(stringPath);
          set({
            rootAstNode: setAtPath(rootAstNode, path, newAstNode),
          });
        },
        setOperatorAtPath: (stringPath, name) => {
          const { rootAstNode } = get();
          const path = parsePath(stringPath);
          const currentNode = getAtPath(rootAstNode, path);
          if (!currentNode) {
            // No node at this path
            return;
          }
          set({
            rootAstNode: setAtPath(rootAstNode, path, {
              ...currentNode,
              name,
            }),
          });
        },
        appendChild: (stringPath, childAst) => {
          const { rootAstNode } = get();
          const path = parsePath(stringPath);
          const currentAstNode = getAtPath(rootAstNode, path);
          if (!currentAstNode) {
            // No node at this path
            return;
          }
          set({
            rootAstNode: setAtPath(rootAstNode, path, {
              ...currentAstNode,
              children: [...currentAstNode.children, childAst],
            }),
          });
        },
        remove: (stringPath) => {
          const { rootAstNode, rootEvaluation } = get();
          const path = parsePath(stringPath);
          set({
            rootAstNode: removeAtPath(rootAstNode, path),
            rootEvaluation: removeAtPath(
              rootEvaluation,
              path,
              NewNodeEvaluation(),
            ),
          });
        },
      },
    })),
  );

  return store;
}

export function AstNodeEditorProvider({
  children,
  store,
}: {
  children: React.ReactNode;
  store: AstEditorStore;
}) {
  return (
    <AstNodeEditorContext.Provider value={store}>
      {children}
    </AstNodeEditorContext.Provider>
  );
}

function createInitialState(initialState: {
  initialAstNode: AstNode;
  initialEvaluation?: NodeEvaluation;
}): AstNodeEditorState {
  return {
    rootAstNode: initialState.initialAstNode,
    rootEvaluation: initialState.initialEvaluation ?? NewNodeEvaluation(),
  };
}

function useAstNodeEditorStore<Out>(
  selector: (state: AstNodeEditorStore) => Out,
) {
  const store = AstNodeEditorContext.useValue();
  return useStore(store, selector);
}

export function useSaveAstNode(
  store: AstEditorStore,
  onSave: (astNode: AstNode) => void,
) {
  const onSaveCallbackRef = useCallbackRef(onSave);
  return React.useCallback(() => {
    const { rootAstNode } = store.getState();
    onSaveCallbackRef(rootAstNode);
  }, [onSaveCallbackRef, store]);
}

export function useValidateAstNode(
  store: AstEditorStore,
  validate: (astNode: AstNode) => void,
  validation: NodeEvaluation | null,
) {
  const validateRef = useCallbackRef(validate);
  const astNode = useStore(store, (state) => state.rootAstNode);

  React.useEffect(() => {
    validateRef(astNode);
  }, [astNode, validateRef]);

  React.useEffect(() => {
    if (!validation) return;
    store.setState({
      rootEvaluation: validation,
    });
  }, [store, validation]);
}

export function useAstNodeEditorActions() {
  return useAstNodeEditorStore((state) => state.actions);
}

export function useRootAstNode(): AstNode {
  return useAstNodeEditorStore((state) => state.rootAstNode);
}

export function usePath(stringPath: string) {
  return React.useMemo(() => parsePath(stringPath), [stringPath]);
}

function useParentPath(path: Path) {
  return React.useMemo(() => {
    return getParentPath(path);
  }, [path]);
}

export function useAstNode(stringPath: string) {
  const path = usePath(stringPath);
  const rootAstNode = useRootAstNode();
  return React.useMemo(() => {
    return getAtPath(rootAstNode, path);
  }, [path, rootAstNode]);
}

function useParentAstNode(parentPath: ParentPath) {
  const rootAstNode = useRootAstNode();
  return React.useMemo(() => {
    if (!parentPath) return undefined;
    return getAtPath(rootAstNode, parentPath.path);
  }, [parentPath, rootAstNode]);
}

export function useEnumValuesFromNeighbour(stringPath: string) {
  const getEnumValuesFromNeighbour = useGetEnumValuesFromNeighbour();
  const path = usePath(stringPath);
  const parentPath = useParentPath(path);
  const parentAstNode = useParentAstNode(parentPath);
  return React.useMemo(() => {
    if (!parentAstNode || !parentPath) return [];
    const { childPathSegment } = parentPath;
    if (childPathSegment?.type !== 'children') return [];
    return getEnumValuesFromNeighbour(parentAstNode, childPathSegment.index);
  }, [getEnumValuesFromNeighbour, parentAstNode, parentPath]);
}

export function useEvaluation(stringPath: string) {
  const path = usePath(stringPath);
  const rootEvaluation = useAstNodeEditorStore((state) => state.rootEvaluation);
  return React.useMemo(() => {
    return getAtPath(rootEvaluation, path);
  }, [path, rootEvaluation]);
}

function useParentEvaluation(parentPath: ParentPath) {
  const rootEvaluation = useAstNodeEditorStore((state) => state.rootEvaluation);
  return React.useMemo(() => {
    if (!parentPath) return undefined;
    return getAtPath(rootEvaluation, parentPath.path);
  }, [parentPath, rootEvaluation]);
}

export function useEvaluationErrors(stringPath: string) {
  const astNode = useAstNode(stringPath);
  const evaluation = useEvaluation(stringPath);
  return React.useMemo(() => {
    if (!astNode || !evaluation) return [];
    return getAstNodeEvaluationErrors(astNode, evaluation);
  }, [astNode, evaluation]);
}

export function useParentEvaluationErrors(parentPath: ParentPath) {
  const parentAstNode = useParentAstNode(parentPath);
  const parentEvaluation = useParentEvaluation(parentPath);
  return React.useMemo(() => {
    if (!parentAstNode || !parentEvaluation) return [];
    return getAstNodeEvaluationErrors(parentAstNode, parentEvaluation);
  }, [parentAstNode, parentEvaluation]);
}

export function useRootOrAndValidation(stringPath: string) {
  const getOrAndNodeEvaluationErrorMessage =
    useGetOrAndNodeEvaluationErrorMessage();
  const errors = useEvaluationErrors(stringPath);
  return React.useMemo(() => {
    const { nodeErrors } = separateChildrenErrors(errors);
    const errorMessages = adaptEvaluationErrorViewModels(nodeErrors).map(
      getOrAndNodeEvaluationErrorMessage,
    );
    return { errorMessages };
  }, [errors, getOrAndNodeEvaluationErrorMessage]);
}

export function useRootOrAndChildValidation(stringPath: string) {
  const getNodeEvaluationErrorMessage = useGetNodeEvaluationErrorMessage();
  const path = usePath(stringPath);
  const astNode = useAstNode(stringPath);
  const evaluation = useEvaluation(stringPath);
  const parentPath = useParentPath(path);
  const parentAstNode = useParentAstNode(parentPath);
  const parentEvaluation = useParentEvaluation(parentPath);
  return React.useMemo(() => {
    const lineErrors =
      astNode && evaluation ? computeLineErrors(astNode, evaluation) : [];
    const argumentIndexErrorsFromParent =
      parentAstNode && parentEvaluation && parentPath?.childPathSegment
        ? findArgumentErrorsFromParent(
            parentPath?.childPathSegment,
            getAstNodeEvaluationErrors(parentAstNode, parentEvaluation),
          )
        : [];

    const errorMessages = adaptEvaluationErrorViewModels([
      ...lineErrors,
      ...argumentIndexErrorsFromParent,
    ]).map((error) => getNodeEvaluationErrorMessage(error));

    return {
      errorMessages,
      hasArgumentIndexErrorsFromParent:
        argumentIndexErrorsFromParent.length > 0,
    };
  }, [
    astNode,
    evaluation,
    parentAstNode,
    parentEvaluation,
    parentPath?.childPathSegment,
    getNodeEvaluationErrorMessage,
  ]);
}

export function useValidationStatus(
  stringPath: string,
  returnValue?: ReturnValue,
) {
  const path = usePath(stringPath);
  const evaluationErrors = useEvaluationErrors(stringPath);
  const parentPath = useParentPath(path);
  const parentNode = useParentAstNode(parentPath);
  const isDivByZeroField =
    isDivisionDenominator(parentNode, path) &&
    !returnValue?.isOmitted &&
    returnValue?.value === 0;

  const parentEvaluationErrors = useParentEvaluationErrors(parentPath);
  const valueIsNull = !returnValue?.isOmitted && returnValue?.value === null;
  return React.useMemo(() => {
    return getValidationStatus({
      evaluationErrors,
      valueIsNull,
      isDivByZeroField,
      parentEvaluationErrors,
      pathSegment: parentPath?.childPathSegment,
    });
  }, [
    evaluationErrors,
    isDivByZeroField,
    parentEvaluationErrors,
    parentPath?.childPathSegment,
    valueIsNull,
  ]);
}

function isDivisionDenominator(
  parentNode: Tree<AstNode> | undefined,
  path: Path,
) {
  if (path.length === 0) {
    return false;
  }
  const pathLastPart = path[path.length - 1];
  if (!pathLastPart) {
    return false;
  }
  if (pathLastPart.type !== 'children') {
    return false;
  }

  return (
    parentNode?.name === '/' &&
    pathLastPart.type === 'children' &&
    pathLastPart.index === 1
  );
}
