import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { serverServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { omit } from 'radash';
import { useTranslation } from 'react-i18next';
import { useHydrated } from 'remix-utils/use-hydrated';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const editListFormSchema = z.object({
  listId: z.string().uuid(),
  name: z.string().nonempty(),
  description: z.string(),
});

type EditListForm = z.infer<typeof editListFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const [raw, { customListsRepository }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = editListFormSchema.safeParse(raw);

  if (!success) return json({ success: 'false', errors: error.flatten() });

  await customListsRepository.updateCustomList(data.listId, omit(data, ['listId']));

  return json({ success: 'true' });
}

export function EditList({
  listId,
  name,
  description,
}: {
  listId: string;
  name: string;
  description: string;
}) {
  const { t } = useTranslation(handle.i18n);
  const { submit } = useFetcher<typeof action>();
  const hydrated = useHydrated();

  const form = useForm({
    defaultValues: {
      listId,
      name,
      description,
    } as EditListForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/lists/edit'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: editListFormSchema,
      onBlurAsync: editListFormSchema,
      onSubmitAsync: editListFormSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Button variant="secondary" disabled={!hydrated}>
          <Icon icon="edit-square" className="size-6" />
          <p>{t('lists:edit_list.button')}</p>
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
          <Modal.Title>{t('lists:edit_list.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-1 flex-col gap-4">
              <form.Field name="name">
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
              <form.Field name="description">
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
              <Button className="flex-1" variant="primary" type="submit" name="editList">
                {t('common:save')}
              </Button>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
