import { type Meta, type StoryFn } from '@storybook/react';
import { useState } from 'react';

import { MenuCommand } from './MenuCommand';

const Story: Meta<typeof MenuCommand.Menu> = {
  component: MenuCommand.Menu,
  title: 'MenuCommand',
};
export default Story;

const options = ['Approve', 'Reject', 'Escalate'];

export const AsSelect: StoryFn<typeof MenuCommand.Menu> = () => {
  const [selected, setSelected] = useState<string>('Approve');
  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-48">{selected}</MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" sideOffset={4}>
        <MenuCommand.List>
          {options.map((option) => (
            <MenuCommand.Item key={option} value={option} onSelect={() => setSelected(option)}>
              {option}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};

export const WithCombobox: StoryFn<typeof MenuCommand.Menu> = () => {
  const [selected, setSelected] = useState<string>('Apple');
  const fruits = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Orange', 'Pear'];

  return (
    <MenuCommand.Menu>
      <MenuCommand.Trigger>
        <MenuCommand.SelectButton className="w-48">{selected}</MenuCommand.SelectButton>
      </MenuCommand.Trigger>
      <MenuCommand.Content sameWidth align="start" sideOffset={4}>
        <MenuCommand.Combobox placeholder="Search fruit..." />
        <MenuCommand.List>
          <MenuCommand.Empty>
            <div className="p-2 text-s text-grey-secondary">No matches</div>
          </MenuCommand.Empty>
          {fruits.map((fruit) => (
            <MenuCommand.Item key={fruit} value={fruit} onSelect={() => setSelected(fruit)}>
              {fruit}
            </MenuCommand.Item>
          ))}
        </MenuCommand.List>
      </MenuCommand.Content>
    </MenuCommand.Menu>
  );
};

export const WithSubMenuAndSeparator: StoryFn<typeof MenuCommand.Menu> = () => (
  <MenuCommand.Menu>
    <MenuCommand.Trigger>
      <MenuCommand.SelectButton className="w-48">Actions</MenuCommand.SelectButton>
    </MenuCommand.Trigger>
    <MenuCommand.Content align="start" sideOffset={4}>
      <MenuCommand.List>
        <MenuCommand.Group heading={<div className="px-2 py-1 text-xs text-grey-secondary">Primary</div>}>
          <MenuCommand.Item value="open" onSelect={() => alert('Open')}>
            Open
          </MenuCommand.Item>
          <MenuCommand.Item value="edit" onSelect={() => alert('Edit')}>
            Edit
          </MenuCommand.Item>
        </MenuCommand.Group>
        <MenuCommand.Separator />
        <MenuCommand.SubMenu trigger="More actions">
          <MenuCommand.List>
            <MenuCommand.Item value="duplicate" onSelect={() => alert('Duplicate')}>
              Duplicate
            </MenuCommand.Item>
            <MenuCommand.Item value="archive" onSelect={() => alert('Archive')}>
              Archive
            </MenuCommand.Item>
          </MenuCommand.List>
        </MenuCommand.SubMenu>
        <MenuCommand.Separator />
        <MenuCommand.Item value="delete" onSelect={() => alert('Delete')}>
          Delete
        </MenuCommand.Item>
      </MenuCommand.List>
    </MenuCommand.Content>
  </MenuCommand.Menu>
);
