import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type Tag } from 'marble-api';
import * as React from 'react';
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
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: updateTagFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await apiClient.updateTag(submission.value.id, submission.value);
    return redirect(getRoute('/settings/tags'));
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common']);

    const formError = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message: formError,
    });

    return json(submission.reply({ formErrors: [formError] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function UpdateTag({ tag }: { tag: Tag }) {
  const { t } = useTranslation(handle.i18n);
  const [open, setOpen] = React.useState(false);

  const navigation = useNavigation();
  React.useEffect(() => {
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

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: tag,
    lastResult: fetcher.data,
    constraint: getZodConstraint(updateTagFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateTagFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute('/ressources/settings/tags/update')}
        method="PATCH"
        {...getFormProps(form)}
      >
        <Modal.Title>{t('settings:tags.update_tag')}</Modal.Title>
        <div className="flex flex-col gap-6 p-6">
          <div className="flex gap-2">
            <input
              {...getInputProps(fields.id, { type: 'hidden' })}
              key={fields.id.key}
            />
            <FormField
              name={fields.name.name}
              className="group flex w-full flex-col gap-2"
            >
              <FormLabel>{t('settings:tags.name')}</FormLabel>
              <FormInput type="text" />
              <FormErrorOrDescription />
            </FormField>
            <FormField
              name={fields.color.name}
              className="group flex flex-col gap-2"
            >
              <FormLabel>{t('settings:tags.color')}</FormLabel>
              <FormSelect.Default options={tagColors}>
                {tagColors.map((color) => (
                  <FormSelect.DefaultItem key={color} value={color}>
                    <div
                      className="size-4 rounded-full"
                      style={{ backgroundColor: color }}
                    ></div>
                  </FormSelect.DefaultItem>
                ))}
              </FormSelect.Default>
              <FormErrorOrDescription />
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
    </FormProvider>
  );
};
