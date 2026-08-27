import { authI18n } from '@app-builder/components/Auth/auth-i18n';
import { CalloutV2 } from '@app-builder/components/Callout';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { LanguagePicker } from '@app-builder/components/LanguagePicker';
import { servicesMiddleware } from '@app-builder/middlewares/services-middleware';
import { useCreateInitialOrgMutation } from '@app-builder/queries/onboarding/create-initial-org';
import {
  createInitialOrgPayloadSchema,
  getOnboardingFormSchema,
  MIN_PASSWORD_LENGTH,
  type OnboardingFormValues,
} from '@app-builder/schemas/onboarding';
import { getFieldErrors, handleSubmit } from '@app-builder/utils/form';
import { type AnyFieldApi, useForm } from '@tanstack/react-form';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { useMemo } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, Input, Typo } from 'ui-design-system';
import { Icon, Logo } from 'ui-icons';
import type z from 'zod/v4';

const onboardingLoader = createServerFn()
  .middleware([servicesMiddleware])
  .handler(async function onboardingLoader({ context }) {
    const appConfig = context.appConfig;

    // Onboarding only makes sense on a migrated, empty instance. Anything else
    // belongs on the sign-in page, which explains what is still missing.
    if (!appConfig || !appConfig.status.migrations || appConfig.status.hasOrg) {
      throw redirect({ to: '/sign-in' });
    }

    return { authProvider: appConfig.auth.provider };
  });

export const Route = createFileRoute('/_app/onboarding')({
  staticData: {
    i18n: authI18n,
  },
  beforeLoad: async ({ context }) => {
    await context.i18n.loadNamespaces(['common', 'auth']);
  },
  loader: () => onboardingLoader(),
  component: Onboarding,
});

/**
 * Validate a field on blur, but never while typing and never on a field left
 * untouched — an error under an empty input shifts the layout for nothing.
 * Missing values are still caught by the form-level validator on submit.
 */
const onBlurWhenFilled = (schema: z.ZodType<string>) => ({
  onBlur: ({ value }: { value: string }) => (value === '' ? undefined : schema.safeParse(value).error?.issues[0]),
});

const isLongEnough = (password: string) => password.length >= MIN_PASSWORD_LENGTH;
const doPasswordsMatch = ({ password, passwordConfirmation }: OnboardingFormValues) =>
  password !== '' && password === passwordConfirmation;

