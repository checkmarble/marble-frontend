import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal } from 'ui-design-system';
import { NewInbox } from 'ui-icons';
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

export function CreateInbox() {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<CreateInboxForm>({
    progressive: true,
    resolver: zodResolver(createInboxFormSchema),
    defaultValues: {
      name: '',
    },
  });
  const { control, reset } = formMethods;

  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data?.success) {
      setIsOpen(false);
      reset();
    }
  }, [fetcher.data?.success, fetcher.state, reset]);

  return (
    <Modal.Root open={isOpen} onOpenChange={setIsOpen}>
      <Modal.Trigger asChild>
        <Button className="w-fit" variant={'secondary'}>
          <NewInbox width={'24px'} height={'24px'} />
          {t('cases:inbox.new_inbox.create')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>{t('cases:inbox.new_inbox.explain')}</Modal.Title>
        <FormProvider {...formMethods}>
          <Form
            onSubmit={({ formDataJson }) => {
              fetcher.submit(formDataJson, {
                method: 'POST',
                action: '/ressources/cases/create-inbox',
                encType: 'application/json',
              });
            }}
          >
            <div className="bg-grey-00 flex flex-col gap-8 p-8">
              <FormField
                name="name"
                control={control}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-2">
                    <FormLabel>{t('cases:inbox.new_inbox.name')}</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex flex-1 flex-row gap-2">
                <Modal.Close asChild>
                  <Button className="flex-1" variant="secondary">
                    {t('common:cancel')}
                  </Button>
                </Modal.Close>
                <Button
                  className="flex-1"
                  variant="primary"
                  type="submit"
                  name="create"
                >
                  <NewInbox />
                  {t('cases:inbox.new_inbox.create')}
                </Button>
              </div>
            </div>
          </Form>
        </FormProvider>
      </Modal.Content>
    </Modal.Root>
  );
}
