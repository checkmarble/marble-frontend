import { Callout } from '@app-builder/components';
import { type ContinuousScreeningMatch } from '@app-builder/models/continuous-screening';
import { useReviewContinuousScreeningMatchMutation } from '@app-builder/queries/continuous-screening/review-match';
import { type ReviewMatchPayload, reviewMatchPayloadSchema } from '@app-builder/schemas/continuous-screenings';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm, useSelector } from '@tanstack/react-form';
import { useRouter } from '@tanstack/react-router';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand, Modal, Radio, TextArea } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';
import { TentativeReviewSummary } from './TentativeReview';

type ReviewScreeningMatchProps = {
  screeningMatch: ContinuousScreeningMatch;
  automaticallyConfirmScreening?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const ReviewScreeningMatch = ({
  screeningMatch,
  automaticallyConfirmScreening = false,
  open,
  onOpenChange,
}: ReviewScreeningMatchProps) => {
  const { t } = useTranslation(['screenings']);
  // Owned here rather than by the content, which unmounts on close: Save stays disabled while a request is in flight.
  const reviewScreeningMatchMutation = useReviewContinuousScreeningMatchMutation();

  return (
    <MenuCommand.Menu open={open} onOpenChange={onOpenChange} persistOnSelect>
      <MenuCommand.Trigger>
        <Button
          variant="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {t('screenings:start_reviewing')}
          <Icon icon="caret-down" className="size-4" />
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content align="end" sideOffset={4} className="w-[420px]">
        {/* The content unmounts on close, so a cancelled decision doesn't survive reopening. */}
        <ReviewScreeningMatchContent
          screeningMatch={screeningMatch}
          automaticallyConfirmScreening={automaticallyConfirmScreening}
          reviewScreeningMatchMutation={reviewScreeningMatchMutation}
          onClose={() => onOpenChange(false)}
        />
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};

type ReviewDecision = ReviewMatchPayload['status'];

/** The form values before submission: the reviewer may not have picked a decision yet. */
type ReviewMatchDraft = {
  matchId: string;
  status: ReviewDecision | null;
  comment: string;
};

// The payload schema with the comment the form always holds, so its input type fits the draft.
const reviewMatchDraftSchema = reviewMatchPayloadSchema.extend({ comment: z.string() });

function ReviewScreeningMatchContent({
  screeningMatch,
  automaticallyConfirmScreening,
  reviewScreeningMatchMutation,
  onClose,
}: {
  screeningMatch: ContinuousScreeningMatch;
  automaticallyConfirmScreening: boolean;
  reviewScreeningMatchMutation: ReturnType<typeof useReviewContinuousScreeningMatchMutation>;
  onClose: () => void;
}) {
  const { t } = useTranslation(['common', 'screenings']);
  const router = useRouter();

  const defaultValues: ReviewMatchDraft = {
    matchId: screeningMatch.id,
    // A prefilled decision would read as agreeing with the tentative review, so the reviewer picks one.
    status: screeningMatch.tentativeReview ? null : 'no_hit',
    comment: '',
  };

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const payload = reviewMatchDraftSchema.safeParse(value);
      if (!payload.success) return;
      try {
        await reviewScreeningMatchMutation.mutateAsync(payload.data);
        onClose();
        router.invalidate();
      } catch {
        toast.error(t('common:errors.unknown'));
      }
    },
    validators: {
      onSubmit: reviewMatchDraftSchema,
    },
  });

  const currentStatus = useSelector(form.store, (state) => state.values.status);
  const formId = `match_review_form_${screeningMatch.id}`;

  return (
    <>
      <form id={formId} className="flex flex-col gap-sm p-md" onSubmit={handleSubmit(form)}>
        {screeningMatch.tentativeReview ? <TentativeReviewSummary review={screeningMatch.tentativeReview} /> : null}
        <span className="text-s font-medium">{t('screenings:review_modal.status_label')}</span>

        <form.Field name="status">
          {(field) => (
            <>
              <Radio.Root
                value={field.state.value ?? ''}
                onValueChange={(value) => {
                  const decision = reviewMatchPayloadSchema.shape.status.safeParse(value);
                  if (decision.success) field.handleChange(decision.data);
                }}
                className="flex flex-col gap-sm"
              >
                <Radio.Item
                  value="confirmed_hit"
                  className="text-grey-secondary data-[state=checked]:text-purple-primary rounded-sm transition-colors"
                >
                  <span className="text-xs">{t('screenings:match.status.confirmed_hit')}</span>
                </Radio.Item>
                <Radio.Item
                  value="no_hit"
                  className="text-grey-secondary data-[state=checked]:text-purple-primary rounded-sm transition-colors"
                >
                  <span className="text-xs">{t('screenings:match.status.no_hit')}</span>
                </Radio.Item>
              </Radio.Root>
              {currentStatus === 'confirmed_hit' && automaticallyConfirmScreening ? (
                <Callout>{t('screenings:review_modal.callout_confirmed_hit')}</Callout>
              ) : null}
            </>
          )}
        </form.Field>

        <form.Field name="comment">
          {(field) => (
            <TextArea
              name={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder={t('screenings:review_modal.comment_label')}
              className="h-[100px]"
            />
          )}
        </form.Field>
      </form>

      <Modal.Footer>
        <Modal.FooterButton variant="secondary" label={t('common:cancel')} onClick={onClose} />
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Modal.FooterButton
              type="submit"
              form={formId}
              label={t('common:save')}
              disabled={currentStatus === null || isSubmitting || reviewScreeningMatchMutation.isPending}
            />
          )}
        </form.Subscribe>
      </Modal.Footer>
    </>
  );
}
