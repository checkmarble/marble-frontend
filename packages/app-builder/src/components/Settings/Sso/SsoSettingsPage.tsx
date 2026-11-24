import { Callout } from '@app-builder/components/Callout';
import { Page } from '@app-builder/components/Page';
import { type TenantDomain, type TenantOidcConfiguration } from '@app-builder/models/tenant-oidc';
import { useSaveSsoConfigurationMutation } from '@app-builder/queries/settings/sso/save-sso-configuration';
import { type getSsoSettingsFn } from '@app-builder/server-fns/settings';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { isClientSecretRequired, parseExtraParams } from '@marble/shared';
import { useForm, useSelector } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Tag, TextArea, Typo } from 'ui-design-system';
import { z } from 'zod/v4';
import { SsoDomainsSection } from './SsoDomainsSection';
import { SsoCopyableValue, SsoField, SsoSection, SsoTextField } from './SsoLayout';
import { SsoRecoveryKeyCard } from './SsoRecoveryKeyCard';
import { SsoTestResult } from './SsoTestResult';
import {
  canEnableSso,
  hasOfflineAccess,
  isRecoveryKeyRequired,
  isTestedConnection,
  toSaveSsoConfigurationPayload,
  toSsoConnection,
  toSsoFormValues,
} from './sso-form';
import { useSsoTestSignIn } from './use-sso-test-sign-in';

type SsoSettings = Awaited<ReturnType<typeof getSsoSettingsFn>>;

export function SsoSettingsPage({ settings }: { settings: SsoSettings }) {
  const { t } = useTranslation(['settings']);
  const { configuration, domains, recoveryKeys, callbackUrl, ssoLicensed, canCreateRecoveryKey, apiUrl, tenantId } =
    settings;
  // Only verified domains send users to the identity provider.
  const verifiedDomains = domains.filter((domain) => domain.verifiedAt !== null).map((domain) => domain.domain);
  const isActive = configuration?.ssoEnabled === true && verifiedDomains.length > 0;

  return (
    <Page.Content width="readable">
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <div className="flex items-center gap-sm">
            <Typo variant="title2">{t('settings:sso.title')}</Typo>
            <Tag color={isActive ? 'green' : 'grey'}>
              {isActive ? t('settings:sso.status.active') : t('settings:sso.status.not_active')}
            </Tag>
          </div>
          <p className="text-xs text-grey-primary">{t('settings:sso.description')}</p>
        </div>

        {ssoLicensed ? null : (
          <Callout variant="outlined" color="orange" icon="warning" iconColor="orange">
            {t('settings:sso.license_missing')}
          </Callout>
        )}

        <SsoSection
          highlighted
          title={t('settings:sso.register.title')}
          description={t('settings:sso.register.description')}
        >
          <div className="grid grid-cols-2 gap-md">
            <SsoField id="sso-callback-url" label={t('settings:sso.register.callback_url')}>
              <SsoCopyableValue id="sso-callback-url" value={callbackUrl} />
            </SsoField>
          </div>
        </SsoSection>

        <SsoConnectionForm
          configuration={configuration}
          domains={domains}
          verifiedDomains={verifiedDomains}
          readOnly={!ssoLicensed}
          recoveryKeyRequired={isRecoveryKeyRequired({ recoveryKeys, canCreateRecoveryKey, configuration })}
        />

        {canCreateRecoveryKey ? (
          <SsoRecoveryKeyCard
            apiUrl={apiUrl}
            tenantId={tenantId}
            configuration={configuration}
            recoveryKeys={recoveryKeys}
          />
        ) : null}
      </div>
    </Page.Content>
  );
}

const SAVE_ERROR_KEYS = {
  invalid: 'settings:sso.errors.invalid',
  license: 'settings:sso.license_missing',
  forbidden: 'settings:sso.errors.forbidden',
  unknown: 'common:errors.unknown',
} as const;

