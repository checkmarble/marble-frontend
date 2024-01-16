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
  useEmailAndPasswordSignIn,
  UserNotFoundError,
  WrongPasswordError,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from '@remix-run/react';
import * as Sentry from '@sentry/remix';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClientOnly } from 'remix-utils/client-only';
import { Button, Input } from 'ui-design-system';
import * as z from 'zod';

const emailAndPasswordFormSchema = z.object({
  credentials: z.object({
    email: z.string().email(),
    password: z.string().min(1, 'Required'),
  }),
});
type EmailAndPasswordFormValues = z.infer<typeof emailAndPasswordFormSchema>;

export function SignInWithEmailAndPassword({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['auth', 'common']);

  const formMethods = useForm<z.infer<typeof emailAndPasswordFormSchema>>({
    resolver: zodResolver(emailAndPasswordFormSchema),
    defaultValues: {
      credentials: { email: '', password: '' },
    },
  });
  const { control } = formMethods;

  const children = (
    <>
      <FormField
        control={control}
        name="credentials.email"
        render={({ field }) => (
          <FormItem className="flex flex-col items-start gap-2">
            <FormLabel>{t('auth:sign_in.email')}</FormLabel>
            <FormControl>
              <Input className="w-full" type="email" {...field} />
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
              <Input className="w-full" type="password" {...field} />
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
      <Button type="submit">{t('auth:sign_in')}</Button>
    </>
  );

  return (
    <FormProvider {...formMethods}>
      <ClientOnly
        fallback={
          <SignInWithEmailAndPasswordForm>
            {children}
          </SignInWithEmailAndPasswordForm>
        }
      >
        {() => (
          <ClientSignInWithEmailAndPasswordForm signIn={signIn}>
            {children}
          </ClientSignInWithEmailAndPasswordForm>
        )}
      </ClientOnly>
    </FormProvider>
  );
}

function SignInWithEmailAndPasswordForm(
  props: React.ComponentPropsWithoutRef<'form'>,
) {
  return <form noValidate className="flex w-full flex-col gap-4" {...props} />;
}

function ClientSignInWithEmailAndPasswordForm({
  children,
  signIn,
}: {
  children: React.ReactNode;
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['auth', 'common']);

  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(
    clientServices.authenticationClientService,
  );

  const { handleSubmit, setError } =
    useFormContext<EmailAndPasswordFormValues>();
  const navigate = useNavigate();

  const handleEmailSignIn = handleSubmit(
    async ({ credentials: { email, password } }) => {
      try {
        const result = await emailAndPasswordSignIn(email, password);

        if (!result) return;
        const { idToken, csrf } = result;
        if (!idToken) return;
        signIn({ idToken, csrf });
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
        } else {
          Sentry.captureException(error);
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  );

  return (
    <SignInWithEmailAndPasswordForm
      onSubmit={(e) => {
        void handleEmailSignIn(e);
      }}
    >
      {children}
    </SignInWithEmailAndPasswordForm>
  );
}
