import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type GetFeatureAccessAPIClientWithAuth } from '@app-builder/infra/feature-access-api';
import {
  type GetMarbleCoreAPIClientWithAuth,
  type MarbleCoreApi,
} from '@app-builder/infra/marblecore-api';
import {
  type GetTransfercheckAPIClientWithAuth,
  type TransfercheckApi,
} from '@app-builder/infra/transfercheck-api';
import {
  type AuthData,
  type AuthFlashData,
  adaptAuthErrors,
  type CurrentUser,
} from '@app-builder/models';
import { emptyFeatureAccesses, type FeatureAccesses } from '@app-builder/models/feature-access';
import { ToastFlashData } from '@app-builder/models/toast-session';
import { type AiAssistRepository } from '@app-builder/repositories/AiAssistRepository';
import { type AnalyticsRepository } from '@app-builder/repositories/AnalyticsRepository';
import { type ApiKeyRepository } from '@app-builder/repositories/ApiKeyRepository';
import { type CaseRepository } from '@app-builder/repositories/CaseRepository';
import { type CustomListsRepository } from '@app-builder/repositories/CustomListRepository';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import { type DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { type EditorRepository } from '@app-builder/repositories/EditorRepository';
import { type makeGetFeatureAccessRepository } from '@app-builder/repositories/FeatureAccessRepository';
import { type InboxRepository } from '@app-builder/repositories/InboxRepository';
import { type OrganizationRepository } from '@app-builder/repositories/OrganizationRepository';
import { type PartnerRepository } from '@app-builder/repositories/PartnerRepository';
import { PersonalSettingsRepository } from '@app-builder/repositories/PersonalSettingsRepository';
import { type RuleSnoozeRepository } from '@app-builder/repositories/RuleSnoozeRepository';
import { type ScenarioIterationRuleRepository } from '@app-builder/repositories/ScenarioIterationRuleRepository';
import { type ScenarioIterationScreeningRepository } from '@app-builder/repositories/ScenarioIterationScreeningRepository';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type ScreeningRepository } from '@app-builder/repositories/ScreeningRepository';
import { type TestRunRepository } from '@app-builder/repositories/TestRunRepository';
import { type TransferAlertRepository } from '@app-builder/repositories/TransferAlertRepository';
import { type TransferRepository } from '@app-builder/repositories/TransferRepository';
import { type UserRepository } from '@app-builder/repositories/UserRepository';
import { type WebhookRepository } from '@app-builder/repositories/WebhookRepository';
import { getServerEnv } from '@app-builder/utils/environment';
import { parseForm } from '@app-builder/utils/input-validation';
import { json, redirect } from '@remix-run/node';
import { captureRemixServerException } from '@sentry/remix';
import { BackendGlobalError, marblecoreApi, TokenService } from 'marble-api';
import { type CSRF, CSRFError } from 'remix-utils/csrf/server';
import * as z from 'zod/v4';
import { getRoute } from '../../utils/routes';
import { captureUnexpectedRemixError } from '../monitoring';
import { type SessionService } from './session.server';
import { Tokens } from '@app-builder/routes/oidc+/auth';
import { AppConfigRepository } from '@app-builder/repositories/AppConfigRepository';
import { MarbleOidcStrategy } from './oidc.server';

