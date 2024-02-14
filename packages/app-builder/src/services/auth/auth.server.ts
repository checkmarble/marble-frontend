import { type MarbleApi } from '@app-builder/infra/marble-api';
import {
  adaptAuthErrors,
  type AuthData,
  type AuthFlashData,
  type CurrentUser,
} from '@app-builder/models';
import { type AnalyticsRepository } from '@app-builder/repositories/AnalyticsRepository';
import { type ApiKeyRepository } from '@app-builder/repositories/ApiKeyRepository';
import { type CaseRepository } from '@app-builder/repositories/CaseRepository';
import { type DataModelRepository } from '@app-builder/repositories/DataModelRepository';
import { type DecisionRepository } from '@app-builder/repositories/DecisionRepository';
import { type EditorRepository } from '@app-builder/repositories/EditorRepository';
import { type InboxRepository } from '@app-builder/repositories/InboxRepository';
import { type MarbleAPIRepository } from '@app-builder/repositories/MarbleAPIRepository';
import { type OrganizationRepository } from '@app-builder/repositories/OrganizationRepository';
import { type ScenarioRepository } from '@app-builder/repositories/ScenarioRepository';
import { type UserRepository } from '@app-builder/repositories/UserRepository';
import { getServerEnv } from '@app-builder/utils/environment';
import { parseForm } from '@app-builder/utils/input-validation';
import { type RoutePath } from '@app-builder/utils/routes/types';
import { json, redirect } from '@remix-run/node';
import { marbleApi } from 'marble-api';
import { type CSRF } from 'remix-utils/csrf/server';
import * as z from 'zod';

import { getRoute } from '../../utils/routes';
import { type SessionService } from './session.server';

interface AuthenticatedInfo {
  apiClient: MarbleApi;
  editor: EditorRepository;
  decision: DecisionRepository;
  cases: CaseRepository;
  dataModelRepository: DataModelRepository;
  apiKey: ApiKeyRepository;
  analytics: AnalyticsRepository;
  organization: OrganizationRepository;
  scenario: ScenarioRepository;
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
  idToken: z.string(),
  csrf: z.string(),
});
export type AuthPayload = z.infer<typeof schema>;

export function makeAuthenticationServerService(
  marbleAPIClient: MarbleAPIRepository,
  userRepository: (marbleApiClient: MarbleApi) => UserRepository,
  inboxRepository: (marbleApiClient: MarbleApi) => InboxRepository,
  editorRepository: (marbleApiClient: MarbleApi) => EditorRepository,
  decisionRepository: (marbleApiClient: MarbleApi) => DecisionRepository,
  caseRepository: (marbleApiClient: MarbleApi) => CaseRepository,
  organizationRepository: (
    marbleApiClient: MarbleApi,
    organizationId: string,
  ) => OrganizationRepository,
  scenarioRepository: (marbleApiClient: MarbleApi) => ScenarioRepository,
  dataModelRepository: (marbleApiClient: MarbleApi) => DataModelRepository,
  apiKeysRepository: (marbleApiClient: MarbleApi) => ApiKeyRepository,
  analyticsRepository: (marbleApiClient: MarbleApi) => AnalyticsRepository,
  authSessionService: SessionService<AuthData, AuthFlashData>,
  csrfService: CSRF,
) {
  function getMarbleAPIClient(marbleAccessToken: string) {
    const tokenService = {
      getToken: () => Promise.resolve(marbleAccessToken),
      refreshToken: () => {
        // We don't handle refresh for now, force a logout when 401 is returned instead
        throw redirect(getRoute('/ressources/auth/logout'));
      },
    };
    return marbleAPIClient(tokenService);
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

      const marbleToken = await marbleApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_DOMAIN') },
      );

      const apiClient = getMarbleAPIClient(marbleToken.access_token);
      const user = await userRepository(apiClient).getCurrentUser();

      authSession.set('authToken', marbleToken);
      authSession.set('user', user);
      redirectUrl = options.successRedirect;
    } catch (error) {
      authSession.flash('authError', { message: adaptAuthErrors(error) });

      redirectUrl = options.failureRedirect;
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

      const marbleToken = await marbleApi.postToken(
        {
          authorization: `Bearer ${idToken}`,
        },
        { baseUrl: getServerEnv('MARBLE_API_DOMAIN') },
      );

      const apiClient = getMarbleAPIClient(marbleToken.access_token);
      const user = await userRepository(apiClient).getCurrentUser();

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

    const apiClient = getMarbleAPIClient(marbleToken.access_token);

    return {
      apiClient,
      editor: editorRepository(apiClient),
      decision: decisionRepository(apiClient),
      cases: caseRepository(apiClient),
      scenario: scenarioRepository(apiClient),
      organization: organizationRepository(apiClient, user.organizationId),
      dataModelRepository: dataModelRepository(apiClient),
      apiKey: apiKeysRepository(apiClient),
      analytics: analyticsRepository(apiClient),
      user,
      inbox: inboxRepository(apiClient),
    };
  }

  async function logout(
    request: Request,
    options: { redirectTo: RoutePath },
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
