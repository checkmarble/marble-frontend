import { Callout } from '@app-builder/components';
import { StatusRadioGroup } from '@app-builder/components/Screenings/StatusRadioGroup';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { type ScreeningMatch } from '@app-builder/models/screening';
import {
  ReviewScreeningMatchPayload,
  reviewScreeningMatchPayloadSchema,
  useReviewScreeningMatchMutation,
} from '@app-builder/queries/screening/review-screening-match';
import { handleSubmit } from '@app-builder/utils/form';
import { useCallbackRef } from '@app-builder/utils/hooks';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalV2, Switch, TextArea } from 'ui-design-system';

export const ReviewScreeningMatch = ({
  open,
  onClose: _onClose,
  sanctionMatch,
}: {
  open: boolean;
  onClose: () => void;
  sanctionMatch: ScreeningMatch;
}) => {
  const { t } = useTranslation(['common', 'screenings']);
  const onClose = useCallbackRef(_onClose);
  const [isConfirming, setIsConfirming] = useState(false);
  const reviewScreeningMatchMutation = useReviewScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      matchId: sanctionMatch.id,
      status: 'confirmed_hit',
      comment: '',
      whitelist: false,
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation.mutateAsync(value).then((res) => {
        console.log(res);
        if (res.success) {
          onClose();
        }
        revalidate();
      });
    },
    validators: {
      onSubmit: reviewScreeningMatchPayloadSchema,
    },
  });

  const currentStatus = useStore(form.store, (state) => state.values.status);

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
      <ModalV2.Title>{t('screenings:review_modal.title')}</ModalV2.Title>
      <form
        className="flex flex-col gap-8 p-8"
        onSubmit={handleSubmit(form)}
        id="review-screening-match"
      >
        <input name="matchId" type="hidden" value={sanctionMatch.id} />
        <form.Field name="status">
          {(field) => {
            return (
              <div className="flex flex-col gap-2">
                <div className="text-m">{t('screenings:review_modal.status_label')}</div>
                <StatusRadioGroup value={field.state.value} onChange={field.handleChange} />
                {currentStatus === 'confirmed_hit' ? (
                  <Callout>{t('screenings:review_modal.callout_confirmed_hit')}</Callout>
                ) : null}
              </div>
            );
          }}
        </form.Field>
        <form.Field name="comment">
          {(field) => {
            return (
              <div className="flex flex-col gap-2">
                <div className="text-m">{t('screenings:review_modal.comment_label')}</div>
                <TextArea
                  name={field.name}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            );
          }}
        </form.Field>
        {/* TODO: Whitelisting */}
        {currentStatus === 'no_hit' && !!sanctionMatch.uniqueCounterpartyIdentifier ? (
          <form.Field name="whitelist">
            {(field) => {
              return (
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2">
                    <Switch
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                    />{' '}
                    {t('screenings:review_modal.whitelist_label')}
                  </span>
                  <div className="border-grey-90 bg-grey-98 flex flex-col gap-2 rounded-sm border p-2">
                    <span className="font-semibold">
                      {t('screenings:match.unique_counterparty_identifier')}
                    </span>
                    <span>{sanctionMatch.uniqueCounterpartyIdentifier}</span>
                  </div>
                </div>
              );
            }}
          </form.Field>
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
            <ModalV2.Title>{t('screenings:review_modal.confirmation')}</ModalV2.Title>
            <div className="flex flex-col gap-4 p-6">
              <div>{t('screenings:review_modal.callout_confirmed_hit')}</div>
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
                  form="review-screening-match"
                  type="submit"
                >
                  {t('common:save')}
                </Button>
              </div>
            </div>
          </ModalV2.Content>
        </div>
      </form>
    </ModalV2.Content>
  );
};
