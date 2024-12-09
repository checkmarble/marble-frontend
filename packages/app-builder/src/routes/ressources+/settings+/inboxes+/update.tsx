import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type Inbox } from '@app-builder/models/inbox';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
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
import * as React from 'react';
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
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: updateInboxFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const updatedInbox = await inbox.updateInbox(submission.value.id, {
      name: submission.value.name,
    });
    return redirect(
      safeRedirect(
        getRoute(submission.value.redirectRoute, {
          inboxId: fromUUID(updatedInbox.id),
        }),
        getRoute('/ressources/auth/logout'),
      ),
    );
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

export function UpdateInbox({
  inbox,
  redirectRoutePath,
}: {
  inbox: Inbox;
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
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
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-6" />
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
  inbox: Inbox;
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
  const { t } = useTranslation(handle.i18n);

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: { ...inbox, redirectRoute: redirectRoutePath },
    lastResult: fetcher.data,
    constraint: getZodConstraint(updateInboxFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: updateInboxFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        action={getRoute('/ressources/settings/inboxes/update')}
        method="PATCH"
        {...getFormProps(form)}
      >
        <Modal.Title>{t('settings:inboxes.update_inbox')}</Modal.Title>
        <div className="bg-grey-00 flex flex-col gap-6 p-6">
          <input
            {...getInputProps(fields.id, { type: 'hidden' })}
            key={fields.id.key}
          />
          <input
            {...getInputProps(fields.redirectRoute, { type: 'hidden' })}
            key={fields.redirectRoute.key}
          />
          <FormField
            name={fields.name.name}
            className="group flex flex-col gap-2"
          >
            <FormLabel>{t('settings:inboxes.name')}</FormLabel>
            <FormInput type="text" />
            <FormErrorOrDescription />
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
    </FormProvider>
  );
}
