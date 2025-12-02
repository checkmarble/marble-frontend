import { TagSelector } from '@app-builder/components/Tags/TagSelector';
import { useLoaderRevalidator } from '@app-builder/contexts/LoaderRevalidatorContext';
import { editTagsPayloadSchema, useEditTagsMutation } from '@app-builder/queries/cases/edit-tags';
import { useForm, useStore } from '@tanstack/react-form';
import { isDeepEqual } from 'remeda';

export const EditCaseTags = ({ id, tagIds }: { id: string; tagIds: string[] }) => {
  const editTagsMutation = useEditTagsMutation();
  const revalidate = useLoaderRevalidator();

  const form = useForm({
    onSubmit: ({ value }) => {
      editTagsMutation.mutateAsync(value).then(() => {
        revalidate();
      });
    },
    defaultValues: {
      caseId: id,
      tagIds,
    },
    validators: {
      onSubmit: editTagsPayloadSchema,
    },
  });

  const selectedTagIds = useStore(form.store, (state) => state.values.tagIds);

  const handleSelectedTagIdsChange = (newTagIds: string[]) => {
    form.setFieldValue('tagIds', newTagIds);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && form.state.isDirty && !isDeepEqual(form.options.defaultValues, form.state.values)) {
      form.handleSubmit();
    }
  };

  return (
    <TagSelector
      selectedTagIds={selectedTagIds}
      onSelectedTagIdsChange={handleSelectedTagIdsChange}
      onOpenChange={handleOpenChange}
    />
  );
};
