import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { type Tag } from 'marble-api';
import { pick, toggle } from 'radash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

type SimpleTag = Pick<Tag, 'color' | 'id' | 'name'>;

interface TagSelectorProps {
  selectedTagIds: string[];
  onSelectedTagIdsChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onSelectedTagIdsChange }: TagSelectorProps) {
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
      <Button variant="secondary" disabled>
        <span className="text-grey-50 text-xs">{t('workflows:action.tags.no_tags')}</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <MenuCommand.Menu persistOnSelect>
        <MenuCommand.Trigger>
          <Button variant="secondary" size={selectedTagIds.length ? 'icon' : 'xs'}>
            <Icon icon={selectedTagIds.length ? 'edit-square' : 'plus'} className="text-grey-50 size-4" />
            {!selectedTagIds.length ? <span className="text-grey-50 text-xs">{t('common:add')}</span> : null}
          </Button>
        </MenuCommand.Trigger>
        <MenuCommand.Content className="mt-2 min-w-[200px]" side="bottom">
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
                  {selectedTagIds.includes(tagId) ? <Icon icon="tick" className="text-purple-65 size-6" /> : null}
                </div>
              </MenuCommand.Item>
            ))}
            <MenuCommand.Empty>
              <div className="px-3 py-2 text-grey-60">{t('workflows:action.tags.no_result')}</div>
            </MenuCommand.Empty>
          </MenuCommand.List>
        </MenuCommand.Content>
      </MenuCommand.Menu>
      {selectedTagIds.map((id) => (
        <TagPreview key={id} name={formattedTags[id]?.name ?? id} />
      ))}
    </div>
  );
}
