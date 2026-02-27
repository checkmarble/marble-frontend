import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { SCREENING_CATEGORIES, SCREENING_CATEGORY_COLORS } from '@app-builder/models/screening';
import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { createRiskAnnotationSchema, riskAnnotationFormSchema } from '@app-builder/schemas/annotations';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { GroupedAnnotations } from 'marble-api';
import { toggle } from 'radash';
import { useTranslation } from 'react-i18next';
import { isDeepEqual } from 'remeda';
import { Button, MenuCommand, Tag } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

type ClientRiskCategoriesEditSelectProps = {
  caseId?: string;
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations['risk_tags'];
  onAnnotateSuccess?: () => void;
};

export function ClientRiskCategoriesEditSelect({
  caseId,
  tableName,
  objectId,
  annotations,
  onAnnotateSuccess,
}: ClientRiskCategoriesEditSelectProps) {
  const { t } = useTranslation(['cases', 'common']);
  const createAnnotationMutation = useCreateAnnotationMutation();
  const categories = annotations.map((annotation) => annotation.payload.tag);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: 'risk_tag',
      payload: {
        categories,
      },
    } as z.infer<typeof riskAnnotationFormSchema>,
    validators: {
      onSubmit: riskAnnotationFormSchema,
      onChange: riskAnnotationFormSchema,
      onMount: riskAnnotationFormSchema,
    },
    onSubmit({ value }) {
      const addedCategories = value.payload.categories.filter((t) => !categories.includes(t));
      const removedAnnotations = annotations.filter((annotation) => {
        return !value.payload.categories.includes(annotation.payload.tag);
      });

      createAnnotationMutation
        .mutateAsync({
          tableName,
          objectId,
          caseId,
          type: 'risk_tag',
          payload: {
            addedCategories,
            removedAnnotations: removedAnnotations.map((annotation) => annotation.id),
          },
        } satisfies z.infer<typeof createRiskAnnotationSchema>)
        .then((result) => {
          revalidate();
          if (result.success) {
            onAnnotateSuccess?.();
          }
        });
    },
  });

  return (
    <form onSubmit={handleSubmit(form)}>
      <form.Field name="payload.categories">
        {(field) => (
          <MenuCommand.List>
            {SCREENING_CATEGORIES.map((cat) => (
              <MenuCommand.Item key={cat} value={cat} onSelect={() => field.handleChange((prev) => toggle(prev, cat))}>
                <Tag color={SCREENING_CATEGORY_COLORS[cat]}>{cat}</Tag>
                {field.state.value.includes(cat) ? <Icon icon="tick" className="text-purple-primary size-5" /> : null}
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <div className="text-center">{t('cases:case_detail.add_a_tag.empty')}</div>
            </MenuCommand.Empty>
          </MenuCommand.List>
        )}
      </form.Field>
      <form.Subscribe
        selector={(state) => [isDeepEqual(state.values.payload.categories, categories), state.isSubmitting]}
      >
        {([isDefaultValue, isSubmitting]) =>
          !isDefaultValue ? (
            <div className="border-grey-border flex justify-end gap-2 overflow-x-auto border-t p-2">
              <MenuCommand.HeadlessItem>
                {isSubmitting ? (
                  <Button mode="icon" type="submit" disabled>
                    <Icon icon="spinner" className="size-4 animate-spin" />
                  </Button>
                ) : (
                  <Button size="small" type="submit">
                    {t('common:confirm')}
                  </Button>
                )}
              </MenuCommand.HeadlessItem>
            </div>
          ) : null
        }
      </form.Subscribe>
    </form>
  );
}
