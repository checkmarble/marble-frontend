import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2 as Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['lists', 'navigation', 'common'] satisfies Namespace,
};

const addValueFormSchema = z.object({
  listId: z.string().uuid(),
  value: z.string().nonempty(),
});

type AddValueForm = z.infer<typeof addValueFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const { authService } = serverServices;

  const [raw, { customListsRepository }] = await Promise.all([
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = addValueFormSchema.safeParse(raw);

  if (!success) return json({ success: false as const, errors: error.format() });

  await customListsRepository.createCustomListValue(data.listId, {
    value: data.value,
  });

  return json({ success: true as const });
}

export function NewListValue({ listId }: { listId: string }) {
  const { t } = useTranslation(handle.i18n);
  const { submit } = useFetcher<typeof action>();

  const form = useForm<AddValueForm>({
    defaultValues: {
      listId,
      value: '',
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        submit(value, {
          method: 'POST',
          action: getRoute('/ressources/lists/value_create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: addValueFormSchema,
      onBlurAsync: addValueFormSchema,
      onSubmitAsync: addValueFormSchema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger render={<Button />}>
        <Icon icon="plus" className="size-6" />
        {t('lists:create_value.title')}
      </Modal.Trigger>
      <Modal.Content>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <Modal.Title>{t('lists:create_value.title')}</Modal.Title>
          <div className="flex flex-col gap-6 p-6">
            <form.Field name="value">
              {(field) => (
                <div className="flex flex-col gap-2">
                  <FormLabel name={field.name}>{t('lists:value', { count: 1 })}</FormLabel>
                  <FormInput
                    type="text"
                    name={field.name}
                    defaultValue={field.state.value}
                    onChange={(e) => field.handleChange(e.currentTarget.value)}
                    onBlur={field.handleBlur}
                    valid={field.state.meta.errors.length === 0}
                    placeholder={t('lists:create_value.value_placeholder')}
                  />
                  <FormErrorOrDescription errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
            <div className="flex flex-1 flex-row gap-2">
              <Modal.Close render={<Button className="flex-1" type="button" variant="secondary" />}>
                {t('common:cancel')}
              </Modal.Close>
              <Modal.Close
                render={<Button className="flex-1" variant="primary" type="submit" name="create" />}
              >
                {t('common:save')}
              </Modal.Close>
            </div>
          </div>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
}
