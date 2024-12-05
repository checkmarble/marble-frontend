import {
  type GetMarbleCoreAPIClientWithAuth,
  type MarbleCoreApi,
} from '@app-builder/infra/marblecore-api';
import {
  type GetTransfercheckAPIClientWithAuth,
  type TransfercheckApi,
} from '@app-builder/infra/transfercheck-api';
import {
  adaptAuthErrors,
  type AuthData,
  type AuthFlashData,
  type CurrentUser,
} from '@app-builder/models';
import { type AnalyticsRepository } from '@app-builder/repositories/AnalyticsRepository';
import { type ApiKeyRepository } from '@app-builder/repositories/ApiKeyRepository';
import { type CaseRepository } from '@app-builder/repositories/CaseRepository';
import { type CustomListsRepository } from '@app-builder/repositories/CustomListRepository';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import { type DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { type EditorRepository } from '@app-builder/repositories/EditorRepository';
import { type InboxRepository } from '@app-builder/repositories/InboxRepository';
import { type OrganizationRepository } from '@app-builder/repositories/OrganizationRepository';
import { type PartnerRepository } from '@app-builder/repositories/PartnerRepository';
import { type RuleSnoozeRepository } from '@app-builder/repositories/RuleSnoozeRepository';
import { type ScenarioIterationRuleRepository } from '@app-builder/repositories/ScenarioIterationRuleRepository';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type TestRunRepository } from '@app-builder/repositories/TestRunRepository';
import { type TransferAlertRepository } from '@app-builder/repositories/TransferAlertRepository';
import { type TransferRepository } from '@app-builder/repositories/TransferRepository';
import { type UserRepository } from '@app-builder/repositories/UserRepository';
import { type WebhookRepository } from '@app-builder/repositories/WebhookRepository';
import { getServerEnv } from '@app-builder/utils/environment';
import { parseForm } from '@app-builder/utils/input-validation';
import { json, redirect } from '@remix-run/node';
import { marblecoreApi } from 'marble-api';
import { type CSRF, CSRFError } from 'remix-utils/csrf/server';
import * as z from 'zod';

import { getRoute } from '../../utils/routes';
import { captureUnexpectedRemixError } from '../monitoring';
import { type SessionService } from './session.server';

interface AuthenticatedInfo {
  /**
   * @deprecated Use repositories directly
   */
  apiClient: MarbleCoreApi;
  editor: EditorRepository;
  decision: DecisionRepository;
  cases: CaseRepository;
  customListsRepository: CustomListsRepository;
  dataModelRepository: DataModelRepository;
  apiKey: ApiKeyRepository;
  analytics: AnalyticsRepository;
  transferRepository: TransferRepository;
  partnerRepository: PartnerRepository;
  transferAlertRepository: TransferAlertRepository;
  testRun: TestRunRepository;
  webhookRepository: WebhookRepository;
  ruleSnoozeRepository: RuleSnoozeRepository;
  organization: OrganizationRepository;
  scenario: ScenarioRepository;
  scenarioIterationRuleRepository: ScenarioIterationRuleRepository;
  user: CurrentUser;
  inbox: InboxRepository;
}

export interface AuthenticationServerService {
  authenticate(
    request: Request,
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ): Promise<void>;

  refresh(
    request: Request,
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ): Promise<void>;

  isAuthenticated(
    request: Request,
    options?: { successRedirect?: never; failureRedirect?: never },
  ): Promise<AuthenticatedInfo | null>;
  isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect?: never },
  ): Promise<null>;
  isAuthenticated(
    request: Request,
    options: { successRedirect?: never; failureRedirect: string },
  ): Promise<AuthenticatedInfo>;
  isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect: string },
  ): Promise<null>;
}

const schema = z.object({
  type: z.enum(['google', 'microsoft', 'email']),
  idToken: z.string(),
  csrf: z.string(),
});
export type AuthPayload = z.infer<typeof schema>;

