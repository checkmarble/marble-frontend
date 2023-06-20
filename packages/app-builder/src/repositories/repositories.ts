import {
  fetchWithAuthMiddleware,
  marbleApi,
  type TokenService,
} from '@marble-api';
import * as R from 'remeda';

import { adaptFormulaDto, type AstNode } from '../models';

type FunctionKeys<T> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof T]: T[P] extends Function ? P : never;
}[keyof T];

export type MarbleApi = {
  [P in FunctionKeys<typeof marbleApi>]: (typeof marbleApi)[P];
};

export function getMarbleAPIClient({
  tokenService,
  baseUrl,
}: {
  baseUrl: string;
  tokenService: TokenService<string>;
}): MarbleApi {
  const fetch = fetchWithAuthMiddleware({
    tokenService,
    getAuthorizationHeader: (token) => ({
      name: 'Authorization',
      value: `Bearer ${token}`,
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { defaults, servers, ...api } = marbleApi;

  //@ts-expect-error can't infer args
  return R.mapValues(api, (value) => (...args) => {
    // @ts-expect-error can't infer args
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return value(...args, { fetch, baseUrl });
  });
}

export function isOrAndGroup(astNode: AstNode): boolean {
  if (astNode.name !== 'OR') {
    return false;
  }
  for (const child of astNode.children) {
    if (child.name !== 'AND') {
      return false;
    }
  }
  return true;
}

export function wrapInOrAndGroups(astNode: AstNode): AstNode {
  return {
    name: 'OR',
    constant: null,
    children: [
      {
        name: 'AND',
        constant: null,
        children: [astNode],
        namedChildren: {},
      },
    ],
    namedChildren: {},
  };
}

export async function getScenarioIterationRule({
  ruleId,
  tokenService,
  baseUrl,
}: {
  ruleId: string;
  tokenService: TokenService<string>;
  baseUrl: string;
}) {
  const marbleApiClient = getMarbleAPIClient({
    tokenService,
    baseUrl,
  });

  const { formula, ...rule } = await marbleApiClient.getScenarioIterationRule(
    ruleId
  );

  const astNode = adaptFormulaDto(formula);

  const orAndGroupAstNode = isOrAndGroup(astNode)
    ? astNode
    : wrapInOrAndGroups(astNode);

  return { ...rule, astNode: orAndGroupAstNode };
}
