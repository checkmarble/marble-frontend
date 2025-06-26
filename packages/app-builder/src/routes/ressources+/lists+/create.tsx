import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isStatusConflictHttpError } from '@app-builder/models';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const createListFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
});

type CreateListForm = z.infer<typeof createListFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [raw, session, { customListsRepository }] = await Promise.all([
    request.json(),
    getSession(request),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = createListFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });

  try {
    const result = await customListsRepository.createCustomList(data);

    return redirect(getRoute('/lists/:listId', { listId: fromUUIDtoSUUID(result.id) }));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: isStatusConflictHttpError(error)
        ? 'common:errors.list.duplicate_list_name'
        : 'common:errors.unknown',
    });

    return json(
      { success: 'false', error: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function CreateList() {
  const { t } = useTranslation(handle.i18n);
  const { submit } = useFetcher<typeof action>();
  const hydrated = useHydrated();

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
    } as CreateListForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        submit(value, {
          method: 'POST',
          action: getRoute('/ressources/lists/create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmitAsync: createListFormSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button disabled={!hydrated}>
          <Icon icon="plus" className="size-6" />
          {t('lists:create_list.title')}
        </Button>
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('lists:create_list.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field
                name="name"
                validators={{
                  onBlur: createListFormSchema.shape.name,
                  onChange: createListFormSchema.shape.name,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:name')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.name_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
              <form.Field
                name="description"
                validators={{
                  onBlur: createListFormSchema.shape.description,
                  onChange: createListFormSchema.shape.description,
                }}
              >
                {(field) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel name={field.name}>{t('lists:description')}</FormLabel>
                    <FormInput
                      type="text"
                      name={field.name}
                      defaultValue={field.state.value}
                      onChange={(e) => field.handleChange(e.currentTarget.value)}
                      onBlur={field.handleBlur}
                      valid={field.state.meta.errors.length === 0}
                      placeholder={t('lists:create_list.description_placeholder')}
                    />
                    <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
                  </div>
                )}
              </form.Field>
            </div>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close asChild>
                <Button className="flex-1" type="button" variant="secondary">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
              <Button className="flex-1" variant="primary" type="submit" name="create">
                {t('lists:create_list.button_accept')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
