import { ReviewStatusTag } from '@app-builder/components/Decisions/ReviewStatusTag';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { ScreeningStatus } from '@app-builder/models/screening';
import {
  type ReviewDecisionPayload,
  reviewDecisionPayloadSchema,
  useReviewDecisionMutation,
} from '@app-builder/queries/cases/review-decision';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, cn, Modal, TextArea } from 'ui-design-system';
import { z } from 'zod/v4';

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = initServerServices(request);

  const [t, session, rawData, { cases }] = await Promise.all([
    getFixedT(request, ['common']),
    getSession(request),
    request.json(),
    authService.isAuthenticated(request, {
      failureRedirect: getRoute('/sign-in'),
    }),
  ]);

  const { data, success, error } = reviewDecisionPayloadSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: z.treeifyError(error) },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }

  try {
    await cases.reviewDecision(data);

    setToastMessage(session, {
      type: 'success',
      message: t('common:success.save'),
    });

    return json(
      { status: 'success', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  } catch (_error) {
    setToastMessage(session, {
      type: 'error',
      message: t('common:errors.unknown'),
    });

    return json(
      { status: 'error', errors: [] },
      {
        headers: { 'Set-Cookie': await commitSession(session) },
      },
    );
  }
}

export function ReviewDecisionModal({
  decisionId,
  screening,
  children,
}: {
  children: React.ReactElement;
  decisionId: string;
  screening: { status: ScreeningStatus } | undefined;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>{children}</Modal.Trigger>
      <Modal.Content>
        <ReviewDecisionContent setOpen={setOpen} decisionId={decisionId} screening={screening} />
      </Modal.Content>
    </Modal.Root>
  );
}

function ReviewDecisionContent({
  decisionId,
  screening,
  setOpen,
}: {
  decisionId: string;
  screening: { status: ScreeningStatus } | undefined;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const reviewDecisionMutation = useReviewDecisionMutation();

  const form = useForm({
    defaultValues: {
      decisionId,
      reviewComment: '',
      reviewStatus: '' as Outcome,
    } as ReviewDecisionPayload,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        reviewDecisionMutation.mutate(value, {
          onSuccess: () => setOpen(false),
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
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
    >
      <div className="flex flex-col gap-2 p-4">
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
            <div className="flex flex-col gap-2">
              {nonPendingReviewStatuses.map((reviewStatus) => {
                const isSelected = field.state.value === reviewStatus;
                const hasScreeningWarning = screening && screening.status !== 'no_hit' && reviewStatus === 'approve';

                return (
                  <label key={reviewStatus} className="flex cursor-pointer items-center gap-2">
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
                    <div className="flex flex-col gap-0.5">
                      <ReviewStatusTag size="small" className="w-fit" reviewStatus={reviewStatus} />
                      {hasScreeningWarning ? (
                        <span className="text-red-hover text-xs">
                          {t('cases:case_detail.review_decision.warning_approve')}
                        </span>
                      ) : null}
                    </div>
                  </label>
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
        <Modal.Close asChild>
          <Button variant="secondary" appearance="stroked">
            {t('cases:case_detail.review_decision.go_back')}
          </Button>
        </Modal.Close>
        <Button variant="primary" type="submit">
          <LoadingIcon icon="case-manager" className="size-5" loading={reviewDecisionMutation.isPending} />
          {t('common:validate')}
        </Button>
      </Modal.Footer>
    </form>
  );
}
