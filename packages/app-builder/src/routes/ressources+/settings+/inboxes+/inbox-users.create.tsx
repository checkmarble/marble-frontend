import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { Nudge } from '@app-builder/components/Nudge';
import { type User } from '@app-builder/models';
import { tKeyForInboxUserRole } from '@app-builder/models/inbox';
import { getInboxUserRoles } from '@app-builder/services/feature-access';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUID } from '@app-builder/utils/short-uuid';
import { FormProvider, getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import clsx from 'clsx';
import { type Namespace } from 'i18next';
import { type FeatureAccessDto } from 'marble-api/generated/license-api';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

export const handle = {
  i18n: ['settings', 'common'] satisfies Namespace,
};

function getCreateInboxUserFormSchema(inboxUserRoles: readonly [string, ...string[]]) {
  return z.object({
    userId: z.string().uuid(),
    inboxId: z.string().uuid(),
    role: z.enum(inboxUserRoles),
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { inbox, entitlements } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: getCreateInboxUserFormSchema(getInboxUserRoles(entitlements)),
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await inbox.createInboxUser(submission.value.inboxId, submission.value);
    return redirect(
      getRoute('/settings/inboxes/:inboxId', {
        inboxId: fromUUID(submission.value.inboxId),
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

export function CreateInboxUser({
  inboxId,
  users,
  inboxUserRoles,
  access,
}: {
  inboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessDto;
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
        <Button>
          <Icon icon="plus" className="size-6" />
          {t('settings:inboxes.inbox_details.add_member')}
        </Button>
      </Modal.Trigger>
      <Modal.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxUserContent
          currentInboxId={inboxId}
          users={users}
          inboxUserRoles={inboxUserRoles}
          access={access}
        />
      </Modal.Content>
    </Modal.Root>
  );
}

export function CreateInboxUserContent({
  currentInboxId,
  users,
  inboxUserRoles,
  access,
}: {
  currentInboxId: string;
  users: User[];
  inboxUserRoles: readonly [string, ...string[]];
  access: FeatureAccessDto;
}) {
  const { t } = useTranslation(handle.i18n);
  const schema = React.useMemo(
    () => getCreateInboxUserFormSchema(inboxUserRoles),
    [inboxUserRoles],
  );

  const fetcher = useFetcher<typeof action>();

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: { userId: '', inboxId: currentInboxId, role: 'admin' },
    lastResult: fetcher.data,
    constraint: getZodConstraint(schema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema,
      });
    },
  });

  const userOptions = users.map((user) => ({
    value: user.userId,
    label: `${user.firstName} ${user.lastName}`,
  }));

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/settings/inboxes/inbox-users/create')}
        {...getFormProps(form)}
      >
        <Modal.Title>{t('settings:inboxes.inbox_details.add_member')}</Modal.Title>
        <div className="bg-grey-100 flex flex-col gap-6 p-6">
          <input {...getInputProps(fields.inboxId, { type: 'hidden' })} key={fields.inboxId.key} />
          <FormField name={fields.userId.name} className="group flex flex-col gap-2">
            <FormLabel>{t('settings:inboxes.inbox_details.user')}</FormLabel>
            <FormSelect.Default options={userOptions}>
              {userOptions.map(({ value, label }) => (
                <FormSelect.DefaultItem key={value} value={value}>
                  {label}
                </FormSelect.DefaultItem>
              ))}
            </FormSelect.Default>
            <FormErrorOrDescription />
          </FormField>
          <FormField name={fields.role.name} className="group flex flex-col gap-2">
            <FormLabel className="flex gap-2">
              <span className={clsx({ 'text-grey-80': access === 'restricted' })}>
                {t('settings:inboxes.inbox_details.role')}
              </span>
              {access === 'allowed' ? null : (
                <Nudge content={t('settings:users.role.nudge')} className="size-6" kind={access} />
              )}
            </FormLabel>
            <FormSelect.Default options={inboxUserRoles} disabled={access === 'restricted'}>
              {inboxUserRoles.map((role) => (
                <FormSelect.DefaultItem key={role} value={role}>
                  {t(tKeyForInboxUserRole(role))}
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
            <Button className="flex-1" variant="primary" type="submit" name="create">
              <Icon icon="new-inbox" className="size-6" />
              {t('settings:inboxes.inbox_details.create_user')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
