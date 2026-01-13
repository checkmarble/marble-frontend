import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { type Tag } from 'marble-api';
import { pick, toggle } from 'radash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonV2, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type SimpleTag = Pick<Tag, 'color' | 'id' | 'name'>;

interface TagSelectorProps {
  selectedTagIds: string[];
  onSelectedTagIdsChange: (tagIds: string[]) => void;
  onOpenChange?: (open: boolean) => void;
  /** Maximum number of tags to display inline. Additional tags show as "+X" */
  maxVisibleTags?: number;
}

export function TagSelector({
  selectedTagIds,
  onSelectedTagIdsChange,
  onOpenChange,
  maxVisibleTags,
}: TagSelectorProps) {
  const { t } = useTranslation(['workflows', 'common']);
  const { orgTags } = useOrganizationTags();

  const formattedTags = useMemo(
    () =>
      orgTags.reduce(
        (acc, curr) => {
          acc[curr.id] = pick(curr, ['color', 'id', 'name']);
          return acc;
        },
        {} as Record<string, SimpleTag>,
      ),
    [orgTags],
  );

  const handleToggleTag = (tagId: string) => {
    onSelectedTagIdsChange(toggle(selectedTagIds, tagId));
  };

  if (orgTags.length === 0) {
    return (
      <ButtonV2 variant="secondary" disabled>
        <span className="text-grey-secondary text-xs">{t('workflows:action.tags.no_tags')}</span>
      </ButtonV2>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MenuCommand.Menu persistOnSelect onOpenChange={onOpenChange}>
        <MenuCommand.Trigger>
          <ButtonV2 variant="secondary" mode={selectedTagIds.length ? 'icon' : 'normal'}>
            <Icon icon={selectedTagIds.length ? 'edit-square' : 'plus'} className="text-grey-secondary size-4" />
            {!selectedTagIds.length ? <span className="text-grey-secondary text-xs">{t('common:add')}</span> : null}
          </ButtonV2>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2 min-w-[200px]" side="bottom" align="start">
          <MenuCommand.Combobox placeholder={t('workflows:action.tags.search_placeholder')} />
          <MenuCommand.List>
            {orgTags.map(({ id: tagId }) => (
              <MenuCommand.Item
                key={tagId}
                value={formattedTags[tagId]!.name}
                className="cursor-pointer"
                onSelect={() => handleToggleTag(tagId)}
              >
                <div className="inline-flex w-full justify-between">
                  <TagPreview name={formattedTags[tagId]!.name} />
                  {selectedTagIds.includes(tagId) ? <Icon icon="tick" className="text-purple-primary size-6" /> : null}
                </div>
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <div className="px-3 py-2 text-grey-60">{t('workflows:action.tags.no_result')}</div>
            </MenuCommand.Empty>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      {(maxVisibleTags ? selectedTagIds.slice(0, maxVisibleTags) : selectedTagIds).map((id) => (
        <TagPreview key={id} name={formattedTags[id]?.name ?? id} />
      ))}
      {maxVisibleTags && selectedTagIds.length > maxVisibleTags ? (
        <span className="text-grey-secondary text-xs">+{selectedTagIds.length - maxVisibleTags}</span>
      ) : null}
    </div>
  );
}
