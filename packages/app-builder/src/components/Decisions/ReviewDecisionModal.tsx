import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { Outcome } from '@app-builder/models/outcome';
import { ScreeningStatus } from '@app-builder/models/screening';
import {
  ReviewDecisionPayload,
  reviewDecisionPayloadSchema,
  useReviewDecisionMutation,
} from '@app-builder/queries/cases/review-decision';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { cn, Modal, TextArea } from 'ui-design-system';
import { Callout } from '../Callout';
import { FormErrorOrDescription } from '../Form/Tanstack/FormErrorOrDescription';
import { LoadingIcon } from '../Spinner';
import { ReviewStatusTag } from './ReviewStatusTag';

export function ReviewDecisionModal({
  decisionId,
  screenings,
  children,
  defaultOpened,
}: {
  children: React.ReactElement;
  decisionId: string;
  screenings: Array<{ status: ScreeningStatus }> | undefined;
  defaultOpened: boolean;
}) {
  const [open, setOpen] = useState(defaultOpened);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <ReviewDecisionContent setOpen={setOpen} decisionId={decisionId} screenings={screenings} />
      </Modal.Content>
    </Modal.Root>
  );
}

function ReviewDecisionContent({
  decisionId,
  screenings,
  setOpen,
}: {
  decisionId: string;
  screenings: Array<{ status: ScreeningStatus }> | undefined;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const reviewDecisionMutation = useReviewDecisionMutation();
  const hasScreeningsUnconfirmed = screenings?.some((screening) => ['in_review', 'pending'].includes(screening.status));

  const form = useForm({
    defaultValues: {
      decisionId,
      reviewComment: '',
      reviewStatus: '' as Outcome,
    } as ReviewDecisionPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        reviewDecisionMutation.mutate(value, {
          onSuccess: (res) => {
            if (res.status === 'error') {
              toast.error(t('common:errors.unknown'));
              return;
            }
            toast.success(t('common:success.save'));
            setOpen(false);
          },
          onError: () => {
            toast.error(t('common:errors.unknown'));
          },
        });
      }
    },
    validators: {
      onSubmit: reviewDecisionPayloadSchema,
    },
  });

  return (
    // Stop React synthetic events from bubbling through the portal to the parent AlertCard
    <form
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-sm p-md">
        <p className="text-grey-primary text-base font-semibold leading-[1.1]">
          {t('cases:case_detail.review_decision.title')}
        </p>
        <Modal.Description asChild>
          <p className="text-grey-primary text-s leading-[1.4]">{t('cases:case_detail.review_decision.description')}</p>
        </Modal.Description>

        <form.Field
          name="reviewStatus"
          validators={{
            onChange: reviewDecisionPayloadSchema.shape.reviewStatus,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-sm">
              {nonPendingReviewStatuses.map((reviewStatus) => {
                const isSelected = field.state.value === reviewStatus;

                return (
                  <div className="flex flex-col gap-2xs">
                    <label key={reviewStatus} className="flex cursor-pointer items-center gap-sm">
                      <input
                        type="radio"
                        name="reviewStatus"
                        value={reviewStatus}
                        checked={isSelected}
                        onChange={() => field.handleChange(reviewStatus)}
                        className={cn(
                          'size-4 shrink-0 appearance-none rounded-full border',
                          isSelected ? 'border-[5px] border-purple-primary' : 'border border-purple-primary bg-white',
                        )}
                      />
                      <ReviewStatusTag size="small" className="w-fit" reviewStatus={reviewStatus} />
                    </label>
                    {hasScreeningsUnconfirmed && reviewStatus === 'approve' ? (
                      <Callout icon="warning" iconColor="orange" color="orange" className="text-orange-primary text-xs">
                        {t('cases:case_detail.review_decision.warning_approve')}
                      </Callout>
                    ) : null}
                  </div>
                );
              })}
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="reviewComment"
          validators={{
            onChange: reviewDecisionPayloadSchema.shape.reviewComment,
          }}
        >
          {(field) => (
            <TextArea
              className="w-full"
              name={field.name}
              defaultValue={field.state.value}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
              placeholder={t('cases:case_detail.review_decision.comment.placeholder')}
            />
          )}
        </form.Field>
      </div>
      <Modal.Footer>
        <Modal.FooterButton isCloseButton label={t('cases:case_detail.review_decision.go_back')} />
        <Modal.FooterButton
          variant="primary"
          type="submit"
          label={t('common:validate')}
          disabled={reviewDecisionMutation.isPending}
        >
          <LoadingIcon icon="case-manager" className="size-5" loading={reviewDecisionMutation.isPending} />
        </Modal.FooterButton>
      </Modal.Footer>
    </form>
  );
}
