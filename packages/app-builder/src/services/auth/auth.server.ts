import { type GetFeatureAccessAPIClientWithAuth } from '@app-builder/infra/feature-access-api';
import { type GetMarbleCoreAPIClientWithAuth, type MarbleCoreApi } from '@app-builder/infra/marblecore-api';
import { adaptAuthErrors, type CurrentUser } from '@app-builder/models';
import { AppConfig } from '@app-builder/models/app-config';
import { emptyFeatureAccesses, type FeatureAccesses } from '@app-builder/models/feature-access';
import { type AiAssistRepository } from '@app-builder/repositories/AiAssistRepository';
import { type AnalyticsRepository } from '@app-builder/repositories/AnalyticsRepository';
import { type ApiKeyRepository } from '@app-builder/repositories/ApiKeyRepository';
import { AppConfigRepository } from '@app-builder/repositories/AppConfigRepository';
import { type AuditEventsRepository } from '@app-builder/repositories/AuditEventsRepository';
import { type CaseRepository } from '@app-builder/repositories/CaseRepository';
import { Client360Repository } from '@app-builder/repositories/Client360Repository';
import { ContinuousScreeningRepository } from '@app-builder/repositories/ContinuousScreeningRepository';
import { type CustomListsRepository } from '@app-builder/repositories/CustomListRepository';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import { type DecisionRepository } from '@app-builder/repositories/DecisionRepository';

import { type makeGetFeatureAccessRepository } from '@app-builder/repositories/FeatureAccessRepository';
import { type InboxRepository } from '@app-builder/repositories/InboxRepository';
import { type OrganizationRepository } from '@app-builder/repositories/OrganizationRepository';
import { PersonalSettingsRepository } from '@app-builder/repositories/PersonalSettingsRepository';
import { type RuleSnoozeRepository } from '@app-builder/repositories/RuleSnoozeRepository';
import { type ScenarioIterationRuleRepository } from '@app-builder/repositories/ScenarioIterationRuleRepository';
import { type ScenarioIterationScreeningRepository } from '@app-builder/repositories/ScenarioIterationScreeningRepository';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type ScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import { type TestRunRepository } from '@app-builder/repositories/TestRunRepository';
import { type UserRepository } from '@app-builder/repositories/UserRepository';
import { type UserScoringRepository } from '@app-builder/repositories/UserScoringRepository';
import { type WebhookRepository } from '@app-builder/repositories/WebhookRepository';
import { Tokens } from '@app-builder/routes/oidc/auth';
import { useAuthSession } from '@app-builder/services/auth/auth-session.server';
import { setToast } from '@app-builder/services/toast.server';
import { CsrfError, validateCsrf } from '@app-builder/utils/csrf.server';
import { getServerEnv } from '@app-builder/utils/environment';
import * as Sentry from '@sentry/node';
import { BackendGlobalError, marblecoreApi, TokenService, TokenServiceUpdate } from 'marble-api';
import * as z from 'zod/v4';
import { captureUnexpectedError } from '../monitoring';
import { makeOidcService } from './oidc.server';

function redirect(url: string, init?: { status?: number; headers?: HeadersInit }): Response {
  const headers = new Headers(init?.headers);
  headers.set('Location', url);
  return new Response(null, { status: init?.status ?? 302, headers });
}

interface AuthenticatedInfo {
  /**
   * @deprecated Use repositories directly
   */
  apiClient: MarbleCoreApi;
  tokenService: TokenService<string>;

  decision: DecisionRepository;
  cases: CaseRepository;
  continuousScreening: ContinuousScreeningRepository;
  screening: ScreeningRepository;
  customListsRepository: CustomListsRepository;
  dataModelRepository: DataModelRepository;
  apiKey: ApiKeyRepository;
  analytics: AnalyticsRepository;
  testRun: TestRunRepository;
  webhookRepository: WebhookRepository;
  ruleSnoozeRepository: RuleSnoozeRepository;
  organization: OrganizationRepository;
  scenario: ScenarioRepository;
  scenarioIterationRuleRepository: ScenarioIterationRuleRepository;
  scenarioIterationScreeningRepository: ScenarioIterationScreeningRepository;
  user: CurrentUser;
  entitlements: FeatureAccesses;
  inbox: InboxRepository;
  personalSettings: PersonalSettingsRepository;
  aiAssistSettings: AiAssistRepository;
  client360: Client360Repository;
  auditEvents: AuditEventsRepository;
  userScoring: UserScoringRepository;
}