interface AuthenticatedInfo {
  /**
   * @deprecated Use repositories directly
   */
  apiClient: MarbleCoreApi;
  tokenService: TokenService<string>;
  editor: EditorRepository;
  decision: DecisionRepository;
  cases: CaseRepository;
  screening: ScreeningRepository;
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
  scenarioIterationScreeningRepository: ScenarioIterationScreeningRepository;
  user: CurrentUser;
  entitlements: FeatureAccesses;
  inbox: InboxRepository;
  personalSettings: PersonalSettingsRepository;
  aiAssistSettings: AiAssistRepository;
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
  getFeatureAccessAPIClientWithAuth: GetFeatureAccessAPIClientWithAuth;
  getAppConfigRepository: (marbleCoreApiClient: MarbleCoreApi) => AppConfigRepository;
  getUserRepository: (marbleCoreApiClient: MarbleCoreApi) => UserRepository;
  getInboxRepository: (marbleCoreApiClient: MarbleCoreApi) => InboxRepository;
  getEditorRepository: (marbleCoreApiClient: MarbleCoreApi) => EditorRepository;
  getDecisionRepository: (marbleCoreApiClient: MarbleCoreApi) => DecisionRepository;
  getCaseRepository: (marbleCoreApiClient: MarbleCoreApi) => CaseRepository;
  getScreeningRepository: (marbleCoreApiClient: MarbleCoreApi) => ScreeningRepository;
  getCustomListRepository: (marbleCoreApiClient: MarbleCoreApi) => CustomListsRepository;
  getOrganizationRepository: (
    marbleCoreApiClient: MarbleCoreApi,
    organizationId: string,
  ) => OrganizationRepository;
  getScenarioRepository: (marbleCoreApiClient: MarbleCoreApi) => ScenarioRepository;
  getScenarioIterationRuleRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => ScenarioIterationRuleRepository;
  getScenarioIterationScreeningRepository: (
    marbleCoreApiClient: MarbleCoreApi,
  ) => ScenarioIterationScreeningRepository;
  getDataModelRepository: (marbleCoreApiClient: MarbleCoreApi) => DataModelRepository;
  getApiKeyRepository: (marbleCoreApiClient: MarbleCoreApi) => ApiKeyRepository;
  getAnalyticsRepository: (marbleCoreApiClient: MarbleCoreApi) => AnalyticsRepository;
  getTransferRepository: (transfercheckApi: TransfercheckApi) => TransferRepository;
  getTestRunRepository: (marbleCoreApiClient: MarbleCoreApi) => TestRunRepository;
  getPartnerRepository: (transfercheckApi: TransfercheckApi) => PartnerRepository;
  getTransferAlertRepository: (
    transfercheckApi: TransfercheckApi,
    partnerId?: string,
  ) => TransferAlertRepository;
  getWebhookRepository: (marbleCoreApiClient: MarbleCoreApi) => WebhookRepository;
  getRuleSnoozeRepository: (marbleCoreApiClient: MarbleCoreApi) => RuleSnoozeRepository;
  getFeatureAccessRepository: ReturnType<typeof makeGetFeatureAccessRepository>;
  getPersonalSettingsRepository: (marbleCoreApiClient: MarbleCoreApi) => PersonalSettingsRepository;
  getAiAssistSettingsRepository: (marbleCoreApiClient: MarbleCoreApi) => AiAssistRepository;
  authSessionService: SessionService<AuthData, AuthFlashData>;
  toastSessionService: SessionService<void, ToastFlashData>;
  csrfService: CSRF;
  makeOidcService: (configRepository: AppConfigRepository) => Promise<MarbleOidcStrategy<Tokens>>;
}

function expectedErrors(error: unknown) {
  return error instanceof CSRFError || error instanceof z.ZodError;
}

