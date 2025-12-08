import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { createTagAnnotationSchema, tagAnnotationFormSchema } from '@app-builder/schemas/annotations';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { handleSubmit } from '@app-builder/utils/form';
import { useForm } from '@tanstack/react-form';
import { type GroupedAnnotations } from 'marble-api';
import { toggle } from 'radash';
import { useTranslation } from 'react-i18next';
import { isDeepEqual } from 'remeda';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { z } from 'zod/v4';

type ClientTagsEditSelectProps = {
  caseId: string;
  tableName: string;
  objectId: string;
  annotations: GroupedAnnotations['tags'];
  onAnnotateSuccess?: () => void;
};

export function ClientTagsEditSelect({
  caseId,
  tableName,
  objectId,
  annotations,
  onAnnotateSuccess,
}: ClientTagsEditSelectProps) {
  const { t } = useTranslation(['cases', 'common']);
  const { orgObjectTags } = useOrganizationObjectTags();
  const createAnnotationMutation = useCreateAnnotationMutation();
  const tags = annotations.map((annotation) => annotation.payload.tag_id);
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    defaultValues: {
      caseId,
      tableName,
      objectId,
      type: 'tag',
      payload: {
        tags,
      },
    } as z.infer<typeof tagAnnotationFormSchema>,
    validators: {
      onSubmit: tagAnnotationFormSchema,
    },
    onSubmit({ value }) {
      const addedTags = value.payload.tags.filter((t) => !tags.includes(t));
      const removedAnnotations = annotations.filter((annotation) => {
        return !value.payload.tags.includes(annotation.payload.tag_id);
      });

      createAnnotationMutation
        .mutateAsync({
          tableName,
          objectId,
          caseId,
          type: 'tag',
          payload: {
            addedTags,
            removedAnnotations: removedAnnotations.map((annotation) => annotation.id),
          },
        } satisfies z.infer<typeof createTagAnnotationSchema>)
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
      <form.Field
        name="payload.tags"
        validators={{
          onChange: tagAnnotationFormSchema._def.right.shape.payload.shape.tags,
          onBlur: tagAnnotationFormSchema._def.right.shape.payload.shape.tags,
        }}
      >
        {(field) => (
          <MenuCommand.List>
            {orgObjectTags.map((tag) => (
              <MenuCommand.Item
                key={tag.id}
                value={tag.id}
                onSelect={() => field.handleChange((prev) => toggle(prev, tag.id))}
              >
                <TagPreview name={tag.name} />
                {field.state.value.includes(tag.id) ? <Icon icon="tick" className="text-purple-65 size-5" /> : null}
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <div className="text-center">{t('cases:case_detail.add_a_tag.empty')}</div>
            </MenuCommand.Empty>
          </MenuCommand.List>
        )}
      </form.Field>
      <form.Subscribe selector={(state) => [isDeepEqual(state.values.payload.tags, tags), state.isSubmitting]}>
        {([isDefaultValue, isSubmitting]) =>
          !isDefaultValue ? (
            <div className="border-grey-90 flex justify-end gap-2 overflow-x-auto border-t p-2">
              <MenuCommand.HeadlessItem>
                {isSubmitting ? (
                  <Button size="icon" type="submit" disabled>
                    <Icon icon="spinner" className="size-4 animate-spin" />
                  </Button>
                ) : (
                  <Button size="small" type="submit">
                    Confirm
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
