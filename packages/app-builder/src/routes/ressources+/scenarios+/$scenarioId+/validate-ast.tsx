import { type AstNode } from '@app-builder/models';
import {
  isKnownOperandAstNode,
  isLeafOperandAstNode,
} from '@app-builder/models/astNode/builder-ast-node';
import {
  type EvaluationError,
  type NodeEvaluation,
  type ReturnValue,
  type ReturnValueType,
} from '@app-builder/models/node-evaluation';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useCallback } from 'react';
import * as R from 'remeda';

export type AstValidationPayload = {
  node: AstNode;
  expectedReturnType?: ReturnValueType;
};

type UnifiedEvalutionError = {
  error: EvaluationError['error'];
  message: string;
  path: string | undefined;
};

function adaptUnifiedEvaluationError(
  error: EvaluationError | UnifiedEvalutionError,
): UnifiedEvalutionError {
  return {
    error: error.error,
    message: error.message,
    path:
      error.path ??
      (error as EvaluationError).argumentIndex?.toString() ??
      (error as EvaluationError).argumentName,
  };
}

function getErrorsForChild(errors: UnifiedEvalutionError[], indexOrKey: string) {
  return R.pipe(
    errors,
    R.filter((err) => {
      if (err.path === undefined) return false;
      return err.path === indexOrKey || err.path.startsWith(`${indexOrKey}.`);
    }),
    R.map((err) => {
      let fieldPath = err.path;
      if (fieldPath != undefined) {
        if (fieldPath === indexOrKey) {
          fieldPath = undefined;
        } else if (fieldPath?.toString().startsWith(`${indexOrKey}.`)) {
          fieldPath = (fieldPath as string).replace(new RegExp(`^${indexOrKey}\\.`), '');
        }
      }
      return { ...err, path: fieldPath };
    }),
  );
}

export type FlatNodeEvaluation = {
  returnValue: ReturnValue;
  errors: EvaluationError[];
  skipped?: boolean;
  nodeId: string;
  relatedIds: string[];
};
export function generateFlatEvaluation(
  node: AstNode,
  evaluation: NodeEvaluation,
  relatedIds: string[] = [],
): FlatNodeEvaluation[] {
  const isOperandNode = isKnownOperandAstNode(node);
  const errors = R.map(evaluation.errors, adaptUnifiedEvaluationError);

  const currentRelatedId = isOperandNode ? [node.id] : [...relatedIds, node.id];

  const childrenEvaluations = node.children.flatMap((childNode, i) => {
    const childEvaluation = evaluation.children[i];
    if (!childEvaluation) return [];

    const childErrorsFromParent = getErrorsForChild(errors, i.toString());
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent],
    };

    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });

  const namedChildrenEvaluations = R.entries(node.namedChildren).flatMap(([key, childNode]) => {
    const childEvaluation = evaluation.namedChildren[key];
    if (!childEvaluation) return [];

    const childErrorsFromParent = getErrorsForChild(errors, key);
    const childEvaluationWithParentError = {
      ...childEvaluation,
      errors: [...childEvaluation.errors, ...childErrorsFromParent],
    };

    return generateFlatEvaluation(childNode, childEvaluationWithParentError, currentRelatedId);
  });

  const hasChildError =
    childrenEvaluations.filter((e) => e.errors.length > 0).length > 0 ||
    namedChildrenEvaluations.filter((e) => e.errors.length > 0).length > 0;

  const currentErrors: EvaluationError[] = [
    ...errors.filter((err) => !err.path),
    ...(hasChildError && isLeafOperandAstNode(node)
      ? [{ error: 'FUNCTION_ERROR' as const, message: 'function has error' }]
      : []),
  ];
  const currentNodeEvaluation: FlatNodeEvaluation = {
    returnValue: evaluation.returnValue,
    errors: currentErrors,
    skipped: evaluation.skipped,
    nodeId: node.id,
    relatedIds: [...relatedIds, node.id],
  };

  return [currentNodeEvaluation, ...childrenEvaluations, ...namedChildrenEvaluations];
}

export type AstValidationFunction = (
  node: AstNode,
  expectedReturnType?: ReturnValueType,
) => Promise<NodeEvaluation>;

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const body = (await request.json()) as AstValidationPayload;

  try {
    const res = await scenario.validateAst(scenarioId, {
      node: body.node,
      expectedReturnType: body.expectedReturnType,
    });

    // Reformating evaluation based on ast node ids
    const flatEval = generateFlatEvaluation(body.node, res);

    return Response.json({ original: res, flat: flatEval });
  } catch (error) {
    // TODO: manage error
    console.log('an error happened', error);
    throw error;
  }
}

export function useAstValidationFetcher(scenarioId: string) {
  const { submit, data } = useFetcher<{ original: NodeEvaluation; flat: FlatNodeEvaluation[] }>();

  const validate = useCallback(
    (ast: AstNode, expectedReturnType?: ReturnValueType) => {
      const args: AstValidationPayload = {
        node: ast,
        expectedReturnType,
      };
      submit(args, {
        method: 'POST',
        encType: 'application/json',
        action: getRoute('/ressources/scenarios/:scenarioId/validate-ast', {
          scenarioId: fromUUID(scenarioId),
        }),
      });
    },
    [submit, scenarioId],
  );

  return {
    validate,
    validation: data ?? undefined,
  };
}
