import { type TenantOidcConfiguration } from '@app-builder/models/tenant-oidc';
import { type SaveSsoConfigurationPayload } from '@app-builder/queries/settings/sso/save-sso-configuration';
import { DEFAULT_OIDC_SCOPES, formatExtraParams, formatScopes, parseExtraParams, parseScopes } from '@marble/shared';
import * as R from 'remeda';

/** Scopes and extra parameters are edited as text: space-separated scopes, one `key=value` per line. */
type SsoFormValues = {
  issuer: string;
  clientId: string;
  /** Empty keeps the stored secret. */
  clientSecret: string;
  scopes: string;
  extraParams: string;
  emailClaim: string;
  ssoEnabled: boolean;
};

export const toSsoFormValues = (configuration: TenantOidcConfiguration | null): SsoFormValues => ({
  issuer: configuration?.issuer ?? '',
  clientId: configuration?.clientId ?? '',
  clientSecret: '',
  scopes: formatScopes(configuration?.scopes ?? DEFAULT_OIDC_SCOPES),
  extraParams: formatExtraParams(configuration?.extraParams ?? {}),
  emailClaim: configuration?.emailClaim ?? '',
  ssoEnabled: configuration?.ssoEnabled ?? false,
});

export const hasOfflineAccess = (scopes: string) => parseScopes(scopes).includes('offline_access');

export function isEmailDomainVerified(email: string, verifiedDomains: string[]): boolean {
  const at = email.indexOf('@');
  if (at <= 0) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return verifiedDomains.some((verified) => verified.toLowerCase() === domain);
}

/** The values a test sign-in depends on, normalized the way the backend reads them. */
export type SsoConnection = {
  issuer: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  /** `null` when the text is not one `key=value` per line. */
  extraParams: Record<string, string> | null;
  emailClaim: string;
};

export const toSsoConnection = (values: SsoFormValues): SsoConnection => {
  const scopes = parseScopes(values.scopes);
  return {
    issuer: values.issuer.trim(),
    clientId: values.clientId.trim(),
    clientSecret: values.clientSecret,
    scopes: scopes.length > 0 ? scopes : DEFAULT_OIDC_SCOPES,
    extraParams: parseExtraParams(values.extraParams),
    emailClaim: values.emailClaim.trim(),
  };
};

export const isTestedConnection = (connection: SsoConnection, testedConnection: SsoConnection | null) =>
  testedConnection !== null && R.isDeepEqual(testedConnection, connection);

/**
 * SSO sign-in can be turned on for a connection that passed a test sign-in, or kept on when the
 * saved connection is already on and unchanged (an empty secret field keeps the stored secret).
 * Neither applies while a recovery key is required (see `isRecoveryKeyRequired`).
 * The backend accepts `sso_enabled: true` without any test: this gate exists only in the UI.
 */
export const canEnableSso = ({
  values,
  configuration,
  testedConnection,
  recoveryKeyRequired,
}: {
  values: SsoFormValues;
  configuration: TenantOidcConfiguration | null;
  testedConnection: SsoConnection | null;
  recoveryKeyRequired: boolean;
}) => {
  if (recoveryKeyRequired) return false;
  const connection = toSsoConnection(values);
  if (isTestedConnection(connection, testedConnection)) return true;
  return (
    configuration?.ssoEnabled === true && R.isDeepEqual(connection, toSsoConnection(toSsoFormValues(configuration)))
  );
};

/**
 * SSO sign-in can't be turned on before a recovery key exists, so an admin can still turn it off if a
 * configuration change locks everyone out. A saved configuration that is already on stays allowed, and a key
 * list that could not be read (`null`) or a user who can't create keys never blocks.
 * The backend accepts `sso_enabled: true` without any recovery key: this gate exists only in the UI.
 */
export const isRecoveryKeyRequired = ({
  recoveryKeys,
  canCreateRecoveryKey,
  configuration,
}: {
  recoveryKeys: unknown[] | null;
  canCreateRecoveryKey: boolean;
  configuration: TenantOidcConfiguration | null;
}) => canCreateRecoveryKey && recoveryKeys?.length === 0 && configuration?.ssoEnabled !== true;

export const toSaveSsoConfigurationPayload = (
  values: SsoFormValues,
  ssoEnabled: boolean,
): SaveSsoConfigurationPayload => {
  const connection = toSsoConnection(values);
  return { ...connection, extraParams: connection.extraParams ?? {}, ssoEnabled };
};
