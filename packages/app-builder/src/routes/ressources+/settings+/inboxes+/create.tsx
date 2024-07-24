import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormInput } from '@app-builder/components/Form/FormInput';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
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
import { Button, ModalV2 } from 'ui-design-system';
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
  const submission = parseWithZod(formData, { schema: createInboxFormSchema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    const { inbox: createdInbox } = await apiClient.createInbox({
      name: submission.value.name,
    });
    if (submission.value.redirectRoute)
      return redirect(
        getRoute(submission.value.redirectRoute, {
          inboxId: fromUUID(createdInbox.id),
        }),
      );
    return json(submission.reply());
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

export function CreateInbox({
  redirectRoutePath,
}: {
  redirectRoutePath?: (typeof redirectRouteOptions)[number];
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
    <ModalV2.Root open={open} setOpen={setOpen}>
      <ModalV2.Trigger
        onClick={(e) => e.stopPropagation()}
        render={<Button className="whitespace-nowrap" variant="secondary" />}
      >
        <Icon icon="new-inbox" className="size-5 shrink-0" />
        {t('settings:inboxes.new_inbox.create')}
      </ModalV2.Trigger>
      <ModalV2.Content onClick={(e) => e.stopPropagation()}>
        <CreateInboxContent
          redirectRoutePath={redirectRoutePath}
          setOpen={setOpen}
        />
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
  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: { name: '', redirectRoute: redirectRoutePath },
    lastResult: fetcher.data,
    constraint: getZodConstraint(createInboxFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: createInboxFormSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/settings/inboxes/create')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>{t('settings:inboxes.new_inbox.explain')}</ModalV2.Title>
        <div className="flex flex-col gap-6 p-6">
          <input
            {...getInputProps(fields.redirectRoute, { type: 'hidden' })}
            key={fields.redirectRoute.key}
          />
          <FormField
            name={fields.name.name}
            className="group flex flex-col gap-2"
          >
            <FormLabel>{t('settings:inboxes.new_inbox.name')}</FormLabel>
            <FormInput type="text" />
            <FormErrorOrDescription />
          </FormField>
          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
              {t('common:cancel')}
            </ModalV2.Close>
            <Button
              className="flex-1"
              variant="primary"
              type="submit"
              name="create"
            >
              <Icon icon="new-inbox" className="size-5" />
              {t('settings:inboxes.new_inbox.create')}
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </FormProvider>
  );
}
