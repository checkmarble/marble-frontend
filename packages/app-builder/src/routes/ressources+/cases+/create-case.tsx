import { useCaseRightPanelContext } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select } from 'ui-design-system';
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

  return json({ inboxes: await inbox.listInboxes() });
}

type CreateCaseForm = z.infer<typeof createCaseFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [raw, session, { cases }] = await Promise.all([
    request.json(),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createCaseFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });

  try {
    const createdCase = await cases.createCase(data);

    return redirect(getRoute('/cases/:caseId', { caseId: fromUUID(createdCase.id) }));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      { success: 'false', error: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
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

  const form = useForm({
    defaultValues: {
      name: '',
      inboxId: data?.inboxId ?? '',
    } as CreateCaseForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/cases/create-case'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: createCaseFormSchema,
      onBlur: createCaseFormSchema,
      onSubmit: createCaseFormSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('cases:case.name')}
              </FormLabel>
              <FormInput
                type="text"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                valid={field.state.meta.errors.length === 0}
                placeholder={t('cases:case.new_case.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <form.Field name="inboxId">
          {(field) => (
            <div className="flex flex-1 flex-col gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('cases:case.new_case.select_inbox')}
              </FormLabel>
              <Select.Default
                className="w-full overflow-hidden"
                defaultValue={field.state.value}
                onValueChange={(type) => {
                  field.handleChange(type);
                }}
              >
                {inboxes.map(({ name, id }) => {
                  return (
                    <Select.DefaultItem key={id} value={id}>
                      {name}
                    </Select.DefaultItem>
                  );
                })}
              </Select.Default>
            </div>
          )}
        </form.Field>
        <Button type="submit">
          <Icon icon="plus" className="size-6" />
          {t('cases:case.new_case.create')}
        </Button>
      </div>
    </form>
  );
}
