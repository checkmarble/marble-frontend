import { TagPreview } from '@app-builder/components/Tags/TagPreview';
import { useOrganizationTags } from '@app-builder/services/organization/organization-tags';
import { useTranslation } from 'react-i18next';
import { MenuCommand } from 'ui-design-system';

type TagsFilterMenuItemProps = {
  onSelect: (tagId: string) => void;
};

export const TagsFilterMenuItem = ({ onSelect }: TagsFilterMenuItemProps) => {
  const { t } = useTranslation(['cases']);
  const { orgTags } = useOrganizationTags();

  return (
    <>
      <MenuCommand.Combobox placeholder={t('cases:filter.tags.search_placeholder')} />
      <MenuCommand.List>
        {orgTags.map((tag) => (
          <MenuCommand.Item key={tag.id} value={tag.name} onSelect={() => onSelect(tag.id)}>
            <TagPreview name={tag.name} />
          </MenuCommand.Item>
        ))}
      </MenuCommand.List>
    </>
  );
};
