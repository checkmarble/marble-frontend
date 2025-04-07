import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { type Inbox } from '@app-builder/models/inbox';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { pick } from 'radash';
import { useEffect, useState } from 'react';
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

type UpdateInboxForm = z.infer<typeof updateInboxFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { inbox }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = updateInboxFormSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    const updatedInbox = await inbox.updateInbox(data.id, pick(data, ['name']));

    return redirect(
      safeRedirect(
        getRoute(data.redirectRoute, {
          inboxId: fromUUIDtoSUUID(updatedInbox.id),
        }),
        getRoute('/ressources/auth/logout'),
      ),
    );
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

export function UpdateInbox({
  inbox,
  redirectRoutePath,
}: {
  inbox: Inbox;
  redirectRoutePath: (typeof redirectRouteOptions)[number];
}) {
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
      <Modal.Trigger asChild onClick={(e) => e.stopPropagation()}>
        <Button className="w-fit whitespace-nowrap">
          <Icon icon="edit-square" className="size-6" />
          {t('settings:inboxes.update_inbox')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <UpdateInboxContent inbox={inbox} redirectRoutePath={redirectRoutePath} />
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

  const form = useForm({
    defaultValues: { ...inbox, redirectRoute: redirectRoutePath } as UpdateInboxForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'PATCH',
          action: getRoute('/ressources/settings/inboxes/update'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onChange: updateInboxFormSchema,
      onBlur: updateInboxFormSchema,
      onSubmit: updateInboxFormSchema,
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
      <Modal.Title>{t('settings:inboxes.update_inbox')}</Modal.Title>
      <div className="bg-grey-100 flex flex-col gap-6 p-6">
        <form.Field name="name">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.name')}</FormLabel>
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
        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" type="button">
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
}