function SsoConnectionForm({
  configuration,
  domains,
  verifiedDomains,
  readOnly,
  recoveryKeyRequired,
}: {
  configuration: TenantOidcConfiguration | null;
  domains: TenantDomain[];
  verifiedDomains: string[];
  readOnly: boolean;
  recoveryKeyRequired: boolean;
}) {
  const { t } = useTranslation(['common', 'settings']);
  const router = useRouter();
  const saveMutation = useSaveSsoConfigurationMutation();
  const test = useSsoTestSignIn();
  const testedConnection = test.state.status === 'success' ? test.state.connection : null;

  const defaultValues = useMemo(() => toSsoFormValues(configuration), [configuration]);
  const formSchema = useMemo(
    () =>
      z
        .object({
          issuer: z
            .string()
            .trim()
            .pipe(z.url(t('settings:sso.connect.issuer.invalid'))),
          clientId: z.string().trim().min(1, t('settings:sso.connect.client_id.required')),
          clientSecret: z.string(),
          scopes: z.string(),
          extraParams: z.string(),
          emailClaim: z.string(),
          ssoEnabled: z.boolean(),
        })
        .superRefine((values, context) => {
          if (values.clientSecret.trim() || !isClientSecretRequired(configuration, values)) return;
          context.addIssue({
            code: 'custom',
            path: ['clientSecret'],
            message: configuration
              ? t('settings:sso.connect.client_secret.required_changed')
              : t('settings:sso.connect.client_secret.required'),
          });
        }),
    [configuration, t],
  );

  const form = useForm({
    defaultValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value }) => {
      // Never turn SSO on for a connection the gate does not allow, even if it was ticked before an edit.
      const ssoEnabled =
        value.ssoEnabled && canEnableSso({ values: value, configuration, testedConnection, recoveryKeyRequired });
      try {
        const result = await saveMutation.mutateAsync(toSaveSsoConfigurationPayload(value, ssoEnabled));
        if (!result) return;
        if (!result.success) {
          const message = t(SAVE_ERROR_KEYS[result.error]);
          toast.error(result.message ? `${message} ${result.message}` : message);
          return;
        }
        toast.success(t('common:success.save'));
        // The saved secret is the tested one: the pass still holds once the field empties to keep it.
        if (test.state.status === 'success' && isTestedConnection(toSsoConnection(value), test.state.connection)) {
          test.setState({ ...test.state, connection: { ...test.state.connection, clientSecret: '' } });
        }
        await router.invalidate();
        form.reset();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
  });

  const values = useSelector(form.store, (state) => state.values);
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const connection = toSsoConnection(values);
  const canEnable = canEnableSso({ values, configuration, testedConnection, recoveryKeyRequired });
  const isTestRunning = test.state.status === 'running';
  const hasTestValues = !!connection.issuer && !!connection.clientId && !!connection.clientSecret;
  const passMatches = isTestedConnection(connection, testedConnection);

  return (
    <form onSubmit={handleSubmit(form)} className="contents" noValidate>
      <SsoSection title={t('settings:sso.connect.title')} description={t('settings:sso.connect.description')}>
        <div className="grid grid-cols-2 gap-md">
          <form.Field name="issuer">
            {(field) => (
              <SsoTextField
                field={field}
                label={t('settings:sso.connect.issuer')}
                hint={t('settings:sso.connect.issuer.hint')}
                readOnly={readOnly}
                type="url"
                placeholder="https://your-idp.com/oauth2/default"
              />
            )}
          </form.Field>
          <form.Field name="clientId">
            {(field) => (
              <SsoTextField
                field={field}
                label={t('settings:sso.connect.client_id')}
                readOnly={readOnly}
                placeholder="client-zypcdne2"
              />
            )}
          </form.Field>
          <form.Field name="clientSecret">
            {(field) => (
              <SsoTextField
                field={field}
                label={t('settings:sso.connect.client_secret')}
                hint={
                  configuration
                    ? t('settings:sso.connect.client_secret.hint')
                    : t('settings:sso.connect.client_secret.hint_new')
                }
                readOnly={readOnly}
                type="password"
                autoComplete="new-password"
                placeholder={configuration ? '••••••••••' : undefined}
              />
            )}
          </form.Field>
          <form.Field name="scopes">
            {(field) => (
              <SsoTextField
                field={field}
                label={t('settings:sso.connect.scopes')}
                hint={t('settings:sso.connect.scopes.hint')}
                readOnly={readOnly}
                placeholder="openid profile email"
              />
            )}
          </form.Field>
          <form.Field name="emailClaim">
            {(field) => (
              <SsoTextField
                field={field}
                label={t('settings:sso.connect.email_claim')}
                hint={t('settings:sso.connect.email_claim.hint')}
                readOnly={readOnly}
                placeholder="email"
              />
            )}
          </form.Field>
          <form.Field
            name="extraParams"
            validators={{
              onChange: ({ value }) =>
                parseExtraParams(value) === null
                  ? { message: t('settings:sso.connect.extra_params.invalid') }
                  : undefined,
            }}
          >
            {(field) => {
              const errors = getFieldErrors(field.state.meta.errors);
              return (
                <SsoField
                  id={field.name}
                  label={t('settings:sso.connect.extra_params')}
                  hint={t('settings:sso.connect.extra_params.hint')}
                  errors={errors}
                >
                  <TextArea
                    id={field.name}
                    dir="ltr"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    readOnly={readOnly}
                    placeholder="prompt=login"
                    aria-invalid={errors.length > 0 || undefined}
                    borderColor={errors.length > 0 ? 'redfigma-47' : 'greyfigma-90'}
                  />
                </SsoField>
              );
            }}
          </form.Field>
        </div>
      </SsoSection>

      <SsoDomainsSection domains={domains} verifiedDomains={verifiedDomains} />

      <SsoSection title={t('settings:sso.test.title')} description={t('settings:sso.test.description')}>
        <SsoTestResult state={test.state} passMatches={passMatches} verifiedDomains={verifiedDomains} />
        <div className="flex flex-col gap-xs">
          <div className="flex flex-wrap items-center gap-sm">
            <Button
              variant="primary"
              appearance="stroked"
              disabled={readOnly || isTestRunning || !hasTestValues || connection.extraParams === null}
              onClick={() => test.run(connection)}
            >
              {passMatches ? t('settings:sso.test.run_again') : t('settings:sso.test.run')}
            </Button>
            {isTestRunning ? (
              <>
                <span className="text-xs text-grey-secondary">{t('settings:sso.test.running')}</span>
                <Button variant="secondary" appearance="link" onClick={test.cancel}>
                  {t('settings:sso.test.cancel')}
                </Button>
              </>
            ) : null}
          </div>
          {!readOnly && !hasTestValues ? (
            <p className="text-2xs text-grey-secondary">{t('settings:sso.test.missing_values')}</p>
          ) : null}
        </div>

        <div className="flex items-start gap-sm">
          <Checkbox
            name="sso-enabled"
            size="small"
            className="mt-2xs"
            checked={values.ssoEnabled && canEnable}
            disabled={readOnly || !canEnable}
            onCheckedChange={(checked) => form.setFieldValue('ssoEnabled', checked === true)}
          />
          <div className="flex flex-col gap-2xs">
            <label htmlFor="sso-enabled" className="text-xs text-grey-primary font-medium">
              {t('settings:sso.enable.label')}
            </label>
            <p className="text-2xs text-grey-secondary">
              {recoveryKeyRequired
                ? t('settings:sso.enable.description_recovery_key')
                : !canEnable
                  ? t('settings:sso.enable.description_locked')
                  : values.ssoEnabled
                    ? t('settings:sso.enable.description_on')
                    : t('settings:sso.enable.description_off')}
            </p>
          </div>
        </div>
        {hasOfflineAccess(values.scopes) ? null : (
          <Callout variant="outlined" color="purple" iconColor="purple">
            {t('settings:sso.offline_access.missing')}
          </Callout>
        )}

        <div className="flex items-center gap-sm">
          <Button variant="primary" appearance="link" disabled={readOnly || isSubmitting} onClick={() => form.reset()}>
            {t('common:cancel')}
          </Button>
          <Button type="submit" disabled={readOnly || isSubmitting || isTestRunning}>
            {t('settings:sso.save')}
          </Button>
        </div>
      </SsoSection>
    </form>
  );
}
