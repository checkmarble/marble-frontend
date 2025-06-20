import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormInput } from '@app-builder/components/Form/Tanstack/FormInput';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, json, redirect } from '@remix-run/node';
import { useFetcher, useNavigation } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { type Namespace } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, HiddenInputs, ModalV2 } from 'ui-design-system';
import { Icon } from 'ui-icons';
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
  redirectRoute: z.enum(redirectRouteOptions).optional(),
});

type CreateInboxForm = z.infer<typeof createInboxFormSchema>;

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [{ inbox }, data, session, t] = await Promise.all([
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
    request.json(),
    getSession(request),
    getFixedT(request, ['common']),
  ]);

  const result = createInboxFormSchema.safeParse(data);

  if (!result.success) {
    return json(
      { status: 'error', errors: result.error.flatten() },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }

  try {
    const createdInbox = await inbox.createInbox(data);

    if (data.redirectRoute)
      return redirect(
        getRoute(data.redirectRoute, {
          inboxId: fromUUIDtoSUUID(createdInbox.id),
        }),
      );

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      { status: 'success', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export function CreateInbox({
  redirectRoutePath,
}: {
  redirectRoutePath?: (typeof redirectRouteOptions)[number];
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
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger
        onClick={(e) => e.stopPropagation()}
        render={<Button className="whitespace-nowrap" variant="secondary" />}
      >
        <Icon icon="new-inbox" className="size-5 shrink-0" />
        {t('settings:inboxes.new_inbox.create')}
      </ModalV2.Trigger>
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent redirectRoutePath={redirectRoutePath} setOpen={setOpen} />
      </ModalV2.Content>
    </ModalV2.Root>
  );
}

export function CreateInboxContent({
  redirectRoutePath,
  setOpen,
}: {
  redirectRoutePath?: (typeof redirectRouteOptions)[number];
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: { name: '', redirectRoute: redirectRoutePath } as CreateInboxForm,
    validators: {
      onChange: createInboxFormSchema,
      onBlur: createInboxFormSchema,
      onSubmit: createInboxFormSchema,
    },
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/settings/inboxes/create'),
          encType: 'application/json',
        });
      }
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
      <ModalV2.Title>{t('settings:inboxes.new_inbox.explain')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <HiddenInputs redirectRoute={redirectRoutePath} />
        <form.Field name="name">
          {(field) => (
            <div className="group flex flex-col gap-2">
              <FormLabel name={field.name}>{t('settings:inboxes.new_inbox.name')}</FormLabel>
              <FormInput
                name={field.name}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                valid={field.state.meta.errors.length === 0}
                type="text"
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit" name="create">
            <Icon icon="new-inbox" className="size-5" />
            {t('settings:inboxes.new_inbox.create')}
          </Button>
        </div>
      </div>
    </form>
  );
}
