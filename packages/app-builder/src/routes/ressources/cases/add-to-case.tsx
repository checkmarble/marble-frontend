import { useDecisionRightPanelContext } from '@app-builder/components';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusBadRequestHttpError } from '@app-builder/models';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  type ActionArgs,
  json,
  type LoaderArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select } from 'ui-design-system';
import { Plus } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['decisions', 'navigation', 'common'] satisfies Namespace,
};

const addToCaseFormSchema = z.discriminatedUnion('newCase', [
  z.object({
    newCase: z.literal(true),
    name: z.string().min(1),
    decisionIds: z.array(z.string()),
    inboxId: z.string().min(1),
  }),
  z.object({
    newCase: z.literal(false),
    caseId: z.string().min(1),
    decisionIds: z.array(z.string()),
  }),
]);

export async function loader({ request }: LoaderArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const inboxes = await apiClient.listInboxes();

  return json(inboxes);
}

type AddToCaseForm = z.infer<typeof addToCaseFormSchema>;

export async function action({ request }: ActionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const parsedForm = addToCaseFormSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      error: parsedForm.error.format(),
    });
  }

  if (parsedForm.data.newCase) {
    try {
      const result = await apiClient.createCase({
        name: parsedForm.data.name,
        decision_ids: parsedForm.data.decisionIds,
        inbox_id: parsedForm.data.inboxId,
      });
      return redirect(
        getRoute('/cases/:caseId', { caseId: fromUUID(result.case.id) })
      );
    } catch (error) {
      const session = await getSession(request);
      if (isStatusBadRequestHttpError(error)) {
        setToastMessage(session, {
          type: 'error',
          messageKey: 'common:errors.create_case.invalid',
        });
      } else {
        setToastMessage(session, {
          type: 'error',
          messageKey: 'common:errors.unknown',
        });
      }
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
}

export function AddToCase() {
  const { t } = useTranslation(handle.i18n);
  const loadFetcher = useFetcher<typeof loader>();
  if (loadFetcher.state === 'idle' && !loadFetcher.data) {
    loadFetcher.load(getRoute('/ressources/cases/add-to-case'));
  }
  const inboxes = loadFetcher.data?.inboxes || [];

  const fetcher = useFetcher<typeof action>();
  const { data } = useDecisionRightPanelContext();

  const formMethods = useForm<AddToCaseForm>({
    progressive: true,
    resolver: zodResolver(addToCaseFormSchema),
    defaultValues: {
      newCase: true,
      name: '',
      decisionIds: data?.decisionId ? [data?.decisionId] : [],
      inboxId: '',
    },
  });
  const { control, register } = formMethods;

  if (inboxes.length === 0) {
    return <p>{t('decisions:add_to_case.new_case.no_inbox')}</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <Form
        onSubmit={({ formDataJson }) => {
          fetcher.submit(formDataJson, {
            method: 'POST',
            action: '/ressources/cases/add-to-case',
            encType: 'application/json',
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <input hidden {...register('newCase')} />
          <p className="text-s text-grey-100 font-semibold first-letter:capitalize">
            {t('decisions:add_to_case.new_case.informations')}
          </p>
          <FormField
            name="name"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="text-xs capitalize">
                  {t('decisions:add_to_case.new_case.new_case_name')}
                </FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="inboxId"
            control={control}
            render={({ field }) => (
              <FormItem className="flex flex-1 flex-col gap-2">
                <FormLabel className="text-xs capitalize">
                  {t('decisions:add_to_case.new_case.select_inbox')}
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
            <Plus />
            {t('decisions:add_to_case.create_new_case')}
          </Button>
        </div>
      </Form>
    </FormProvider>
  );
}
