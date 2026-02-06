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
import { Button, Modal, Switch, TextArea } from 'ui-design-system';

export const ReviewScreeningMatch = ({
  open,
  onClose: _onClose,
  screeningMatch,
}: {
  open: boolean;
  onClose: () => void;
  screeningMatch: ScreeningMatch;
}) => {
  const { t } = useTranslation(['common', 'screenings']);
  const onClose = useCallbackRef(_onClose);
  const [isConfirming, setIsConfirming] = useState(false);
  const reviewScreeningMatchMutation = useReviewScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: 'confirmed_hit',
      comment: '',
      whitelist: false,
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation.mutateAsync(value).then((res) => {
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
    <Modal.Root
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <Modal.Content
        size="small"
        onInteractOutside={(event) => {
          event.preventDefault();
        }}
      >
        <Modal.Title>{t('screenings:review_modal.title')}</Modal.Title>
        <form className="flex flex-col gap-8 p-8" onSubmit={handleSubmit(form)} id="review-screening-match">
          <input name="matchId" type="hidden" value={screeningMatch.id} />
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
          {currentStatus === 'no_hit' && !!screeningMatch.uniqueCounterpartyIdentifier ? (
            <form.Field name="whitelist">
              {(field) => {
                return (
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <Switch name={field.name} checked={field.state.value} onCheckedChange={field.handleChange} />{' '}
                      {t('screenings:review_modal.whitelist_label')}
                    </span>
                    <div className="border-grey-border bg-grey-background-light flex flex-col gap-2 rounded-sm border p-2">
                      <span className="font-semibold">{t('screenings:match.unique_counterparty_identifier')}</span>
                      <span>{screeningMatch.uniqueCounterpartyIdentifier}</span>
                    </div>
                  </div>
                );
              }}
            </form.Field>
          ) : null}
        </form>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary" appearance="stroked" name="cancel">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button
            type={currentStatus === 'confirmed_hit' ? 'button' : 'submit'}
            disabled={!currentStatus}
            className="flex-1"
            variant="primary"
            name="save"
            form="review-screening-match"
            onClick={() => {
              if (currentStatus === 'confirmed_hit') {
                setIsConfirming(true);
              }
            }}
          >
            {t('common:save')}
          </Button>
        </Modal.Footer>
        <Modal.Root open={isConfirming} onOpenChange={setIsConfirming}>
          <Modal.Content>
            <Modal.Title>{t('screenings:review_modal.confirmation')}</Modal.Title>
            <div className="flex flex-col gap-4 p-6">
              <div>{t('screenings:review_modal.callout_confirmed_hit')}</div>
            </div>
            <Modal.Footer>
              <Modal.Close asChild>
                <Button className="flex-1" variant="secondary" appearance="stroked" name="cancel">
                  {t('common:cancel')}
                </Button>
              </Modal.Close>
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
            </Modal.Footer>
          </Modal.Content>
        </Modal.Root>
      </Modal.Content>
    </Modal.Root>
  );
};
