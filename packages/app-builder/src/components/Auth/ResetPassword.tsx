import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import {
  NetworkRequestFailed,
  TooManyRequest,
  useSendPasswordResetEmail,
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

const resetPasswordFormSchema = z.object({
  email: z.string().email(),
});
type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export function ResetPassword() {
  const { t } = useTranslation(['auth', 'common']);

  const formMethods = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });
  const { control } = formMethods;

  const children = (
    <>
      <FormField
        control={control}
        name="email"
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
      <Button type="submit">{t('auth:reset-password.send')}</Button>
    </>
  );

  return (
    <FormProvider {...formMethods}>
      <ClientOnly fallback={<ResetPasswordForm>{children}</ResetPasswordForm>}>
        {() => <ClientResetPasswordForm>{children}</ClientResetPasswordForm>}
      </ClientOnly>
    </FormProvider>
  );
}

function ResetPasswordForm(props: React.ComponentPropsWithoutRef<'form'>) {
  return <form noValidate className="flex w-full flex-col gap-4" {...props} />;
}

function ClientResetPasswordForm({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(['auth', 'common']);

  const sendPasswordResetEmail = useSendPasswordResetEmail(
    clientServices.authenticationClientService,
  );

  const { handleSubmit } = useFormContext<ResetPasswordFormValues>();

  const handleResetPassword = handleSubmit(async ({ email }) => {
    try {
      await sendPasswordResetEmail(email);
      toast.success(t('auth:reset-password.email_sent'));
    } catch (error) {
      if (error instanceof NetworkRequestFailed) {
        toast.error(t('common:errors.firebase_network_error'));
      } else if (error instanceof TooManyRequest) {
        toast.error(t('common:errors.too_many_requests'));
      } else {
        Sentry.captureException(error);
        toast.error(t('common:errors.unknown'));
      }
    }
  });

  return (
    <ResetPasswordForm
      onSubmit={(e) => {
        void handleResetPassword(e);
      }}
    >
      {children}
    </ResetPasswordForm>
  );
}
