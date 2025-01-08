import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import {
  EmailUnverified,
  InvalidLoginCredentials,
  NetworkRequestFailed,
  useEmailAndPasswordSignIn,
  UserNotFoundError,
  WrongPasswordError,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import { getRoute } from '@app-builder/utils/routes';
import { sleep } from '@app-builder/utils/sleep';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import type * as React from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, Input, UX_DELAY_1S } from 'ui-design-system';
import * as z from 'zod';

import { Spinner } from '../Spinner';

const emailAndPasswordFormSchema = z.object({
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Required'),
  }),
});
type EmailAndPasswordFormValues = z.infer<typeof emailAndPasswordFormSchema>;

export function SignInWithEmailAndPassword({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  const formMethods = useForm<z.infer<typeof emailAndPasswordFormSchema>>({
    resolver: zodResolver(emailAndPasswordFormSchema),
    defaultValues: {
      credentials: { email: '', password: '' },
    },
  });

  return (
    <FormProvider {...formMethods}>
      <ClientOnly
        fallback={<SignInWithEmailAndPasswordForm loading={loading} />}
      >
        {() => (
          <ClientSignInWithEmailAndPasswordForm
            loading={loading}
            signIn={signIn}
          />
        )}
      </ClientOnly>
    </FormProvider>
  );
}

function SignInWithEmailAndPasswordForm({
  loading,
  ...props
}: Omit<React.ComponentPropsWithoutRef<'form'>, 'children'> & {
  loading?: boolean;
}) {
  const { t } = useTranslation(['auth', 'common']);
  const { control } = useFormContext<EmailAndPasswordFormValues>();
  const hydrated = useHydrated();
  return (
    <form noValidate className="flex w-full flex-col gap-4" {...props}>
      <FormField
        control={control}
        name="credentials.email"
        render={({ field }) => (
          <FormItem className="flex flex-col items-start gap-2">
            <FormLabel>{t('auth:sign_in.email')}</FormLabel>
            <FormControl>
              <Input
                disabled={!hydrated}
                className="w-full"
                type="email"
                {...field}
              />
            </FormControl>
            <FormError />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="credentials.password"
        render={({ field }) => (
          <FormItem className="flex flex-col items-start gap-2">
            <FormLabel>{t('auth:sign_in.password')}</FormLabel>
            <FormControl>
              <Input
                className="w-full"
                type="password"
                autoComplete="current-password"
                disabled={!hydrated}
                {...field}
              />
            </FormControl>
            <FormError />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="credentials"
        render={() => <FormError />}
      />
      <Button type="submit" disabled={!hydrated}>
        {loading ? <Spinner className="size-4" /> : t('auth:sign_in')}
      </Button>
    </form>
  );
}

function ClientSignInWithEmailAndPasswordForm({
  signIn,
  loading,
}: {
  signIn: (authPayload: AuthPayload) => void;
  loading?: boolean;
}) {
  const { t } = useTranslation(['auth', 'common']);

  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(
    clientServices.authenticationClientService,
  );

  const { handleSubmit, setError, formState } =
    useFormContext<EmailAndPasswordFormValues>();
  const navigate = useNavigate();

  const handleEmailSignIn = handleSubmit(
    async ({ credentials: { email, password } }) => {
      try {
        const result = await emailAndPasswordSignIn(email, password);

        if (!result) return;
        const { idToken, csrf } = result;
        if (!idToken) return;
        signIn({ type: 'email', idToken, csrf });
        // Hack to wait for the form to be submitted, otherwise the loading spinner will be flickering
        await sleep(UX_DELAY_1S);
      } catch (error) {
        if (error instanceof EmailUnverified) {
          navigate(getRoute('/email-verification'));
        } else if (error instanceof UserNotFoundError) {
          setError(
            'credentials.email',
            {
              message: t('auth:sign_in.errors.user_not_found'),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof WrongPasswordError) {
          setError(
            'credentials.password',
            {
              message: t('auth:sign_in.errors.wrong_password_error'),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof InvalidLoginCredentials) {
          setError('credentials', {
            message: t('auth:sign_in.errors.invalid_login_credentials'),
          });
        } else if (error instanceof NetworkRequestFailed) {
          toast.error(t('common:errors.firebase_network_error'));
        } else {
          Sentry.captureException(error);
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  );

  return (
    <SignInWithEmailAndPasswordForm
      loading={loading || formState.isSubmitting}
      onSubmit={(e) => {
        void handleEmailSignIn(e);
      }}
    />
  );
}
