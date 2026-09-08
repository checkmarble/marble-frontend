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
import { useGraphAnnotationsActions } from './contexts/GraphAnnotationsContext';
import { useCheckedNodeIds, useGraphInteractionActions, useSelectionMode } from './contexts/GraphInteractionContext';
import { useGraphStats } from './contexts/GraphStatsContext';
import { useGraphStructureActions } from './contexts/GraphStructureContext';
import { graphI18n } from './lib/graph-i18n';
import { nodeKey, parseNodeKey } from './lib/graph-keys';

function BulkAddTagsMenu({ checkedKeys, disabled }: { checkedKeys: ReadonlySet<string>; disabled: boolean }) {
  const { t } = useTranslation([...graphI18n, 'cases']);
  const { addTagsToNodes } = useGraphAnnotationsActions();
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
      const persons = [...checkedKeys].map(parseNodeKey);
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
        const results = await Promise.allSettled(
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

        const succeeded = personsToUpdate.flatMap((personToUpdate, index) => {
          const result = results[index];
          return result?.status === 'fulfilled' && result.value.success ? [personToUpdate] : [];
        });

        if (succeeded.length > 0) {
          await Promise.all(
            succeeded.map(({ person }) =>
              queryClient.invalidateQueries({ queryKey: ['annotations', person.objectType, person.objectId] }),
            ),
          );

          // Nodes render tags from static graph metadata, so patch it for this session.
          // A checked cluster chip contributes its fold root, which is off-canvas while
          // folded: that patch only shows once the cluster is expanded.
          addTagsToNodes(
            succeeded.map(({ person, addedTags }) => ({
              nodeId: nodeKey(person.objectType, person.objectId),
              tagIds: addedTags,
            })),
          );
        }

        if (succeeded.length !== personsToUpdate.length) {
          toast.error(t('common:errors.unknown'));
          return;
        }
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
        {t('graph:selection.add_tags')}
      </Button>
    );
  }

  return (
    <MenuCommand.Menu persistOnSelect open={open} onOpenChange={handleOpenChange}>
      <MenuCommand.Trigger>
        <Button type="button" variant="primary" appearance="stroked" size="small">
          {t('graph:selection.add_tags')}
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content side="bottom" align="end" sideOffset={4} className="w-85">
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
                  {t('graph:selection.confirm')}
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
  const { t } = useTranslation(graphI18n);
  const { hideNodes } = useGraphStructureActions();
  const graphStats = useGraphStats();
  const { enterSelectionMode, exitSelectionMode, clearCheckedNodes } = useGraphInteractionActions();
  const selectionMode = useSelectionMode();
  const checkedNodeIds = useCheckedNodeIds();
  const hasCheckedNodes = checkedNodeIds.size > 0;

  const handleHide = () => {
    hideNodes([...checkedNodeIds]);
    // Stay in selection mode so pruning can continue.
    clearCheckedNodes();
  };

  if (!selectionMode) {
    return (
      <div className="pointer-events-none absolute top-sm right-sm z-20">
        <Button
          type="button"
          variant="secondary"
          appearance="stroked"
          size="small"
          className="pointer-events-auto"
          onClick={enterSelectionMode}
        >
          {t('graph:selection.select_entities')}
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'pointer-events-auto absolute top-sm right-sm z-20',
        'bg-surface-card flex items-center gap-sm rounded-lg px-sm py-xs shadow-md',
      )}
    >
      <Button type="button" variant="primary" appearance="stroked" size="small" disabled>
        {t('graph:selection.add_to_case')}
      </Button>
      <BulkAddTagsMenu checkedKeys={checkedNodeIds} disabled={!hasCheckedNodes} />
      <Button
        type="button"
        variant="secondary"
        appearance="stroked"
        size="small"
        disabled={!hasCheckedNodes}
        onClick={handleHide}
      >
        <Icon icon="eye-slash" className="size-4" />
        {t('graph:selection.hide', { count: checkedNodeIds.size })}
        {graphStats.hidePreviewOrphans > 0
          ? t('graph:selection.hide_orphans', { count: graphStats.hidePreviewOrphans })
          : null}
      </Button>
      <Button type="button" variant="secondary" appearance="link" size="small" onClick={exitSelectionMode}>
        {t('common:cancel')}
      </Button>
    </div>
  );
}
