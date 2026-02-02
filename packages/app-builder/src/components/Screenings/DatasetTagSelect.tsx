import { type ScreeningCategory } from '@app-builder/models/screening';
import { toggle } from 'radash';
import { type Dispatch, type SetStateAction, useMemo } from 'react';
import { ButtonV2, Checkbox, MenuCommand } from 'ui-design-system';
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
        <ButtonV2 variant="secondary">
          <Icon icon="add-circle" className="size-3.5" />
          <span className="text-xs">Type</span>
          {selectedTags.length > 0 ? <div className="bg-grey-disabled mx-1 h-3 w-px" /> : null}
          {selectedTags.map((tag) => (
            <DatasetTag key={tag} category={tag as ScreeningCategory} />
          ))}
        </ButtonV2>
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
              <DatasetTag category={tag as ScreeningCategory} />
            </MenuCommand.Item>
          ))}
          <div className="bg-surface-card sticky bottom-0 flex w-full gap-2">
            <ButtonV2 variant="secondary" size="small" className="basis-full" onClick={() => setSelectedTags([])}>
              <Icon icon="filters-off" className="size-4" />
            </ButtonV2>
            <ButtonV2
              variant="secondary"
              size="small"
              className="basis-full"
              onClick={() => setSelectedTags(filteredTags)}
            >
              <Icon icon="checked" className="size-3.5" />
            </ButtonV2>
          </div>
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};
