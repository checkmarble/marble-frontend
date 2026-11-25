import { Callout } from '@app-builder/components/Callout';
import { useFormatDateTime } from '@app-builder/utils/format';
import { type ParseKeys } from 'i18next';
import { useTranslation } from 'react-i18next';
import { isEmailDomainVerified } from './sso-form';
import { type SsoTestError, type SsoTestReason, type SsoTestState } from './use-sso-test-sign-in';

const TEST_ERROR_KEYS = {
  unreachable: 'settings:sso.test.errors.unreachable',
  invalid_discovery: 'settings:sso.test.errors.invalid_discovery',
  issuer_mismatch: 'settings:sso.test.errors.issuer_mismatch',
  insecure_url: 'settings:sso.test.errors.insecure_url',
  expired: 'settings:sso.test.errors.expired',
  idp_error: 'settings:sso.test.errors.idp_error',
  token_exchange_failed: 'settings:sso.test.errors.token_exchange_failed',
  invalid_client: 'settings:sso.test.errors.invalid_client',
  invalid_id_token: 'settings:sso.test.errors.invalid_id_token',
  missing_email: 'settings:sso.test.errors.missing_email',
  popup_blocked: 'settings:sso.test.errors.popup_blocked',
  timeout: 'settings:sso.test.errors.timeout',
  unknown: 'settings:sso.test.errors.unknown',
} as const satisfies Record<SsoTestError, ParseKeys<['settings']>>;

const TEST_REASON_KEYS = {
  not_jwt: 'settings:sso.test.details.not_jwt',
  signing_alg: 'settings:sso.test.details.signing_alg',
  issuer_mismatch: 'settings:sso.test.details.issuer_mismatch',
  audience: 'settings:sso.test.details.audience',
  nonce: 'settings:sso.test.details.nonce',
  no_subject: 'settings:sso.test.details.no_subject',
  claim_type: 'settings:sso.test.details.claim_type',
  no_id_token: 'settings:sso.test.details.no_id_token',
  http_status: 'settings:sso.test.details.http_status',
  claim_missing: 'settings:sso.test.details.claim_missing',
  no_verified_email: 'settings:sso.test.details.no_verified_email',
} as const satisfies Record<SsoTestReason, ParseKeys<['settings']>>;

export function SsoTestResult({
  state,
  passMatches,
  verifiedDomains,
}: {
  state: SsoTestState;
  passMatches: boolean;
  verifiedDomains: string[];
}) {
  const { t } = useTranslation(['settings']);
  const formatDateTime = useFormatDateTime();

  if (state.status === 'success' && passMatches) {
    return (
      <>
        <Callout variant="outlined" color="purple" iconColor="purple">
          {t('settings:sso.test.success', {
            email: state.email,
            date: formatDateTime(state.testedAt, { dateStyle: 'medium', timeStyle: 'short' }),
          })}
        </Callout>
        {isEmailDomainVerified(state.email, verifiedDomains) ? null : (
          <Callout variant="outlined" color="orange" icon="warning" iconColor="orange">
            {t('settings:sso.test.domain_not_verified', { email: state.email })}
          </Callout>
        )}
      </>
    );
  }

  if (state.status === 'error') {
    return (
      <Callout variant="outlined" color="red" icon="error" iconColor="red">
        <div className="flex min-w-0 flex-col gap-2xs">
          <span>{t(TEST_ERROR_KEYS[state.error])}</span>
          {state.reason ? (
            <span className="text-xs text-grey-secondary break-words">
              {t(TEST_REASON_KEYS[state.reason], { value: state.value })}
            </span>
          ) : null}
          {state.detail ? (
            <span dir="auto" className="text-xs text-grey-secondary break-words">
              {state.detail}
            </span>
          ) : null}
        </div>
      </Callout>
    );
  }

  return null;
}
