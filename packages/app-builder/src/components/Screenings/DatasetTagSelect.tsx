import { type ScreeningCategory } from '@app-builder/models/screening';
import { toggle } from 'radash';
import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { Button, Checkbox, MenuCommand } from 'ui-design-system';
import { Icon } from 'ui-icons';

import { DatasetTag } from './DatasetTag';

type DatasetTagSelectProps = {
  tags: string[];
  selectedTags: string[];
  setSelectedTags: Dispatch<SetStateAction<string[]>>;
};

export const DatasetTagSelect = ({ tags, selectedTags, setSelectedTags }: DatasetTagSelectProps) => {
  const filteredTags = useMemo(() => tags.filter((t) => t !== ''), [tags]);

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <Button variant="secondary">
          <Icon icon="add-circle" className="size-3.5" />
          <span className="text-xs">Type</span>
          {selectedTags.length > 0 ? <div className="bg-grey-disabled mx-xs h-3 w-px" /> : null}
          {selectedTags.map((tag) => (
            <DatasetTag key={tag} category={tag as ScreeningCategory} />
          ))}
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content className="mt-sm max-h-[400px] max-w-[210px]" align="end">
        <MenuCommand.Combobox className="m-xs mb-0 h-8 p-0" iconClasses="size-4" />
        <MenuCommand.List className="p-xs">
          {filteredTags.map((tag) => (
            <MenuCommand.Item
              onSelect={() => setSelectedTags((prev) => toggle(prev, tag))}
              className="flex min-h-0 cursor-pointer items-center justify-start p-xs.5"
              key={tag}
              value={tag}
            >
              <Checkbox size="small" checked={selectedTags.includes(tag)} />
              <DatasetTag category={tag as ScreeningCategory} />
            </MenuCommand.Item>
          ))}
          <div className="bg-surface-card sticky bottom-0 flex w-full gap-sm">
            <Button variant="secondary" size="small" className="basis-full" onClick={() => setSelectedTags([])}>
              <Icon icon="filters-off" className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="small"
              className="basis-full"
              onClick={() => setSelectedTags(filteredTags)}
            >
              <Icon icon="checked" className="size-3.5" />
            </Button>
          </div>
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
