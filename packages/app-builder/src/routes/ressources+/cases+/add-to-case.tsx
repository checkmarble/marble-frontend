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
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type InboxDto } from 'marble-api';
import { useEffect } from 'react';
import {
  type Control,
  Form,
  FormProvider,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Button, Input, Select, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
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

export async function loader({ request }: LoaderFunctionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const inboxes = await apiClient.listInboxes({ withCaseCount: false });

  return json(inboxes);
}

type AddToCaseForm = z.infer<typeof addToCaseFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const parsedForm = addToCaseFormSchema.safeParse(await request.json());
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      error: parsedForm.error.format(),
    });
  }
  const session = await getSession(request);

  try {
    if (parsedForm.data.newCase) {
      const result = await apiClient.createCase({
        name: parsedForm.data.name,
        decision_ids: parsedForm.data.decisionIds,
        inbox_id: parsedForm.data.inboxId,
      });
      return redirect(
        getRoute('/cases/:caseId', { caseId: fromUUID(result.case.id) }),
      );
    } else {
      await apiClient.addDecisionsToCase(parsedForm.data.caseId, {
        decision_ids: parsedForm.data.decisionIds,
      });
      setToastMessage(session, {
        type: 'success',
        messageKey: 'common:success.add_to_case',
      });
      return json(
        {
          success: true as const,
        },
        {
          headers: { 'Set-Cookie': await commitSession(session) },
        },
      );
    }
  } catch (error) {
    if (isStatusBadRequestHttpError(error)) {
      setToastMessage(session, {
        type: 'error',
        messageKey: 'common:errors.add_to_case.invalid',
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
      },
    );
  }
}

export function AddToCase() {
  const { t } = useTranslation(handle.i18n);
  const loadFetcher = useFetcher<typeof loader>();
  useEffect(() => {
    if (loadFetcher.state === 'idle' && !loadFetcher.data) {
      loadFetcher.load(getRoute('/ressources/cases/add-to-case'));
    }
  }, [loadFetcher]);
  const inboxes = loadFetcher.data?.inboxes || [];

  const fetcher = useFetcher<typeof action>();
  const { data, closePanel } = useDecisionRightPanelContext();

  const formMethods = useForm<AddToCaseForm>({
    progressive: true,
    resolver: zodResolver(addToCaseFormSchema),
    defaultValues: {
      newCase: false,
      decisionIds: data?.decisionIds ? data?.decisionIds : [],
    },
  });
  const { control } = formMethods;
  const isNewCase = useWatch({ control, name: 'newCase' });

  useEffect(() => {
    if (fetcher.data?.success) {
      closePanel();
    }
  }, [fetcher.data, closePanel]);

  if (inboxes.length === 0) {
    return <p>{t('decisions:add_to_case.new_case.no_inbox')}</p>;
  }

  return (
    <FormProvider {...formMethods}>
      <Form
        onSubmit={({ formDataJson }) => {
          fetcher.submit(formDataJson, {
            method: 'POST',
            action: getRoute('/ressources/cases/add-to-case'),
            encType: 'application/json',
          });
        }}
      >
        <div className="flex flex-col gap-4">
          <FormField
            name="newCase"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex items-center  gap-2">
                <FormLabel className="text-xs capitalize">
                  {t('decisions:add_to_case.create_new_case')}
                </FormLabel>
                <FormControl>
                  <Switch
                    {...rest}
                    id="newCase"
                    checked={value}
                    onCheckedChange={(checked) => onChange(checked)}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {isNewCase ? (
            <NewCaseFields control={control} inboxes={inboxes} />
          ) : (
            <AddToCaseFields control={control} />
          )}
        </div>
      </Form>
    </FormProvider>
  );
}

const NewCaseFields = ({
  control,
  inboxes,
}: {
  control: Control<AddToCaseForm>;
  inboxes: InboxDto[];
}) => {
  const { t } = useTranslation(handle.i18n);
  return (
    <>
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
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case.create_new_case')}
      </Button>
    </>
  );
};

const AddToCaseFields = ({ control }: { control: Control<AddToCaseForm> }) => {
  const { t } = useTranslation(handle.i18n);
  return (
    <>
      <p className="text-s text-grey-100 font-semibold first-letter:capitalize">
        {t('decisions:add_to_case.new_case.attribution')}
      </p>
      <FormField
        name="caseId"
        control={control}
        render={({ field }) => (
          <FormItem className="flex flex-col gap-2">
            <FormLabel className="text-xs capitalize">
              {t('decisions:add_to_case.new_case.case_id.label')}
            </FormLabel>
            <FormControl>
              <Input
                type="text"
                {...field}
                placeholder={t(
                  'decisions:add_to_case.new_case.case_id.placeholder',
                )}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <Button type="submit">
        <Icon icon="plus" className="size-5" />
        {t('decisions:add_to_case')}
      </Button>
    </>
  );
};
