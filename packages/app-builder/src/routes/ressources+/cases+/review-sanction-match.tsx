import { Callout } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { StatusRadioGroup } from '@app-builder/components/Sanctions/StatusRadioGroup';
import { serverServices } from '@app-builder/services/init.server';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { type UpdateSanctionCheckMatchDto } from 'marble-api';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Switch, TextArea } from 'ui-design-system';
import { z } from 'zod';

const schema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
  whitelist: z.boolean().optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;

  const { sanctionCheck } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  try {
    await sanctionCheck.updateMatchStatus(submission.value);

    return submission.reply();
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common', 'cases']);

    const message = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(submission.reply({ formErrors: [message] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
  }
}

export const SanctionCheckReviewModal = ({
  open,
  onClose: _onClose,
  sanctionMatchId,
}: {
  open: boolean;
  onClose: () => void;
  sanctionMatchId: string;
}) => {
  const { t } = useTranslation(['common', 'cases']);
  const [currentStatus, setCurrentStatus] = useState<
    UpdateSanctionCheckMatchDto['status'] | null
  >(null);
  const onClose = useCallbackRef(_onClose);

  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    if (fetcher.data?.status === 'success') {
      onClose();
    }
  }, [fetcher, onClose]);

  return (
    <ModalV2.Content
      open={open}
      hideOnInteractOutside={(event) => {
        event.stopPropagation();
        // Prevent people from losing their work by clicking accidentally outside the modal
        return false;
      }}
      onClose={onClose}
      size="small"
    >
      <ModalV2.Title>Change match status</ModalV2.Title>
      <fetcher.Form
        className="flex flex-col gap-8 p-8"
        method="post"
        action={getRoute('/ressources/cases/review-sanction-match')}
      >
        <input name="matchId" type="hidden" value={sanctionMatchId} />
        <div className="flex flex-col gap-2">
          <div className="text-m">Choose a status</div>
          <StatusRadioGroup value={currentStatus} onChange={setCurrentStatus} />
          {currentStatus === 'confirmed_hit' ? (
            <Callout>
              By choosing to confirm this match, the status of this sanction
              check will automatically changed for Confirmed hit
            </Callout>
          ) : null}
          {/* <div className="grid grid-cols-2 gap-2">
              {(['confirmed_hit', 'no_hit'] as const).map((status) => (
                <div key={status} className="border-grey-90 flex items-center gap-2 rounded border p-2">
                  <Icon className="text-grey-90 size-6" icon={status === match.status ? 'radio-selected' : 'radio-unselected'} />
                  <StatusTag status={status} disabled />
                </div>
              ))}
            </div> */}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-m">Add a comment</div>
          <TextArea name="comment" />
        </div>
        {currentStatus === 'no_hit' ? (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <Switch name="whitelist" /> Do not alert again if this profile is
              associated with:
            </span>
            <div className="border-grey-90 bg-grey-98 flex flex-col gap-2 rounded border p-2">
              <span className="font-semibold">IBAN</span>
              <span>FR76 4061 8801 5200 0500 9263 912</span>
            </div>
          </div>
        ) : null}
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close
            render={
              <Button className="flex-1" variant="secondary" name="cancel" />
            }
          >
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            type="submit"
            disabled={!currentStatus}
            className="flex-1"
            variant="primary"
            name="save"
          >
            {t('common:save')}
          </Button>
        </div>
      </fetcher.Form>
    </ModalV2.Content>
  );
};
