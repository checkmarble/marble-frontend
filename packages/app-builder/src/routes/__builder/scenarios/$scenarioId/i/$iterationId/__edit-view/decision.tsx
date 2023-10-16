import {
  Callout,
  decisionsI18n,
  Outcome,
  Paper,
  scenarioI18n,
} from '@app-builder/components';
import {
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
} from '@app-builder/components/Form';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import {
  useCurrentScenarioIteration,
  useEditorMode,
} from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { fromParams } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button, Input } from '@ui-design-system';
import { type Namespace, type TFunction } from 'i18next';
import { useEffect } from 'react';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import * as z from 'zod';

export const handle = {
  i18n: [...decisionsI18n, ...scenarioI18n, 'common'] satisfies Namespace,
};

function getFormSchema(t: TFunction<typeof handle.i18n>) {
  return z
    .object({
      thresholds: z.object({
        scoreReviewThreshold: z.coerce
          .number({
            required_error: t(
              'scenarios:validation.decision.score_review_threshold_required'
            ),
          })
          .int(),
        scoreRejectThreshold: z.coerce
          .number({
            required_error: t(
              'scenarios:validation.decision.score_reject_threshold_required'
            ),
          })
          .int(),
      }),
    })
    .refine(
      ({ thresholds: { scoreReviewThreshold, scoreRejectThreshold } }) => {
        return scoreRejectThreshold >= scoreReviewThreshold;
      },
      {
        message: t(
          'scenarios:validation.decision.score_reject_review_thresholds_missmatch'
        ),
        path: ['thresholds'],
      }
    );
}

export async function action({ request, params }: ActionArgs) {
  const { authService, i18nextService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const t = await i18nextService.getFixedT(request, 'scenarios');
  const parsedForm = await parseFormSafe(request, getFormSchema(t));
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { getSession, commitSession } = serverServices.sessionService;
  const session = await getSession(request);

  try {
    const iterationId = fromParams(params, 'iterationId');
    const { thresholds } = parsedForm.data;
    await apiClient.updateScenarioIteration(iterationId, {
      body: thresholds,
    });

    setToastMessage(session, {
      type: 'success',
      messageKey: 'common:success.save',
    });

    return json(
      {
        success: true as const,
        error: null,
        values: parsedForm.data,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  } catch (error) {
    setToastMessage(session, {
      type: 'error',
      messageKey: 'common:errors.unknown',
    });

    return json(
      {
        success: false as const,
        error: null,
        values: parsedForm.data,
      },
      { headers: { 'Set-Cookie': await commitSession(session) } }
    );
  }
}

export default function Decision() {
  const { t } = useTranslation(handle.i18n);
  const { scoreRejectThreshold, scoreReviewThreshold } =
    useCurrentScenarioIteration();

  const editorMode = useEditorMode();

  const submit = useSubmit();
  const formMethods = useForm<z.infer<ReturnType<typeof getFormSchema>>>({
    resolver: zodResolver(getFormSchema(t)),
    defaultValues: {
      thresholds: {
        scoreReviewThreshold,
        scoreRejectThreshold,
      },
    },
  });
  const { control, trigger, watch } = formMethods;

  useEffect(() => {
    void trigger();
  }, [trigger]);

  const disabled = editorMode === 'view';

  return (
    <Paper.Container className="max-w-3xl">
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:decision.score_based.title')}</Paper.Title>
        <Callout>{t('scenarios:decision.score_based.callout')}</Callout>
      </div>

      <Form
        control={control}
        onSubmit={({ formData }) => {
          submit(formData, { method: 'POST' });
        }}
        className="flex flex-col gap-2"
      >
        <FormProvider {...formMethods}>
          <div className="grid grid-cols-[min-content_auto] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
            <Outcome border="square" size="big" outcome="approve" />
            <FormField
              control={control}
              name="thresholds.scoreReviewThreshold"
              disabled={disabled}
              render={({ field }) => (
                <FormItem className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
                  <FormLabel className="sr-only">
                    {t('scenarios:decision.score_based.score_review_threshold')}
                  </FormLabel>
                  <FormControl>
                    <Trans
                      t={t}
                      i18nKey="scenarios:decision.score_based.approve_condition"
                      components={{
                        ReviewThreshold: (
                          <Input
                            type="number"
                            className="relative w-fit"
                            {...field}
                          />
                        ),
                      }}
                      shouldUnescape
                    />
                  </FormControl>
                  <FormError className={style.errorMessage} />
                </FormItem>
              )}
            />

            <Outcome border="square" size="big" outcome="review" />
            {t('scenarios:decision.score_based.review_condition', {
              replace: {
                reviewThreshold: watch('thresholds.scoreReviewThreshold'),
                rejectThreshold: watch('thresholds.scoreRejectThreshold'),
              },
            })}

            <Outcome border="square" size="big" outcome="decline" />
            <FormField
              control={control}
              name="thresholds.scoreRejectThreshold"
              disabled={disabled}
              render={({ field }) => (
                <FormItem className="flex flex-row flex-wrap items-center gap-1 lg:gap-2">
                  <FormLabel className="sr-only">
                    {t('scenarios:decision.score_based.score_reject_threshold')}
                  </FormLabel>
                  <FormControl>
                    <Trans
                      t={t}
                      i18nKey="scenarios:decision.score_based.decline_condition"
                      components={{
                        RejectThreshold: (
                          <Input
                            type="number"
                            className="relative w-fit"
                            {...field}
                          />
                        ),
                      }}
                    />
                  </FormControl>
                  <FormError className={style.errorMessage} />
                </FormItem>
              )}
            />
          </div>
          <div className="flex flex-row items-center justify-between">
            <span>
              <FormField
                control={control}
                name="thresholds"
                disabled={disabled}
                render={() => <FormError className={style.errorMessage} />}
              />
            </span>
            <span>
              {editorMode === 'edit' && (
                <Button type="submit">{t('common:save')}</Button>
              )}
            </span>
          </div>
        </FormProvider>
      </Form>
    </Paper.Container>
  );
}

const style = {
  errorMessage:
    'bg-red-05 rounded px-2 py-1 h-8 flex items-center justify-center',
} as const;