function Onboarding() {
  const { t } = useTranslation(['auth', 'common']);
  const { authProvider } = Route.useLoaderData();
  const createInitialOrgMutation = useCreateInitialOrgMutation();

  // OIDC instances have no local credentials to set: the identity provider owns them.
  const requiresPassword = authProvider !== 'oidc';
  const formSchema = useMemo(() => getOnboardingFormSchema(requiresPassword), [requiresPassword]);

  const form = useForm({
    defaultValues: {
      organization: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
    } as OnboardingFormValues,
    validators: { onSubmit: formSchema },
    onSubmit: async ({ value: { passwordConfirmation: _, password, ...rest } }) => {
      const result = await createInitialOrgMutation.mutateAsync(requiresPassword ? { ...rest, password } : rest);

      if (result.error === 'already_initialized') {
        toast.error(t('auth:onboarding.errors.already_initialized'));
        window.location.href = '/sign-in';
        return;
      }

      // A full page load lets the root loader pick up the refreshed app config.
      // The password is set, so the new user can sign in straight away.
      window.location.href = requiresPassword ? `/sign-in-email?email=${encodeURIComponent(rest.email)}` : '/sign-in';
    },
  });

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#080525] p-xl">
      <div className="bg-surface-card flex w-full max-w-[520px] flex-col gap-2xl rounded-2xl p-2xl shadow-md">
        <Logo
          logo="logo-standard"
          className="text-grey-primary h-8 w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-labelledby="marble"
        />
        <div className="flex flex-col gap-sm">
          <Typo variant="title2" className="text-center">
            {t('auth:onboarding.title')}
          </Typo>
          <p className="text-s text-grey-secondary text-center">{t('auth:onboarding.description')}</p>
        </div>
        <form className="flex flex-col gap-lg" onSubmit={handleSubmit(form)}>
          <form.Field
            name="organization"
            validators={onBlurWhenFilled(createInitialOrgPayloadSchema.shape.organization)}
          >
            {(field) => <OnboardingField field={field} label={t('auth:onboarding.organization')} type="text" />}
          </form.Field>
          <div className="flex gap-lg">
            <form.Field name="firstName" validators={onBlurWhenFilled(createInitialOrgPayloadSchema.shape.firstName)}>
              {(field) => (
                <OnboardingField field={field} label={t('auth:onboarding.first_name')} type="text" className="flex-1" />
              )}
            </form.Field>
            <form.Field name="lastName" validators={onBlurWhenFilled(createInitialOrgPayloadSchema.shape.lastName)}>
              {(field) => (
                <OnboardingField field={field} label={t('auth:onboarding.last_name')} type="text" className="flex-1" />
              )}
            </form.Field>
          </div>
          <form.Field name="email" validators={onBlurWhenFilled(createInitialOrgPayloadSchema.shape.email)}>
            {(field) => <OnboardingField field={field} label={t('auth:onboarding.email')} type="email" />}
          </form.Field>
          {/* Both password criteria are reported by the indicators below, so the
              inputs themselves stay free of redundant field-level errors. */}
          {!requiresPassword ? <CalloutV2>{t('auth:onboarding.external_account_notice')}</CalloutV2> : null}
          {requiresPassword ? (
            <div className="flex flex-col gap-md">
              <div className="flex gap-lg">
                <form.Field name="password">
                  {(field) => (
                    <OnboardingField
                      field={field}
                      label={t('auth:onboarding.password')}
                      type="password"
                      className="flex-1"
                    />
                  )}
                </form.Field>
                <form.Field name="passwordConfirmation">
                  {(field) => (
                    <OnboardingField
                      field={field}
                      label={t('auth:onboarding.password_confirmation')}
                      type="password"
                      className="flex-1"
                    />
                  )}
                </form.Field>
              </div>
              <form.Subscribe selector={(state) => state.values}>
                {(values) => (
                  <div className="flex flex-col gap-2xs">
                    <PasswordCriterion
                      fulfilled={isLongEnough(values.password)}
                      label={t('auth:onboarding.password_criteria.length', { min: MIN_PASSWORD_LENGTH })}
                    />
                    <PasswordCriterion
                      fulfilled={doPasswordsMatch(values)}
                      label={t('auth:onboarding.password_criteria.match')}
                    />
                  </div>
                )}
              </form.Subscribe>
            </div>
          ) : null}
          <form.Subscribe selector={(state) => [state.values, state.isSubmitting] as const}>
            {([values, isSubmitting]) => (
              <Button
                type="submit"
                size="large"
                className="w-full justify-center"
                disabled={
                  isSubmitting || (requiresPassword && (!isLongEnough(values.password) || !doPasswordsMatch(values)))
                }
              >
                {t('auth:onboarding.submit')}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </div>
      <div className="absolute bottom-6 right-6">
        <LanguagePicker />
      </div>
    </div>
  );
}

function OnboardingField({
  field,
  label,
  type,
  className,
}: {
  field: AnyFieldApi;
  label: string;
  type: 'text' | 'email' | 'password';
  className?: string;
}) {
  const valid = field.state.meta.errors.length === 0;

  return (
    <div className={cn('flex flex-col items-start gap-sm', className)}>
      <FormLabel name={field.name} valid={valid}>
        {label}
      </FormLabel>
      <Input
        type={type}
        id={field.name}
        name={field.name}
        className="w-full"
        borderColor={valid ? 'greyfigma-90' : 'redfigma-47'}
        // Controlled, so a browser restoring values on reload cannot desync the
        // visible input from the form state backing the submit button.
        value={field.state.value}
        onChange={(e) => field.handleChange(e.currentTarget.value)}
        onBlur={field.handleBlur}
        enablePasswordManagers
      />
      <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
    </div>
  );
}

function PasswordCriterion({ label, fulfilled }: { label: string; fulfilled: boolean }) {
  return (
    <span
      className={cn(
        'text-xs flex items-center gap-xs font-medium transition-colors',
        fulfilled ? 'text-green-primary' : 'text-grey-secondary',
      )}
    >
      <Icon icon={fulfilled ? 'tick' : 'dot'} className="size-4 shrink-0" />
      {label}
    </span>
  );
}
