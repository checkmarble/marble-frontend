import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { usePermissionsContext } from '@app-builder/components/PermissionsContext';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input } from 'ui-design-system';
import { Plus } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['cases', 'common'] satisfies Namespace,
};

const createInboxFormSchema = z.object({
  name: z.string().min(1),
});

type CreateInboxForm = z.infer<typeof createInboxFormSchema>;

export async function action({ request }: ActionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = createInboxFormSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      error: parsedForm.error.format(),
    });
  }

  try {
    await apiClient.createInbox({ name: parsedForm.data.name });
    return redirect(getRoute('/cases'));
  } catch (error) {
    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
        error: error,
      },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      }
    );
  }
}

export function CreateFirstInbox() {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<CreateInboxForm>({
    progressive: true,
    resolver: zodResolver(createInboxFormSchema),
    defaultValues: {
      name: '',
    },
  });
  const { control } = formMethods;
  const { canEditInboxes } = usePermissionsContext();

  if (!canEditInboxes) {
    return t('cases:inbox.no_inbox_available');
  }

  return (
    <FormProvider {...formMethods}>
      <Form
        onSubmit={({ formDataJson }) => {
          fetcher.submit(formDataJson, {
            method: 'POST',
            action: '/ressources/cases/create-first-inbox',
            encType: 'application/json',
          });
        }}
      >
        <div className="flex max-w-xl flex-col gap-4">
          <p className="text-s text-grey-100 font-semibold first-letter:capitalize">
            {t('cases:inbox.new_inbox.explain')}
          </p>
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-xs">
                  {t('cases:inbox.new_inbox.name')}
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Plus />
            {t('cases:inbox.new_inbox.create')}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
