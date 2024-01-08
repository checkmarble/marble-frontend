import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { tagColors } from './create';

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
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const formData = await request.formData();
  const submission = parse(formData, { schema: updateTagFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  const session = await getSession(request);

  try {
    await apiClient.updateTag(submission.value.id, submission.value);
    return redirect(getRoute('/settings/tags'));
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });
    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function UpdateTag({ tag }: { tag: Tag }) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    if (navigation.state === 'loading') {
      setOpen(false);
    }
  }, [navigation.state]);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger>
        <Icon
          icon="edit"
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

  const formId = useId();
  const [form, { id, name, color }] = useForm({
    id: formId,
    defaultValue: tag,
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(updateTagFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: updateTagFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/tags/update')}
      method="PATCH"
      {...form.props}
    >
      <Modal.Title>{t('settings:tags.new_tag')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <div className="text-s flex gap-2 font-bold">
          <input {...conform.input(id, { type: 'hidden' })} />
          <FormField config={name} className="group flex w-full flex-col gap-2">
            <FormLabel>{t('settings:tags.name')}</FormLabel>
            <FormInput type="text" />
            <FormError />
          </FormField>
          <FormField config={color} className="group flex flex-col gap-2">
            <FormLabel>{t('settings:tags.color')}</FormLabel>
            <FormSelect.Default config={color}>
              {tagColors.map((color) => (
                <FormSelect.DefaultItem key={color} value={color}>
                  <div
                    className="size-4 rounded-full"
                    style={{ backgroundColor: color }}
                  ></div>
                </FormSelect.DefaultItem>
              ))}
            </FormSelect.Default>
            <FormError />
          </FormField>
        </div>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="update"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
};