export function makeAuthenticationServerService({
  getMarbleCoreAPIClientWithAuth,
  getTransfercheckAPIClientWithAuth,
  getFeatureAccessAPIClientWithAuth,
  getAppConfigRepository,
  getUserRepository,
  getInboxRepository,
  getEditorRepository,
  getDecisionRepository,
  getCaseRepository,
  getScreeningRepository,
  getCustomListRepository,
  getOrganizationRepository,
  getScenarioRepository,
  getScenarioIterationRuleRepository,
  getScenarioIterationScreeningRepository,
  getDataModelRepository,
  getApiKeyRepository,
  getAnalyticsRepository,
  getTransferRepository,
  getTestRunRepository,
  getPartnerRepository,
  getTransferAlertRepository,
  getWebhookRepository,
  getRuleSnoozeRepository,
  getFeatureAccessRepository,
  getPersonalSettingsRepository,
  authSessionService,
  toastSessionService,
  csrfService,
  getAiAssistSettingsRepository,
  makeOidcService,
}: MakeAuthenticationServerServiceArgs) {
  function getTokenService(marbleAccessToken: string, request: Request | undefined = undefined) {
    return {
      getToken: () => Promise.resolve(marbleAccessToken),
      refreshToken: async () => {
        const appConfigRepository = getAppConfigRepository(marblecoreApi);
        const appConfig = await appConfigRepository.getAppConfig();

        if (appConfig.auth.provider == 'oidc') {
          const oidc = await makeOidcService(appConfigRepository);

          if (request) {
            const authSession = await authSessionService.getSession(request);

            if (authSession.data.refreshToken) {
              const response = await oidc.refreshToken(authSession.data.refreshToken);

              const marbleToken = await marblecoreApi.postToken(
                {
                  authorization: `Bearer ${response.idToken()}`,
                },
                { baseUrl: getServerEnv('MARBLE_API_URL') },
              );

              authSession.set('authToken', marbleToken);

              if (response.hasRefreshToken()) {
                authSession.set('refreshToken', response.refreshToken());
              }

              return marbleToken.access_token;
            }
          }
        }

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
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      authSession.set('authToken', marbleToken);
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

  async function authenticateOidc(
    request: Request,
    tokens: Tokens,
    options: {
      successRedirect: string;
      failureRedirect: string;
    },
  ) {
    const authSession = await authSessionService.getSession(request);

    let redirectUrl = options.failureRedirect;

    try {
      const { idToken, refreshToken } = tokens;

      const marbleToken = await marblecoreApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      authSession.set('authToken', marbleToken);

      if (refreshToken) {
        authSession.set('refreshToken', refreshToken);
      }

      redirectUrl = options.successRedirect;
    } catch (error) {
      authSession.flash('authError', { message: adaptAuthErrors(error) });
      redirectUrl = options.failureRedirect;

      if (!expectedErrors(error)) {
        captureUnexpectedRemixError(error, 'auth.server@authenticate', request);
      }
    }

    const session = await authSessionService.commitSession(authSession);

    throw redirect(redirectUrl, {
      headers: {
        'Set-Cookie': session,
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
        { baseUrl: getServerEnv('MARBLE_API_URL') },
      );

      authSession.set('authToken', marbleToken);

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
    const toastSession = await toastSessionService.getSession(request);

    const marbleToken = authSession.get('authToken');

    if (!marbleToken || marbleToken.expires_at < new Date().toISOString()) {
      if (options.failureRedirect) throw redirect(options.failureRedirect);
      else return null;
    }

    const tokenService = getTokenService(marbleToken.access_token, request);
    const marbleCoreApiClient = getMarbleCoreAPIClientWithAuth(tokenService);
    const featureAccessApiClient = getFeatureAccessAPIClientWithAuth(
      getTokenService(marbleToken.access_token, request),
    );
    const transfercheckAPIClient = getTransfercheckAPIClientWithAuth(tokenService);

    let user: CurrentUser;
    let entitlements: FeatureAccesses;
    try {
      user = await getUserRepository(marbleCoreApiClient).getCurrentUser();
      entitlements = user.organizationId
        ? await getFeatureAccessRepository(featureAccessApiClient).getEntitlements()
        : emptyFeatureAccesses();
    } catch (err) {
      let headers = new Headers();
      if (err instanceof BackendGlobalError) {
        setToastMessage(toastSession, {
          type: 'error',
          messageKey: `common:errors.backend_global_error.${err.code}`,
        });

        headers.set('Set-Cookie', await toastSessionService.commitSession(toastSession));
      }

      captureRemixServerException(err, 'remix.server', request);
      if (options.failureRedirect) throw redirect(options.failureRedirect, { headers });
      else return null;
    }

    if (options.successRedirect) throw redirect(options.successRedirect);

    return {
      tokenService,
      apiClient: marbleCoreApiClient,
      editor: getEditorRepository(marbleCoreApiClient),
      decision: getDecisionRepository(marbleCoreApiClient),
      cases: getCaseRepository(marbleCoreApiClient),
      screening: getScreeningRepository(marbleCoreApiClient),
      customListsRepository: getCustomListRepository(marbleCoreApiClient),
      scenario: getScenarioRepository(marbleCoreApiClient),
      scenarioIterationRuleRepository: getScenarioIterationRuleRepository(marbleCoreApiClient),
      scenarioIterationScreeningRepository:
        getScenarioIterationScreeningRepository(marbleCoreApiClient),
      organization: getOrganizationRepository(marbleCoreApiClient, user.organizationId),
      dataModelRepository: getDataModelRepository(marbleCoreApiClient),
      apiKey: getApiKeyRepository(marbleCoreApiClient),
      analytics: getAnalyticsRepository(marbleCoreApiClient),
      transferRepository: getTransferRepository(transfercheckAPIClient),
      testRun: getTestRunRepository(marbleCoreApiClient),
      partnerRepository: getPartnerRepository(transfercheckAPIClient),
      transferAlertRepository: getTransferAlertRepository(transfercheckAPIClient, user.partnerId),
      webhookRepository: getWebhookRepository(marbleCoreApiClient),
      ruleSnoozeRepository: getRuleSnoozeRepository(marbleCoreApiClient),
      user,
      entitlements,
      inbox: getInboxRepository(marbleCoreApiClient),
      personalSettings: getPersonalSettingsRepository(marbleCoreApiClient),
      aiAssistSettings: getAiAssistSettingsRepository(marbleCoreApiClient),
    };
  }

  async function logout(request: Request, options: { redirectTo: string }): Promise<never> {
    const authSession = await authSessionService.getSession(request);

    throw redirect(options.redirectTo, {
      headers: {
        'Set-Cookie': await authSessionService.destroySession(authSession),
      },
    });
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
