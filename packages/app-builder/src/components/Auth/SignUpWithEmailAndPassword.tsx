import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import {
  EmailExistsError,
  NetworkRequestFailed,
  TooManyRequest,
  useEmailAndPasswordSignUp,
  WeakPasswordError,
} from '@app-builder/services/auth/auth.client';
import { clientServices } from '@app-builder/services/init.client';
import { zodResolver } from '@hookform/resolvers/zod';
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

export function SignUpWithEmailAndPassword({ signUp }: { signUp: () => void }) {
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
              <Input
                className="w-full"
                type="password"
                autoComplete="new-password"
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
      <Button type="submit">{t('auth:sign_up')}</Button>
    </>
  );

  return (
    <FormProvider {...formMethods}>
      <ClientOnly
        fallback={
          <SignUpWithEmailAndPasswordForm>
            {children}
          </SignUpWithEmailAndPasswordForm>
        }
      >
        {() => (
          <ClientSignUpWithEmailAndPasswordForm signUp={signUp}>
            {children}
          </ClientSignUpWithEmailAndPasswordForm>
        )}
      </ClientOnly>
    </FormProvider>
  );
}

function SignUpWithEmailAndPasswordForm(
  props: React.ComponentPropsWithoutRef<'form'>,
) {
  return <form noValidate className="flex w-full flex-col gap-4" {...props} />;
}

function ClientSignUpWithEmailAndPasswordForm({
  children,
  signUp,
}: {
  children: React.ReactNode;
  signUp: () => void;
}) {
  const { t } = useTranslation(['auth', 'common']);

  const emailAndPasswordSignUp = useEmailAndPasswordSignUp(
    clientServices.authenticationClientService,
  );

  const { handleSubmit, setError } =
    useFormContext<EmailAndPasswordFormValues>();

  const handleEmailSignIn = handleSubmit(
    async ({ credentials: { email, password } }) => {
      try {
        await emailAndPasswordSignUp(email, password);
        signUp();
      } catch (error) {
        if (error instanceof EmailExistsError) {
          setError(
            'credentials.email',
            {
              message: t('auth:sign_up.errors.email_already_exists'),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof WeakPasswordError) {
          setError(
            'credentials.password',
            {
              message: t('auth:sign_up.errors.weak_password_error'),
            },
            { shouldFocus: true },
          );
        } else if (error instanceof NetworkRequestFailed) {
          toast.error(t('common:errors.firebase_network_error'));
        } else if (error instanceof TooManyRequest) {
          toast.error(t('common:errors.too_many_requests'));
        } else {
          Sentry.captureException(error);
          toast.error(t('common:errors.unknown'));
        }
      }
    },
  );

  return (
    <SignUpWithEmailAndPasswordForm
      onSubmit={(e) => {
        void handleEmailSignIn(e);
      }}
    >
      {children}
    </SignUpWithEmailAndPasswordForm>
  );
}