interface MakeAuthenticationServerServiceArgs {
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
  getTransfercheckAPIClientWithAuth: GetTransfercheckAPIClientWithAuth;
  getUserRepository: (marbleCoreApiClient: MarbleCoreApi) => UserRepository;
  getInboxRepository: (marbleCoreApiClient: MarbleCoreApi) => InboxRepository;
  getEditorRepository: (marbleCoreApiClient: MarbleCoreApi) => EditorRepository;
  getDecisionRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => DecisionRepository;
  getCaseRepository: (marbleCoreApiClient: MarbleCoreApi) => CaseRepository;
  getCustomListRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => CustomListsRepository;
  getOrganizationRepository: (
    marbleCoreApiClient: MarbleCoreApi,
    organizationId: string,
  ) => OrganizationRepository;
  getScenarioRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => ScenarioRepository;
  getScenarioIterationRuleRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => ScenarioIterationRuleRepository;
  getDataModelRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => DataModelRepository;
  getApiKeyRepository: (marbleCoreApiClient: MarbleCoreApi) => ApiKeyRepository;
  getAnalyticsRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => AnalyticsRepository;
  getTransferRepository: (
    transfercheckApi: TransfercheckApi,
  ) => TransferRepository;
  getTestRunRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => TestRunRepository;
  getPartnerRepository: (
    transfercheckApi: TransfercheckApi,
  ) => PartnerRepository;
  getTransferAlertRepository: (
    transfercheckApi: TransfercheckApi,
    partnerId?: string,
  ) => TransferAlertRepository;
  getWebhookRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => WebhookRepository;
  getRuleSnoozeRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => RuleSnoozeRepository;
  authSessionService: SessionService<AuthData, AuthFlashData>;
  csrfService: CSRF;
}

function expectedErrors(error: unknown) {
  return error instanceof CSRFError || error instanceof z.ZodError;
}

