import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Select } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export const tagColors = ['#C8C3FF', '#FDE9AD', '#FFA89A', '#B7DFF5', '#B2E5BA'] as const;

const createTagFormSchema = z.object({
  name: z.string().min(1),
  color: z.enum(tagColors),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const [t, session, rawData, { apiClient }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = createTagFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await apiClient.createTag(data);

    return redirect(getRoute('/settings/tags'));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function CreateTag() {
  const { t } = useTranslation(handle.i18n);
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button onClick={(e) => e.stopPropagation()}>
          <Icon icon="plus" className="size-6" />
          {t('settings:tags.new_tag')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateTagContent />
      </Modal.Content>
    </Modal.Root>
  );
}

const CreateTagContent = () => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: { name: '', color: tagColors[0] },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/tags/create'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChangeAsync: createTagFormSchema,
      onBlurAsync: createTagFormSchema,
      onSubmitAsync: createTagFormSchema,
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
      <Modal.Title>{t('settings:tags.new_tag')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex gap-2">
          <form.Field name="name">
            {(field) => (
              <div className="group flex w-full flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.name')}</FormLabel>
                <FormInput
                  type="text"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.currentTarget.value)}
                  defaultValue={field.state.value}
                  valid={field.state.meta.errors.length === 0}
                />
                <FormErrorOrDescription errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
          <form.Field name="color">
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.color')}</FormLabel>
                <Select.Default
                  defaultValue={field.state.value}
                  onValueChange={(e) => field.handleChange(e as (typeof tagColors)[number])}
                >
                  {tagColors.map((color) => (
                    <Select.DefaultItem key={color} value={color}>
                      <div className="size-4 rounded-full" style={{ backgroundColor: color }}></div>
                    </Select.DefaultItem>
                  ))}
                </Select.Default>
                <FormErrorOrDescription />
              </div>
            )}
          </form.Field>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" type="button" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            {t('settings:tags.new_tag.create')}
          </Button>
        </div>
      </div>
    </form>
  );
};
