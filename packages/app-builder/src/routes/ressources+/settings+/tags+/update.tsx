import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { ColorSelect } from '@app-builder/components/Tags/ColorSelect';
import { tagColors } from '@app-builder/models/tags';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import type { Namespace } from 'i18next';
import type { Tag } from 'marble-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const updateTagFormSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  color: z.enum(tagColors),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { apiClient }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = updateTagFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await apiClient.updateTag(data.id, data);

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

export function UpdateTag({ tag }: { tag: Tag }) {
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
      <Modal.Trigger>
        <Icon
          icon="edit-square"
          className="size-6 shrink-0"
          aria-label={t('settings:tags.update_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateTagContent tag={tag} />
      </Modal.Content>
    </Modal.Root>
  );
}

const UpdateTagContent = ({ tag }: { tag: Tag }) => {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const form = useForm({
    defaultValues: tag as z.infer<typeof updateTagFormSchema>,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/settings/tags/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: updateTagFormSchema,
      onBlur: updateTagFormSchema,
      onSubmit: updateTagFormSchema,
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
      <Modal.Title>{t('settings:tags.update_tag')}</Modal.Title>
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
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
              </div>
            )}
          </form.Field>
          <form.Field name="color">
            {(field) => (
              <div className="group flex flex-col gap-2">
                <FormLabel name={field.name}>{t('settings:tags.color')}</FormLabel>
                <ColorSelect onChange={field.handleChange} value={field.state.value} />
                <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
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
          <Button className="flex-1" variant="primary" type="submit" name="update">
            {t('common:save')}
          </Button>
        </div>
      </div>
    </form>
  );
};
