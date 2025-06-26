import { Callout } from '@app-builder/components';
import { ReviewStatusTag } from '@app-builder/components/Decisions/ReviewStatusTag';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/Tanstack/FormErrorOrDescription';
import { FormLabel } from '@app-builder/components/Form/Tanstack/FormLabel';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { type Outcome } from '@app-builder/models/outcome';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { blockingReviewDocHref } from '@app-builder/services/documentation-href';
import { initServerServices } from '@app-builder/services/init.server';
import { getFieldErrors } from '@app-builder/utils/form';
import { getRoute } from '@app-builder/utils/routes';
import type * as Ariakit from '@ariakit/react';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { useForm } from '@tanstack/react-form';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2, Select, TextArea } from 'ui-design-system';
import { z } from 'zod';

const reviewDecisionSchema = z.object({
  decisionId: z.string(),
  reviewComment: z.string(),
  reviewStatus: z.enum(nonPendingReviewStatuses),
});

type ReviewDecisionForm = z.infer<typeof reviewDecisionSchema>;

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

  const { data, success, error } = reviewDecisionSchema.safeParse(rawData);

  if (!success) {
    return json(
      { status: 'error', errors: error.flatten() },
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
  sanctionCheck,
  store,
}: {
  decisionId: string;
  sanctionCheck: SanctionCheck | undefined;
  store: Ariakit.DialogStore;
}) {
  return (
    <ModalV2.Content store={store}>
      <ReviewDecisionContent
        setOpen={store.setOpen}
        decisionId={decisionId}
        sanctionCheck={sanctionCheck}
      />
    </ModalV2.Content>
  );
}

function ReviewDecisionContent({
  decisionId,
  sanctionCheck,
  setOpen,
}: {
  decisionId: string;
  sanctionCheck: SanctionCheck | undefined;
  setOpen: (open: boolean) => void;
}) {
  const { t } = useTranslation(['common', 'cases']);
  const fetcher = useFetcher<typeof action>();

  useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const form = useForm({
    defaultValues: {
      decisionId,
      reviewComment: '',
      reviewStatus: '' as Outcome,
    } as ReviewDecisionForm,
    onSubmit: ({ value, formApi }) => {
      if (formApi.state.isValid) {
        fetcher.submit(value, {
          method: 'POST',
          action: getRoute('/ressources/cases/review-decision'),
          encType: 'application/json',
        });
      }
    },
    validators: {
      onSubmit: reviewDecisionSchema,
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
      <ModalV2.Title>{t('cases:case_detail.review_decision.title')}</ModalV2.Title>
      <div className="flex flex-col gap-6 p-6">
        <ModalV2.Description render={<Callout variant="outlined" />}>
          <p className="whitespace-pre text-wrap">
            <Trans
              t={t}
              i18nKey="cases:case_detail.review_decision.callout"
              components={{
                DocLink: <ExternalLink href={blockingReviewDocHref} />,
              }}
            />
          </p>
        </ModalV2.Description>

        <form.Field
          name="reviewStatus"
          validators={{
            onBlur: reviewDecisionSchema.shape.reviewStatus,
            onChange: reviewDecisionSchema.shape.reviewStatus,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>
                {t('cases:case_detail.review_decision.review_status.label')}
              </FormLabel>
              <Select.Default
                className="h-10 w-full"
                defaultValue={field.state.value}
                onValueChange={(status) =>
                  field.handleChange(status as ReviewDecisionForm['reviewStatus'])
                }
                placeholder={t('cases:case_detail.review_decision.review_status.placeholder')}
                //contentClassName="max-w-[var(--radix-select-trigger-width)]"
              >
                {nonPendingReviewStatuses.map((reviewStatus) => {
                  const disabled = sanctionCheck && sanctionCheck.status !== 'no_hit';

                  return (
                    <Select.DefaultItem key={reviewStatus} value={reviewStatus}>
                      <div className="flex flex-col gap-2">
                        <ReviewStatusTag
                          border="square"
                          size="big"
                          className="w-fit"
                          reviewStatus={reviewStatus}
                        />
                        {disabled && reviewStatus === 'approve' ? (
                          <span className="text-red-43 text-xs">
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
            onBlur: reviewDecisionSchema.shape.reviewComment,
            onChange: reviewDecisionSchema.shape.reviewComment,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-2">
              <FormLabel name={field.name}>
                {t('cases:case_detail.review_decision.comment.label')}
              </FormLabel>
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
          <ModalV2.Close render={<Button className="flex-1" variant="secondary" />}>
            {t('common:cancel')}
          </ModalV2.Close>
          <Button className="flex-1" variant="primary" type="submit">
            <LoadingIcon
              icon="case-manager"
              className="size-5"
              loading={fetcher.state === 'submitting'}
            />
            {t('cases:case_detail.review_decision')}
          </Button>
        </div>
      </div>
    </form>
  );
}
