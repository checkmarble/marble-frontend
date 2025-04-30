import { Callout, casesI18n } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { isAdmin } from '@app-builder/models';
import { type loader } from '@app-builder/routes/_builder+/cases+/$caseId+/_index';
import { initServerServices } from '@app-builder/services/init.server';
import { handleSubmit } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { fromUUIDtoSUUID } from '@app-builder/utils/short-uuid';
import { type ActionFunctionArgs, redirect } from '@remix-run/node';
import { Link, useFetcher, useLoaderData } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Button, Modal, Tooltip } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod';

const schema = z.object({ caseId: z.string(), inboxId: z.string() });

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [raw, session, t, { cases }] = await Promise.all([
    request.json(),
    getSession(request),
    getFixedT(request, ['cases', 'common']),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, data, error } = schema.safeParse(raw);

  if (!success) return { success: false, errors: error.flatten() };

  try {
    await cases.escalateCase({ caseId: data.caseId });

    setToastMessage(session, {
      type: 'success',
      messageKey: t('cases:case.escalated'),
    });

    return redirect(
      getRoute('/cases/inboxes/:inboxId', { inboxId: fromUUIDtoSUUID(data.inboxId) }),
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: t('common:errors.unknown'),
    });

    return Response.json(
      { success: false, errors: [] },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      },
    );
  }
}

export const EscalateCase = ({ id, inboxId }: { id: string; inboxId: string }) => {
  const { t } = useTranslation(casesI18n);
  const fetcher = useFetcher<typeof action>();

  const { inboxes, currentUser } = useLoaderData<typeof loader>();

  const inboxDetail = inboxes.find((inbox) => inbox.id === inboxId)!;
  const targetInbox = inboxes.find((inbox) => inbox.id === inboxDetail.escalationInboxId);
  const canEscalate = inboxDetail.escalationInboxId !== undefined;

  const isAdminUser = isAdmin(currentUser);

  const form = useForm({
    onSubmit: async ({ value }) => {
      fetcher.submit(value, {
        method: 'POST',
        action: getRoute('/ressources/cases/escalate-case'),
        encType: 'application/json',
      });
    },
    defaultValues: { caseId: id, inboxId },
    validators: {
      onChange: schema,
      onBlur: schema,
      onSubmit: schema,
    },
  });

  return (
    <Modal.Root>
      <Modal.Trigger asChild>
        <Tooltip.Default
          content={
            <div className="pb-2">
              <div>
                {canEscalate
                  ? t('cases:case.escalate-button.hint', { inboxName: targetInbox?.name })
                  : isAdminUser
                    ? t('cases:case.escalate-button.forbidden.hint.admin')
                    : t('cases:case.escalate-button.forbidden.hint')}
              </div>
              {!canEscalate && isAdminUser ? (
                <Link
                  to={getRoute('/settings/inboxes/:inboxId', {
                    inboxId: fromUUIDtoSUUID(inboxId),
                  })}
                  className="hover:text-purple-60 focus:text-purple-60 text-purple-65 font-semibold hover:underline focus:underline"
                >
                  Inbox settings
                </Link>
              ) : null}
            </div>
          }
        >
          <Button variant="secondary" size="medium" type="button" disabled={!canEscalate}>
            <Icon icon="arrow-up" className="size-5" aria-hidden />
            Escalate
          </Button>
        </Tooltip.Default>
      </Modal.Trigger>
      <Modal.Content>
        <Modal.Title>Escalate Case</Modal.Title>
        <div className="flex flex-col gap-8 p-8">
          <Callout>
            By escalating this decision, you will no longer have access to the case and will no
            longer be assigned to the case. You will be redirected to your inbox.
          </Callout>
          <form onSubmit={handleSubmit(form)} className="flex w-full flex-row gap-2">
            <Modal.Close asChild>
              <Button variant="secondary" type="button" className="flex-1 first-letter:capitalize">
                {t('common:cancel')}
              </Button>
            </Modal.Close>

            <Button type="submit" className="flex-1 first-letter:capitalize">
              Escalate
            </Button>
          </form>
        </div>
      </Modal.Content>
    </Modal.Root>
  );
};
