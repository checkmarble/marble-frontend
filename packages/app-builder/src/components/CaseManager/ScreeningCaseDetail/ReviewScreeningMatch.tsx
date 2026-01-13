import { Callout } from '@app-builder/components';
import { StatusRadioGroup } from '@app-builder/components/Screenings/StatusRadioGroup';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { ContinuousScreeningMatch } from '@app-builder/models/continuous-screening';
import {
  reviewMatchPayloadSchema,
  useReviewContinuousScreeningMatchMutation,
} from '@app-builder/queries/continuous-screening/review-match';
import { ReviewScreeningMatchPayload } from '@app-builder/queries/screening/review-screening-match';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useStore } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, ModalV2, TextArea } from 'ui-design-system';

export const ReviewScreeningMatch = ({
  screeningMatch,
  children,
}: {
  screeningMatch: ContinuousScreeningMatch;
  children: React.ReactNode;
}) => {
  const { t } = useTranslation(['common', 'screenings']);
  const [open, setOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const reviewScreeningMatchMutation = useReviewContinuousScreeningMatchMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      matchId: screeningMatch.id,
      status: 'confirmed_hit',
      comment: '',
    } as ReviewScreeningMatchPayload,
    onSubmit: async ({ value }) => {
      reviewScreeningMatchMutation.mutateAsync(value).then((res) => {
        if (res.success) {
          setOpen(false);
        }
        revalidate();
      });
    },
    validators: {
      onSubmit: reviewMatchPayloadSchema,
    },
  });

  const currentStatus = useStore(form.store, (state) => state.values.status);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content size="small">
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
          <div className="flex flex-1 flex-row gap-2">
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
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
                  <ModalV2.Close render={<Button className="flex-1" variant="secondary" name="cancel" />}>
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
      </Modal.Content>
    </Modal.Root>
  );
};
