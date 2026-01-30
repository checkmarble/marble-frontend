import { Callout } from '@app-builder/components';
import { ReviewStatusTag } from '@app-builder/components/Decisions/ReviewStatusTag';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { ScreeningStatus } from '@app-builder/models/screening';
import {
  ReviewDecisionPayload,
  reviewDecisionPayloadSchema,
  useReviewDecisionMutation,
} from '@app-builder/queries/decisions/review-decision';
import { blockingReviewDocHref } from '@app-builder/services/documentation-href';
import { getFieldErrors } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, Modal, Select, TextArea } from 'ui-design-system';

type ReviewDecisionModalProps = {
  caseId: string;
  decisionId: string;
  screening: { status: ScreeningStatus } | undefined;
  trigger: React.ReactNode;
};

export function ReviewDecisionModal({ caseId, decisionId, screening, trigger }: ReviewDecisionModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{trigger}</Modal.Trigger>
      <Modal.Content>
        <ReviewDecisionContent caseId={caseId} setOpen={setOpen} decisionId={decisionId} screening={screening} />
      </Modal.Content>
    </Modal.Root>
  );
}

type ReviewDecisionContentProps = {
  caseId: string;
  decisionId: string;
  screening: { status: ScreeningStatus } | undefined;
  setOpen: (open: boolean) => void;
};

function ReviewDecisionContent({ caseId, decisionId, screening, setOpen }: ReviewDecisionContentProps) {
  const { t } = useTranslation(['common', 'cases']);
  const reviewDecisionMutation = useReviewDecisionMutation();
  const revalidate = useLoaderRevalidator();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      decisionId,
      reviewComment: '',
      reviewStatus: '' as Outcome,
    } as ReviewDecisionPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        reviewDecisionMutation.mutateAsync(value).then((res) => {
          if (res?.success) {
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['cases', 'list-decisions', caseId] });
          }
          revalidate();
        });
      }
    },
    validators: {
      onSubmit: reviewDecisionPayloadSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <Modal.Title>{t('cases:case_detail.review_decision.title')}</Modal.Title>
      <div className="flex flex-col gap-6 p-6">
        <Modal.Description asChild>
          <Callout variant="outlined">
            <p className="whitespace-pre-wrap">
              <Trans
                t={t}
                i18nKey="cases:case_detail.review_decision.callout"
                components={{
                  DocLink: <ExternalLink href={blockingReviewDocHref} />,
                }}
              />
            </p>
          </Callout>
        </Modal.Description>

        <form.Field
          name="reviewStatus"
          validators={{
            onBlur: reviewDecisionPayloadSchema.shape.reviewStatus,
            onChange: reviewDecisionPayloadSchema.shape.reviewStatus,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>{t('cases:case_detail.review_decision.review_status.label')}</FormLabel>
              <Select.Default
                className="h-10 w-full"
                defaultValue={field.state.value}
                onValueChange={(status) => field.handleChange(status as ReviewDecisionPayload['reviewStatus'])}
                placeholder={t('cases:case_detail.review_decision.review_status.placeholder')}
                //contentClassName="max-w-(--radix-select-trigger-width)"
              >
                {nonPendingReviewStatuses.map((reviewStatus) => {
                  const disabled = screening && screening.status !== 'no_hit';

                  return (
                    <Select.DefaultItem key={reviewStatus} value={reviewStatus}>
                      <div className="flex flex-col gap-2">
                        <ReviewStatusTag border="square" size="big" className="w-fit" reviewStatus={reviewStatus} />
                        {disabled && reviewStatus === 'approve' ? (
                          <span className="text-red-hover text-xs">
                            {t('cases:case_detail.review_decision.warning_approve')}
                          </span>
                        ) : null}
                      </div>
                    </Select.DefaultItem>
                  );
                })}
              </Select.Default>
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="reviewComment"
          validators={{
            onBlur: reviewDecisionPayloadSchema.shape.reviewComment,
            onChange: reviewDecisionPayloadSchema.shape.reviewComment,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>{t('cases:case_detail.review_decision.comment.label')}</FormLabel>
              <TextArea
                className="w-full"
                name={field.name}
                defaultValue={field.state.value}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                borderColor={field.state.meta.errors.length === 0 ? 'greyfigma-90' : 'redfigma-47'}
                placeholder={t('cases:case_detail.review_decision.comment.placeholder')}
              />
              <FormErrorOrDescription errors={getFieldErrors(field.state.meta.errors)} />
            </div>
          )}
        </form.Field>

        <div className="flex flex-1 flex-row gap-2">
          <Modal.Close asChild>
            <Button className="flex-1" variant="secondary">
              {t('common:cancel')}
            </Button>
          </Modal.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <LoadingIcon icon="case-manager" className="size-5" loading={reviewDecisionMutation.isPending} />
            {t('common:validate')}
          </Button>
        </div>
      </div>
    </form>
  );
}
