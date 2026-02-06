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
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Modal, TextArea } from 'ui-design-system';

type ReviewScreeningMatchProps = {
  screeningMatch: ContinuousScreeningMatch;
  children: ReactNode;
  automaticallyConfirmScreening?: boolean;
};

export const ReviewScreeningMatch = ({
  screeningMatch,
  children,
  automaticallyConfirmScreening = false,
}: ReviewScreeningMatchProps) => {
  const { t } = useTranslation(['common', 'screenings']);
  const [open, setOpen] = useState(false);
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
        <form onSubmit={handleSubmit(form)} id="review-screening-match">
          <div className="flex flex-col gap-8 p-8">
            <input name="matchId" type="hidden" value={screeningMatch.id} />
            <form.Field name="status">
              {(field) => {
                return (
                  <div className="flex flex-col gap-2">
                    <div className="text-m">{t('screenings:review_modal.status_label')}</div>
                    <StatusRadioGroup value={field.state.value} onChange={field.handleChange} />
                    {currentStatus === 'confirmed_hit' && automaticallyConfirmScreening ? (
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
          </div>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button className="flex-1" variant="secondary" appearance="stroked" name="cancel">
                {t('common:cancel')}
              </Button>
            </Modal.Close>
            <Button type="submit" disabled={!currentStatus} className="flex-1" variant="primary" name="save">
              {t('common:save')}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal.Root>
  );
};
