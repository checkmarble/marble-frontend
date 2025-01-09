import { type AstNode } from '@app-builder/models';
import { type ReturnValueType } from '@app-builder/models/node-evaluation';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useCallback } from 'react';

type AstValidationPayload = {
  node: AstNode;
  expectedReturnType?: ReturnValueType;
};

export async function action({ request, params }: ActionFunctionArgs) {
  const { authService } = serverServices;
  const { scenario } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const scenarioId = fromParams(params, 'scenarioId');
  const body = (await request.json()) as AstValidationPayload;

  const res = await scenario.validateAst(scenarioId, {
    node: body.node,
    expectedReturnType: body.expectedReturnType,
  });

  console.dir(res, { depth: null });

  return res;
}

export function useAstValidationFetcher(scenarioId: string) {
  const { submit, data } = useFetcher<typeof action>();

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
