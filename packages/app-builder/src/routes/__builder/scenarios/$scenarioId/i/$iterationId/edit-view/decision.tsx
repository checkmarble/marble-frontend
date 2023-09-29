import { Callout, decisionI18n, Outcome, Paper } from '@app-builder/components';
import { setToastMessage } from '@app-builder/components/MarbleToaster';
import { useEditorMode } from '@app-builder/services/editor';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { fromParams } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json } from '@remix-run/node';
import { useSubmit } from '@remix-run/react';
import { Button, Input, Tag } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { Form, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as z from 'zod';

import { useCurrentScenarioIteration } from '../../$iterationId';

export const handle = {
  i18n: [...decisionI18n, 'scenarios', 'common'] satisfies Namespace,
};

const formSchema = z
  .object({
    thresholds: z.object({
      scoreReviewThreshold: z.coerce.number().int(),
      scoreRejectThreshold: z.coerce.number().int(),
    }),
  })
  .refine(
    ({ thresholds: { scoreReviewThreshold, scoreRejectThreshold } }) => {
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
  const parsedForm = await parseFormSafe(request, formSchema);
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

  return (
    <Paper.Container className="max-w-3xl">
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:decision.score_based.title')}</Paper.Title>
        <Callout>{t('scenarios:decision.score_based.callout')}</Callout>
      </div>

      {editorMode === 'view' ? (
        <DecisionViewer
          scoreReviewThreshold={scoreReviewThreshold}
          scoreRejectThreshold={scoreRejectThreshold}
        />
      ) : (
        <DecisionEditor
          scoreReviewThreshold={scoreReviewThreshold}
          scoreRejectThreshold={scoreRejectThreshold}
        />
      )}
    </Paper.Container>
  );
}

function DecisionViewer({
  scoreReviewThreshold,
  scoreRejectThreshold,
}: {
  scoreReviewThreshold?: number;
  scoreRejectThreshold?: number;
}) {
  const { t } = useTranslation(handle.i18n);
  return (
    <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
      <Outcome border="square" size="big" outcome="approve" />
      <div className="flex flex-row items-center gap-1 lg:gap-2">
        {t('scenarios:decision.score_based.approve_condition')}
        <Tag border="square" size="big" color="grey">
          {scoreReviewThreshold}
        </Tag>
      </div>

      <Outcome border="square" size="big" outcome="review" />
      {t('scenarios:decision.score_based.review_condition')}

      <Outcome border="square" size="big" outcome="decline" />
      <div className="flex flex-row items-center gap-1 lg:gap-2">
        {t('scenarios:decision.score_based.decline_condition')}
        <Tag border="square" size="big" color="grey">
          {scoreRejectThreshold}
        </Tag>
      </div>
    </div>
  );
}

function DecisionEditor({
  scoreReviewThreshold,
  scoreRejectThreshold,
}: {
  scoreReviewThreshold?: number;
  scoreRejectThreshold?: number;
}) {
  const { t } = useTranslation(handle.i18n);
  const submit = useSubmit();
  const {
    control,
    register,
    formState: { errors, isValid },
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      thresholds: {
        scoreReviewThreshold,
        scoreRejectThreshold,
      },
    },
  });

  return (
    <Form
      control={control}
      onSubmit={({ formData }) => {
        submit(formData, { method: 'POST' });
      }}
    >
      <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-x-1 gap-y-2 lg:gap-x-2 lg:gap-y-4">
        <Outcome border="square" size="big" outcome="approve" />
        <div className="flex flex-row items-center gap-1 lg:gap-2">
          {t('scenarios:decision.score_based.approve_condition')}
          <Input
            {...register('thresholds.scoreReviewThreshold')}
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
            {...register('thresholds.scoreRejectThreshold')}
            type="number"
          />
        </div>
      </div>
      <div className="flex flex-row-reverse items-center justify-between">
        <Button type="submit">{t('common:save')}</Button>
        {!isValid && (
          <div className="bg-grey-00 text-s text-red-100">
            {errors?.thresholds?.root?.message}
          </div>
        )}
      </div>
    </Form>
  );
}
