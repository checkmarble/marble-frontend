import { useDecisionRightPanelContext } from '@app-builder/components';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusBadRequestHttpError } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, type LoaderFunctionArgs, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm, useStore } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Select, Switch } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

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
  const { authService } = initServerServices(request);
  const { inbox, cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const inboxes = await inbox.listInboxes();

  return json({
    inboxes,
    casesList: await cases.listCases({
      inboxIds: inboxes.map(({ id }) => id),
    }),
  });
}

type AddToCaseForm = z.infer<typeof addToCaseFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [raw, session, { cases }] = await Promise.all([
    request.json(),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = addToCaseFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: z.treeifyError(error) });

  try {
    if (data.newCase) {
      const createdCase = await cases.createCase(data);
      return redirect(getRoute('/cases/:caseId', { caseId: fromUUIDtoSUUID(createdCase.id) }));
    } else {
      await cases.addDecisionsToCase(data);

      setToastMessage(session, {
        type: 'success',
        messageKey: 'common:success.add_to_case',
      });

      return json({ success: 'true' }, { headers: { 'Set-Cookie': await commitSession(session) } });
    }
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusBadRequestHttpError(error)
        ? 'common:errors.add_to_case.invalid'
        : 'common:errors.unknown',
    });

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
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

  const form = useForm({
    defaultValues: {
      newCase: false,
      decisionIds: data?.decisionIds ? data?.decisionIds : [],
      caseId: '',
    } as AddToCaseForm,
    onSubmit: ({ value }) => {
      fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/cases/add-to-case'),
        encType: 'application/json',
      });
    },
    validators: {
      onSubmit: addToCaseFormSchema,
    },
  });

  const isNewCase = useStore(form.store, (state) => state.values.newCase);

  useEffect(() => {
    if (fetcher.data?.success) {
      closePanel();
    }
  }, [fetcher.data, closePanel]);

  if (inboxes.length === 0) {
    return <p>{t('decisions:add_to_case.new_case.no_inbox')}</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-4">
        <form.Field name="newCase">
          {(field) => (
            <div className="flex items-center gap-2">
              <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                {t('decisions:add_to_case.create_new_case')}
              </FormLabel>
              <Switch
                id="newCase"
                defaultChecked={field.state.value}
                onBlur={field.handleBlur}
                onCheckedChange={(checked) => field.handleChange(checked)}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        {isNewCase ? (
          <>
            <p className="text-s text-grey-00 font-semibold first-letter:capitalize">
              {t('decisions:add_to_case.new_case.informations')}
            </p>
            <form.Field
              name="name"
              validators={{
                onChange: addToCaseFormSchema.options[0].shape.name,
                onBlur: addToCaseFormSchema.options[0].shape.name,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.new_case_name')}
                  </FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value as string}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <form.Field
              name="inboxId"
              validators={{
                onChange: addToCaseFormSchema.options[0].shape.inboxId,
                onBlur: addToCaseFormSchema.options[0].shape.inboxId,
              }}
            >
              {(field) => (
                <div className="flex flex-1 flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.select_inbox')}
                  </FormLabel>
                  <Select.Default
                    className="w-full overflow-hidden"
                    defaultValue={field.state.value as string}
                    onValueChange={(type) => {
                      field.handleChange(type);
                      field.handleBlur();
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
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <Button type="submit">
              <Icon icon="plus" className="size-5" />
              {t('decisions:add_to_case.create_new_case')}
            </Button>
          </>
        ) : (
          <>
            <p className="text-s text-grey-00 font-semibold first-letter:capitalize">
              {t('decisions:add_to_case.new_case.attribution')}
            </p>
            <form.Field
              name="caseId"
              validators={{
                onChange: addToCaseFormSchema.options[1].shape.caseId,
                onBlur: addToCaseFormSchema.options[1].shape.caseId,
              }}
            >
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name} className="text-xs first-letter:capitalize">
                    {t('decisions:add_to_case.new_case.case_id.label')}
                  </FormLabel>

                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value as string}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                  />
                  <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                </div>
              )}
            </form.Field>
            <Button type="submit">
              <Icon icon="plus" className="size-5" />
              {t('decisions:add_to_case')}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
