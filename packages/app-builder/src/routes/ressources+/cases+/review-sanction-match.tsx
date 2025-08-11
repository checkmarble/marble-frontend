import { Callout } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { StatusRadioGroup } from '@app-builder/components/Sanctions/StatusRadioGroup';
import { type SanctionCheckMatch } from '@app-builder/models/sanction-check';
import { initServerServices } from '@app-builder/services/init.server';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { decode } from 'decode-formdata';
import { type UpdateSanctionCheckMatchDto } from 'marble-api';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Switch, TextArea } from 'ui-design-system';
import { z } from 'zod/v4';

const reviewSanctionSchema = z.object({
  matchId: z.string(),
  status: z.union([z.literal('confirmed_hit'), z.literal('no_hit')]),
  comment: z.string().optional(),
  whitelist: z
    .preprocess((onoff) => onoff === 'on', z.boolean())
    .prefault(false)
    .optional(),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [session, t, raw, { sanctionCheck }] = await Promise.all([
    getSession(request),
    getFixedT(request, ['common', 'cases']),
    request.formData(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { success, error, data } = reviewSanctionSchema.safeParse(decode(raw));

  if (!success) {
    return json({ success: 'false', errors: z.treeifyError(error) });
  }

  try {
    await sanctionCheck.updateMatchStatus(data);
    return json({ success: 'true', errors: [] });
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { success: 'false', errors: [] },
      { headers: { 'Set-Cookie': await commitSession(session) } },
    );
  }
}

export const SanctionCheckReviewModal = ({
  open,
  onClose: _onClose,
  sanctionMatch,
}: {
  open: boolean;
  onClose: () => void;
  sanctionMatch: SanctionCheckMatch;
}) => {
  const { t } = useTranslation(['common', 'sanctions']);
  const [currentStatus, setCurrentStatus] = useState<UpdateSanctionCheckMatchDto['status'] | null>(
    null,
  );
  const onClose = useCallbackRef(_onClose);
  const [isConfirming, setIsConfirming] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher.data?.success === 'true') {
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
      <ModalV2.Title>{t('sanctions:review_modal.title')}</ModalV2.Title>
      <fetcher.Form
        className="flex flex-col gap-8 p-8"
        method="post"
        action={getRoute('/ressources/cases/review-sanction-match')}
        ref={formRef}
      >
        <input name="matchId" type="hidden" value={sanctionMatch.id} />
        <div className="flex flex-col gap-2">
          <div className="text-m">{t('sanctions:review_modal.status_label')}</div>
          <StatusRadioGroup value={currentStatus} onChange={setCurrentStatus} />
          {currentStatus === 'confirmed_hit' ? (
            <Callout>{t('sanctions:review_modal.callout_confirmed_hit')}</Callout>
          ) : null}
        </div>
        <div className="flex flex-col gap-2">
          <div className="text-m">{t('sanctions:review_modal.comment_label')}</div>
          <TextArea name="comment" />
        </div>
        {/* TODO: Whitelisting */}
        {currentStatus === 'no_hit' && !!sanctionMatch.uniqueCounterpartyIdentifier ? (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-2">
              <Switch name="whitelist" /> {t('sanctions:review_modal.whitelist_label')}
            </span>
            <div className="border-grey-90 bg-grey-98 flex flex-col gap-2 rounded border p-2">
              <span className="font-semibold">
                {t('sanctions:match.unique_counterparty_identifier')}
              </span>
              <span>{sanctionMatch.uniqueCounterpartyIdentifier}</span>
            </div>
          </div>
        ) : null}
        <div className="flex flex-1 flex-row gap-2">
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" name="cancel" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button
            type={currentStatus === 'confirmed_hit' ? 'button' : 'submit'}
            disabled={!currentStatus}
            className="flex-1"
            variant="primary"
            name="save"
            onClick={() => {
              if (currentStatus === 'confirmed_hit') {
                setIsConfirming(true);
              }
            }}
          >
            {t('common:save')}
          </Button>
          <ModalV2.Content open={isConfirming} onClose={() => setIsConfirming(false)}>
            <ModalV2.Title>{t('sanctions:review_modal.confirmation')}</ModalV2.Title>
            <div className="flex flex-col gap-4 p-6">
              <div>{t('sanctions:review_modal.callout_confirmed_hit')}</div>
              <div className="flex justify-between gap-4">
                <ModalV2.Close
                  render={<Button className="flex-1" variant="secondary" name="cancel" />}
                >
                  {t('common:cancel')}
                </ModalV2.Close>
                <Button
                  disabled={!currentStatus}
                  className="flex-1"
                  variant="primary"
                  name="save"
                  onClick={() => {
                    fetcher.submit(formRef.current);
                  }}
                >
                  {t('common:save')}
                </Button>
              </div>
            </div>
          </ModalV2.Content>
        </div>
      </fetcher.Form>
    </ModalV2.Content>
  );
};
