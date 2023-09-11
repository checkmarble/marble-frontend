import { Paper } from '@app-builder/components';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@app-builder/components/Form';
import { type ScenarioIterationRule } from '@app-builder/models/scenario';
import { serverServices } from '@app-builder/services/init.server';
import { parseFormSafe } from '@app-builder/utils/input-validation';
import { getRoute } from '@app-builder/utils/routes';
import { fromParams, fromUUID } from '@app-builder/utils/short-uuid';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ActionArgs, json, redirect } from '@remix-run/node';
import { useFetcher } from '@remix-run/react';
import { Button, Input } from '@ui-design-system';
import { type Namespace } from 'i18next';
import { Form, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

export const handle = {
  i18n: ['scenarios', 'navigation', 'common'] satisfies Namespace,
};

const editRuleFormSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  scoreModifier: z.coerce.number().int().min(-1000).max(1000),
});

export async function action({ request, params }: ActionArgs) {
  const { authService } = serverServices;
  const { apiClient } = await authService.isAuthenticated(request, {
    failureRedirect: '/login',
  });
  const scenarioId = fromParams(params, 'scenarioId');
  const iterationId = fromParams(params, 'iterationId');

  const parsedForm = await parseFormSafe(request, editRuleFormSchema);
  if (!parsedForm.success) {
    parsedForm.error.flatten((issue) => issue);

    return json({
      success: false as const,
      values: parsedForm.formData,
      error: parsedForm.error.format(),
    });
  }
  const { name, description, scoreModifier } = parsedForm.data;
  const ruleId = fromParams(params, 'ruleId');
  try {
    const { rule } = await apiClient.updateScenarioIterationRule(ruleId, {
      name: name,
      description: description,
      scoreModifier: scoreModifier,
    });

    return redirect(
      getRoute('/scenarios/:scenarioId/i/:iterationId/edit/rules/:ruleId', {
        scenarioId: fromUUID(scenarioId),
        iterationId: fromUUID(iterationId),
        ruleId: fromUUID(rule.id),
      })
    );
  } catch (error) {
    return json({
      success: false as const,
      values: parsedForm.data,
      error: error,
    });
  }
}

export function EditRule({
  rule,
  scenarioId,
  iterationId,
}: {
  rule: Pick<
    ScenarioIterationRule,
    'id' | 'name' | 'description' | 'scoreModifier'
  >;
  scenarioId: string;
  iterationId: string;
}) {
  const { t } = useTranslation(handle.i18n);
  const fetcher = useFetcher<typeof action>();

  const formMethods = useForm<z.infer<typeof editRuleFormSchema>>({
    progressive: true,
    resolver: zodResolver(editRuleFormSchema),
    defaultValues: {
      name: rule.name,
      description: rule.description,
      scoreModifier: rule.scoreModifier,
    },
  });
  const { control } = formMethods;

  return (
    <Paper.Container>
      <div className="flex flex-col gap-2 lg:gap-4">
        <Paper.Title>{t('scenarios:edit_rule.title')}</Paper.Title>
      </div>
      <Form
        className="flex flex-col gap-2 lg:gap-4"
        control={control}
        onSubmit={({ formData }) => {
          fetcher.submit(formData, {
            method: 'POST',
            action: `/ressources/scenarios/${fromUUID(scenarioId)}/${fromUUID(
              iterationId
            )}/rules/${fromUUID(rule.id)}/edit`,
          });
        }}
      >
        <FormProvider {...formMethods}>
          <FormField
            name="name"
            control={control}
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('common:name')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t('scenarios:edit_rule.name_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            name="description"
            control={control}
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('common:description')}</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder={t(
                      'scenarios:edit_rule.description_placeholder'
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <FormField
            name="scoreModifier"
            control={control}
            render={({ field, fieldState }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel>{t('scenarios:create_rule.score')}</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={t('scenarios:edit_rule.score_placeholder')}
                    {...field}
                  />
                </FormControl>
                <FormMessage>{fieldState.error?.message}</FormMessage>
              </FormItem>
            )}
          />
          <div className="flex flex-row justify-end">
            <Button type="submit">{t('common:save')}</Button>
          </div>
        </FormProvider>
      </Form>
    </Paper.Container>
  );
}