export interface AuthenticationServerService {
  authenticate(
    request: Request,
    payload: { idToken: string; csrf: string },
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ): Promise<{ redirectTo: string }>;

  refresh(
    request: Request,
    payload: { idToken: string; csrf: string },
    options: {
      failureRedirect: string;
    },
  ): Promise<void>;

  isAuthenticated(
    request: Request,
    options?: { successRedirect?: never; failureRedirect?: never },
  ): Promise<AuthenticatedInfo | null>;
  isAuthenticated(request: Request, options: { successRedirect: string; failureRedirect?: never }): Promise<null>;
  isAuthenticated(
    request: Request,
    options: { successRedirect?: never; failureRedirect: string },
  ): Promise<AuthenticatedInfo>;
  isAuthenticated(request: Request, options: { successRedirect: string; failureRedirect: string }): Promise<null>;

  logout(request: Request, options: { redirectTo: string }): Promise<{ redirectTo: string }>;
}

const schema = z.object({
  type: z.enum(['google', 'microsoft', 'email']),
  idToken: z.string(),
  csrf: z.string(),
});
export type AuthPayload = z.infer<typeof schema>;

interface MakeAuthenticationServerServiceArgs {
  getMarbleCoreAPIClientWithAuth: GetMarbleCoreAPIClientWithAuth;
  getFeatureAccessAPIClientWithAuth: GetFeatureAccessAPIClientWithAuth;
  getAppConfigRepository: (marbleCoreApiClient: MarbleCoreApi) => AppConfigRepository;
  getUserRepository: (marbleCoreApiClient: MarbleCoreApi) => UserRepository;
  getInboxRepository: (marbleCoreApiClient: MarbleCoreApi) => InboxRepository;

  getDecisionRepository: (marbleCoreApiClient: MarbleCoreApi) => DecisionRepository;
  getCaseRepository: (marbleCoreApiClient: MarbleCoreApi) => CaseRepository;
  getContinuousScreeningRepository: (marbleCoreApiClient: MarbleCoreApi) => ContinuousScreeningRepository;
  getScreeningRepository: (marbleCoreApiClient: MarbleCoreApi) => ScreeningRepository;
  getCustomListRepository: (marbleCoreApiClient: MarbleCoreApi) => CustomListsRepository;
  getOrganizationRepository: (marbleCoreApiClient: MarbleCoreApi, organizationId: string) => OrganizationRepository;
  getScenarioRepository: (marbleCoreApiClient: MarbleCoreApi) => ScenarioRepository;
  getScenarioIterationRuleRepository: (marbleCoreApiClient: MarbleCoreApi) => ScenarioIterationRuleRepository;
  getScenarioIterationScreeningRepository: (marbleCoreApiClient: MarbleCoreApi) => ScenarioIterationScreeningRepository;
  getDataModelRepository: (marbleCoreApiClient: MarbleCoreApi) => DataModelRepository;
  getApiKeyRepository: (marbleCoreApiClient: MarbleCoreApi) => ApiKeyRepository;
  getAnalyticsRepository: (marbleCoreApiClient: MarbleCoreApi) => AnalyticsRepository;
  getTestRunRepository: (marbleCoreApiClient: MarbleCoreApi) => TestRunRepository;
  getWebhookRepository: (marbleCoreApiClient: MarbleCoreApi) => WebhookRepository;
  getRuleSnoozeRepository: (marbleCoreApiClient: MarbleCoreApi) => RuleSnoozeRepository;
  getFeatureAccessRepository: ReturnType<typeof makeGetFeatureAccessRepository>;
  getPersonalSettingsRepository: (marbleCoreApiClient: MarbleCoreApi) => PersonalSettingsRepository;
  getAiAssistSettingsRepository: (marbleCoreApiClient: MarbleCoreApi) => AiAssistRepository;
  getClient360TablesRepository: (marbleCoreApiClient: MarbleCoreApi) => Client360Repository;
  getAuditEventsRepository: (marbleCoreApiClient: MarbleCoreApi) => AuditEventsRepository;
  getUserScoringRepository: (marbleCoreApiClient: MarbleCoreApi) => UserScoringRepository;
  makeOidcService: (appConfig: AppConfig) => ReturnType<typeof makeOidcService>;
}

