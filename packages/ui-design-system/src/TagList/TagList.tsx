import { useState } from 'react';
import { Icon } from 'ui-icons';
import { Button } from '../Button/Button';
import { MenuCommand } from '../MenuCommand/MenuCommand';
import Tag from '../Tag/Tag';
import { cn } from '../utils';

type TagEntity = { id: string; name: string };

type EditableTagListProps = {
  editable: true;
  onChange: (tags: string[]) => void;
  placeholder: string;
};

type ReadonlyTagListProps = {
  editable?: false;
  onChange?: never;
  placeholder?: never;
};

export type TagListProps = {
  tags: TagEntity[];
  value: string[];
  align?: 'start' | 'end';
} & (EditableTagListProps | ReadonlyTagListProps);

export function TagList({ tags, value, editable, align = 'start', ...rest }: TagListProps) {
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen((o) => !o);
  };
  const handleSelect = (tag: TagEntity) => {
    const tagsIds = value.includes(tag.id) ? value.filter((tagId) => tagId !== tag.id) : [...value, tag.id];

    rest.onChange?.(tagsIds);
  };

  const anchor = (
    <div className="flex gap-v2-xs items-center">
      <ListContainer tags={tags} value={value} onClick={handleClick} />
      {editable ? (
        <Button variant="secondary" appearance="link" mode={value.length > 0 ? 'icon' : 'normal'} onClick={handleClick}>
          <Icon icon="plus" className="size-4" />
          {value.length === 0 ? <span>{rest.placeholder}</span> : null}
        </Button>
      ) : null}
    </div>
  );

  return !editable ? (
    anchor
  ) : (
    <MenuCommand.Menu persistOnSelect open={open} onOpenChange={setOpen}>
      <MenuCommand.Anchor>{anchor}</MenuCommand.Anchor>
      <MenuCommand.Content sideOffset={4} align={align} className="min-w-[16rem]">
        <MenuCommand.List>
          {tags.map((tag) => (
            <MenuCommand.Item key={tag.id} onSelect={() => handleSelect(tag)}>
              <Tag>{tag.name}</Tag>
              {value.includes(tag.id) ? <Icon icon="tick" className="size-4" /> : null}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
}

function ListContainer({ tags, value, onClick }: { tags: TagEntity[]; value: string[]; onClick?: () => void }) {
  const valueTags = value.map((id) => tags.find((t) => t.id === id)).filter(Boolean) as TagEntity[];

  return (
    <div className={cn('flex gap-v2-xs', { 'cursor-pointer': !!onClick, hidden: value.length === 0 })}>
      {valueTags.map((tag) => (
        <Tag tabIndex={0} key={tag.id} onClick={onClick}>
          {tag.name}
        </Tag>
      ))}
    </div>
  );
}
