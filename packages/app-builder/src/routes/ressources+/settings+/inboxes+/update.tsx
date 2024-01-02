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
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { type Namespace } from 'i18next';
import { type InboxDto } from 'marble-api';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { safeRedirect } from 'remix-utils/safe-redirect';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

import { redirectRouteOptions } from './create';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

const updateInboxFormSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  redirectRoute: z.enum(redirectRouteOptions),
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
  const submission = parse(formData, { schema: updateInboxFormSchema });

  if (submission.intent !== 'submit' || !submission.value) {
    return json(submission);
  }

  try {
    const { inbox } = await apiClient.updateInbox(submission.value.id, {
      name: submission.value.name,
    });
    return redirect(
      safeRedirect(
        getRoute(submission.value.redirectRoute, {
          inboxId: fromUUID(inbox.id),
        }),
        getRoute('/ressources/auth/logout'),
      ),
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

export function UpdateInbox({
  inbox,
  redirectRoutePath,
}: {
  inbox: InboxDto;
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
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit" className="h-6 w-6" />
          {t('settings:inboxes.update_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateInboxContent
          inbox={inbox}
          redirectRoutePath={redirectRoutePath}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxContent({
  inbox,
  redirectRoutePath,
}: {
  inbox: InboxDto;
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const formId = useId();
  const [form, { id, name, redirectRoute }] = useForm({
    id: formId,
    defaultValue: { ...inbox, redirectRoute: redirectRoutePath },
    lastSubmission: fetcher.data,
    constraint: getFieldsetConstraint(updateInboxFormSchema),
    onValidate({ formData }) {
      return parse(formData, {
        schema: updateInboxFormSchema,
      });
    },
  });

  return (
    <fetcher.Form
      action={getRoute('/ressources/settings/inboxes/update')}
      method="PATCH"
      {...form.props}
    >
      <Modal.Title>{t('settings:inboxes.update_inbox')}</Modal.Title>
      <div className="bg-grey-00 flex flex-col gap-6 p-6">
        <input {...conform.input(id, { type: 'hidden' })} />
        <input {...conform.input(redirectRoute, { type: 'hidden' })} />
        <FormField config={name} className="group flex flex-col gap-2">
          <FormLabel>{t('settings:inboxes.name')}</FormLabel>
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
            name="update"
          >
            {t('common:save')}
          </Button>
        </div>
      </div>
    </fetcher.Form>
  );
}
