import {
  fetchWithAuthMiddleware,
  marbleApi,
  type TokenService,
} from '@marble-front/api/marble';
import {
  adaptFormulaDto,
  isOrAndGroup,
  wrapInOrAndGroups,
} from '@marble-front/models';
import * as R from 'remeda';

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
    return value(...args, { fetch, baseUrl });
  });
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
