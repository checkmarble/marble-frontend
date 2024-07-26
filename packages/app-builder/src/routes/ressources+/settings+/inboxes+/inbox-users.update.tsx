import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
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
import { type InboxUserDto } from 'marble-api';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getUpdateInboxUserFormSchema(
  inboxUserRoles: readonly [string, ...string[]],
) {
  return z.object({
    id: z.string().uuid(),
    inbox_id: z.string().uuid(),
    role: z.enum(inboxUserRoles),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
    featureAccessService,
  } = serverServices;
  const { inbox } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: getUpdateInboxUserFormSchema(
      await featureAccessService.getInboxUserRoles(),
    ),
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await inbox.updateInboxUser(submission.value.id, {
      role: submission.value.role,
    });
    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUID(submission.value.inbox_id),
      }),
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

export function UpdateInboxUser({
  inboxUser,
  inboxUserRoles,
}: {
  inboxUser: InboxUserDto;
  inboxUserRoles: readonly [string, ...string[]];
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
      <Modal.Trigger>
        <Icon
          icon="edit"
          className="size-6 shrink-0"
          aria-label={t('settings:tags.update_tag')}
        />
      </Modal.Trigger>
      <Modal.Content>
        <UpdateInboxUserContent
          currentInboxUser={inboxUser}
          inboxUserRoles={inboxUserRoles}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function UpdateInboxUserContent({
  currentInboxUser,
  inboxUserRoles,
}: {
  currentInboxUser: InboxUserDto;
  inboxUserRoles: readonly [string, ...string[]];
}) {
  const { t } = useTranslation(handle.i18n);
  const schema = React.useMemo(
    () => getUpdateInboxUserFormSchema(inboxUserRoles),
    [inboxUserRoles],
  );

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: currentInboxUser,
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const inboxUserRoleOptions = React.useMemo(() => {
    return inboxUserRoles.map((role) => ({
      value: role,
      label: t(tKeyForInboxUserRole(role)),
    }));
  }, [inboxUserRoles, t]);

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="patch"
        action={getRoute('/ressources/settings/inboxes/inbox-users/update')}
        {...getFormProps(form)}
      >
        <Modal.Title>{t('settings:inboxes.inbox_user.update')}</Modal.Title>
        <div className="bg-grey-00 flex flex-col gap-6 p-6">
          <input
            {...getInputProps(fields.id, { type: 'hidden' })}
            key={fields.id.key}
          />
          <input
            {...getInputProps(fields.inbox_id, { type: 'hidden' })}
            key={fields.inbox_id.key}
          />
          <FormField
            name={fields.role.name}
            className="group flex flex-col gap-2"
          >
            <FormLabel>{t('settings:inboxes.inbox_details.role')}</FormLabel>
            <FormSelect.Default options={inboxUserRoleOptions}>
              {inboxUserRoleOptions.map((role) => (
                <FormSelect.DefaultItem key={role.value} value={role.value}>
                  {role.label}
                </FormSelect.DefaultItem>
              ))}
            </FormSelect.Default>
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