export function makeAuthenticationServerService({
  getMarbleCoreAPIClientWithAuth,
  getTransfercheckAPIClientWithAuth,
  getUserRepository,
  getInboxRepository,
  getEditorRepository,
  getDecisionRepository,
  getCaseRepository,
  getCustomListRepository,
  getOrganizationRepository,
  getScenarioRepository,
  getScenarioIterationRuleRepository,
  getDataModelRepository,
  getApiKeyRepository,
  getAnalyticsRepository,
  getTransferRepository,
  getTestRunRepository,
  getPartnerRepository,
  getTransferAlertRepository,
  getWebhookRepository,
  getRuleSnoozeRepository,
  authSessionService,
  csrfService,
}: MakeAuthenticationServerServiceArgs) {
  function getTokenService(marbleAccessToken: string) {
    return {
      getToken: () => Promise.resolve(marbleAccessToken),
      refreshToken: () => {
        // We don't handle refresh for now, force a logout when 401 is returned instead
        throw redirect(getRoute('/ressources/auth/logout'));
      },
    };
  }

  async function authenticate(
    request: Request,
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ) {
    const authSession = await authSessionService.getSession(request);

    let redirectUrl = options.failureRedirect;

    try {
      const { idToken } = await parseForm(request, schema);
      await csrfService.validate(request);

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_DOMAIN_SERVER') },
      );

      const marbleCoreApiClient = getMarbleCoreAPIClientWithAuth(
        getTokenService(marbleToken.access_token),
      );
      const user =
        await getUserRepository(marbleCoreApiClient).getCurrentUser();

      authSession.set('authToken', marbleToken);
      authSession.set('user', user);
      redirectUrl = options.successRedirect;
    } catch (error) {
      authSession.flash('authError', { message: adaptAuthErrors(error) });
      redirectUrl = options.failureRedirect;

      if (!expectedErrors(error)) {
        captureUnexpectedRemixError(error, 'auth.server@authenticate', request);
      }
    }

    throw redirect(redirectUrl, {
      headers: {
        'Set-Cookie': await authSessionService.commitSession(authSession),
      },
    });
  }

  async function refresh(
    request: Request,
    options: {
      successRedirect?: string;
      failureRedirect: string;
    },
  ) {
    const authSession = await authSessionService.getSession(request);

    try {
      const { idToken } = await parseForm(
        request,
        z.object({
          idToken: z.string(),
        }),
      );
      await csrfService.validate(request);

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_DOMAIN_SERVER') },
      );

      const marbleCoreApiClient = getMarbleCoreAPIClientWithAuth(
        getTokenService(marbleToken.access_token),
      );
      const user =
        await getUserRepository(marbleCoreApiClient).getCurrentUser();

      authSession.set('authToken', marbleToken);
      authSession.set('user', user);

      if (options?.successRedirect) {
        throw redirect(options.successRedirect, {
          headers: {
            'Set-Cookie': await authSessionService.commitSession(authSession),
          },
        });
      }
      return json(
        {},
        {
          headers: {
            'Set-Cookie': await authSessionService.commitSession(authSession),
          },
        },
      );
    } catch (error) {
      if (!expectedErrors(error)) {
        captureUnexpectedRemixError(error, 'auth.server@refresh', request);
      }
      throw redirect(options.failureRedirect);
    }
  }

  async function isAuthenticated(
    request: Request,
    options?: { successRedirect?: never; failureRedirect?: never },
  ): Promise<AuthenticatedInfo | null>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect?: never },
  ): Promise<null>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect?: never; failureRedirect: string },
  ): Promise<AuthenticatedInfo>;
  async function isAuthenticated(
    request: Request,
    options: { successRedirect: string; failureRedirect: string },
  ): Promise<null>;
  async function isAuthenticated(
    request: Request,
    options:
      | { successRedirect?: never; failureRedirect?: never }
      | { successRedirect: string; failureRedirect?: never }
      | { successRedirect?: never; failureRedirect: string }
      | { successRedirect: string; failureRedirect: string } = {},
  ): Promise<AuthenticatedInfo | null> {
    const authSession = await authSessionService.getSession(request);

    const marbleToken = authSession.get('authToken');
    const user = authSession.get('user');
    if (
      !marbleToken ||
      marbleToken.expires_at < new Date().toISOString() ||
      !user
    ) {
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    if (options.successRedirect) throw redirect(options.successRedirect);

    const tokenService = getTokenService(marbleToken.access_token);
    const marbleCoreApiClient = getMarbleCoreAPIClientWithAuth(tokenService);
    const transfercheckAPIClient =
      getTransfercheckAPIClientWithAuth(tokenService);

    return {
      apiClient: marbleCoreApiClient,
      editor: getEditorRepository(marbleCoreApiClient),
      decision: getDecisionRepository(marbleCoreApiClient),
      cases: getCaseRepository(marbleCoreApiClient),
      customListsRepository: getCustomListRepository(marbleCoreApiClient),
      scenario: getScenarioRepository(marbleCoreApiClient),
      scenarioIterationRuleRepository:
        getScenarioIterationRuleRepository(marbleCoreApiClient),
      organization: getOrganizationRepository(
        marbleCoreApiClient,
        user.organizationId,
      ),
      dataModelRepository: getDataModelRepository(marbleCoreApiClient),
      apiKey: getApiKeyRepository(marbleCoreApiClient),
      analytics: getAnalyticsRepository(marbleCoreApiClient),
      transferRepository: getTransferRepository(transfercheckAPIClient),
      testRun: getTestRunRepository(marbleCoreApiClient),
      partnerRepository: getPartnerRepository(transfercheckAPIClient),
      transferAlertRepository: getTransferAlertRepository(
        transfercheckAPIClient,
        user.partnerId,
      ),
      webhookRepository: getWebhookRepository(marbleCoreApiClient),
      ruleSnoozeRepository: getRuleSnoozeRepository(marbleCoreApiClient),
      user,
      inbox: getInboxRepository(marbleCoreApiClient),
    };
  }

  async function logout(
    request: Request,
    options: { redirectTo: string },
  ): Promise<never> {
    const authSession = await authSessionService.getSession(request);

    throw redirect(options.redirectTo, {
      headers: {
        'Set-Cookie': await authSessionService.destroySession(authSession),
      },
    });
  }

  return {
    authenticate,
    refresh,
    isAuthenticated,
    logout,
  };
}
