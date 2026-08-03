import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { useCreateAnnotationMutation } from '@app-builder/queries/annotations/create-annotation';
import { useOrganizationObjectTags } from '@app-builder/services/organization/organization-object-tags';
import { useQueryClient } from '@tanstack/react-query';
import { type GroupedAnnotations } from 'marble-api';
import { toggle } from 'radash';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Button, cn, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';
import { parsePersonBulkKey, useCustomerGraph } from './CustomerGraphContext';

function BulkAddTagsMenu({ checkedKeys, disabled }: { checkedKeys: Set<string>; disabled: boolean }) {
  const { t } = useTranslation(['common', 'cases']);
  const { orgObjectTags } = useOrganizationObjectTags();
  const createAnnotationMutation = useCreateAnnotationMutation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSelectedTagIds([]);
    }
  };

  const handleConfirm = async () => {
    if (selectedTagIds.length === 0 || checkedKeys.size === 0) return;

    setIsSubmitting(true);
    try {
      const persons = [...checkedKeys].map(parsePersonBulkKey);
      const personsToUpdate = persons.flatMap((person) => {
        const cached = queryClient.getQueriesData<{ annotations: GroupedAnnotations }>({
          queryKey: ['annotations', person.objectType, person.objectId],
        });
        const existing =
          cached.find(([, data]) => data != null)?.[1]?.annotations.tags.map((a) => a.payload.tag_id) ?? [];
        const addedTags = selectedTagIds.filter((id) => !existing.includes(id));
        return addedTags.length > 0 ? [{ person, addedTags }] : [];
      });

      if (personsToUpdate.length > 0) {
        const results = await Promise.all(
          personsToUpdate.map(({ person, addedTags }) =>
            createAnnotationMutation.mutateAsync({
              tableName: person.objectType,
              objectId: person.objectId,
              type: 'tag',
              payload: {
                addedTags,
                removedAnnotations: [],
              },
            }),
          ),
        );

        const failed = results.some((result) => !result.success);
        if (failed) {
          toast.error(t('common:errors.unknown'));
          return;
        }

        await Promise.all(
          personsToUpdate.map(({ person }) =>
            queryClient.invalidateQueries({ queryKey: ['annotations', person.objectType, person.objectId] }),
          ),
        );
      }

      setSelectedTagIds([]);
      setOpen(false);
    } catch {
      toast.error(t('common:errors.unknown'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (disabled) {
    return (
      <Button type="button" variant="primary" appearance="stroked" size="small" disabled>
        Add tags
      </Button>
    );
  }

  return (
    <MenuCommand.Menu persistOnSelect open={open} onOpenChange={handleOpenChange}>
      <MenuCommand.Trigger>
        <Button type="button" variant="primary" appearance="stroked" size="small">
          Add tags
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="w-[340px]">
        <MenuCommand.List>
          {orgObjectTags.map((tag) => (
            <MenuCommand.Item
              key={tag.id}
              value={tag.id}
              onSelect={() => setSelectedTagIds((prev) => toggle(prev, tag.id))}
            >
              <TagPreview name={tag.name} />
              {selectedTagIds.includes(tag.id) ? <Icon icon="tick" className="text-purple-primary size-5" /> : null}
            </MenuCommand.Item>
          ))}
          <MenuCommand.Empty>
            <div className="text-center">{t('cases:case_detail.add_a_tag.empty')}</div>
          </MenuCommand.Empty>
        </MenuCommand.List>
        {selectedTagIds.length > 0 ? (
          <div className="border-grey-border flex justify-end gap-sm overflow-x-auto border-t p-sm">
            <MenuCommand.HeadlessItem>
              {isSubmitting ? (
                <Button mode="icon" type="button" disabled>
                  <Icon icon="spinner" className="size-4 animate-spin" />
                </Button>
              ) : (
                <Button size="small" type="button" onClick={handleConfirm}>
                  Confirm
                </Button>
              )}
            </MenuCommand.HeadlessItem>
          </div>
        ) : null}
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

export function GraphSelectionToolbar() {
  const { selectionMode, enterSelectionMode, exitSelectionMode, checkedPersons } = useCustomerGraph();
  const hasCheckedPersons = checkedPersons.size > 0;

  if (!selectionMode) {
    return (
      <div className="pointer-events-none absolute top-sm right-sm z-20">
        <Button
          type="button"
          variant="secondary"
          appearance="stroked"
          size="small"
          className="pointer-events-auto bg-grey-white text-purple-primary shadow-md border-transparent hover:bg-grey-white"
          onClick={enterSelectionMode}
        >
          Select entities
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-auto absolute top-sm right-sm z-20',
        'bg-grey-white flex items-center gap-sm rounded-lg px-sm py-xs shadow-md',
      )}
    >
      <Button type="button" variant="primary" appearance="stroked" size="small" disabled>
        Add to case
      </Button>
      <BulkAddTagsMenu checkedKeys={checkedPersons} disabled={!hasCheckedPersons} />
      <Button type="button" variant="secondary" appearance="link" size="small" onClick={exitSelectionMode}>
        Cancel
      </Button>
    </div>
  );
}
