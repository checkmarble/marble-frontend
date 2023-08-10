import { Callout, decisionI18n, Outcome, Paper } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { fromParams } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button, Input } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { Form, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: [...decisionI18n, 'scenarios'] satisfies Namespace,
};

const formSchema = z
  .object({
    thresholds: z.tuple([z.coerce.number().int(), z.coerce.number().int()]),
  })
  .refine(
    ({ thresholds }) => {
      const [scoreReviewThreshold, scoreRejectThreshold] = thresholds;
      return scoreRejectThreshold >= scoreReviewThreshold;
    },
    {
      message: 'Reject threshold must be greater than review threshold',
      path: ['thresholds'],
    }
  );

export async function action({ request, params }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  console.log("decision")
  const parsedForm = await parseFormSafe(request, formSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }

  try {
    const iterationId = fromParams(params, 'iterationId');
    const [scoreReviewThreshold, scoreRejectThreshold] =
      parsedForm.data.thresholds;
    await apiClient.updateScenarioIteration(iterationId, {
      body: { scoreRejectThreshold, scoreReviewThreshold },
    });

    return json({
      success: true as const,
      error: null,
      values: parsedForm.data,
    });
  } catch (error) {
    const { getSession, commitSession } = serverServices.sessionService;
    const session = await getSession(request);

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
  const {
   scoreRejectThreshold, scoreReviewThreshold
  } = useCurrentScenarioIteration();
  const submit = useSubmit();

  const {
    control,
    register,
    formState: { errors },
  } = useForm<z.infer<typeof formSchema>>({
    progressive: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      thresholds: [scoreReviewThreshold, scoreRejectThreshold],
    },
  });

  return (
    <Paper.Container>
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:decision.score_based.title')}</Paper.Title>
        <Callout>{t('scenarios:decision.score_based.callout')}</Callout>
      </div>

      <Form
        className="grid grid-cols-[repeat(2,max-content)] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4"
        control={control}
        onSubmit={({ formData }) => {
          submit(formData, { method: 'POST' });
        }}
      >
        <Outcome border="square" size="big" outcome="approve" />
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.approve_condition')}
          <Input
            {...register('thresholds.0')}
            type="number"
            className="relative w-fit"
          />
        </div>

        <Outcome border="square" size="big" outcome="review" />
        {t('scenarios:decision.score_based.review_condition')}

        <Outcome border="square" size="big" outcome="decline" />
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.decline_condition')}
          <Input
            className="relative w-fit"
            {...register('thresholds.1')}
            type="number"
          />
        </div>
        <Button type="submit">Submit</Button>
        {errors.thresholds?.message && (
          <div className="bg-grey-00 text-s text-red-100">
            {errors.thresholds?.message}
          </div>
        )}
      </Form>
    </Paper.Container>
  );
}
