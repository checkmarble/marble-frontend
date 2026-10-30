import { makeQueryErrorComponent } from '@bo/components/common/ErrorComponent';
import { SuspenseQuery } from '@bo/components/core/SuspenseQuery';
import {
  listTenantOidcDomainsQueryOptions,
  type Tenant,
  type TenantOidcConfiguration,
  type TenantOidcDomain,
  useCreateTenantOidcDomainMutationOptions,
  useDeleteTenantOidcConfigurationMutationOptions,
  useDeleteTenantOidcDomainMutationOptions,
  usePutTenantOidcConfigurationMutationOptions,
} from '@bo/data/tenants';
import {
  TENANT_OIDC_DOMAIN_CONFLICT_ERROR,
  TENANT_OIDC_LICENSE_REQUIRED_ERROR,
  TENANT_OIDC_NOT_FOUND_ERROR,
} from '@bo/schemas/tenant-oidc';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import toast from 'react-hot-toast';
import { Button, Input, Panel, Switch, TextArea, Typo } from 'ui-design-system';
import { Icon } from 'ui-icons';
import {
  isClientSecretRequired,
  makeTenantOidcFormSchema,
  type TenantOidcFormValues,
  toPutTenantOidcConfigurationPayload,
  toTenantOidcFormValues,
} from './oidc-form';

const FORM_ID = 'tenant-oidc-form';

const DomainsError = makeQueryErrorComponent(
  <span className="text-grey-secondary text-s">Could not load domains.</span>,
);

const ERROR_MESSAGES: Record<string, string> = {
  [TENANT_OIDC_LICENSE_REQUIRED_ERROR]: 'Saving an OIDC configuration requires an SSO license.',
  [TENANT_OIDC_NOT_FOUND_ERROR]: 'This tenant no longer exists, or per-tenant OIDC is not enabled on this deployment.',
  [TENANT_OIDC_DOMAIN_CONFLICT_ERROR]: 'Another tenant already uses this domain.',
};

const toErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? (ERROR_MESSAGES[error.message] ?? error.message) : fallback;

export function TenantOidcPanel({
  tenant,
  onOpenChange,
}: {
  tenant: Tenant | null;
  onOpenChange: (open: boolean) => void;
}) {
  const config = tenant?.oidc_configuration ?? null;

  return (
    <Panel.Root open={tenant !== null} onOpenChange={onOpenChange}>
      <Panel.Container size="medium">
        <Panel.Content>
          {tenant ? (
            // Remount once the configuration is created or deleted, so the form starts from it.
            <TenantOidcPanelBody
              key={`${tenant.id}-${config ? 'edit' : 'create'}`}
              tenant={tenant}
              config={config}
              onClose={() => onOpenChange(false)}
            />
          ) : null}
        </Panel.Content>
      </Panel.Container>
    </Panel.Root>
  );
}

