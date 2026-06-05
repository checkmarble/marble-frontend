import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { useGetAnnotationsQuery } from '@app-builder/queries/data/get-annotations';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useQueryClient } from '@tanstack/react-query';
import { type GroupedAnnotations } from 'marble-api';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { TagList } from 'ui-design-system';

type ClientObjectTagListProps = {
  caseId?: string;
  tableName: string;
  objectId: string;
  annotations?: GroupedAnnotations['tags'];
  placeholder?: string;
};

export function ClientObjectTagList({
  caseId,
  tableName,
  objectId,
  annotations,
  placeholder,
}: ClientObjectTagListProps) {
  const { t } = useTranslation(['common']);
  const queryClient = useQueryClient();
  const { orgObjectTags } = useOrganizationObjectTags();
  const createAnnotationMutation = useCreateAnnotationMutation();

  const internalQuery = useGetAnnotationsQuery(tableName, objectId);
  const tagAnnotations = annotations ?? internalQuery.data?.annotations.tags ?? [];
  const serverTagIds = tagAnnotations.map((a) => a.payload.tag_id);

  const [pendingTagIds, setPendingTagIds] = useState<string[] | null>(null);
  const displayedTagIds = pendingTagIds ?? serverTagIds;

  const handleChange = (next: string[]) => {
    const previous = pendingTagIds ?? serverTagIds;
    const addedTags = next.filter((id) => !previous.includes(id));
    const removedAnnotations = tagAnnotations.filter((a) => !next.includes(a.payload.tag_id)).map((a) => a.id);

    if (addedTags.length === 0 && removedAnnotations.length === 0) return;

    setPendingTagIds(next);

    createAnnotationMutation
      .mutateAsync({
        tableName,
        objectId,
        caseId,
        type: 'tag',
        payload: { addedTags, removedAnnotations },
      })
      .then(async (result) => {
        if (!result.success) {
          toast.error(t('common:errors.unknown'));
          setPendingTagIds(null);
          return;
        }
        await queryClient.invalidateQueries({ queryKey: ['annotations', tableName, objectId] });
        setPendingTagIds(null);
      })
      .catch(() => {
        toast.error(t('common:errors.unknown'));
        setPendingTagIds(null);
      });
  };

  return (
    <TagList
      editable
      tags={orgObjectTags}
      value={displayedTagIds}
      onChange={handleChange}
      placeholder={placeholder ?? 'Add a tag'}
    />
  );
}
