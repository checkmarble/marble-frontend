import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import {
  InvalidLoginCredentials,
  useEmailAndPasswordSignIn,
  UserNotFoundError,
  WrongPasswordError,
} from '@app-builder/services/auth/auth.client';
import { type AuthPayload } from '@app-builder/services/auth/auth.server';
import { clientServices } from '@app-builder/services/init.client';
import { zodResolver } from '@hookform/resolvers/zod';
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

export function SignInWithEmail({
  signIn,
}: {
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['login', 'common']);

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
            <FormLabel>{t('login:sign_in_with_email.email')}</FormLabel>
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
            <FormLabel>{t('login:sign_in_with_email.password')}</FormLabel>
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
      <Button type="submit">{t('login:sign_in_with_email.sign_in')}</Button>
    </>
  );

  return (
    <FormProvider {...formMethods}>
      <ClientOnly
        fallback={<SignInWithEmailForm>{children}</SignInWithEmailForm>}
      >
        {() => (
          <ClientSignInWithEmailForm signIn={signIn}>
            {children}
          </ClientSignInWithEmailForm>
        )}
      </ClientOnly>
    </FormProvider>
  );
}

function SignInWithEmailForm(props: React.ComponentPropsWithoutRef<'form'>) {
  return <form noValidate className="flex flex-col gap-4" {...props} />;
}

function ClientSignInWithEmailForm({
  children,
  signIn,
}: {
  children: React.ReactNode;
  signIn: (authPayload: AuthPayload) => void;
}) {
  const { t } = useTranslation(['login', 'common']);

  const emailAndPasswordSignIn = useEmailAndPasswordSignIn(
    clientServices.authenticationClientService,
  );

  const { handleSubmit, setError } =
    useFormContext<EmailAndPasswordFormValues>();

  const handleEmailSignIn = handleSubmit(
    async ({ credentials: { email, password } }) => {
      try {
        const result = await emailAndPasswordSignIn(email, password);

        if (!result) return;
        const { idToken, csrf } = result;
        if (!idToken) return;
        signIn({ idToken, csrf });
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          setError(
            'credentials.email',
            {
              message: t('login:sign_in_with_email.errors.user_not_found'),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof WrongPasswordError) {
          setError(
            'credentials.password',
            {
              message: t(
                'login:sign_in_with_email.errors.wrong_password_error',
              ),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof InvalidLoginCredentials) {
          setError('credentials', {
            message: t(
              'login:sign_in_with_email.errors.invalid_login_credentials',
            ),
          });
        } else {
          //TODO(sentry): colect unexpected errors
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  );

  return (
    <SignInWithEmailForm
      onSubmit={(e) => {
        void handleEmailSignIn(e);
      }}
    >
      {children}
    </SignInWithEmailForm>
  );
}