function TenantOidcPanelBody({
  tenant,
  config,
  onClose,
}: {
  tenant: Tenant;
  config: TenantOidcConfiguration | null;
  onClose: () => void;
}) {
  const putMutation = useMutation(usePutTenantOidcConfigurationMutationOptions());
  const deleteMutation = useMutation(useDeleteTenantOidcConfigurationMutationOptions());
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const schema = makeTenantOidcFormSchema(config);

  const form = useForm({
    defaultValues: toTenantOidcFormValues(config),
    validators: { onChange: schema, onSubmit: schema },
    onSubmit: async ({ value, formApi }) => {
      if (!formApi.state.isValid) return;

      try {
        await putMutation.mutateAsync(toPutTenantOidcConfigurationPayload(tenant.id, value));
      } catch (error) {
        toast.error(toErrorMessage(error, 'Could not save the OIDC configuration.'));
        return;
      }
      if (config) {
        toast.success('OIDC configuration saved');
        onClose();
      } else {
        // Stay open: the panel switches to editing, where the sign-in domains can be added.
        toast.success('OIDC configuration created. Add the email domains that sign in through it.');
      }
    },
  });

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(tenant.id);
      toast.success('OIDC configuration deleted');
      onClose();
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not delete the OIDC configuration.'));
    }
  };

  return (
    <>
      <Panel.Header>
        <div className="flex flex-col gap-2xs">
          <span>{config ? 'OIDC configuration' : 'Create OIDC configuration'}</span>
          <p className="text-grey-secondary text-small font-normal">{tenant.name}</p>
        </div>
      </Panel.Header>

      <div className="flex flex-col gap-xl">
        <form
          id={FORM_ID}
          className="flex flex-col gap-lg"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <form.Field name="issuer">
            {(field) => (
              <Field label="Issuer URL" errors={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="https://login.example.com"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="clientId">
            {(field) => (
              <Field label="Client ID" errors={field.state.meta.isTouched ? field.state.meta.errors : []}>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                  onBlur={field.handleBlur}
                />
              </Field>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => isClientSecretRequired(state.values as TenantOidcFormValues, config)}>
            {(isRequired) => (
              <form.Field name="clientSecret">
                {(field) => (
                  <Field
                    label="Client secret"
                    hint={
                      isRequired
                        ? undefined
                        : 'A secret is stored and never shown. Leave empty to keep it, or enter a new one to replace it.'
                    }
                    errors={field.state.meta.isTouched ? field.state.meta.errors : []}
                  >
                    <Input
                      id={field.name}
                      type="password"
                      autoComplete="off"
                      value={field.state.value}
                      onChange={(event) => field.handleChange(event.currentTarget.value)}
                      onBlur={field.handleBlur}
                      placeholder={isRequired ? undefined : '••••••••'}
                    />
                  </Field>
                )}
              </form.Field>
            )}
          </form.Subscribe>

          <form.Field name="scopes">
            {(field) => (
              <Field
                label="Scopes"
                hint="Separate scopes with spaces. Defaults to openid, profile and email. You may need additional scopes for the refresh token like 'offline_access'. Check your oidc provider documentation for more information."
              >
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="openid profile email"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="emailClaim">
            {(field) => (
              <Field label="Email claim" hint="Optional. The ID token claim that holds the user's email.">
                <Input
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="email"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="extraParams">
            {(field) => (
              <Field
                label="Extra authorization parameters"
                hint="Optional. One key=value per line, added to the authorization request."
                errors={field.state.meta.isTouched ? field.state.meta.errors : []}
              >
                <TextArea
                  id={field.name}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.currentTarget.value)}
                  onBlur={field.handleBlur}
                  placeholder="prompt=login"
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="ssoEnabled">
            {(field) => (
              <label className="border-grey-border flex items-center justify-between gap-md rounded-md border px-md py-sm">
                <span className="flex flex-col">
                  <span className="text-grey-primary text-s font-medium">Sign-in enabled</span>
                  <span className="text-grey-secondary text-xs">
                    When off, the configuration is kept but users cannot sign in through it.
                  </span>
                </span>
                <Switch checked={field.state.value} onCheckedChange={(checked) => field.handleChange(checked)} />
              </label>
            )}
          </form.Field>
        </form>

        {config ? <TenantOidcDomains tenantId={tenant.id} /> : null}
      </div>

      <Panel.Footer>
        {isConfirmingDelete ? (
          <>
            {/* In the footer, not the body, so the warning stays next to the button whatever the scroll. */}
            <p role="alert" className="text-red-primary mr-auto flex items-start gap-xs self-center text-s">
              <Icon icon="warning" className="mt-px size-4 shrink-0" />
              <span>Users of {tenant.name} will no longer be able to sign in through it. Its domains are kept.</span>
            </p>
            <Panel.FooterButton
              label="Cancel"
              variant="secondary"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={deleteMutation.isPending}
            />
            <Panel.FooterButton
              label="Delete"
              variant="destructive"
              onClick={() => void handleDelete()}
              isLoading={deleteMutation.isPending}
            />
          </>
        ) : (
          <>
            {config ? (
              <Panel.FooterButton
                label="Delete"
                variant="secondary"
                leadingIcon="delete"
                className="mr-auto"
                onClick={() => setIsConfirmingDelete(true)}
                disabled={putMutation.isPending}
              />
            ) : null}
            <Panel.FooterButton isCloseButton label="Cancel" disabled={putMutation.isPending} />
            <form.Subscribe selector={(state) => [state.canSubmit, state.isDirty] as const}>
              {([canSubmit, isDirty]) => (
                <Panel.FooterButton
                  type="submit"
                  form={FORM_ID}
                  label={config ? 'Save changes' : 'Create configuration'}
                  variant="primary"
                  disabled={!canSubmit || !isDirty}
                  isLoading={putMutation.isPending}
                />
              )}
            </form.Subscribe>
          </>
        )}
      </Panel.Footer>
    </>
  );
}

function TenantOidcDomains({ tenantId }: { tenantId: string }) {
  return (
    <div className="flex flex-col gap-sm">
      <div className="flex flex-col gap-2xs">
        <Typo variant="subtitle1">Sign-in domains</Typo>
        <p className="text-grey-secondary text-xs">
          Users whose email ends with one of these domains are sent to this identity provider when they sign in.
        </p>
      </div>
      <SuspenseQuery
        query={listTenantOidcDomainsQueryOptions(tenantId)}
        fallback={<div className="bg-grey-background-light h-10 animate-pulse rounded-md" />}
        errorComponent={DomainsError}
      >
        {(domains) => <TenantOidcDomainList tenantId={tenantId} domains={domains} />}
      </SuspenseQuery>
    </div>
  );
}

function TenantOidcDomainList({ tenantId, domains }: { tenantId: string; domains: TenantOidcDomain[] }) {
  const createMutation = useMutation(useCreateTenantOidcDomainMutationOptions());
  const deleteMutation = useMutation(useDeleteTenantOidcDomainMutationOptions());
  const [domain, setDomain] = useState('');

  const handleAdd = async () => {
    const value = domain.trim();
    if (!value) return;
    try {
      await createMutation.mutateAsync({ tenantId, domain: value });
      setDomain('');
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not add the domain.'));
    }
  };

  const handleRemove = async (domainId: string) => {
    try {
      await deleteMutation.mutateAsync({ tenantId, domainId });
    } catch (error) {
      toast.error(toErrorMessage(error, 'Could not remove the domain.'));
    }
  };

  return (
    <div className="flex flex-col gap-sm">
      {domains.length === 0 ? (
        <p className="text-grey-placeholder text-s">No domains yet: nobody is sent to this provider.</p>
      ) : (
        <ul className="border-grey-border bg-surface-card divide-grey-border divide-y overflow-hidden rounded-lg border">
          {domains.map(({ id, domain: name }) => (
            <li key={id} className="flex items-center justify-between gap-md px-md py-sm">
              <span className="text-grey-primary truncate font-mono text-s">{name}</span>
              <Button
                variant="secondary"
                size="small"
                onClick={() => void handleRemove(id)}
                disabled={deleteMutation.isPending && deleteMutation.variables?.domainId === id}
                aria-label={`Remove ${name}`}
              >
                <Icon icon="delete" className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="flex items-center gap-sm"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void handleAdd();
        }}
      >
        <Input
          className="flex-1"
          value={domain}
          onChange={(event) => setDomain(event.currentTarget.value)}
          placeholder="example.com"
          aria-label="Domain"
        />
        <Button type="submit" variant="secondary" size="medium" disabled={!domain.trim() || createMutation.isPending}>
          <Icon icon="plus" className="size-4" />
          Add domain
        </Button>
      </form>
    </div>
  );
}

function firstError(errors: unknown[]): string | null {
  for (const error of errors) {
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
  }
  return null;
}

function Field({
  label,
  hint,
  errors = [],
  children,
}: {
  label: string;
  hint?: string;
  errors?: unknown[];
  children: ReactNode;
}) {
  const error = firstError(errors);

  return (
    <label className="flex flex-col gap-xs">
      <span className="text-grey-primary text-s font-medium">{label}</span>
      {children}
      {error ? (
        <span className="text-red-primary text-xs">{error}</span>
      ) : hint ? (
        <span className="text-grey-secondary text-xs">{hint}</span>
      ) : null}
    </label>
  );
}
