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

export const DatasetTagSelect = ({
  tags,
  selectedTags,
  setSelectedTags,
}: DatasetTagSelectProps) => {
  const filteredTags = useMemo(() => tags.filter((t) => t !== ''), [tags]);

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <Button variant="secondary" size="medium">
          <Icon icon="add-circle" className="size-3.5" />
          <span className="text-xs">Type</span>
          {selectedTags.length > 0 ? <div className="bg-grey-80 mx-1 h-3 w-px" /> : null}
          {selectedTags.map((tag) => (
            <DatasetTag key={tag} tag={tag} />
          ))}
        </Button>
      </MenuCommand.Trigger>
      <MenuCommand.Content className="mt-2 max-h-[400px] max-w-[210px]" align="end">
        <MenuCommand.Combobox className="m-1 mb-0 h-8 p-0" iconClasses="size-4" />
        <MenuCommand.List className="p-1">
          {filteredTags.map((tag) => (
            <MenuCommand.Item
              onSelect={() => setSelectedTags((prev) => toggle(prev, tag))}
              className="flex min-h-0 cursor-pointer items-center justify-start p-1.5"
              key={tag}
              value={tag}
            >
              <Checkbox size="small" checked={selectedTags.includes(tag)} />
              <DatasetTag tag={tag} />
            </MenuCommand.Item>
          ))}
          <div className="bg-grey-100 sticky bottom-0 flex w-full gap-2">
            <Button
              variant="secondary"
              size="small"
              className="basis-full"
              onClick={() => setSelectedTags([])}
            >
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
