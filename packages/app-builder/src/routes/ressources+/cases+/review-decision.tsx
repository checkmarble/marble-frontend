import { Callout } from '@app-builder/components';
import { ReviewStatusTag } from '@app-builder/components/Decisions/ReviewStatusTag';
import { ExternalLink } from '@app-builder/components/ExternalLink';
import { FormErrorOrDescription } from '@app-builder/components/Form/FormErrorOrDescription';
import { FormField } from '@app-builder/components/Form/FormField';
import { FormLabel } from '@app-builder/components/Form/FormLabel';
import { FormSelect } from '@app-builder/components/Form/FormSelect';
import { FormTextArea } from '@app-builder/components/Form/FormTextArea';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { LoadingIcon } from '@app-builder/components/Spinner';
import { nonPendingReviewStatuses } from '@app-builder/models/decision';
import { type SanctionCheck } from '@app-builder/models/sanction-check';
import { blockingReviewDocHref } from '@app-builder/services/documentation-href';
import { serverServices } from '@app-builder/services/init.server';
import { getRoute } from '@app-builder/utils/routes';
import type * as Ariakit from '@ariakit/react';
import {
  FormProvider,
  getFormProps,
  getInputProps,
  useForm,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { type ActionFunctionArgs, json } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import * as React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Button, ModalV2 } from 'ui-design-system';
import { z } from 'zod';

const reviewDecisionSchema = z.object({
  decisionId: z.string(),
  reviewComment: z.string(),
  reviewStatus: z.enum(nonPendingReviewStatuses),
});

export async function action({ request }: ActionFunctionArgs) {
  const {
    authService,
    i18nextService: { getFixedT },
    toastSessionService: { getSession, commitSession },
  } = serverServices;
  const { cases } = await authService.isAuthenticated(request, {
    failureRedirect: getRoute('/sign-in'),
  });

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: reviewDecisionSchema,
  });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  try {
    await cases.reviewDecision(submission.value);

    return json(submission.reply());
  } catch (error) {
    const session = await getSession(request);
    const t = await getFixedT(request, ['common', 'cases']);

    const message = t('common:errors.unknown');

    setToastMessage(session, {
      type: 'error',
      message,
    });

    return json(submission.reply({ formErrors: [message] }), {
      headers: { 'Set-Cookie': await commitSession(session) },
    });
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
  console.log(sanctionCheck);
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
  React.useEffect(() => {
    if (fetcher?.data?.status === 'success') {
      setOpen(false);
    }
  }, [setOpen, fetcher?.data?.status]);

  const [form, fields] = useForm({
    shouldRevalidate: 'onInput',
    defaultValue: {
      decisionId,
    },
    lastResult: fetcher.data,
    constraint: getZodConstraint(reviewDecisionSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: reviewDecisionSchema,
      });
    },
  });

  return (
    <FormProvider context={form.context}>
      <fetcher.Form
        method="post"
        action={getRoute('/ressources/cases/review-decision')}
        {...getFormProps(form)}
      >
        <ModalV2.Title>
          {t('cases:case_detail.review_decision.title')}
        </ModalV2.Title>
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

          <input
            {...getInputProps(fields.decisionId, {
              type: 'hidden',
            })}
          />

          <FormField
            name={fields.reviewStatus.name}
            className="flex flex-col gap-2"
          >
            <FormLabel>
              {t('cases:case_detail.review_decision.review_status.label')}
            </FormLabel>
            <FormSelect.Default
              className="h-10 w-full"
              options={nonPendingReviewStatuses}
              placeholder={t(
                'cases:case_detail.review_decision.review_status.placeholder',
              )}
              contentClassName="max-w-[var(--radix-select-trigger-width)]"
            >
              {nonPendingReviewStatuses.map((reviewStatus) => {
                const disabled =
                  sanctionCheck && sanctionCheck.status === 'in_review';

                return disabled && reviewStatus === 'approve' ? (
                  <div className="flex flex-col items-start gap-2 p-1">
                    <ReviewStatusTag
                      key={reviewStatus}
                      disabled
                      border="square"
                      size="big"
                      reviewStatus={reviewStatus}
                    />
                    <span className="text-grey-50 text-xs">
                      {t('cases:case_detail.review_decision.disabled_approve')}
                    </span>
                  </div>
                ) : (
                  <FormSelect.DefaultItem
                    key={reviewStatus}
                    value={reviewStatus}
                  >
                    <ReviewStatusTag
                      border="square"
                      size="big"
                      reviewStatus={reviewStatus}
                    />
                  </FormSelect.DefaultItem>
                );
              })}
            </FormSelect.Default>
            <FormErrorOrDescription />
          </FormField>

          <FormField
            name={fields.reviewComment.name}
            className="flex flex-col gap-2"
          >
            <FormLabel>
              {t('cases:case_detail.review_decision.comment.label')}
            </FormLabel>
            <FormTextArea
              className="w-full"
              placeholder={t(
                'cases:case_detail.review_decision.comment.placeholder',
              )}
            />
            <FormErrorOrDescription />
          </FormField>

          <div className="flex flex-1 flex-row gap-2">
            <ModalV2.Close
              render={<Button className="flex-1" variant="secondary" />}
            >
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
      </fetcher.Form>
    </FormProvider>
  );
}
