import { useCaseRightPanelContext } from '@app-builder/components';
import { FormControl, FormField, FormItem, FormLabel } from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useEffect } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const createCaseFormSchema = z.object({
  name: z.string().min(1),
  inboxId: z.string().min(1),
});

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const inboxes = await inbox.listInboxes();

  return json({ inboxes });
}

type CreateCaseForm = z.infer<typeof createCaseFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedForm = createCaseFormSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      error: parsedForm.error.format(),
    });
  }
  const session = await getSession(request);

  try {
    const createdCase = await cases.createCase(parsedForm.data);
    return redirect(getRoute('/cases/:caseId', { caseId: fromUUID(createdCase.id) }));
  } catch (error) {
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
      },
    );
  }
}

export function CreateCase() {
  const { t } = useTranslation(['cases']);
  const loadFetcher = useFetcher<typeof loader>();
  useEffect(() => {
    if (loadFetcher.state === 'idle' && !loadFetcher.data) {
      loadFetcher.load(getRoute('/ressources/cases/create-case'));
    }
  }, [loadFetcher]);
  const inboxes = loadFetcher.data?.inboxes || [];

  const fetcher = useFetcher<typeof action>();
  const { data } = useCaseRightPanelContext();

  const formMethods = useForm<CreateCaseForm>({
    progressive: true,
    resolver: zodResolver(createCaseFormSchema),
    defaultValues: {
      name: '',
      inboxId: data?.inboxId ?? '',
    },
  });
  const { control } = formMethods;

  return (
    <FormProvider {...formMethods}>
      <Form
        onSubmit={({ formDataJson }): void => {
          fetcher.submit(formDataJson, {
            method: 'POST',
            action: getRoute('/ressources/cases/create-case'),
            encType: 'application/json',
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-xs first-letter:capitalize">
                  {t('cases:case.name')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    placeholder={t('cases:case.new_case.placeholder')}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="inboxId"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-col gap-2">
                <FormLabel className="text-xs first-letter:capitalize">
                  {t('cases:case.new_case.select_inbox')}
                </FormLabel>
                <FormControl>
                  <Select.Default
                    className="w-full overflow-hidden"
                    onValueChange={(type) => {
                      field.onChange(type);
                    }}
                    value={field.value}
                  >
                    {inboxes.map(({ name, id }) => {
                      return (
                        <Select.DefaultItem key={id} value={id}>
                          {name}
                        </Select.DefaultItem>
                      );
                    })}
                  </Select.Default>
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">
            <Icon icon="plus" className="size-6" />
            {t('cases:case.new_case.create')}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