function expectedErrors(error: unknown) {
  return error instanceof CsrfError || error instanceof z.ZodError;
}

export function makeAuthenticationServerService({
  getMarbleCoreAPIClientWithAuth,
  getFeatureAccessAPIClientWithAuth,
  getAppConfigRepository,
  getUserRepository,
  getInboxRepository,
  getDecisionRepository,
  getCaseRepository,
  getContinuousScreeningRepository,
  getScreeningRepository,
  getCustomListRepository,
  getOrganizationRepository,
  getScenarioRepository,
  getScenarioIterationRuleRepository,
  getScenarioIterationScreeningRepository,
  getDataModelRepository,
  getApiKeyRepository,
  getAnalyticsRepository,
  getTestRunRepository,
  getWebhookRepository,
  getRuleSnoozeRepository,
  getFeatureAccessRepository,
  getPersonalSettingsRepository,
  getAiAssistSettingsRepository,
  getClient360TablesRepository,
  getAuditEventsRepository,
  getUserScoringRepository,
  makeOidcService,
}: MakeAuthenticationServerServiceArgs) {
  function getTokenService(marbleAccessToken: string, request: Request | undefined = undefined): TokenService<string> {
    let update: { value: TokenServiceUpdate } = {
      value: { status: false, marbleToken: null, refreshToken: null },
    };

    return {
      getToken: () => Promise.resolve(update.value.marbleToken?.access_token ?? marbleAccessToken),
      getUpdate: () => update.value,
      get tokenUpdated() {
        return update.value.status;
      },
      refreshToken: async () => {
        const appConfigRepository = getAppConfigRepository(marblecoreApi);
        const appConfig = await appConfigRepository.getAppConfig();

        if (appConfig.auth.provider == 'oidc') {
          const oidc = await makeOidcService(appConfig);

          if (request) {
            const authSession = await useAuthSession();

            if (authSession.data.refreshToken) {
              const response = await oidc.refreshToken(authSession.data.refreshToken);
              const accessToken = response.accessToken();
              const idToken = response.idToken();

              const marbleToken = await marblecoreApi.postToken(
                {
                  authorization: `Bearer ${idToken}`,
                  xOidcAccessToken: accessToken,
                },
                { baseUrl: getServerEnv('MARBLE_API_URL') },
              );

              let refreshToken = null;
              if (response.hasRefreshToken()) {
                refreshToken = response.refreshToken();
              }

              update.value = { status: true, marbleToken, refreshToken };

              return marbleToken.access_token;
            }
          }
        }

        // We don't handle refresh for now, force a logout when 401 is returned instead
        const authSession = await useAuthSession();
        await authSession.clear();
        throw redirect('/sign-in');
      },
    };
  }

  async function authenticate(
    request: Request,
    payload: { idToken: string; csrf: string },
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ): Promise<{ redirectTo: string }> {
    const authSession = await useAuthSession();

    let redirectUrl = options.failureRedirect;

    try {
      await validateCsrf(request, payload.csrf);

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${payload.idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      await authSession.update({ authToken: marbleToken, authError: undefined });
      redirectUrl = options.successRedirect;
    } catch (error) {
      await authSession.update({ authError: { message: adaptAuthErrors(error) } });
      redirectUrl = options.failureRedirect;

      if (!expectedErrors(error)) {
        captureUnexpectedError(error, 'auth.server@authenticate', request);
      }
    }

    return { redirectTo: redirectUrl };
  }

  async function authenticateOidc(
    request: Request,
    tokens: Tokens,
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ): Promise<never> {
    const authSession = await useAuthSession();

    let redirectUrl = options.failureRedirect;

    try {
      const { idToken, accessToken, refreshToken } = tokens;

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
          xOidcAccessToken: accessToken,
        },
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      await authSession.update({
        authToken: marbleToken,
        authError: undefined,
        ...(refreshToken ? { refreshToken } : {}),
      });

      redirectUrl = options.successRedirect;
    } catch (error) {
      await authSession.update({ authError: { message: adaptAuthErrors(error) } });
      redirectUrl = options.failureRedirect;

      if (!expectedErrors(error)) {
        captureUnexpectedError(error, 'auth.server@authenticate', request);
      }
    }

    throw redirect(redirectUrl);
  }

  async function refresh(
    request: Request,
    payload: { idToken: string; csrf: string },
    options: {
      failureRedirect: string;
    },
  ): Promise<void> {
    const authSession = await useAuthSession();

    try {
      await validateCsrf(request, payload.csrf);

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${payload.idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      await authSession.update({ authToken: marbleToken });
    } catch (error) {
      if (!expectedErrors(error)) {
        captureUnexpectedError(error, 'auth.server@refresh', request);
      }
      await authSession.clear();
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
    const authSession = await useAuthSession();

    const marbleToken = authSession.data.authToken;

    if (!marbleToken || marbleToken.expires_at < new Date().toISOString()) {
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    const tokenService = getTokenService(marbleToken.access_token, request);
    const marbleCoreApiClient = getMarbleCoreAPIClientWithAuth(tokenService);
    const featureAccessApiClient = getFeatureAccessAPIClientWithAuth(
      getTokenService(marbleToken.access_token, request),
    );

    let user: CurrentUser;
    let entitlements: FeatureAccesses;
    try {
      user = await getUserRepository(marbleCoreApiClient).getCurrentUser();
      entitlements = user.organizationId
        ? await getFeatureAccessRepository(featureAccessApiClient).getEntitlements()
        : emptyFeatureAccesses();
    } catch (err) {
      if (err instanceof BackendGlobalError) {
        await setToast({
          type: 'error',
          messageKey: `common:errors.backend_global_error.${err.code}`,
        });
      }

      Sentry.captureException(err);
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    if (options.successRedirect) throw redirect(options.successRedirect);

    return {
      tokenService,
      apiClient: marbleCoreApiClient,

      decision: getDecisionRepository(marbleCoreApiClient),
      cases: getCaseRepository(marbleCoreApiClient),
      continuousScreening: getContinuousScreeningRepository(marbleCoreApiClient),
      screening: getScreeningRepository(marbleCoreApiClient),
      customListsRepository: getCustomListRepository(marbleCoreApiClient),
      scenario: getScenarioRepository(marbleCoreApiClient),
      scenarioIterationRuleRepository: getScenarioIterationRuleRepository(marbleCoreApiClient),
      scenarioIterationScreeningRepository: getScenarioIterationScreeningRepository(marbleCoreApiClient),
      organization: getOrganizationRepository(marbleCoreApiClient, user.organizationId),
      dataModelRepository: getDataModelRepository(marbleCoreApiClient),
      apiKey: getApiKeyRepository(marbleCoreApiClient),
      analytics: getAnalyticsRepository(marbleCoreApiClient),
      testRun: getTestRunRepository(marbleCoreApiClient),
      webhookRepository: getWebhookRepository(marbleCoreApiClient),
      ruleSnoozeRepository: getRuleSnoozeRepository(marbleCoreApiClient),
      user,
      entitlements,
      inbox: getInboxRepository(marbleCoreApiClient),
      personalSettings: getPersonalSettingsRepository(marbleCoreApiClient),
      aiAssistSettings: getAiAssistSettingsRepository(marbleCoreApiClient),
      client360: getClient360TablesRepository(marbleCoreApiClient),
      auditEvents: getAuditEventsRepository(marbleCoreApiClient),
      userScoring: getUserScoringRepository(marbleCoreApiClient),
    };
  }

  async function logout(_request: Request, options: { redirectTo: string }): Promise<{ redirectTo: string }> {
    const authSession = await useAuthSession();
    await authSession.clear();
    return { redirectTo: options.redirectTo };
  }

  return {
    makeOidcService,
    authenticate,
    authenticateOidc,
    refresh,
    isAuthenticated,
    logout,
  };
}
