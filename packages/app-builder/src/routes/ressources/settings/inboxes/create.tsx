import { FormError } from '@app-builder/components/Form/FormError';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { conform, useForm } from '@conform-to/react';
import { getFieldsetConstraint, parse } from '@conform-to/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { NewInbox } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

export const redirectRouteOptions = [
  '/cases/inboxes/:inboxId',
  '/settings/inboxes/:inboxId',
] as const;
const createInboxFormSchema = z.object({
  name: z.string().min(1),
  redirectRoute: z.enum(redirectRouteOptions),
});

export async function action({ request }: ActionArgs) {
  const {
    authService,
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });

  const formData = await request.formData();
  const submission = parse(formData, { schema: createInboxFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    const { inbox: createdInbox } = await apiClient.createInbox({
      name: submission.value.name,
    });
    return redirect(
      getRoute(submission.value.redirectRoute, {
        inboxId: fromUUID(createdInbox.id),
      }),
    );
  } catch (error) {
    const session = await getSession(request);

    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(submission, {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export function CreateInbox({
  redirectRoutePath,
}: {
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
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
      <Modal.Trigger asChild>
        <Button
          className="w-fit whitespace-nowrap"
          variant="secondary"
          onClick={(e) => e.stopPropagation()}
        >
          <NewInbox className="text-l" />
          {t('settings:inboxes.new_inbox.create')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent redirectRoutePath={redirectRoutePath} />
      </Modal.Content>
    </Modal.Root>
  );
}

export function CreateInboxContent({
  redirectRoutePath,
}: {
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { name, redirectRoute }] = useForm({
    id: formId,
    defaultValue: { name: '', redirectRoute: redirectRoutePath },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(createInboxFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: createInboxFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      method="post"
      action={getRoute('/ressources/settings/inboxes/create')}
      {...form.props}
    >
      <Modal.Title>{t('settings:inboxes.new_inbox.explain')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <input {...conform.input(redirectRoute, { type: 'hidden' })} />
        <FormField config={name} className="group flex flex-col gap-2">
          <FormLabel>{t('settings:inboxes.new_inbox.name')}</FormLabel>
          <FormInput type="text" />
          <FormError />
        </FormField>
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            className="flex-1"
            variant="primary"
            type="submit"
            name="create"
          >
            <NewInbox />
            {t('settings:inboxes.new_inbox.create')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
